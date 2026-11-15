const slides = [
    "2dcharapdf.jpg",
    "2dscene0pdf.jpg",
    "2dscene1pdf.jpg",
    "2dscene2pdf.jpg",
    "2dscene3pdf.jpg",
    "2dscene4pdf.jpg",
    "2dniangaopdf.jpg"
];

const slideImage = document.querySelector(".flowers-pdf-slide");
let currentSlide = 0;

function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slideImage.src = `../image/${slides[currentSlide]}`;
    slideImage.alt = `2D animation scenes and details slide ${currentSlide + 1} of ${slides.length}`;
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
