const seedanViewer = document.querySelector(".seedan-pdf-viewer");
const seedanPage = document.querySelector(".seedan-pdf-page");
const seedanTitle = document.querySelector(".seedan-detail-page .flowers-page-title");
const seedanTitleDescription = document.querySelector('.seedan-title-description');
const seedanProjectTags = document.querySelector('.seedan-project-tags');
const seedanConceptHeading = document.querySelector(".seedan-concept-heading");
const seedanConceptText = document.querySelector(".seedan-concept-text");
const seedanManifesto = document.querySelector(".seedan-manifesto");
const seedanScript = document.querySelector(".seedan-script");
const seedanModelingHeading = document.querySelector(".seedan-modeling-heading");
const seedanModelingGallery = document.querySelector(".seedan-modeling-gallery");
const seedanCitizenGallery = document.querySelector(".seedan-citizen-gallery");
const seedanBoxGallery = document.querySelector(".seedan-box-gallery");
const seedanResidentialGallery = document.querySelector(".seedan-residential-gallery");
const seedanResidentialCaption = seedanResidentialGallery.querySelector("p");
const seedanNameCardHeading = document.querySelector(".seedan-name-card-heading");
const seedanNameCardGallery = document.querySelector(".seedan-name-card-gallery");
const seedanInspirationHeading = document.querySelector(".seedan-inspiration-heading");
const seedanInspirationImage = document.querySelector(".seedan-inspiration-image");
let seedanCurrentPage = 1;
const seedanPageCount = 20;
const seedanScriptPage = document.querySelector(".seedan-script-page");
let seedanScriptCurrentPage = 1;
const seedanScriptPageCount = 3;
const seedanScriptDialog = document.querySelector(".seedan-script-dialog");
const seedanScriptModalPage = document.querySelector(".seedan-script-modal-page");
let seedanScriptScrollY = 0;

function openSeedanScript() {
    if (seedanScriptDialog.open) return;
    seedanScriptScrollY = window.scrollY;
    seedanScriptModalPage.src = seedanScriptPage.src;
    seedanScriptModalPage.alt = seedanScriptPage.alt;
    seedanScriptDialog.showModal();
    document.documentElement.classList.add("is-script-open");
}

seedanScriptDialog.addEventListener("close", () => {
    document.documentElement.classList.remove("is-script-open");
    window.scrollTo(0, seedanScriptScrollY);
});

seedanScriptPage.addEventListener("click", openSeedanScript);
seedanScriptPage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSeedanScript();
    }
});
document.querySelector(".seedan-script-open").addEventListener("click", openSeedanScript);
seedanScriptDialog.addEventListener("click", (event) => {
    if (event.target === seedanScriptDialog) seedanScriptDialog.close();
});
document.querySelector(".seedan-script-modal-prev").addEventListener("click", () => showSeedanScriptPage(-1));
document.querySelector(".seedan-script-modal-next").addEventListener("click", () => showSeedanScriptPage(1));

function showSeedanScriptPage(direction) {
    seedanScriptCurrentPage = (seedanScriptCurrentPage - 1 + direction + seedanScriptPageCount) % seedanScriptPageCount + 1;
    seedanScriptPage.src = `../image/seedan-script-pages/page-${seedanScriptCurrentPage}.jpg`;
    seedanScriptPage.alt = `Seedan script page ${seedanScriptCurrentPage} of ${seedanScriptPageCount}`;
    seedanScriptModalPage.src = seedanScriptPage.src;
    seedanScriptModalPage.alt = seedanScriptPage.alt;
}

document.querySelector(".seedan-script-prev").addEventListener("click", () => showSeedanScriptPage(-1));
document.querySelector(".seedan-script-next").addEventListener("click", () => showSeedanScriptPage(1));

function showSeedanPage(direction) {
    seedanCurrentPage = (seedanCurrentPage - 1 + direction + seedanPageCount) % seedanPageCount + 1;
    seedanPage.src = `../image/seedan-pages/page-${seedanCurrentPage}.jpg`;
    seedanPage.alt = `Seedan presentation page ${seedanCurrentPage} of ${seedanPageCount}`;
}

document.querySelector(".seedan-pdf-prev").addEventListener("click", () => showSeedanPage(-1));
document.querySelector(".seedan-pdf-next").addEventListener("click", () => showSeedanPage(1));
document.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (seedanScriptDialog.open || seedanScript.contains(document.activeElement)) {
        showSeedanScriptPage(event.key === "ArrowRight" ? 1 : -1);
    } else {
        showSeedanPage(event.key === "ArrowRight" ? 1 : -1);
    }
});

function positionSeedanViewer() {
    seedanProjectTags.style.top = `${seedanTitleDescription.offsetTop + seedanTitleDescription.offsetHeight + window.innerWidth * 0.005}px`;
    seedanViewer.style.top = `${seedanProjectTags.getBoundingClientRect().bottom + window.scrollY + window.innerWidth * 0.03}px`;
    const bottom = seedanViewer.getBoundingClientRect().bottom + window.scrollY;
    seedanConceptHeading.style.top = `${bottom + window.innerWidth * 0.08}px`;
    const headingBottom = seedanConceptHeading.getBoundingClientRect().bottom + window.scrollY;
    seedanConceptText.style.top = `${headingBottom + window.innerWidth * 0.03}px`;
    const textBottom = seedanConceptText.getBoundingClientRect().bottom + window.scrollY;
    seedanManifesto.style.top = `${textBottom + window.innerWidth * 0.05}px`;
    seedanScript.style.top = seedanManifesto.style.top;
    const figuresBottom = Math.max(seedanManifesto.getBoundingClientRect().bottom, seedanScript.getBoundingClientRect().bottom) + window.scrollY;
    seedanModelingHeading.style.top = `${figuresBottom + window.innerWidth * 0.08}px`;
    const modelingHeadingBottom = seedanModelingHeading.getBoundingClientRect().bottom + window.scrollY;
    seedanModelingGallery.style.top = `${modelingHeadingBottom - window.innerWidth * 0.05}px`;
    const modelingImagesBottom = Math.max(...[...seedanModelingGallery.children].map((element) => element.getBoundingClientRect().bottom)) + window.scrollY;
    seedanCitizenGallery.style.top = `${modelingImagesBottom + window.innerWidth * 0.1}px`;
    const citizenBottom = seedanCitizenGallery.getBoundingClientRect().bottom + window.scrollY;
    seedanBoxGallery.style.top = `${citizenBottom + window.innerWidth * 0.05}px`;
    const boxBottom = seedanBoxGallery.getBoundingClientRect().bottom + window.scrollY;
    seedanResidentialGallery.style.top = `${boxBottom - window.innerWidth * 0.01}px`;
    const residentialCaptionBottom = seedanResidentialCaption.getBoundingClientRect().bottom + window.scrollY;
    seedanNameCardHeading.style.top = `${residentialCaptionBottom + window.innerWidth * 0.08}px`;
    const nameCardHeadingBottom = seedanNameCardHeading.getBoundingClientRect().bottom + window.scrollY;
    seedanNameCardGallery.style.top = `${nameCardHeadingBottom + window.innerWidth * 0.05}px`;
    const nameCardsBottom = seedanNameCardGallery.getBoundingClientRect().bottom + window.scrollY;
    seedanInspirationHeading.style.top = `${nameCardsBottom + window.innerWidth * 0.08}px`;
    const inspirationHeadingBottom = seedanInspirationHeading.getBoundingClientRect().bottom + window.scrollY;
    seedanInspirationImage.style.top = `${inspirationHeadingBottom + window.innerWidth * 0.05}px`;
    const contentBottom = seedanInspirationImage.getBoundingClientRect().bottom + window.scrollY;
    document.body.style.minHeight = `${Math.max(window.innerHeight, contentBottom + window.innerWidth * 0.1)}px`;
}

const seedanResizeObserver = new ResizeObserver(positionSeedanViewer);
seedanResizeObserver.observe(seedanTitle);
seedanResizeObserver.observe(seedanTitleDescription);
seedanResizeObserver.observe(seedanProjectTags);
seedanResizeObserver.observe(seedanViewer);
seedanResizeObserver.observe(seedanConceptHeading);
seedanResizeObserver.observe(seedanConceptText);
seedanResizeObserver.observe(seedanManifesto);
seedanResizeObserver.observe(seedanScript);
seedanResizeObserver.observe(seedanModelingHeading);
seedanResizeObserver.observe(seedanModelingGallery);
seedanResizeObserver.observe(seedanCitizenGallery);
seedanResizeObserver.observe(seedanBoxGallery);
seedanResizeObserver.observe(seedanResidentialGallery);
seedanResizeObserver.observe(seedanNameCardHeading);
seedanResizeObserver.observe(seedanNameCardGallery);
seedanResizeObserver.observe(seedanInspirationHeading);
seedanResizeObserver.observe(seedanInspirationImage);
window.addEventListener("resize", positionSeedanViewer);
document.fonts.ready.then(positionSeedanViewer);
positionSeedanViewer();
