(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previousButton = document.querySelector('.hero-prev');
    var nextButton = document.querySelector('.hero-next');
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function queueSlide() {
        if (slideTimer) {
            window.clearInterval(slideTimer);
        }

        if (slides.length > 1) {
            slideTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    if (previousButton) {
        previousButton.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            queueSlide();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            queueSlide();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            queueSlide();
        });
    });

    showSlide(0);
    queueSlide();

    var filterPanel = document.querySelector('.filter-panel');

    if (filterPanel) {
        var input = filterPanel.querySelector('.filter-input');
        var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('.filter-select'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var emptyState = filterPanel.querySelector('.empty-state');
        var query = new URLSearchParams(window.location.search).get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function fillSelect(select, key) {
            var values = [];
            var exists = {};

            cards.forEach(function (card) {
                var value = card.getAttribute('data-' + key) || '';

                if (value && !exists[value]) {
                    exists[value] = true;
                    values.push(value);
                }
            });

            values.sort(function (a, b) {
                return b.localeCompare(a, 'zh-CN', { numeric: true });
            });

            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        selects.forEach(function (select) {
            var key = select.getAttribute('data-filter');

            if (key === 'year' || key === 'type') {
                fillSelect(select, key);
            }
        });

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var activeFilters = {};
            var visibleCount = 0;

            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter');
                activeFilters[key] = select.value;
            });

            cards.forEach(function (card) {
                var content = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.textContent
                ].join(' ').toLowerCase();

                var matched = !keyword || content.indexOf(keyword) !== -1;

                Object.keys(activeFilters).forEach(function (key) {
                    var expected = activeFilters[key];

                    if (expected && card.getAttribute('data-' + key) !== expected) {
                        matched = false;
                    }
                });

                card.hidden = !matched;

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }
})();
