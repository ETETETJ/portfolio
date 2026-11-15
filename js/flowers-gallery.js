const galleryImages = [...document.querySelectorAll(".flowers-gallery img")];
let activePreview = null;

galleryImages.forEach((image, index) => {
    const hideStillDuringPlayback = index >= galleryImages.length - 2;
    const video = document.createElement("video");
    video.src = `../video/f${index + 1}video.mp4`;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.setAttribute("aria-hidden", "true");
    Object.assign(video.style, {
        position: "fixed",
        zIndex: "10",
        display: "none",
        objectFit: "cover",
        boxShadow: index >= 8 ? "-3vw 0 0 #000, 3vw 0 0 #000" : "",
        pointerEvents: "none"
    });
    document.body.append(video);

    if (hideStillDuringPlayback) {
        video.style.backgroundColor = "#000";
        video.addEventListener("playing", () => {
            image.style.opacity = "0";
        });
        for (const eventName of ["pause", "ended", "error"]) {
            video.addEventListener(eventName, () => {
                image.style.opacity = "";
            });
        }
    }

    const positionPreview = () => {
        const bounds = image.getBoundingClientRect();
        const left = hideStillDuringPlayback ? Math.floor(bounds.left) : bounds.left;
        const top = hideStillDuringPlayback ? Math.floor(bounds.top) : bounds.top;
        Object.assign(video.style, {
            top: `${top}px`,
            left: `${left}px`,
            width: `${hideStillDuringPlayback ? Math.ceil(bounds.right) - left : bounds.width}px`,
            height: `${hideStillDuringPlayback ? Math.ceil(bounds.bottom) - top : bounds.height}px`
        });
    };

    image.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse") return;
        if (activePreview && activePreview !== video) {
            activePreview.pause();
            activePreview.currentTime = 0;
            activePreview.style.display = "none";
        }
        activePreview = video;
        positionPreview();
        video.style.display = "block";
        video.play().catch((error) => {
            video.style.display = "none";
            activePreview = null;
            console.error(`Unable to play the f${index + 1} preview video.`, error);
        });
    });

    image.addEventListener("pointerleave", () => {
        video.pause();
        video.currentTime = 0;
        video.style.display = "none";
        if (activePreview === video) activePreview = null;
    });

    window.addEventListener("scroll", () => {
        if (activePreview === video) positionPreview();
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (activePreview === video) positionPreview();
    });
});
