(() => {
        const isPreview = !!document.querySelector('.mobile-preview-screen');
        // Embedded welcome backgrounds keep their original desktop canvas.
        if (!isPreview && (window.parent !== window || !matchMedia('(max-width: 767px)').matches)) return;
        const preview = isPreview ? document.querySelector('.mobile-preview-screen > iframe') : {
            contentDocument: document,
            contentWindow: window,
            get clientWidth() { return window.innerWidth; },
            style: {
                set transform(value) {
                    const offset = /translateY\(([^)]+)\)/.exec(value);
                    // Root transforms can leave a duplicated/clipped paint strip in iOS Safari.
                    // The body is already positioned, so a top offset preserves the layout
                    // without transforming the viewport or fixed modal layers.
                    document.documentElement.style.removeProperty('translate');
                    document.body.style.top = offset ? offset[1] : '';
                },
                set backgroundColor(value) { document.documentElement.style.backgroundColor = value; }
            }
        };
        const setPreviewLabel = text => {
            if (isPreview) document.querySelector('body > p').textContent = text;
        };
        let stopAlignment = () => {};

        function alignWelcomeBackground() {
            stopAlignment();
            stopAlignment = () => {};
            const welcome = preview.contentDocument;
            preview.style.transform = '';
            const isWinwing = welcome?.body.classList.contains('winwing-detail-page');
            const isAnimation = welcome?.body.classList.contains('animation-detail-page');
            const previewBackground = isWinwing ? '#c0c0c0' : isAnimation ? '#d0d1d3' : 'white';
            preview.style.backgroundColor = previewBackground;
            if (isPreview) document.querySelector('.mobile-preview-screen').style.backgroundColor = previewBackground;
            if (isWinwing || isAnimation) welcome.documentElement.style.backgroundColor = previewBackground;
            setPreviewLabel('手机尺寸预览 · 390 × 844');
            if (welcome?.body.classList.contains('cv-page')) {
                adaptMobileCv(welcome);
                return;
            }
            const enlargeStarHeadings = () => {
                if (preview.contentDocument !== welcome) return;
                const parents = new Set([...welcome.querySelectorAll('img[src*="blackstar.png"], img[src*="redstar.png"]')]
                    .map(image => image.parentElement));
                for (const heading of parents) {
                    const stars = [...heading.children].filter(element =>
                        element.matches('img[src*="blackstar.png"], img[src*="redstar.png"]'));
                    if (stars.length < 2 || heading.dataset.mobileStarHeading) continue;
                    heading.dataset.mobileStarHeading = 'true';
                    const view = welcome.defaultView;
                    const fontSize = parseFloat(view.getComputedStyle(heading).fontSize);
                    heading.style.setProperty('font-size', `${fontSize + view.innerWidth * 0.01}px`, 'important');
                    stars.forEach(star => {
                        const bounds = star.getBoundingClientRect();
                        const ratio = star.naturalWidth && star.naturalHeight
                            ? star.naturalWidth / star.naturalHeight : bounds.width / bounds.height;
                        const height = (fontSize + view.innerWidth * 0.01) * 2 / 3;
                        star.style.setProperty('height', `${height}px`, 'important');
                        star.style.setProperty('width', `${height * ratio}px`, 'important');
                    });
                    if (heading.matches('.animation-scenes-details')) {
                        const parts = [...heading.children].map(part => part.getBoundingClientRect());
                        const width = Math.max(...parts.map(part => part.right)) - Math.min(...parts.map(part => part.left));
                        if (width > view.innerWidth * 0.05) {
                            heading.style.scale = String((width - view.innerWidth * 0.05) / width);
                            heading.style.transformOrigin = 'center center';
                        }
                    }
                }
            };
            welcome.fonts.ready.then(() => welcome.defaultView.requestAnimationFrame(enlargeStarHeadings));
            if (welcome?.body.classList.contains('mei-detail-page')) {
                adaptMobileMei(welcome);
                return;
            }
            if (welcome?.querySelector('.art-canvas') && !welcome.body.classList.contains('welcome-page')) {
                adaptMobileWorks(welcome);
                return;
            }
            const projectTitle = welcome?.querySelector('h1.flowers-page-title');
            if (projectTitle) {
                // Shift the whole rendered page without changing its internal layout calculations.
                preview.style.transform = `translateY(${preview.clientWidth * 0.01}px)`;
                const view = welcome.defaultView;
                const titleStyle = welcome.createElement('style');
                titleStyle.textContent = `html body[class] h1.flowers-page-title {
                    font-size: ${welcome.body.classList.contains('animation-detail-page') ? '3vw' : '5vw'};
                }`;
                titleStyle.textContent += `
                    .animation-detail-page .animation-project-tags { font-size: 2vw; }
                `;
                welcome.head.append(titleStyle);
                if (welcome.body.classList.contains('root-detail-page')) {
                    const description = welcome.querySelector('.root-description');
                    if (description) {
                        description.style.scale = '1.07';
                        description.style.transformOrigin = 'center center';
                    }
                }
                if (welcome.body.classList.contains('taro-detail-page')) {
                    const video = welcome.querySelector('.taro-project-video');
                    if (video) {
                        const currentMargin = parseFloat(view.getComputedStyle(video).marginTop) || 0;
                        video.style.marginTop = `${currentMargin + view.innerWidth * 0.02}px`;
                    }
                    const description = welcome.querySelector('.taro-description');
                    if (description) {
                        description.style.scale = '1.05';
                        description.style.transformOrigin = 'center center';
                    }
                }
                if (welcome.body.classList.contains('earthbound-detail-page')) {
                    const video = welcome.querySelector('.earthbound-project-video');
                    if (video) {
                        const currentMargin = parseFloat(view.getComputedStyle(video).marginTop) || 0;
                        video.style.marginTop = `${currentMargin + view.innerWidth * 0.02}px`;
                    }
                    const description = welcome.querySelector('.earthbound-description');
                    if (description) {
                        description.style.scale = '1.03';
                        description.style.transformOrigin = 'center center';
                    }
                }
                if (welcome.body.classList.contains('ca-detail-page')) {
                    const video = welcome.querySelector('.ca-project-video');
                    if (video) {
                        const currentMargin = parseFloat(view.getComputedStyle(video).marginTop) || 0;
                        video.style.marginTop = `${currentMargin + view.innerWidth * 0.02}px`;
                    }
                }
                if (isWinwing) welcome.fonts.ready.then(() => {
                    view.requestAnimationFrame(() => scaleAbsoluteProjectContent(welcome, '.winwing-project-tags', 1.03, 'mobile-winwing-content'));
                });
                if (welcome.body.classList.contains('map-detail-page')) welcome.fonts.ready.then(() => {
                    view.requestAnimationFrame(() => scaleAbsoluteProjectContent(welcome, '.map-project-tags', 1.05, 'mobile-map-content'));
                });
                if (welcome.body.classList.contains('animation-detail-page')) {
                    const content = [...welcome.querySelectorAll(
                        '.animation-description, .animation-niangao-image, .animation-pdf-button, .animation-scenes-details')];
                    if (content.length) {
                        const group = welcome.createElement('div');
                        group.className = 'mobile-animation-content';
                        Object.assign(group.style, {
                            display: 'flow-root', width: '100%', transform: 'scale(1.15)',
                            transformOrigin: 'top center'
                        });
                        content[0].before(group);
                        group.append(...content);
                        const reserveSpace = () => {
                            group.style.marginBottom = `${group.offsetHeight * 0.15}px`;
                        };
                        const contentObserver = new ResizeObserver(reserveSpace);
                        contentObserver.observe(group);
                        reserveSpace();
                        stopAlignment = () => contentObserver.disconnect();
                    }
                }
                if (welcome.body.classList.contains('flowers-detail-page')) {
                    const contentStyle = welcome.createElement('style');
                    // Use a desktop-shaped content area rather than the tall phone viewport.
                    // The hero, description and gallery retain the same shared center anchor.
                    contentStyle.textContent = `
                        .flowers-detail-page .project-detail { height: 62.5vw; }
                        .flowers-detail-page .flowers-description { top: calc(31.25vw + 14.91vw); }
                        .flowers-detail-page .flowers-gallery { padding-top: calc(31.25vw + 24vw); }
                    `;
                    welcome.head.append(contentStyle);
                    const description = welcome.querySelector('.flowers-description');
                    const gallery = welcome.querySelector('.flowers-gallery');
                    if (description && gallery) {
                        description.style.transform = 'scale(0.97)';
                        description.style.transformOrigin = 'top center';
                        const alignGallery = () => {
                            if (preview.contentDocument !== welcome) return;
                            const gap = view.innerWidth * 0.05;
                            const padding = description.getBoundingClientRect().bottom + gap -
                                gallery.getBoundingClientRect().top;
                            gallery.style.paddingTop = `${Math.max(0, padding)}px`;
                        };
                        const descriptionObserver = new ResizeObserver(alignGallery);
                        descriptionObserver.observe(description);
                        view.addEventListener('resize', alignGallery);
                        welcome.fonts.ready.then(alignGallery);
                        alignGallery();
                        stopAlignment = () => {
                            descriptionObserver.disconnect();
                            view.removeEventListener('resize', alignGallery);
                        };
                    }
                    const tags = welcome.querySelector('.flowers-project-tags > p');
                    const container = welcome.querySelector('.flowers-project-tags');
                    if (tags && container) {
                        Object.assign(tags.style, {
                            position: 'absolute', top: '0', margin: '0',
                            fontSize: 'max(9px, 1vw)', textAlign: 'left', whiteSpace: 'nowrap'
                        });
                        const alignTags = () => {
                            if (preview.contentDocument !== welcome) return;
                            tags.style.left = `${projectTitle.getBoundingClientRect().left - container.getBoundingClientRect().left}px`;
                        };
                        const tagsObserver = new ResizeObserver(alignTags);
                        tagsObserver.observe(projectTitle);
                        welcome.fonts.ready.then(alignTags);
                        alignTags();
                        const stopDescription = stopAlignment;
                        stopAlignment = () => {
                            stopDescription();
                            tagsObserver.disconnect();
                        };
                    }
                }
                const backImage = welcome.querySelector('.flowers-back-link img');
                if (backImage) {
                    const alignBack = () => {
                        if (preview.contentDocument !== welcome) return;
                        const titleBounds = projectTitle.getBoundingClientRect();
                        const backBounds = backImage.getBoundingClientRect();
                        const difference = titleBounds.top + titleBounds.height / 2 -
                            (backBounds.top + backBounds.height / 2);
                        if (Math.abs(difference) > 0.5) {
                            const current = parseFloat(backImage.style.translate.split(' ')[1]) || 0;
                            backImage.style.translate = `0px ${current + difference}px`;
                        }
                    };
                    const observer = new ResizeObserver(alignBack);
                    observer.observe(projectTitle);
                    observer.observe(backImage);
                    backImage.addEventListener('load', alignBack);
                    view.addEventListener('resize', alignBack);
                    welcome.fonts.ready.then(alignBack);
                    alignBack();
                    const stopTags = stopAlignment;
                    stopAlignment = () => {
                        stopTags();
                        observer.disconnect();
                        backImage.removeEventListener('load', alignBack);
                        view.removeEventListener('resize', alignBack);
                    };
                }
                view.dispatchEvent(new Event('resize'));
                return;
            }
            const navigation = welcome?.querySelector('.welcome-nav');
            const background = welcome?.querySelector('.welcome-portfolio-background');
            if (!navigation || !background) return;
            const welcomeView = welcome.defaultView;

            let observer;
            let canvas;
            const align = () => {
                if (preview.contentDocument !== welcome) return;
                const document = background.contentDocument;
                canvas = document?.querySelector('.art-canvas');
                const cards = [...(document?.querySelectorAll('.project-card') || [])];
                if (!canvas || !cards.length) return;
                const bounds = cards.map(card => card.getBoundingClientRect());
                const rowCenter = (Math.min(...bounds.map(rect => rect.top)) +
                    Math.max(...bounds.map(rect => rect.bottom))) / 2;
                const navBounds = navigation.getBoundingClientRect();
                const targetCenter = navBounds.top + navBounds.height / 2 -
                    background.getBoundingClientRect().top;
                const difference = targetCenter - rowCenter;
                if (Math.abs(difference) > 0.5) {
                    canvas.style.marginTop = `${(parseFloat(canvas.style.marginTop) || 0) + difference}px`;
                }
            };
            const watchBackground = () => {
                if (preview.contentDocument !== welcome) return;
                observer?.disconnect();
                observer = new ResizeObserver(align);
                observer.observe(navigation);
                background.contentDocument.querySelectorAll('.project-card img')
                    .forEach(image => observer.observe(image));
                background.contentDocument.fonts.ready.then(align);
                align();
            };
            background.addEventListener('load', watchBackground);
            if (background.contentDocument?.readyState === 'complete') watchBackground();
            preview.contentWindow.addEventListener('resize', align);
            stopAlignment = () => {
                observer?.disconnect();
                background.removeEventListener('load', watchBackground);
                welcomeView.removeEventListener('resize', align);
            };
        }

        function scaleAbsoluteProjectContent(page, tagsSelector, scale, groupClass) {
            if (preview.contentDocument !== page || page.querySelector(`.${groupClass}`)) return;
            const view = page.defaultView;
            const height = page.body.getBoundingClientRect().height;
            const content = [...page.body.children].filter(element =>
                !['SCRIPT', 'STYLE', 'SVG', 'DIALOG'].includes(element.tagName) &&
                !element.matches('.flowers-page-title, .flowers-project-tags'));
            // Keep the existing absolute positions while enlarging their shared coordinate space.
            content.forEach(element => {
                const computed = view.getComputedStyle(element);
                if (computed.position === 'absolute') {
                    element.style.setProperty('top', computed.top, 'important');
                }
            });
            const tags = page.querySelector(tagsSelector);
            if (tags) {
                const bounds = tags.getBoundingClientRect();
                Object.assign(tags.style, {
                    position: 'absolute', top: `${bounds.top + view.scrollY}px`,
                    left: `${bounds.left + view.scrollX}px`, width: `${bounds.width}px`,
                    transform: 'none'
                });
            }
            const group = page.createElement('div');
            group.className = groupClass;
            Object.assign(group.style, {
                position: 'absolute', top: '0', left: '0', width: '100%',
                height: `${height}px`, transform: `scale(${scale})`, transformOrigin: 'top center'
            });
            group.append(...content);
            if (tags) group.prepend(tags);
            page.body.append(group);
            page.body.style.setProperty('min-height', `${height * scale}px`, 'important');
        }

        function adaptMobileWorks(works) {
            const view = works.defaultView;
            const header = works.querySelector('.site-header');
            const ornament = header?.querySelector('.header-ornament');
            const navigation = header?.querySelector('.main-nav');
            if (ornament && navigation) {
                const headerStyle = view.getComputedStyle(header);
                const group = works.createElement('div');
                group.className = 'mobile-navigation-frame';
                Object.assign(group.style, {
                    position: 'absolute', inset: '0', display: 'grid',
                    boxSizing: 'border-box', padding: headerStyle.padding,
                    gridTemplateColumns: headerStyle.gridTemplateColumns,
                    gridTemplateRows: headerStyle.gridTemplateRows,
                    alignItems: headerStyle.alignItems,
                    transformOrigin: 'center center', pointerEvents: 'none'
                });
                navigation.style.pointerEvents = 'auto';
                group.append(ornament, navigation);
                header.append(group);
                const scale = (group.offsetWidth + view.innerWidth * 0.03) / group.offsetWidth;
                group.style.transform = `scale(${scale})`;
            }
            const canvas = works.querySelector('.art-canvas');
            const canvasWindow = works.querySelector('.canvas-window');
            const fixedCanvasHeight = view.innerWidth * 2.2;
            // Start phones at the same scale, independent of desktop zoom history.
            const storedTransform = new view.DOMMatrixReadOnly(view.getComputedStyle(canvas).transform);
            if (Math.abs(storedTransform.a - 1) > 0.001) {
                canvasWindow.dispatchEvent(new view.WheelEvent('wheel', {
                    deltaY: Math.log(storedTransform.a) / 0.002, ctrlKey: true,
                    clientX: view.innerWidth / 2, bubbles: true, cancelable: true
                }));
            }
            const initialTransform = new view.DOMMatrixReadOnly(view.getComputedStyle(canvas).transform);
            canvasWindow.dispatchEvent(new view.WheelEvent('wheel', {
                deltaX: initialTransform.m41, deltaY: 0, bubbles: true, cancelable: true
            }));
            const cards = [...works.querySelectorAll('.project-card')];
            const widths = cards.map(card => parseFloat(view.getComputedStyle(card).width) / view.innerWidth);
            // Published positions must be identical on a fresh phone and in preview.
            const savedPositions = {};
            const keyFor = card => card.getAttribute('href');
            const initialPositions = new Map();
            const categoryPositions = new Map();
            let activeCategory = null;
            let categoryNeedsLayout = false;
            // Screenshot composition on a 390 × 844 reference, scaled by width.
            const layoutHeight = () => view.innerWidth * 844 / 390;
            const referenceCenters = {
                'speci.html': [0.30, 0.17], 'seedan.html': [0.64, 0.33],
                'flowers.html': [0.30, 0.45], 'taro.html': [0.64, 0.62],
                'winwing.html': [0.30, 0.77], 'map.html': [0.64, 0.91],
                'root.html': [1.04, 0.17], 'mei.html': [1.04, 0.50],
                '2d.html': [1.04, 0.77], 'ca.html': [1.50, 0.33],
                'earthbound.html': [1.50, 0.91], 'withoutconsent.html': [1.50, 0.60],
                'neworgan.html': [1.90, 0.77]
            };
            let drag = null;
            let suppressClick = null;
            let frame = 0;
            let panFrame = 0;
            let minimumPan = 0;
            let frozenPan = 0;
            let pendingPan = 0;
            let rasterLayer = null;
            let rasterVersion = 0;
            const assetData = new Map();
            const inlineAsset = url => {
                if (!assetData.has(url)) {
                    assetData.set(url, view.fetch(url).then(response => {
                        if (!response.ok) throw new Error('Mask asset unavailable');
                        return response.blob();
                    }).then(blob => new Promise((resolve, reject) => {
                        const reader = new view.FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    })));
                }
                return assetData.get(url);
            };
            const bakeHighlights = async () => {
                const version = ++rasterVersion;
                const originals = [...canvas.children].filter(node => node.tagName.toLowerCase() === 'svg');
                if (!originals.length) return;
                // Keep the live effects visible until a complete, sharp replacement is ready.
                const bounds = canvas.getBoundingClientRect();
                const x = -bounds.left + frozenPan;
                const y = -bounds.top;
                const width = Math.ceil(view.innerWidth - minimumPan);
                const height = fixedCanvasHeight;
                const ratio = view.devicePixelRatio || 1;
                const svg = works.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
                svg.setAttribute('width', Math.ceil(width * ratio));
                svg.setAttribute('height', Math.ceil(height * ratio));
                for (const original of originals) {
                    if (original.style.visibility === 'hidden') continue;
                    for (const child of original.children) svg.append(child.cloneNode(true));
                }
                let objectURL;
                try {
                    await Promise.all([...svg.querySelectorAll('image')].map(async image => {
                        const url = image.getAttribute('href');
                        if (url && !url.startsWith('data:')) image.setAttribute('href', await inlineAsset(url));
                    }));
                    if (version !== rasterVersion || preview.contentDocument !== works) return;
                    objectURL = view.URL.createObjectURL(new view.Blob([
                        new view.XMLSerializer().serializeToString(svg)
                    ], { type: 'image/svg+xml' }));
                    const image = new view.Image();
                    image.src = objectURL;
                    await image.decode();
                    if (version !== rasterVersion || preview.contentDocument !== works) return;
                    const layer = works.createElement('canvas');
                    layer.width = Math.ceil(width * ratio);
                    layer.height = Math.ceil(height * ratio);
                    layer.setAttribute('aria-hidden', 'true');
                    Object.assign(layer.style, {
                        position: 'absolute', left: `${x}px`, top: `${y}px`,
                        width: `${width}px`, height: `${height}px`,
                        pointerEvents: 'none', zIndex: '1'
                    });
                    const context = layer.getContext('2d');
                    if (!context) return;
                    context.drawImage(image, 0, 0, layer.width, layer.height);
                    rasterLayer?.remove();
                    rasterLayer = layer;
                    canvas.prepend(layer);
                    originals.forEach(original => { original.style.display = 'none'; });
                } catch {
                    // Retain the original visual effects if rasterization is unavailable.
                } finally {
                    if (objectURL) view.URL.revokeObjectURL(objectURL);
                }
            };

            const sendPan = deltaX => {
                frozenPan = Math.max(minimumPan, Math.min(0, frozenPan - deltaX));
                canvas.style.transform = `translate3d(${frozenPan}px, 0px, 0px) scale(1)`;
            };
            const updatePan = () => {
                panFrame = 0;
                const delta = pendingPan;
                pendingPan = 0;
                if (delta) sendPan(delta);
            };
            const schedulePan = () => {
                if (!panFrame) panFrame = view.requestAnimationFrame(updatePan);
            };
            const arrange = () => {
                frame = 0;
                if (preview.contentDocument !== works) return;
                const scale = canvas.getBoundingClientRect().height / canvas.offsetHeight;
                const categoryCards = activeCategory
                    ? cards.filter(card => view.getComputedStyle(card).visibility !== 'hidden') : [];
                const categoryGap = view.innerWidth * 0.03;
                const baseCategoryWidth = categoryCards.reduce((sum, card) =>
                    sum + view.innerWidth * (widths[cards.indexOf(card)] + 0.1), 0);
                const categoryScale = baseCategoryWidth ? Math.min(1,
                    (view.innerWidth * 0.8 - categoryGap * Math.max(0, categoryCards.length - 1)) / baseCategoryWidth) : 1;
                cards.forEach((card, index) => {
                    const width = `${view.innerWidth * (widths[index] + 0.1) * (activeCategory ? categoryScale : 1)}px`;
                    if (card.style.width !== width) card.style.width = width;
                });
                if (activeCategory && categoryNeedsLayout) {
                    const visible = categoryCards;
                    const canvasBounds = canvas.getBoundingClientRect();
                    const sizes = visible.map(card => ({ card, bounds: card.getBoundingClientRect() }));
                    const rowWidth = sizes.reduce((sum, item) => sum + item.bounds.width, 0) +
                        categoryGap * Math.max(0, sizes.length - 1);
                    const centerY = (header.getBoundingClientRect().bottom + view.innerHeight) / 2;
                    let left = (view.innerWidth - rowWidth) / 2;
                    const layout = {};
                    for (const { card, bounds } of sizes) {
                        layout[keyFor(card)] = {
                            x: ((left - canvasBounds.left) / scale - card.offsetLeft) / view.innerWidth,
                            y: ((centerY - bounds.height / 2 - canvasBounds.top) / scale - card.offsetTop) / view.innerHeight
                        };
                        left += bounds.width + categoryGap;
                    }
                    categoryPositions.set(activeCategory, layout);
                    categoryNeedsLayout = false;
                }
                cards.forEach((card, index) => {
                    const bounds = card.getBoundingClientRect();
                    const key = keyFor(card);
                    if (!savedPositions[key] && !initialPositions.has(key)) {
                        const center = referenceCenters[key] || [2 + index * 0.4, 0.5];
                        const canvasBounds = canvas.getBoundingClientRect();
                        initialPositions.set(key, {
                            x: ((view.innerWidth * center[0] - canvasBounds.left - bounds.width / 2) / scale - card.offsetLeft) / view.innerWidth,
                            y: ((layoutHeight() * center[1] - canvasBounds.top - bounds.height / 2) / scale - card.offsetTop) / view.innerHeight
                        });
                    }
                    const saved = (activeCategory && categoryPositions.get(activeCategory)?.[key]) ||
                        savedPositions[key] || initialPositions.get(key);
                    if (saved && drag?.card !== card) {
                        const transform = 'translate3d(0, 0, 0)';
                        const translate = `${saved.x * view.innerWidth}px ${saved.y * view.innerHeight}px`;
                        if (card.style.transform !== transform) card.style.transform = transform;
                        if (card.style.translate !== translate) card.style.translate = translate;
                    }
                    const image = card.querySelector('img');
                    const mask = [...canvas.querySelectorAll('mask > image')]
                        .find(maskImage => maskImage.getAttribute('href') === image.currentSrc);
                    if (mask) {
                        const canvasBounds = canvas.getBoundingClientRect();
                        const cardBounds = card.getBoundingClientRect();
                        const width = cardBounds.width / scale;
                        const height = cardBounds.height / scale;
                        mask.setAttribute('x', (cardBounds.left - canvasBounds.left) / scale - width * 0.015);
                        mask.setAttribute('y', (cardBounds.top - canvasBounds.top) / scale - height * 0.015);
                        mask.setAttribute('width', width * 1.03);
                        mask.setAttribute('height', height * 1.03);
                    }
                });
                // Cache the boundary in canvas coordinates; panning needs no card measurements.
                const currentPan = new view.DOMMatrixReadOnly(view.getComputedStyle(canvas).transform).m41;
                const edgeCards = activeCategory
                    ? cards.filter(card => view.getComputedStyle(card).visibility !== 'hidden')
                    : [works.querySelector('.project-card-neworgan')].filter(Boolean);
                if (edgeCards.length) {
                    const edge = Math.max(...edgeCards.map(card => card.getBoundingClientRect().right));
                    minimumPan = -Math.max(0, edge - currentPan + view.innerWidth * (activeCategory ? 0.1 : 0.05) - view.innerWidth);
                }
                frozenPan = currentPan;
                const lastWork = works.querySelector('.project-card-neworgan');
                if (activeCategory) {
                    const visible = cards.filter(card => view.getComputedStyle(card).visibility !== 'hidden');
                    if (visible.length) {
                        const bounds = visible.map(card => card.getBoundingClientRect());
                        const left = Math.min(...bounds.map(rect => rect.left));
                        const right = Math.max(...bounds.map(rect => rect.right));
                        const padding = view.innerWidth * 0.1;
                        const canvasBounds = canvas.getBoundingClientRect();
                        const localLeft = (left - padding - canvasBounds.left) / scale;
                        const localRight = (right + padding - canvasBounds.left) / scale;
                        const clip = `inset(0px ${canvas.offsetWidth - localRight}px 0px ${localLeft}px)`;
                        if (canvas.style.clipPath !== clip) canvas.style.clipPath = clip;
                        const pan = new view.DOMMatrixReadOnly(view.getComputedStyle(canvas).transform).m41;
                        const remaining = right + padding - view.innerWidth;
                        if (!drag && remaining < -0.5 && pan < -0.5) {
                            canvasWindow.dispatchEvent(new view.WheelEvent('wheel', {
                                deltaX: -Math.min(-remaining, -pan), deltaY: 0,
                                bubbles: true, cancelable: true
                            }));
                        }
                    }
                } else if (lastWork && view.getComputedStyle(lastWork).visibility !== 'hidden') {
                    const canvasBounds = canvas.getBoundingClientRect();
                    const right = lastWork.getBoundingClientRect().right;
                    const padding = view.innerWidth * 0.05;
                    const localRight = (right + padding - canvasBounds.left) / scale;
                    const clip = `inset(0px ${Math.round((canvas.offsetWidth - localRight) * 100) / 100}px 0px 0px)`;
                    if (canvas.style.clipPath !== clip) canvas.style.clipPath = clip;
                    const remaining = right + padding - view.innerWidth;
                    const pan = new view.DOMMatrixReadOnly(view.getComputedStyle(canvas).transform).m41;
                    if (remaining < -0.5 && pan < -0.5) {
                        canvasWindow.dispatchEvent(new view.WheelEvent('wheel', {
                            deltaX: -Math.min(-remaining, -pan), deltaY: 0,
                            bubbles: true, cancelable: true
                        }));
                    }
                } else if (canvas.style.clipPath) {
                    canvas.style.clipPath = '';
                }
                bakeHighlights();
            };
            const schedule = () => {
                if (!frame) frame = view.requestAnimationFrame(arrange);
            };
            const focusCategory = event => {
                const link = event.target.closest('.main-nav a');
                if (!link) return;
                canvasWindow.scrollTop = 0;
                activeCategory = [...link.classList].find(name => name.startsWith('nav-'));
                categoryNeedsLayout = true;
                ++rasterVersion;
                rasterLayer?.remove();
                rasterLayer = null;
                [...canvas.children].filter(node => node.tagName.toLowerCase() === 'svg')
                    .forEach(node => { node.style.display = ''; });
                canvas.style.clipPath = '';
                cards.forEach(card => { card.style.translate = '0px 0px'; });
                pendingPan = 0;
                frozenPan = 0;
                canvas.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
                schedule();
            };
            const startDrag = event => {
                const card = event.target.closest('.project-card') ||
                    (canvasWindow.contains(event.target) ? canvasWindow : null);
                if (!card || event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
                event.stopImmediatePropagation();
                // Block the desktop card-drag handler without changing saved positions.
                drag = { card, id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, moved: false };
                card.setPointerCapture(event.pointerId);
            };
            const moveDrag = event => {
                if (!drag || event.pointerId !== drag.id) return;
                event.stopImmediatePropagation();
                const dx = event.clientX - drag.x;
                const dy = event.clientY - drag.y;
                if (Math.hypot(dx, dy) > 3) drag.moved = true;
                if (drag.moved) {
                    pendingPan += drag.lastX - event.clientX;
                    schedulePan();
                }
                drag.lastX = event.clientX;
            };
            const endDrag = event => {
                if (!drag || event.pointerId !== drag.id) return;
                event.stopImmediatePropagation();
                if (drag.moved) {
                    suppressClick = drag.card;
                    view.setTimeout(() => { suppressClick = null; }, 0);
                }
                drag = null;
                schedulePan();
            };
            const preventDragClick = event => {
                if (!suppressClick || event.target.closest('.project-card') !== suppressClick) return;
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            works.addEventListener('pointerdown', startDrag, true);
            works.addEventListener('pointermove', moveDrag, true);
            works.addEventListener('pointerup', endDrag, true);
            works.addEventListener('pointercancel', endDrag, true);
            works.addEventListener('click', preventDragClick, true);
            works.addEventListener('click', focusCategory, true);
            // Freeze the current canvas box once. Browser toolbar resizing and panning
            // must not trigger desktop extent calculation or SVG mask reconstruction.
            const box = view.getComputedStyle(canvas);
            Object.assign(canvas.style, {
                width: `${canvas.offsetWidth}px`, height: `${canvas.offsetHeight}px`,
                left: box.left, top: box.top, right: 'auto', bottom: 'auto'
            });
            // 220vw is the fixed reference composition: lowest card ends near
            // 212vw, followed by 8vw of space. No scroll-time extent measurement.
            const scrollStyle = works.createElement('style');
            scrollStyle.textContent = `
                html, body { height: 100%; overflow: hidden; }
                .canvas-window {
                    position: fixed; inset: 0; height: 100%; overflow-x: hidden;
                    overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch;
                }
                .mobile-canvas-surface {
                    position: relative; width: 100%; height: 220vw;
                    min-height: 100%; overflow: hidden; touch-action: pan-y;
                }
                .art-canvas, .project-card, .project-card img { touch-action: pan-y; }
                .mobile-canvas-surface .contact-link { position: absolute; bottom: 0; }
                .canvas-hint { display: none; }
            `;
            works.head.append(scrollStyle);
            const scrollSurface = works.createElement('div');
            scrollSurface.className = 'mobile-canvas-surface';
            canvasWindow.append(scrollSurface);
            scrollSurface.append(canvas);
            const contact = works.querySelector('.contact-link');
            if (contact) scrollSurface.append(contact);
            const fixedResize = event => event.stopImmediatePropagation();
            const wheelPan = event => {
                event.stopImmediatePropagation();
                if (event.ctrlKey || event.metaKey) { event.preventDefault(); return; }
                if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) return;
                event.preventDefault();
                pendingPan += event.deltaX;
                schedulePan();
            };
            view.addEventListener('resize', fixedResize, true);
            canvasWindow.addEventListener('wheel', wheelPan, { capture: true, passive: false });
            arrange();
            stopAlignment = () => {
                ++rasterVersion;
                scrollStyle.remove();
                rasterLayer?.remove();
                assetData.clear();
                view.removeEventListener('resize', fixedResize, true);
                canvasWindow.removeEventListener('wheel', wheelPan, true);
                works.removeEventListener('pointerdown', startDrag, true);
                works.removeEventListener('pointermove', moveDrag, true);
                works.removeEventListener('pointerup', endDrag, true);
                works.removeEventListener('pointercancel', endDrag, true);
                works.removeEventListener('click', preventDragClick, true);
                works.removeEventListener('click', focusCategory, true);
                if (frame) view.cancelAnimationFrame(frame);
                if (panFrame) view.cancelAnimationFrame(panFrame);
            };
        }

        function adaptMobileMei(page) {
            const view = page.defaultView;
            preview.style.transform = `translateY(${preview.clientWidth * 0.01}px)`;
            const width = view.innerWidth * 3;
            const rules = [...page.styleSheets].flatMap(sheet => [...sheet.cssRules]);
            const desktopStyles = rules.filter(rule =>
                !/dialog|modal|postcard-flip|is-postcard-open|portfolio-image-open/.test(rule.cssText))
                .map(rule => rule.cssText).join('\n');
            const style = page.createElement('style');
            style.textContent = desktopStyles.replace(/(-?\d*\.?\d+)vw\b/g,
                (_, number) => `${Number(number) * width / 100}px`) + `
                html.mei-html { width: 100%; overflow-x: auto; overflow-y: auto; }
                body.mei-detail-page { width: ${width}px; min-width: ${width}px; }
                html body.mei-detail-page h1.flowers-page-title {
                    left: 50vw; top: 0; font-size: 5vw; transform: translateX(-50%);
                }
                .mei-detail-page .flowers-project-tags {
                    top: 5vw; left: 13.5vw; font-size: clamp(9px, 1.2vw, 23px);
                }
                .mei-detail-page .flowers-back-link {
                    width: 10vw; margin-top: calc(0.7vw + 1.35em);
                }
                .mei-detail-page .flowers-back-link img {
                    width: 70%; height: auto; transform: translate(-10vw, -6.5vw);
                }
                .mei-detail-page .mei-project-tags {
                    top: calc(100% + 0.5vw); left: 0;
                    font-size: 1vw; width: max-content; white-space: nowrap; line-height: 1.35;
                }
                .mei-detail-page .mei-postcards-heading { left: 3vw; top: 22vw; font-size: 1vw; }
                .mei-detail-page .mei-postcards-heading img { width: auto; height: calc(2em / 3); }
                .mei-detail-page .mei-postcards-gallery {
                    left: 3vw; width: ${width - view.innerWidth * 0.06}px;
                    grid-template-columns: repeat(10, minmax(0, 1fr));
                    align-items: start; gap: 6px;
                }
                .mei-detail-page .mei-postcards-gallery .mei-postcard-pair {
                    top: 0; grid-template-rows: repeat(2, auto); gap: 6px;
                }
                .mei-detail-page .mei-postcard-pair img {
                    top: 0; width: 100%; height: auto;
                    aspect-ratio: 2103 / 1500; object-fit: contain; align-self: start;
                }
                .mei-detail-page .mei-postcard-pair:hover { transform: none !important; z-index: auto !important; }
            `;
            page.head.append(style);
            const heading = page.querySelector('.mei-postcards-heading');
            const gallery = page.querySelector('.mei-postcards-gallery');
            const description = page.querySelector('.mei-description');
            const title = page.querySelector('.flowers-page-title');
            const back = page.querySelector('.flowers-back-link img');
            const align = () => {
                if (preview.contentDocument !== page) return;
                const titleBounds = title.getBoundingClientRect();
                const backBounds = back.getBoundingClientRect();
                const difference = titleBounds.top + titleBounds.height / 2 -
                    (backBounds.top + backBounds.height / 2);
                if (Math.abs(difference) > 0.5) {
                    const current = parseFloat(back.style.translate.split(' ')[1]) || 0;
                    back.style.translate = `0px ${current + difference}px`;
                }
                const top = heading.getBoundingClientRect().bottom + view.scrollY + view.innerWidth * 0.05;
                gallery.style.setProperty('top', `${top}px`, 'important');
                const bottom = Math.max(...[...gallery.querySelectorAll('img')]
                    .map(image => image.getBoundingClientRect().bottom)) + view.scrollY;
                description.style.setProperty('top', `${bottom + width * 0.06}px`, 'important');
                const contentBottom = description.getBoundingClientRect().bottom + view.scrollY;
                page.body.style.setProperty('min-height', `${Math.max(view.innerHeight, contentBottom + width * 0.1)}px`, 'important');
            };
            const observer = new ResizeObserver(align);
            [heading, gallery, description, title, back].forEach(element => observer.observe(element));
            view.addEventListener('resize', align);
            page.fonts.ready.then(align);
            align();
            setPreviewLabel('手机尺寸预览 · Mei 电脑排版 · 可左右滑动');
            stopAlignment = () => {
                observer.disconnect();
                view.removeEventListener('resize', align);
            };
        }

        function adaptMobileCv(cv) {
            // Keep the CV's existing composition on a readable virtual desktop canvas.
            // These overrides exist only inside this preview's CV document.
            const canvasWidth = 1000;
            const originalStyles = [...cv.styleSheets].flatMap(sheet =>
                [...sheet.cssRules].map(rule => rule.cssText)).join('\n');
            const style = cv.createElement('style');
            style.textContent = originalStyles.replace(/(-?\d*\.?\d+)vw\b/g,
                (_, number) => `${Number(number) * canvasWidth / 100}px`) + `
                html.cv-html { width: 100%; overflow-x: auto; overflow-y: auto; }
                body.cv-page { width: ${canvasWidth}px; min-width: ${canvasWidth}px; padding-bottom: 72px; }
                .cv-page .site-header { width: ${canvasWidth}px; box-sizing: border-box; }
                .cv-page .cv-skills-text { font-size: 10px; }
                .cv-page .cv-about-text,
                .cv-page .cv-about-text p,
                .cv-page .cv-education-entry,
                .cv-page .cv-software-list,
                .cv-page .cv-email-row,
                .cv-page .cv-instagram-row,
                .cv-page .cv-location { font-size: 10px; }
            `;
            cv.head.append(style);
            setPreviewLabel('手机尺寸预览 · CV 正文 10px · 可左右滑动');


        }
        if (isPreview) {
            preview.addEventListener('load', alignWelcomeBackground);
        } else if (document.readyState === 'complete') {
            alignWelcomeBackground();
        } else {
            window.addEventListener('load', alignWelcomeBackground, { once: true });
        }
})();
