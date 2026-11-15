(() => {
    // Pause full films when off screen; hover-preview videos manage their own playback.
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting && !entry.target.paused) entry.target.pause();
        }
    }, { threshold: 0 });
    document.querySelectorAll('video[controls]').forEach(video => observer.observe(video));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
    });
})();
