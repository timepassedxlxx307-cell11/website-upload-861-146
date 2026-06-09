(function () {
    window.setupMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('player-cover');
        var toggle = document.getElementById('player-toggle');
        var mute = document.getElementById('player-mute');
        var fullscreen = document.getElementById('player-fullscreen');
        var controls = document.querySelector('.player-controls');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function markControls() {
            if (controls) {
                controls.classList.add('active');
                window.setTimeout(function () {
                    controls.classList.remove('active');
                }, 1800);
            }
        }

        function updateToggle() {
            if (toggle) {
                toggle.textContent = video.paused ? '▶' : 'Ⅱ';
            }
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }

            if (cover) {
                cover.classList.add('hidden');
            }

            markControls();
            updateToggle();
        }

        function attachSource() {
            if (loaded) {
                playVideo();
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        if (cover) {
                            cover.innerHTML = '<strong>播放暂时不可用，请稍后再试</strong>';
                            cover.classList.remove('hidden');
                        }
                    }
                });
                return;
            }

            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
        }

        function togglePlay() {
            if (!loaded) {
                attachSource();
                return;
            }

            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }

            updateToggle();
        }

        if (cover) {
            cover.addEventListener('click', attachSource);
        }

        if (toggle) {
            toggle.addEventListener('click', togglePlay);
        }

        if (mute) {
            mute.addEventListener('click', function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? '🔇' : '🔊';
                markControls();
            });
        }

        if (fullscreen) {
            fullscreen.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
                markControls();
            });
        }

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updateToggle);
        video.addEventListener('pause', updateToggle);
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
