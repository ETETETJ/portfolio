const cvHeader = document.querySelector(".cv-page .site-header");

function updateCvHeight() {
    const contentBottom = Math.max(
        ...[cvHeader, ...cvHeader.querySelectorAll("*")].map((element) =>
            element.getBoundingClientRect().bottom + window.scrollY
        )
    );
    document.body.style.minHeight = `${Math.max(window.innerHeight, contentBottom + window.innerWidth * 0.1)}px`;
}

const cvResizeObserver = new ResizeObserver(updateCvHeight);
for (const element of [cvHeader, ...cvHeader.querySelectorAll("*")]) {
    cvResizeObserver.observe(element);
}
window.addEventListener("resize", updateCvHeight);
document.fonts.ready.then(updateCvHeight);
updateCvHeight();
