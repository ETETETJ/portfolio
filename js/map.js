const mapBookSpreads = [[1], [2, 3], [4, 5]];
const mapBookViewer = document.querySelector(".map-book-viewer");
const mapBookSpread = document.querySelector(".map-book-spread");
const mapTags = document.querySelector(".map-project-tags");
const mapGraphicHeading = document.querySelector(".map-graphic-heading");
const mapGraphicGallery = document.querySelector(".map-graphic-gallery");
const mapExhibitionHeading = document.querySelector(".map-exhibition-heading");
const mapExhibitionImage = document.querySelector(".map-exhibition-image");
const mapExhibitionHeadingBottom = document.querySelector(".map-exhibition-heading-bottom");
const mapSetupImage = document.querySelector(".map-setup-image");
let mapBookIndex = 0;
let mapSpreadRequest = 0;
const mapBookImages = new Map([[1, mapBookSpread.querySelector('img')]]);
const mapBookReady = new Map();

function getMapBookImage(page) {
    if (!mapBookImages.has(page)) {
        const image = new Image();
        image.decoding = 'async';
        image.src = `../image/mapbook-web/mapbook${page}.jpg`;
        image.dataset.fullSrc = `../image/mapbook${page}.jpg`;
        image.alt = `Map book page ${page}`;
        mapBookImages.set(page, image);
        mapBookReady.set(page, image.decode().catch(() => {}));
    }
    return mapBookImages.get(page);
}

// Warm the browser cache before the reader turns to the next spread.
for (let page = 2; page <= 5; page++) getMapBookImage(page);

async function showMapSpread(index) {
    mapBookIndex = (index + mapBookSpreads.length) % mapBookSpreads.length;
    const request = ++mapSpreadRequest;
    const pages = mapBookSpreads[mapBookIndex];
    const images = pages.map(getMapBookImage);
    await Promise.all(pages.map(page => mapBookReady.get(page)));
    if (request === mapSpreadRequest) mapBookSpread.replaceChildren(...images);
}

document.querySelector(".map-book-prev").addEventListener("click", () => showMapSpread(mapBookIndex - 1));
document.querySelector(".map-book-next").addEventListener("click", () => showMapSpread(mapBookIndex + 1));
document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showMapSpread(mapBookIndex + (event.key === "ArrowRight" ? 1 : -1));
});

function positionMapBook() {
    mapBookViewer.style.top = `${mapTags.getBoundingClientRect().bottom + window.scrollY + window.innerWidth * 0.03}px`;
    const bookBottom = mapBookViewer.getBoundingClientRect().bottom + window.scrollY;
    mapGraphicHeading.style.top = `${bookBottom + window.innerWidth * 0.07}px`;
    const headingBottom = mapGraphicHeading.getBoundingClientRect().bottom + window.scrollY;
    mapGraphicGallery.style.top = `${headingBottom + window.innerWidth * 0.05}px`;
    const galleryBottom = mapGraphicGallery.getBoundingClientRect().bottom + window.scrollY;
    mapExhibitionHeading.style.top = `${galleryBottom + window.innerWidth * 0.07}px`;
    const exhibitionHeadingBottom = mapExhibitionHeading.getBoundingClientRect().bottom + window.scrollY;
    mapExhibitionImage.style.top = `${exhibitionHeadingBottom + window.innerWidth * 0.03}px`;
    const exhibitionImageBottom = mapExhibitionImage.getBoundingClientRect().bottom + window.scrollY;
    mapExhibitionHeadingBottom.style.top = `${exhibitionImageBottom + window.innerWidth * 0.07}px`;
    const exhibitionLabelBottom = mapExhibitionHeadingBottom.getBoundingClientRect().bottom + window.scrollY;
    mapSetupImage.style.top = `${exhibitionLabelBottom + window.innerWidth * 0.03}px`;
    const contentBottom = mapSetupImage.getBoundingClientRect().bottom + window.scrollY;
    document.body.style.minHeight = `${Math.max(window.innerHeight, contentBottom + window.innerWidth * 0.1)}px`;
}
new ResizeObserver(positionMapBook).observe(mapTags);
new ResizeObserver(positionMapBook).observe(mapBookViewer);
new ResizeObserver(positionMapBook).observe(mapGraphicHeading);
new ResizeObserver(positionMapBook).observe(mapGraphicGallery);
new ResizeObserver(positionMapBook).observe(mapExhibitionHeading);
new ResizeObserver(positionMapBook).observe(mapExhibitionImage);
new ResizeObserver(positionMapBook).observe(mapExhibitionHeadingBottom);
new ResizeObserver(positionMapBook).observe(mapSetupImage);
window.addEventListener("resize", positionMapBook);
document.fonts.ready.then(positionMapBook);
positionMapBook();
