const earthboundDialog = document.querySelector(".earthbound-image-dialog");
const earthboundModalImage = document.querySelector(".earthbound-modal-image");
const earthboundImages = document.querySelectorAll(
    ".earthbound-scenes-image, .earthbound-character-gallery img, .earthbound-object-gallery img, .earthbound-scene-gallery img"
);
let earthboundScrollY = 0;
let earthboundPreviousFocus = null;
let earthboundImageRequest = 0;

earthboundImages.forEach((image) => {
    image.dataset.enlarge = "";
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    function openImage() {
        const request = ++earthboundImageRequest;
        earthboundScrollY = window.scrollY;
        earthboundPreviousFocus = image;
        earthboundModalImage.src = image.currentSrc || image.src;
        earthboundModalImage.alt = image.alt;
        earthboundDialog.showModal();
        document.documentElement.classList.add("is-image-open");
        earthboundModalImage.tabIndex = 0;
        earthboundModalImage.focus({ preventScroll: true });
        if (image.dataset.fullSrc) {
            const original = new Image();
            original.decoding = 'async';
            original.src = image.dataset.fullSrc;
            original.decode().then(() => {
                if (earthboundDialog.open && request === earthboundImageRequest) {
                    earthboundModalImage.src = original.src;
                }
            }).catch(() => {});
        }
    }
    image.addEventListener("click", openImage);
    image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openImage();
        }
    });
});

earthboundDialog.addEventListener("click", (event) => {
    if (event.target === earthboundDialog) earthboundDialog.close();
});
earthboundDialog.addEventListener("close", () => {
    earthboundImageRequest++;
    document.documentElement.classList.remove("is-image-open");
    earthboundPreviousFocus?.focus({ preventScroll: true });
    window.scrollTo(0, earthboundScrollY);
});
