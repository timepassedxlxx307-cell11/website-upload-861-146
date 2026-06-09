(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.stream-play');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var attached = false;

    if (!video || !stream) {
      return;
    }

    function attachStream(callback) {
      if (attached) {
        if (callback) {
          callback();
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        if (callback) {
          callback();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (callback) {
            callback();
          }
        });
        return;
      }

      video.src = stream;
      attached = true;
      if (callback) {
        callback();
      }
    }

    function playVideo() {
      if (button) {
        button.classList.add('is-hidden');
      }
      attachStream(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
