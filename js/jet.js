const canvasWindow = document.querySelector(".canvas-window");
const canvas = document.querySelector(".art-canvas");
const projectCards = [...document.querySelectorAll(".project-card")];
let canvasExtentWidth = canvas.offsetWidth;

function addHoverPreview(card, hideImageDuringPlayback = false) {
    const video = card?.querySelector(".project-card-preview");
    if (!card || !video) return;
    const image = card.querySelector("img");

    function setImageVisible(visible) {
        if (hideImageDuringPlayback && image) {
            image.style.visibility = visible ? "" : "hidden";
        }
    }

    Object.assign(video.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "contain",
        pointerEvents: "none",
        display: "none"
    });

    if (hideImageDuringPlayback) {
        video.addEventListener("playing", () => setImageVisible(false));
        video.addEventListener("pause", () => setImageVisible(true));
        video.addEventListener("ended", () => setImageVisible(true));
        video.addEventListener("error", () => setImageVisible(true));
    }

    card.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse") return;
        video.style.display = "block";
        video.play().catch((error) => {
            video.style.display = "none";
            setImageVisible(true);
            console.error(`Unable to play the ${card.querySelector("img").getAttribute("src")} preview video.`, error);
        });
    });

    card.addEventListener("pointerleave", () => {
        video.pause();
        video.currentTime = 0;
        video.style.display = "none";
        setImageVisible(true);
    });
}

addHoverPreview(document.querySelector(".project-card-ca"));
addHoverPreview(document.querySelector(".project-card-2d"), true);
addHoverPreview(document.querySelector(".project-card-speci"));
addHoverPreview(document.querySelector(".project-card-taro"));
addHoverPreview(document.querySelector(".project-card-earthbound"));

const minimumScale = 1;
const maximumScale = 4;
const canvasViewStorageKey = "entong-jiang-canvas-view";
const savedCanvasView = JSON.parse(localStorage.getItem(canvasViewStorageKey) || "null");
const state = {
    scale: savedCanvasView && Number.isFinite(savedCanvasView.scale)
        ? clamp(savedCanvasView.scale, minimumScale, maximumScale)
        : minimumScale,
    x: savedCanvasView && Number.isFinite(savedCanvasView.x)
        ? savedCanvasView.x * window.innerWidth
        : 0,
    y: 0,
    pointerId: null,
    lastX: 0
};

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function keepCanvasInBounds() {
    const maxX = Math.max(
        0,
        (canvasExtentWidth - canvas.offsetWidth / 2) * state.scale - canvasWindow.clientWidth / 2
    );
    state.x = clamp(state.x, -maxX, 0);
    state.y = 0;
}

function render() {
    keepCanvasInBounds();
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
}

function setScale(nextScale, anchorX) {
    const scale = clamp(nextScale, minimumScale, maximumScale);
    if (scale === state.scale) return;

    const bounds = canvasWindow.getBoundingClientRect();
    const offsetX = anchorX - bounds.left - bounds.width / 2;
    const ratio = scale / state.scale;

    state.x = offsetX - (offsetX - state.x) * ratio;
    state.scale = scale;
    render();
}

canvasWindow.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
        setScale(state.scale * Math.exp(-event.deltaY * 0.002), event.clientX);
        return;
    }

    state.x -= Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    render();
}, { passive: false });

canvasWindow.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, .project-card")) return;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    canvasWindow.classList.add("is-dragging");
    canvasWindow.setPointerCapture(event.pointerId);
});

canvasWindow.addEventListener("pointermove", (event) => {
    if (event.pointerId !== state.pointerId) return;
    state.x += event.clientX - state.lastX;
    state.lastX = event.clientX;
    render();
});

function endDrag(event) {
    if (event.pointerId !== state.pointerId) return;
    state.pointerId = null;
    canvasWindow.classList.remove("is-dragging");
}

canvasWindow.addEventListener("pointerup", endDrag);
canvasWindow.addEventListener("pointercancel", endDrag);

window.addEventListener("pagehide", () => {
    const view = projectFilterSnapshot
        ? { x: projectFilterSnapshot.canvasX, scale: projectFilterSnapshot.canvasScale }
        : state;
    localStorage.setItem(canvasViewStorageKey, JSON.stringify({
        x: view.x / window.innerWidth,
        scale: view.scale
    }));
});

const projectHighlights = new Map();
let activeProjectFilter = null;
let activeProjectFilterKey = null;
const filteredProjectPositionsByCategory = new Map([
    ["animation", new Map()],
    ["ai-video", new Map()],
    ["3d-modeling", new Map()],
    ["electronics", new Map()],
    ["graphics", new Map()],
    ["concept", new Map()],
    ["video-film", new Map()]
]);
const filteredPositionsStorageKeys = new Map([
    ["animation", "entong-jiang-animation-positions"],
    ["ai-video", "entong-jiang-ai-video-positions"],
    ["3d-modeling", "entong-jiang-3d-modeling-positions"],
    ["electronics", "entong-jiang-electronics-positions"],
    ["graphics", "entong-jiang-graphics-positions"],
    ["concept", "entong-jiang-concept-positions"],
    ["video-film", "entong-jiang-video-film-positions"]
]);
const projectPositionsStorageKey = "entong-jiang-project-positions";
const savedProjectPositions = JSON.parse(localStorage.getItem(projectPositionsStorageKey) || "{}");
let projectFilterSnapshot = null;

for (const [category, storageKey] of filteredPositionsStorageKeys) {
    const savedFilteredPositions = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    const positions = filteredProjectPositionsByCategory.get(category);
    for (const card of projectCards) {
        const key = [...card.classList].find((className) => className.startsWith("project-card-") && className !== "project-card");
        const position = savedFilteredPositions[key];
        if (position && Number.isFinite(position.left) && Number.isFinite(position.top)) {
            positions.set(card, position);
        }
    }
}

function saveFilteredProjectPositions() {
    const filteredPositions = filteredProjectPositionsByCategory.get(activeProjectFilterKey);
    if (!filteredPositions) return;
    const positions = Object.fromEntries(
        [...filteredPositions].map(([card, position]) => {
            const key = [...card.classList].find((className) => className.startsWith("project-card-") && className !== "project-card");
            return [key, position];
        })
    );
    sessionStorage.setItem(filteredPositionsStorageKeys.get(activeProjectFilterKey), JSON.stringify(positions));
}

function getActiveFilteredPositions() {
    return filteredProjectPositionsByCategory.get(activeProjectFilterKey);
}

function arrangeFilteredProjects() {
    if (!activeProjectFilter) return;

    const cards = projectCards.filter((card) => activeProjectFilter.has(card));
    const gap = window.innerWidth * 0.03 / state.scale;
    const totalWidth = cards.reduce((width, card) => width + card.offsetWidth, 0) + gap * (cards.length - 1);
    const tallestCard = Math.max(...cards.map((card) => card.offsetHeight));
    const canvasBounds = canvas.getBoundingClientRect();
    const startX = (canvasWindow.clientWidth - totalWidth * state.scale) / 2;
    const headerHeight = document.querySelector(".site-header").offsetHeight;
    const rowCenterY = (headerHeight + canvasWindow.clientHeight) / 2;
    const startY = (rowCenterY - tallestCard * state.scale / 2 - canvasBounds.top) / state.scale;
    let left = (startX - canvasBounds.left) / state.scale;
    const filteredPositions = getActiveFilteredPositions();

    for (const card of cards) {
        const top = startY + (tallestCard - card.offsetHeight) / 2;
        if (!filteredPositions.has(card)) {
            filteredPositions.set(card, { left, top });
        }
        applyFilteredProjectPosition(card, filteredPositions.get(card));
        left += card.offsetWidth + gap;
    }
    saveFilteredProjectPositions();
}

function applyFilteredProjectPosition(card, position) {
    card.style.transform = `translate3d(${position.left - card.offsetLeft}px, ${position.top - card.offsetTop}px, 0)`;
    projectHighlights.get(card)?.drawAt(position.left, position.top);
}

function setProjectFilter(category, visibleCards) {
    if (visibleCards && !projectFilterSnapshot) {
        projectFilterSnapshot = {
            transforms: new Map(projectCards.map((card) => [card, card.style.transform])),
            canvasX: state.x,
            canvasScale: state.scale,
            savedPositions: localStorage.getItem(projectPositionsStorageKey)
        };
        state.x = 0;
        state.scale = minimumScale;
        render();
    }

    activeProjectFilter = visibleCards;
    activeProjectFilterKey = category;
    for (const card of projectCards) {
        const visible = !activeProjectFilter || activeProjectFilter.has(card);
        card.style.visibility = visible ? "" : "hidden";
        projectHighlights.get(card)?.setVisible(visible);
    }
    if (activeProjectFilter) {
        arrangeFilteredProjects();
    } else if (projectFilterSnapshot) {
        for (const [card, transform] of projectFilterSnapshot.transforms) {
            card.style.transform = transform;
            const position = getSavedProjectPosition(card);
            projectHighlights.get(card)?.drawAt(
                card.offsetLeft + position.x * canvasWindow.clientWidth,
                card.offsetTop + position.y * canvasWindow.clientHeight
            );
        }
        state.x = projectFilterSnapshot.canvasX;
        state.scale = projectFilterSnapshot.canvasScale;
        if (projectFilterSnapshot.savedPositions === null) {
            localStorage.removeItem(projectPositionsStorageKey);
        } else {
            localStorage.setItem(projectPositionsStorageKey, projectFilterSnapshot.savedPositions);
        }
        projectFilterSnapshot = null;
        render();
    }
}

document.querySelector(".nav-animation").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("animation", new Set([
        document.querySelector(".project-card-2d"),
        document.querySelector(".project-card-speci")
    ]));
});

document.querySelector(".nav-ai-video").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("ai-video", new Set([
        document.querySelector(".project-card-earthbound")
    ]));
});

document.querySelector(".nav-3d").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("3d-modeling", new Set([
        document.querySelector(".project-card-flowers"),
        document.querySelector(".project-card-speci"),
        document.querySelector(".project-card-seedan"),
        document.querySelector(".project-card-winwing")
    ]));
});

document.querySelector(".nav-electronics").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("electronics", new Set([
        document.querySelector(".project-card-root"),
        document.querySelector(".project-card-withoutconsent")
    ]));
});

document.querySelector(".nav-video").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("video-film", new Set([
        document.querySelector(".project-card-mei"),
        document.querySelector(".project-card-ca"),
        document.querySelector(".project-card-taro"),
        document.querySelector(".project-card-neworgan")
    ]));
});

document.querySelector(".nav-graphics").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("graphics", new Set([
        document.querySelector(".project-card-book"),
        document.querySelector(".project-card-mei"),
        document.querySelector(".project-card-seedan")
    ]));
});

document.querySelector(".nav-concept").addEventListener("click", (event) => {
    event.preventDefault();
    setProjectFilter("concept", new Set([
        document.querySelector(".project-card-mei"),
        document.querySelector(".project-card-seedan"),
        document.querySelector(".project-card-neworgan")
    ]));
});

document.querySelector(".site-title").addEventListener("click", () => {
    if (projectFilterSnapshot) {
        setProjectFilter(null, null);
    }
});

function getSavedProjectPosition(card) {
    const key = [...card.classList].find((className) => className.startsWith("project-card-") && className !== "project-card");
    const position = savedProjectPositions[key];
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
        return { x: 0, y: 0 };
    }
    return position;
}

function saveProjectPosition(card, x, y) {
    const key = [...card.classList].find((className) => className.startsWith("project-card-") && className !== "project-card");
    savedProjectPositions[key] = { x, y };
    localStorage.setItem(projectPositionsStorageKey, JSON.stringify(savedProjectPositions));
}

const canvasExtension = document.createElement("div");
Object.assign(canvasExtension.style, {
    position: "absolute",
    top: "0",
    pointerEvents: "none",
    zIndex: "0"
});
canvas.append(canvasExtension);

function updateCanvasExtent() {
    const contentRight = Math.max(
        canvas.offsetWidth,
        ...projectCards.map((card) => {
            const position = getSavedProjectPosition(card);
            return card.offsetLeft + card.offsetWidth + position.x * canvasWindow.clientWidth;
        })
    );
    const previousWidth = canvasExtentWidth;
    canvasExtentWidth = contentRight;
    const canvasStyle = getComputedStyle(canvas, "::before");
    const tileWidth = Number.parseFloat(canvasStyle.backgroundSize);

    Object.assign(canvasExtension.style, {
        left: `${canvas.offsetWidth}px`,
        width: `${contentRight - canvas.offsetWidth}px`,
        height: `${canvas.offsetHeight}px`,
        backgroundImage: canvasStyle.backgroundImage,
        backgroundSize: canvasStyle.backgroundSize,
        backgroundPositionX: `${-(canvas.offsetWidth % tileWidth)}px`,
        backgroundRepeat: "repeat",
        opacity: getComputedStyle(document.documentElement).getPropertyValue("--star-opacity").trim()
    });

    return { previousWidth, nextWidth: contentRight };
}

updateCanvasExtent();

function createStarHighlight(card) {
    const image = card.querySelector("img");
    const canvasStyle = getComputedStyle(canvas, "::before");
    const tileSize = Number.parseFloat(canvasStyle.backgroundSize);
    const width = canvasExtentWidth;
    const height = canvas.offsetHeight;
    const imageWidth = card.offsetWidth;
    const imageHeight = card.offsetHeight;
    const marginX = imageWidth * 0.015;
    const marginY = imageHeight * 0.015;
    const maskId = `project-mask-${projectHighlights.size}`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, {
        position: "absolute",
        inset: "0",
        width: `${width}px`,
        height: "100%",
        pointerEvents: "none",
        zIndex: "1"
    });

    const defs = document.createElementNS(svg.namespaceURI, "defs");
    const pattern = document.createElementNS(svg.namespaceURI, "pattern");
    const patternId = `${maskId}-pattern`;
    pattern.setAttribute("id", patternId);
    pattern.setAttribute("width", tileSize);
    pattern.setAttribute("height", tileSize);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");

    const filter = document.createElementNS(svg.namespaceURI, "filter");
    const filterId = `${maskId}-contrast`;
    filter.setAttribute("id", filterId);
    filter.setAttribute("x", "-5%");
    filter.setAttribute("y", "-5%");
    filter.setAttribute("width", "110%");
    filter.setAttribute("height", "110%");
    const alphaBoost = document.createElementNS(svg.namespaceURI, "feComponentTransfer");
    const alphaFunction = document.createElementNS(svg.namespaceURI, "feFuncA");
    alphaFunction.setAttribute("type", "linear");
    alphaFunction.setAttribute("slope", "1.5");
    alphaBoost.append(alphaFunction);
    filter.append(alphaBoost);

    const patternImage = document.createElementNS(svg.namespaceURI, "image");
    patternImage.setAttribute("href", new URL("../image/canvas3-grid.png", document.baseURI).href);
    patternImage.setAttribute("width", tileSize);
    patternImage.setAttribute("height", tileSize);
    patternImage.setAttribute("filter", `url(#${filterId})`);
    pattern.append(patternImage);

    const mask = document.createElementNS(svg.namespaceURI, "mask");
    mask.setAttribute("id", maskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("mask-type", "alpha");
    mask.setAttribute("x", "0");
    mask.setAttribute("y", "0");
    mask.setAttribute("width", width);
    mask.setAttribute("height", height);
    mask.style.maskType = "alpha";

    const currentImage = document.createElementNS(svg.namespaceURI, "image");
    currentImage.setAttribute("href", image.currentSrc);
    currentImage.setAttribute("width", imageWidth + marginX * 2);
    currentImage.setAttribute("height", imageHeight + marginY * 2);
    currentImage.setAttribute("preserveAspectRatio", "none");
    const edgeFilter = document.createElementNS(svg.namespaceURI, "filter");
    const edgeFilterId = `${maskId}-edge`;
    edgeFilter.setAttribute("id", edgeFilterId);
    edgeFilter.setAttribute("x", "-0.5");
    edgeFilter.setAttribute("y", "-0.5");
    edgeFilter.setAttribute("width", "2");
    edgeFilter.setAttribute("height", "2");
    const dilation = document.createElementNS(svg.namespaceURI, "feMorphology");
    dilation.setAttribute("in", "SourceAlpha");
    dilation.setAttribute("operator", "dilate");
    dilation.setAttribute("radius", tileSize * 0.45);
    edgeFilter.append(dilation);
    currentImage.setAttribute("filter", `url(#${edgeFilterId})`);
    mask.append(currentImage);

    defs.append(filter, edgeFilter, pattern, mask);

    const overlay = document.createElementNS(svg.namespaceURI, "rect");
    overlay.setAttribute("width", width);
    overlay.setAttribute("height", height);
    overlay.setAttribute("fill", `url(#${patternId})`);
    overlay.setAttribute("mask", `url(#${maskId})`);
    overlay.setAttribute("opacity", "1");
    svg.append(defs, overlay);
    canvas.prepend(svg);

    function drawAt(left, top) {
        currentImage.setAttribute("x", left - marginX);
        currentImage.setAttribute("y", top - marginY);
    }

    function resize(previousWidth, previousHeight, nextWidth, nextHeight) {
        const scaleX = nextWidth / previousWidth;
        const scaleY = nextHeight / previousHeight;
        const nextTileSize = Number.parseFloat(getComputedStyle(canvas, "::before").backgroundSize);
        dilation.setAttribute("radius", nextTileSize * 0.45);
        svg.setAttribute("viewBox", `0 0 ${nextWidth} ${nextHeight}`);
        svg.style.width = `${nextWidth}px`;
        mask.setAttribute("x", "0");
        mask.setAttribute("y", "0");
        mask.setAttribute("width", nextWidth);
        mask.setAttribute("height", nextHeight);
        overlay.setAttribute("width", nextWidth);
        overlay.setAttribute("height", nextHeight);
        pattern.setAttribute("width", nextTileSize);
        pattern.setAttribute("height", nextTileSize);
        patternImage.setAttribute("width", nextTileSize);
        patternImage.setAttribute("height", nextTileSize);

        currentImage.setAttribute("x", Number.parseFloat(currentImage.getAttribute("x")) * scaleX);
        currentImage.setAttribute("y", Number.parseFloat(currentImage.getAttribute("y")) * scaleY);
        currentImage.setAttribute("width", Number.parseFloat(currentImage.getAttribute("width")) * scaleX);
        currentImage.setAttribute("height", Number.parseFloat(currentImage.getAttribute("height")) * scaleY);
    }

    function extend(nextWidth) {
        svg.setAttribute("viewBox", `0 0 ${nextWidth} ${canvas.offsetHeight}`);
        svg.style.width = `${nextWidth}px`;
        mask.setAttribute("x", "0");
        mask.setAttribute("y", "0");
        mask.setAttribute("width", nextWidth);
        mask.setAttribute("height", canvas.offsetHeight);
        overlay.setAttribute("width", nextWidth);
    }

    drawAt(card.offsetLeft, card.offsetTop);
    function setVisible(visible) {
        svg.style.visibility = visible ? "" : "hidden";
    }

    return { drawAt, resize, extend, setVisible };
}

projectCards.forEach((card) => {
    const position = getSavedProjectPosition(card);
    card.style.transform = `translate3d(${position.x * 100}vw, ${position.y * 100}vh, 0)`;
    const image = card.querySelector("img");
    const initialize = () => {
        const highlight = createStarHighlight(card);
        highlight.drawAt(
            card.offsetLeft + position.x * canvasWindow.clientWidth,
            card.offsetTop + position.y * canvasWindow.clientHeight
        );
        if (activeProjectFilter) {
            highlight.setVisible(activeProjectFilter.has(card));
        }
        projectHighlights.set(card, highlight);
    };
    if (image.complete && image.naturalWidth) {
        initialize();
    } else {
        image.addEventListener("load", initialize, { once: true });
    }
});

projectCards.forEach((card) => {
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let minimumDragX = 0;
    let baseLeft = 0;
    let baseTop = 0;
    let dragX = 0;
    let dragY = 0;
    const savedPosition = getSavedProjectPosition(card);
    let positionX = savedPosition.x;
    let positionY = savedPosition.y;
    let frame = 0;
    let moved = false;

    card.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        event.stopPropagation();
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        if (activeProjectFilter) {
            const filteredPosition = getActiveFilteredPositions().get(card);
            if (!filteredPosition) return;
            baseLeft = filteredPosition.left;
            baseTop = filteredPosition.top;
            minimumDragX = Number.NEGATIVE_INFINITY;
        } else {
            const cardBounds = card.getBoundingClientRect();
            minimumDragX = canvasWindow.getBoundingClientRect().left - cardBounds.width / 2 - cardBounds.left;
            baseLeft = card.offsetLeft;
            baseTop = card.offsetTop;
        }
        dragX = 0;
        dragY = 0;
        moved = false;
        card.setPointerCapture(pointerId);
    });

    card.addEventListener("pointermove", (event) => {
        if (event.pointerId !== pointerId) return;

        const dragThreshold = Math.max(2, canvasWindow.clientWidth * 0.003);
        if (!moved && Math.hypot(event.clientX - startX, event.clientY - startY) > dragThreshold) {
            moved = true;
            card.classList.add("is-dragging");
        }

        if (moved) {
            if (activeProjectFilter) {
                dragX = (event.clientX - startX) / state.scale;
                dragY = (event.clientY - startY) / state.scale;
            } else {
                dragX = Math.max(event.clientX - startX, minimumDragX) / state.scale / canvasWindow.clientWidth;
                dragY = (event.clientY - startY) / state.scale / canvasWindow.clientHeight;
            }
            if (!frame) frame = requestAnimationFrame(updateProjectPosition);
        }
    });

    function updateProjectPosition() {
        frame = 0;
        if (activeProjectFilter) {
            const position = { left: baseLeft + dragX, top: baseTop + dragY };
            getActiveFilteredPositions().set(card, position);
            saveFilteredProjectPositions();
            applyFilteredProjectPosition(card, position);
            return;
        }
        card.style.transform = `translate3d(${(positionX + dragX) * 100}vw, ${(positionY + dragY) * 100}vh, 0)`;
        const left = baseLeft + (positionX + dragX) * canvasWindow.clientWidth;
        const top = baseTop + (positionY + dragY) * canvasWindow.clientHeight;
        const highlight = projectHighlights.get(card);
        if (!highlight) return;

        highlight.drawAt(left, top);
    }

    function finishProjectDrag(event) {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        if (frame) {
            cancelAnimationFrame(frame);
            updateProjectPosition();
        }
        card.classList.remove("is-dragging");
        if (moved) {
            if (activeProjectFilter) {
                const position = { left: baseLeft + dragX, top: baseTop + dragY };
                getActiveFilteredPositions().set(card, position);
                applyFilteredProjectPosition(card, position);
            } else {
                positionX += dragX;
                positionY += dragY;
                saveProjectPosition(card, positionX, positionY);
                const extent = updateCanvasExtent();
                if (extent.nextWidth !== extent.previousWidth) {
                    for (const highlight of projectHighlights.values()) {
                        highlight.extend(extent.nextWidth);
                    }
                }
                const highlight = projectHighlights.get(card);
                if (highlight) {
                    const left = baseLeft + positionX * canvasWindow.clientWidth;
                    const top = baseTop + positionY * canvasWindow.clientHeight;
                    highlight.drawAt(left, top);
                }
            }
            card.dataset.suppressClick = "true";
            window.setTimeout(() => delete card.dataset.suppressClick, 0);
        }
    }

    card.addEventListener("pointerup", finishProjectDrag);
    card.addEventListener("pointercancel", finishProjectDrag);
    card.addEventListener("click", (event) => {
        if (card.dataset.suppressClick !== "true") return;
        event.preventDefault();
        delete card.dataset.suppressClick;
    });
});

let previousViewportWidth = window.innerWidth;
let previousCanvasWidth = canvasExtentWidth;
let previousCanvasHeight = canvas.offsetHeight;

window.addEventListener("resize", () => {
    const nextCanvasHeight = canvas.offsetHeight;
    const viewportScale = window.innerWidth / previousViewportWidth;
    state.x *= viewportScale;
    const extent = updateCanvasExtent();
    for (const highlight of projectHighlights.values()) {
        highlight.resize(previousCanvasWidth, previousCanvasHeight, extent.nextWidth, nextCanvasHeight);
    }
    previousViewportWidth = window.innerWidth;
    previousCanvasWidth = extent.nextWidth;
    previousCanvasHeight = nextCanvasHeight;
    render();
    if (activeProjectFilter) arrangeFilteredProjects();
});
render();

const contactLink = document.querySelector('.contact-link');
const contactDialog = document.querySelector('.jet-contact-dialog');
contactLink.addEventListener('click', event => {
    event.preventDefault();
    if (!contactDialog.open) contactDialog.showModal();
});
contactDialog.addEventListener('click', event => {
    const bounds = contactDialog.getBoundingClientRect();
    if (event.target === contactDialog &&
        (event.clientY < bounds.top || event.clientY > bounds.bottom ||
         event.clientX < bounds.left || event.clientX > bounds.right)) {
        contactDialog.close();
    }
});

let welcomePanFrame = 0;
let welcomePanTarget = state.x;

function animateWelcomePan() {
    const distance = welcomePanTarget - state.x;
    state.x = Math.abs(distance) < 0.5 ? welcomePanTarget : state.x + distance * 0.08;
    render();
    welcomePanFrame = state.x === welcomePanTarget ? 0 : requestAnimationFrame(animateWelcomePan);
}

window.addEventListener("message", (event) => {
    if (window.parent === window || event.source !== window.parent) return;
    if (event.data?.type !== "welcome-canvas-pan" || !Number.isFinite(event.data.progress)) return;
    const maxX = Math.max(
        0,
        (canvasExtentWidth - canvas.offsetWidth / 2) * state.scale - canvasWindow.clientWidth / 2
    );
    welcomePanTarget = -maxX * clamp(event.data.progress, 0, 1);
    if (!welcomePanFrame) welcomePanFrame = requestAnimationFrame(animateWelcomePan);
});
