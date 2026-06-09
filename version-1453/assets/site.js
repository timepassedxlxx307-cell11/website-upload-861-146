const SiteUI = (() => {
    const toggleMenu = () => {
        const button = document.querySelector('.mobile-menu-button');
        const menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', () => {
            const open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    };

    const initHero = () => {
        const slider = document.querySelector('.hero-slider');
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        const previous = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        let index = 0;
        const show = (target) => {
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, current) => {
                const active = current === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle('is-active', current === index);
            });
        };
        dots.forEach((dot, current) => {
            dot.addEventListener('click', () => show(current));
        });
        if (previous) {
            previous.addEventListener('click', () => show(index - 1));
        }
        if (next) {
            next.addEventListener('click', () => show(index + 1));
        }
        window.setInterval(() => show(index + 1), 6000);
        show(0);
    };

    const initCardSearch = () => {
        document.querySelectorAll('.js-card-search').forEach((input) => {
            const scope = input.closest('.search-scope') || document;
            const cards = Array.from(scope.querySelectorAll('.movie-card'));
            input.addEventListener('input', () => {
                const value = input.value.trim().toLowerCase();
                cards.forEach((card) => {
                    const source = `${card.dataset.title || ''} ${card.dataset.keywords || ''}`.toLowerCase();
                    card.classList.toggle('is-filtered-out', value && !source.includes(value));
                });
            });
        });
    };

    const init = () => {
        toggleMenu();
        initHero();
        initCardSearch();
    };

    return { init };
})();

const MoviePlayer = (() => {
    const init = (source) => {
        const video = document.querySelector('.movie-player');
        const overlay = document.querySelector('.player-overlay');
        if (!video || !source) {
            return;
        }
        let attached = false;
        let hlsInstance = null;
        const attach = () => {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        };
        const start = () => {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {});
            }
        };
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', () => {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', () => {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        attach();
        window.addEventListener('pagehide', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', SiteUI.init);
