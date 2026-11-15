const winwingGallery = document.querySelector(".winwing-gallery");
const winwingShinyImage = document.querySelector(".winwing-shiny-image");
const winwingDescription = document.querySelector(".winwing-description");
const winwingEarModel = document.querySelector(".winwing-ear-model");
const winwingPoster = document.querySelector(".winwing-poster");
const winwingPhotographyHeading = document.querySelector(".winwing-photography-heading");
const winwingPhotographyGallery = document.querySelector(".winwing-photography-gallery");
const winwingPhotoL2 = winwingPhotographyGallery.querySelector('img[src$="winwingphotol2.png"]');
const winwingPhotomeGallery = document.querySelector(".winwing-photome-gallery");

function positionWinwingShinyImage() {
    const galleryBottom = winwingGallery.getBoundingClientRect().bottom + window.scrollY;
    winwingDescription.style.top = `${galleryBottom + window.innerWidth * 0.1}px`;
    const textBounds = winwingDescription.getBoundingClientRect();
    const textBottom = textBounds.bottom + window.scrollY;
    const textCenter = textBounds.top + window.scrollY + textBounds.height / 2;
    winwingShinyImage.style.top = `${textCenter - winwingShinyImage.getBoundingClientRect().height / 2}px`;
    const imageBottom = winwingShinyImage.getBoundingClientRect().bottom + window.scrollY;
    winwingEarModel.style.top = `${textBottom + window.innerWidth * 0.05}px`;
    const earModelBottom = winwingEarModel.getBoundingClientRect().bottom + window.scrollY;
    winwingPoster.style.top = `${earModelBottom + window.innerWidth * 0.08}px`;
    const posterBottom = winwingPoster.getBoundingClientRect().bottom + window.scrollY;
    winwingPhotographyHeading.style.top = `${posterBottom + window.innerWidth * 0.08}px`;
    const photographyBottom = winwingPhotographyHeading.getBoundingClientRect().bottom + window.scrollY;
    winwingPhotographyGallery.style.top = `${photographyBottom + window.innerWidth * 0.05}px`;
    const photosBottom = winwingPhotographyGallery.getBoundingClientRect().bottom + window.scrollY;
    const photoL2Bottom = winwingPhotoL2.getBoundingClientRect().bottom + window.scrollY;
    winwingPhotomeGallery.style.top = `${Math.max(photosBottom, photoL2Bottom) + window.innerWidth * 0.035 * 54.5 / 74.5}px`;
    const photomeBottom = winwingPhotomeGallery.getBoundingClientRect().bottom + window.scrollY;
    document.body.style.minHeight = `${Math.max(window.innerHeight, Math.max(imageBottom, photosBottom, photomeBottom) + window.innerWidth * 0.1)}px`;
}

new ResizeObserver(positionWinwingShinyImage).observe(winwingGallery);
new ResizeObserver(positionWinwingShinyImage).observe(winwingDescription);
new ResizeObserver(positionWinwingShinyImage).observe(winwingShinyImage);
new ResizeObserver(positionWinwingShinyImage).observe(winwingEarModel);
new ResizeObserver(positionWinwingShinyImage).observe(winwingPoster);
new ResizeObserver(positionWinwingShinyImage).observe(winwingPhotographyHeading);
new ResizeObserver(positionWinwingShinyImage).observe(winwingPhotographyGallery);
new ResizeObserver(positionWinwingShinyImage).observe(winwingPhotoL2);
new ResizeObserver(positionWinwingShinyImage).observe(winwingPhotomeGallery);
window.addEventListener("resize", positionWinwingShinyImage);
positionWinwingShinyImage();
