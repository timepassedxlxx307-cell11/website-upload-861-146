(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    all("[data-hero-carousel]").forEach(function (carousel) {
      var slides = all(".hero-slide", carousel);
      var dots = all(".hero-dot", carousel);
      var previous = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 6200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      show(0);
      start();
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.filter(Boolean).sort().forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    all("[data-filter-scope]").forEach(function (scope) {
      var items = all("[data-filter-item]", scope);
      var input = scope.querySelector("[data-filter-input]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var categorySelect = scope.querySelector("[data-filter-category]");
      var years = [];
      var regions = [];

      items.forEach(function (item) {
        if (item.dataset.year && years.indexOf(item.dataset.year) === -1) {
          years.push(item.dataset.year);
        }
        if (item.dataset.region && regions.indexOf(item.dataset.region) === -1) {
          regions.push(item.dataset.region);
        }
      });

      fillSelect(yearSelect, years);
      fillSelect(regionSelect, regions);

      function apply() {
        var query = normalize(input ? input.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";

        items.forEach(function (item) {
          var text = normalize(item.dataset.search || item.textContent);
          var passQuery = !query || text.indexOf(query) !== -1;
          var passYear = !year || item.dataset.year === year;
          var passRegion = !region || item.dataset.region === region;
          var passCategory = !category || item.dataset.category === category;
          item.hidden = !(passQuery && passYear && passRegion && passCategory);
        });
      }

      [input, yearSelect, regionSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    if (!video || !streamUrl) {
      return;
    }

    var stage = video.closest(".player-stage");
    var button = stage ? stage.querySelector(".player-start") : null;
    var ready = false;

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.__hls = hls;
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    prepare();

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
