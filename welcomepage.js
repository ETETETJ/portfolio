const portfolioBackground = document.querySelector(".welcome-portfolio-background");
const welcomeContactDialog = document.querySelector('.jet-contact-dialog');
document.querySelector('.welcome-contact-link').addEventListener('click', event => {
    event.preventDefault();
    if (!welcomeContactDialog.open) welcomeContactDialog.showModal();
});
welcomeContactDialog.addEventListener('click', event => {
    const bounds = welcomeContactDialog.getBoundingClientRect();
    if (event.target === welcomeContactDialog &&
        (event.clientY < bounds.top || event.clientY > bounds.bottom ||
         event.clientX < bounds.left || event.clientX > bounds.right)) {
        welcomeContactDialog.close();
    }
});

window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    portfolioBackground.contentWindow.postMessage({
        type: "welcome-canvas-pan",
        progress: event.clientX / window.innerWidth
    }, "*");
});
