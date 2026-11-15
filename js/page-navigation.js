(() => {
    // The welcome page embeds jet.html; its background must not record navigation.
    if (window.top !== window) return;
    const pendingKey = 'portfolio-pending-navigation';
    const pageURL = location.href.split('#')[0];
    try {
        const pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null');
        if (pending && pending.to === pageURL && Date.now() - pending.time < 60000) {
            history.replaceState({ ...history.state, portfolioHasPrevious: true }, '');
            sessionStorage.removeItem(pendingKey);
        }
    } catch { /* Navigation remains available if session storage is restricted. */ }

    const savePosition = () => {
        history.replaceState({
            ...history.state,
            portfolioScroll: { x: window.scrollX, y: window.scrollY }
        }, '');
    };
    window.addEventListener('pagehide', savePosition);

    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const destination = new URL(link.href, location.href);
        if (destination.origin !== location.origin ||
            !destination.pathname.endsWith('.html') ||
            destination.href.split('#')[0] === pageURL) return;
        savePosition();
        const isReturn = link.matches('.flowers-back-link, .detail-back, .flowers-pdf-close') ||
            (document.body.classList.contains('cv-page') && link.matches('.site-title'));
        if (isReturn && history.state?.portfolioHasPrevious && history.length > 1) {
            event.preventDefault();
            history.back();
            return;
        }
        try {
            sessionStorage.setItem(pendingKey, JSON.stringify({
                to: destination.href.split('#')[0], time: Date.now()
            }));
        } catch { /* Fall back to the link's original destination. */ }
    });

    window.addEventListener('pageshow', async event => {
        if (event.persisted || !history.state?.portfolioScroll) return;
        const saved = history.state.portfolioScroll;
        await document.fonts.ready;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            window.scrollTo(saved.x, saved.y);
        }));
    });
})();
