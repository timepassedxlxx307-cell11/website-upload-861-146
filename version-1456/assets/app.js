(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
      mobileButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    var searchInput = document.getElementById("siteSearch");
    var regionSelect = document.getElementById("filterRegion");
    var typeSelect = document.getElementById("filterType");
    var yearSelect = document.getElementById("filterYear");
    var movieCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
      if (!movieCards.length) {
        return;
      }

      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);

      movieCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okRegion = !region || normalize(card.getAttribute("data-region")) === region;
        var okType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
        var okYear = !year || normalize(card.getAttribute("data-year")) === year;
        card.hidden = !(okKeyword && okRegion && okType && okYear);
      });
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    var player = document.getElementById("moviePlayer");
    var playerCover = document.getElementById("playerCover");
    var playerError = document.getElementById("playerError");
    var hlsInstance = null;

    function showPlayerError() {
      if (playerError) {
        playerError.hidden = false;
      }
    }

    function beginPlayback() {
      if (!player || typeof playerStream !== "string" || !playerStream) {
        return;
      }

      if (playerCover) {
        playerCover.classList.add("is-hidden");
      }

      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        if (!player.getAttribute("src")) {
          player.setAttribute("src", playerStream);
        }
        player.play().catch(showPlayerError);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(playerStream);
          hlsInstance.attachMedia(player);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            player.play().catch(showPlayerError);
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showPlayerError();
            }
          });
        } else {
          player.play().catch(showPlayerError);
        }
        return;
      }

      if (!player.getAttribute("src")) {
        player.setAttribute("src", playerStream);
      }
      player.play().catch(showPlayerError);
    }

    if (playerCover) {
      playerCover.addEventListener("click", beginPlayback);
    }

    if (player) {
      player.addEventListener("click", function () {
        if (player.paused) {
          beginPlayback();
        }
      });
    }
  });
}());
