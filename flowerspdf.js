const slides = [
    "flowerspdfdraft.jpg",
    "flowersdraftpdf2.jpg",
    "flowersmodelprocess.jpg",
    "flowersfinalworkpdf.jpg",
    "flowersfinalworkpdf2.jpg",
    "flowerspdf1.jpg",
    "flowerspdf2.jpg",
    "flowerspdf3.jpg",
    "flowerspdf3detail.jpg",
    "flowerspdf4.jpg",
    "flowerspdf4detail.jpg",
    "flowerspdf5.jpg",
    "flowerspdf6.jpg",
    "flowerspdf7.jpg",
    "flowerspdf8.jpg",
    "flowerspdf9.jpg"
];

const slideImage = document.querySelector(".flowers-pdf-slide");
let currentSlide = 0;

function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slideImage.src = `../image/${slides[currentSlide]}`;
    slideImage.alt = `Flowers process and details slide ${currentSlide + 1} of ${slides.length}`;
}

document.querySelector(".flowers-pdf-prev").addEventListener("click", () => {
    showSlide(currentSlide - 1);
});

document.querySelector(".flowers-pdf-next").addEventListener("click", () => {
    showSlide(currentSlide + 1);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
    if (event.key === "ArrowRight") showSlide(currentSlide + 1);
});
