(() => {
    const dialog = document.createElement("dialog");
    dialog.className = "portfolio-image-dialog";
    dialog.setAttribute("aria-label", "Enlarged image");
    const enlargedImage = document.createElement("img");
    enlargedImage.className = "portfolio-enlarged-image";
    enlargedImage.alt = "";
    enlargedImage.tabIndex = 0;
    dialog.append(enlargedImage);
    document.body.append(dialog);
    let previousFocus = null;
    let savedScrollX = 0;
    let savedScrollY = 0;
    let imageRequest = 0;
    enlargedImage.decoding = 'async';
    let enlargeSeedtech = false;
    let enlargeResidential = false;
    let enlargeCollage = false;
    enlargedImage.addEventListener('load', () => {
        if (dialog.open && enlargedImage.classList.contains('portfolio-rotated-box')) {
            enlargedImage.style.width = '';
            enlargedImage.style.maxWidth = '';
            enlargedImage.style.maxHeight = '';
            const bounds = enlargedImage.getBoundingClientRect();
            const factor = (bounds.width + window.innerWidth * 0.25) / bounds.width;
            enlargedImage.style.width = `${bounds.height * factor}px`;
            enlargedImage.style.maxWidth = 'none';
            enlargedImage.style.maxHeight = 'none';
            dialog.style.setProperty('--box-scroll-height', `${bounds.height * factor}px`);
            return;
        }
        if ((!enlargeSeedtech && !enlargeResidential && !enlargeCollage) || !dialog.open) return;
        enlargedImage.style.width = '';
        enlargedImage.style.maxWidth = '';
        enlargedImage.style.maxHeight = '';
        const width = enlargedImage.getBoundingClientRect().width;
        enlargedImage.style.width = `${width + window.innerWidth * (enlargeCollage ? 0.25 : enlargeResidential ? 0.2 : 0.1)}px`;
        enlargedImage.style.maxWidth = 'none';
        enlargedImage.style.maxHeight = 'none';
    });

    function isViewable(image) {
        if (!(image instanceof HTMLImageElement)) return false;
        if (image.closest("a, dialog, .mei-postcard-pair, .seedan-script-viewer, .winwing-shiny-image, .neworgan-research-viewer")) return false;
        const filename = new URL(image.src, location.href).pathname.split("/").pop().toLowerCase();
        return !["back.png", "blackstar.png", "redstar.png"].includes(filename);
    }

    function prepareImages() {
        document.querySelectorAll("body img").forEach((image) => {
            if (!isViewable(image)) return;
            image.dataset.imageViewer = "";
            image.tabIndex = 0;
            image.setAttribute("role", "button");
            image.setAttribute("aria-haspopup", "dialog");
        });
    }

    function openImage(image) {
        if (dialog.open) return;
        previousFocus = image;
        savedScrollX = window.scrollX;
        savedScrollY = window.scrollY;
        const request = ++imageRequest;
        const previewSource = image.currentSrc || image.src;
        const originalPath = new URL(image.dataset.fullSrc || image.src, location.href).pathname;
        enlargeSeedtech = document.body.classList.contains('seedan-detail-page') &&
            originalPath.endsWith('/seedtech.png');
        enlargeResidential = document.body.classList.contains('seedan-detail-page') &&
            /\/(FANGZI|FANGZI2|FANGZI3)\.png$/i.test(originalPath);
        enlargeCollage = document.body.classList.contains('seedan-detail-page') &&
            originalPath.endsWith('/utopiacollage.png');
        dialog.classList.toggle('portfolio-collage-scroll', enlargeCollage);
        enlargedImage.style.transform = '';
        const isBox = document.body.classList.contains('seedan-detail-page') &&
            originalPath.endsWith('/box.png');
        enlargedImage.classList.toggle('portfolio-rotated-box', isBox);
        dialog.classList.toggle('portfolio-box-scroll', isBox);
        dialog.scrollTop = 0;
        dialog.scrollLeft = 0;
        enlargedImage.style.width = '';
        enlargedImage.style.maxWidth = '';
        enlargedImage.style.maxHeight = '';
        enlargedImage.src = previewSource;
        enlargedImage.alt = image.alt;
        // End Flowers hover previews while its still image is enlarged.
        document.querySelectorAll('video[aria-hidden="true"]').forEach((video) => video.pause());
        dialog.showModal();
        document.documentElement.classList.add("portfolio-image-open");
        enlargedImage.focus({ preventScroll: true });
        // Show the cached preview immediately; replace it only after the original is ready.
        if (image.dataset.fullSrc) {
            const original = new Image();
            original.decoding = 'async';
            original.src = image.dataset.fullSrc;
            original.decode().then(() => {
                if (dialog.open && request === imageRequest) enlargedImage.src = original.src;
            }).catch(() => { /* Keep the sharp preview if the original cannot load. */ });
        }
    }

    document.addEventListener("click", (event) => {
        if (isViewable(event.target)) openImage(event.target);
    });
    document.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && isViewable(event.target)) {
            event.preventDefault();
            openImage(event.target);
        }
    });
    dialog.addEventListener("keydown", (event) => {
        // Keep underlying book/PDF keyboard controls inactive in the image viewer.
        event.stopPropagation();
    });
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
            return;
        }
        if (event.target !== enlargedImage ||
            !document.body.classList.contains('seedan-detail-page') ||
            !enlargedImage.complete || !enlargedImage.naturalWidth) return;

        // Transparent PNG pixels should behave like the surrounding backdrop.
        const bounds = enlargedImage.getBoundingClientRect();
        const rotated = enlargedImage.classList.contains('portfolio-rotated-box');
        const width = rotated ? bounds.height : bounds.width;
        const height = rotated ? bounds.width : bounds.height;
        const scale = Math.min(width / enlargedImage.naturalWidth,
            height / enlargedImage.naturalHeight);
        const localX = rotated ? event.clientY - (bounds.top + bounds.height / 2) + width / 2
            : event.clientX - bounds.left;
        const localY = rotated ? -(event.clientX - (bounds.left + bounds.width / 2)) + height / 2
            : event.clientY - bounds.top;
        const x = Math.floor((localX - (width - enlargedImage.naturalWidth * scale) / 2) / scale);
        const y = Math.floor((localY - (height - enlargedImage.naturalHeight * scale) / 2) / scale);
        if (x < 0 || y < 0 || x >= enlargedImage.naturalWidth || y >= enlargedImage.naturalHeight) {
            dialog.close();
            return;
        }
        const sample = document.createElement('canvas');
        sample.width = sample.height = 1;
        const context = sample.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        try {
            context.drawImage(enlargedImage, x, y, 1, 1, 0, 0, 1, 1);
            if (context.getImageData(0, 0, 1, 1).data[3] <= 16) dialog.close();
        } catch { /* Keep the image open if its pixels cannot be read. */ }
    });
    dialog.addEventListener("close", () => {
        imageRequest++;
        document.documentElement.classList.remove("portfolio-image-open");
        previousFocus?.focus({ preventScroll: true });
        window.scrollTo(savedScrollX, savedScrollY);
    });

    prepareImages();
    new MutationObserver(prepareImages).observe(document.body, { childList: true, subtree: true });
})();
