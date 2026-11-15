(() => {
    const gallery = document.querySelector('.neworgan-exhibition-gallery');
    const photo = gallery.querySelector(':scope > img');
    const text = gallery.querySelector('.neworgan-description');
    const heading = gallery.querySelector('.neworgan-exhibition-heading');
    const hairPhoto = gallery.querySelector('.neworgan-hair-gallery img:last-child');
    const modelingHeading = document.querySelector('.neworgan-modeling-heading');
    const objectGallery = document.querySelector('.neworgan-object-gallery');
    const hairJoint = document.querySelector('.neworgan-hair-joint');
    const alignHeading = () => {
        const bounds = gallery.getBoundingClientRect();
        const imageBounds = photo.getBoundingClientRect();
        const textBounds = text.getBoundingClientRect();
        heading.style.left = `${imageBounds.left - bounds.left}px`;
        heading.style.width = `${imageBounds.width}px`;
        heading.style.top = `${textBounds.top - bounds.top + textBounds.height / 2}px`;
        modelingHeading.style.marginTop = `${hairPhoto.getBoundingClientRect().bottom - bounds.bottom + window.innerWidth * 0.08}px`;
        hairJoint.style.transform = `translateX(${hairPhoto.getBoundingClientRect().right - objectGallery.getBoundingClientRect().right}px)`;
    };
    const observer = new ResizeObserver(alignHeading);
    observer.observe(gallery);
    observer.observe(text);
    observer.observe(photo);
    observer.observe(hairPhoto);
    document.fonts.ready.then(alignHeading);
    window.addEventListener('resize', alignHeading);
    alignHeading();
    const viewer = document.querySelector('.neworgan-research-viewer');
    const pageImage = viewer.querySelector('.neworgan-research-page');
    const dialog = document.querySelector('.neworgan-research-dialog');
    const modalImage = dialog.querySelector('.neworgan-research-modal-page');
    let savedScrollY = 0;
    const syncModal = () => {
        modalImage.src = pageImage.src;
        modalImage.alt = pageImage.alt;
    };
    const openPDF = () => {
        if (dialog.open) return;
        savedScrollY = window.scrollY;
        syncModal();
        dialog.showModal();
        document.documentElement.classList.add('is-research-open');
    };
    pageImage.tabIndex = 0;
    pageImage.setAttribute('role', 'button');
    pageImage.setAttribute('aria-label', 'Enlarge research PDF');
    pageImage.addEventListener('click', openPDF);
    pageImage.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPDF();
        }
    });
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('is-research-open');
        pageImage.focus({ preventScroll: true });
        window.scrollTo(0, savedScrollY);
    });
    let currentPage = 1;
    const pageCount = 6;
    const turnPage = direction => {
        currentPage = (currentPage - 1 + direction + pageCount) % pageCount + 1;
        pageImage.src = `../image/neworgan-research-pages/page-${currentPage}.jpg`;
        pageImage.alt = `Research PDF page ${currentPage}`;
        if (dialog.open) syncModal();
    };
    dialog.querySelector('.neworgan-research-modal-prev').addEventListener('click', () => turnPage(-1));
    dialog.querySelector('.neworgan-research-modal-next').addEventListener('click', () => turnPage(1));
    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            turnPage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    });
    viewer.querySelector('.neworgan-research-prev').addEventListener('click', () => turnPage(-1));
    viewer.querySelector('.neworgan-research-next').addEventListener('click', () => turnPage(1));
    viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            turnPage(event.key === 'ArrowLeft' ? -1 : 1);
        }
    });
})();
