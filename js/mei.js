const meiPostcardsHeading = document.querySelector(".mei-postcards-heading");
const meiPostcardsGallery = document.querySelector(".mei-postcards-gallery");
const meiDescription = document.querySelector(".mei-description");

function positionMeiPostcards() {
    const headingBottom = meiPostcardsHeading.getBoundingClientRect().bottom + window.scrollY;
    meiPostcardsGallery.style.top = `${headingBottom + window.innerWidth * 0.03}px`;
    const imagesBottom = Math.max(...[...meiPostcardsGallery.querySelectorAll("img")].map((image) => image.getBoundingClientRect().bottom)) + window.scrollY;
    meiDescription.style.top = `${imagesBottom + window.innerWidth * 0.06}px`;
    const contentBottom = meiDescription.getBoundingClientRect().bottom + window.scrollY;
    document.body.style.minHeight = `${Math.max(window.innerHeight, contentBottom + window.innerWidth * 0.1)}px`;
}

const meiResizeObserver = new ResizeObserver(positionMeiPostcards);
meiResizeObserver.observe(meiPostcardsHeading);
meiResizeObserver.observe(meiPostcardsGallery);
meiResizeObserver.observe(meiDescription);
window.addEventListener("resize", positionMeiPostcards);
document.fonts.ready.then(positionMeiPostcards);
positionMeiPostcards();

const meiPostcardDialog = document.querySelector(".mei-postcard-dialog");
const meiModalImage = document.querySelector(".mei-postcard-modal-image");
let meiActivePostcard = 1;
let meiShowingBack = false;
let meiSavedScrollY = 0;
let meiPreviousFocus = null;

function updateMeiModalImage() {
    const filename = meiShowingBack
        ? `postcard${meiActivePostcard}-${meiActivePostcard}.png`
        : `postcard${meiActivePostcard}.png`;
    meiModalImage.src = `../image/${filename}`;
    meiModalImage.alt = `Postcard ${meiActivePostcard} ${meiShowingBack ? "back" : "front"}`;
}

document.querySelectorAll(".mei-postcard-pair").forEach((pair, index) => {
    pair.querySelectorAll("img").forEach((image) => {
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute("aria-haspopup", "dialog");
        function openPostcard() {
            meiActivePostcard = index + 1;
            meiShowingBack = false;
            meiSavedScrollY = window.scrollY;
            meiPreviousFocus = image;
            updateMeiModalImage();
            meiPostcardDialog.showModal();
        }
        image.addEventListener("click", openPostcard);
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPostcard();
            }
        });
    });
});

function flipMeiPostcard() {
    meiShowingBack = !meiShowingBack;
    updateMeiModalImage();
}

document.querySelector(".mei-postcard-flip").addEventListener("click", flipMeiPostcard);
meiModalImage.addEventListener("click", flipMeiPostcard);
meiModalImage.tabIndex = 0;
meiModalImage.setAttribute("role", "button");
meiModalImage.setAttribute("aria-label", "Flip postcard");
meiModalImage.style.cursor = "pointer";
meiModalImage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flipMeiPostcard();
    }
});
meiPostcardDialog.addEventListener("click", (event) => {
    if (event.target === meiPostcardDialog) meiPostcardDialog.close();
});
meiPostcardDialog.addEventListener("close", () => {
    meiPreviousFocus?.focus({ preventScroll: true });
    window.scrollTo(0, meiSavedScrollY);
});
