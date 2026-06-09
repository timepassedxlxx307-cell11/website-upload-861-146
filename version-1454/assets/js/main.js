(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        var heroSearch = document.querySelector('[data-hero-search]');
        if (heroSearch) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery) {
                heroSearch.value = initialQuery;
            }
        }

        setupCarousel();
        setupFilters();
    });

    function setupCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        if (!cards.length) {
            return;
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
        var currentType = 'all';

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (initialQuery && inputs.length) {
            inputs.forEach(function (input) {
                input.value = initialQuery;
            });
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var query = normalize(inputs.length ? inputs[0].value : '');

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-text'));
                var type = normalize(card.getAttribute('data-type'));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesType = currentType === 'all' || type.indexOf(normalize(currentType)) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesType));
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                inputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                apply();
            });
        });

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                currentType = button.getAttribute('data-filter-type') || 'all';
                apply();
            });
        });

        apply();
    }
}());
