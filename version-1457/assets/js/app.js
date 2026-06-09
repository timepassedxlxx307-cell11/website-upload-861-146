(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var current = 0;
      var timer = null;

      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };

      var start = function () {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          show(i);
          start();
        });
      });

      show(0);
      start();
    });

    var params = new URLSearchParams(window.location.search);
    var qParam = params.get('q') || params.get('tag') || '';
    var searchInput = document.querySelector('.search-input');

    if (searchInput && qParam) {
      searchInput.value = qParam;
    }

    var filterControls = document.querySelectorAll('.search-input, .year-filter, .type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var counter = document.querySelector('.filter-counter');

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilter = function () {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(document.querySelector('.search-input') && document.querySelector('.search-input').value);
      var year = normalize(document.querySelector('.year-filter') && document.querySelector('.year-filter').value);
      var type = normalize(document.querySelector('.type-filter') && document.querySelector('.type-filter').value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          matched = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (counter) {
        var label = counter.getAttribute('data-label') || '当前';
        counter.textContent = label + '匹配 ' + shown + ' 部';
      }
    };

    filterControls.forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();

    document.querySelectorAll('[data-player]').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('.play-layer');
      var hlsInstance = null;
      var loaded = false;

      var load = function () {
        if (!video) {
          return;
        }

        var src = video.getAttribute('data-stream');
        if (!src) {
          return;
        }

        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
          } else {
            video.src = src;
          }
          loaded = true;
        }

        wrap.classList.add('is-playing');
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {
            wrap.classList.remove('is-playing');
          });
        }
      };

      if (button) {
        button.addEventListener('click', load);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          load();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          wrap.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
