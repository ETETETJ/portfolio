const rootVideo = document.querySelector(".root-project-video");
const rootDescription = document.querySelector(".root-description");
const rootVeggiePhotos = document.querySelector(".root-veggie-photos");
const rootIdeaHeading = document.querySelector(".root-idea-heading");
const rootVeggieDraft = document.querySelector(".root-veggie-draft");
const rootProcessHeading = document.querySelector(".root-process-heading");
const rootVeggieProcess = document.querySelector(".root-veggie-process");

function positionRootDescription() {
    const videoBottom = rootVideo.getBoundingClientRect().bottom + window.scrollY;
    rootDescription.style.top = `${videoBottom + window.innerWidth * 0.07}px`;
    const textBottom = rootDescription.getBoundingClientRect().bottom + window.scrollY;
    rootVeggiePhotos.style.top = `${textBottom + window.innerWidth * 0.05}px`;
    const photosBottom = rootVeggiePhotos.getBoundingClientRect().bottom + window.scrollY;
    rootIdeaHeading.style.top = `${photosBottom + window.innerWidth * 0.08}px`;
    const headingBottom = rootIdeaHeading.getBoundingClientRect().bottom + window.scrollY;
    rootVeggieDraft.style.top = `${headingBottom + window.innerWidth * 0.05}px`;
    const draftBottom = rootVeggieDraft.getBoundingClientRect().bottom + window.scrollY;
    rootProcessHeading.style.top = `${draftBottom + window.innerWidth * 0.08}px`;
    const processHeadingBottom = rootProcessHeading.getBoundingClientRect().bottom + window.scrollY;
    rootVeggieProcess.style.top = `${processHeadingBottom + window.innerWidth * 0.05}px`;
    const contentBottom = rootVeggieProcess.getBoundingClientRect().bottom + window.scrollY;
    document.body.style.minHeight = `${Math.max(window.innerHeight, contentBottom + window.innerWidth * 0.1)}px`;
}

const rootResizeObserver = new ResizeObserver(positionRootDescription);
rootResizeObserver.observe(rootVideo);
rootResizeObserver.observe(rootDescription);
rootResizeObserver.observe(rootVeggiePhotos);
rootResizeObserver.observe(rootIdeaHeading);
rootResizeObserver.observe(rootVeggieDraft);
rootResizeObserver.observe(rootProcessHeading);
rootResizeObserver.observe(rootVeggieProcess);
window.addEventListener("resize", positionRootDescription);
document.fonts.ready.then(positionRootDescription);
positionRootDescription();
