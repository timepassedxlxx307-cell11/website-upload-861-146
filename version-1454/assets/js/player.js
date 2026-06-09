(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('[data-play]');
            var stream = box.getAttribute('data-stream');
            var hls = null;

            if (!video || !stream) {
                return;
            }

            function attach() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.setAttribute('data-ready', '1');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.setAttribute('data-ready', '1');
                    return;
                }

                video.src = stream;
                video.setAttribute('data-ready', '1');
            }

            function play() {
                attach();
                box.classList.add('is-playing');
                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            attach();

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
}());
