const speciTitle = document.querySelector(".speci-detail-page .flowers-page-title");
const speciVideo = document.querySelector(".speci-project-video");
const speciScenesImage = document.querySelector(".speci-scenes-image");

function alignSpeciVideo() {
    const titleBounds = speciTitle.getBoundingClientRect();
    const videoBounds = speciVideo.getBoundingClientRect();
    const currentOffset = Number.parseFloat(speciVideo.style.left) || 0;
    const difference = titleBounds.left + titleBounds.width / 2
        - (videoBounds.left + videoBounds.width / 2);
    speciVideo.style.left = `${currentOffset + difference}px`;
    if (speciScenesImage) speciScenesImage.style.left = speciVideo.style.left;
}

const speciAlignmentObserver = new ResizeObserver(alignSpeciVideo);
speciAlignmentObserver.observe(speciTitle);
speciAlignmentObserver.observe(speciVideo);
window.addEventListener("resize", alignSpeciVideo);
document.fonts.ready.then(alignSpeciVideo);
alignSpeciVideo();
