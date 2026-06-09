(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startSlider() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startSlider();
      });
    });

    showSlide(0);
    startSlider();
  }

  var pageSearch = document.querySelector('[data-page-search]');
  var filterSelect = document.querySelector('[data-page-filter="type"]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var empty = document.querySelector('[data-empty-state]');

  if (pageSearch && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    pageSearch.value = initialQuery;

    function cardMatches(card, query, filterValue) {
      var searchText = (card.getAttribute('data-search') || '').toLowerCase();
      var matchesQuery = !query || searchText.indexOf(query) !== -1;
      var matchesFilter = !filterValue || searchText.indexOf(filterValue) !== -1;
      return matchesQuery && matchesFilter;
    }

    function applyFilters() {
      var query = pageSearch.value.trim().toLowerCase();
      var filterValue = filterSelect ? filterSelect.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = cardMatches(card, query, filterValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    pageSearch.addEventListener('input', applyFilters);

    if (filterSelect) {
      filterSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
  }
})();
