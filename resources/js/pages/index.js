
        /*
        =====================================================
        PLAYER DE MÚSICA
        =====================================================
        */

        const audio =
            document.getElementById("audio");

        const botao =
            document.getElementById("botaoMusica");

        const disco =
            document.getElementById("disco");


        function iniciarMusica() {
            const tentativa = audio.play();

            if (tentativa && typeof tentativa.catch === "function") {
                tentativa.catch(function () {
                    // O navegador pode bloquear autoplay com som.
                });
            }
        }

        audio.addEventListener("play", function () {
            botao.textContent = "❚❚ Pausar nossa música";
            disco.classList.add("tocando");
        });

        audio.addEventListener("pause", function () {
            botao.textContent = "▶ Tocar nossa música";
            disco.classList.remove("tocando");
        });

        window.addEventListener("load", iniciarMusica);

        function iniciarNoPrimeiroToque() {
            document.removeEventListener("click", iniciarNoPrimeiroToque);
            document.removeEventListener("touchstart", iniciarNoPrimeiroToque);

            if (audio.paused) {
                iniciarMusica();
            }
        }

        document.addEventListener("click", iniciarNoPrimeiroToque);
        document.addEventListener("touchstart", iniciarNoPrimeiroToque, { passive: true });

        botao.addEventListener("click", function (event) {
            event.stopPropagation();

            if (audio.paused) {
                iniciarMusica();
            } else {
                audio.pause();
            }
        });

        audio.addEventListener("ended", function () {

            botao.textContent =
                "▶ Tocar nossa música";

            disco.classList.remove("tocando");

        });

        /*
        =====================================================
        CONTROLE DO INSTAGRAM STORY
        =====================================================
        */
        const storyCard = document.getElementById('storyCard');
        const storyVideos = document.querySelectorAll('.story-video');
        const progressFills = document.querySelectorAll('.progress-fill');
        let currentStoryIndex = 0;

        function loadStory(index) {
            storyVideos.forEach((vid, i) => {
                if (i === index) {
                    vid.classList.add('active');
                    vid.currentTime = 0;
                    vid.play().catch(() => {});
                } else {
                    vid.classList.remove('active');
                    vid.pause();
                }
            });

            progressFills.forEach((fill, i) => {
                if (i < index) {
                    fill.style.width = '100%';
                } else if (i > index) {
                    fill.style.width = '0%';
                }
            });
        }

        storyVideos.forEach((vid, index) => {
            vid.addEventListener('timeupdate', () => {
                if (index === currentStoryIndex && vid.duration) {
                    const percentage = (vid.currentTime / vid.duration) * 100;
                    progressFills[index].style.width = percentage + '%';
                }
            });

            vid.addEventListener('ended', () => {
                progressFills[index].style.width = '100%';
                currentStoryIndex = (currentStoryIndex + 1) % storyVideos.length;
                loadStory(currentStoryIndex);
            });
        });

        if (storyCard) {
            storyCard.addEventListener('click', (e) => {
                if (e.target.closest('.story-footer') || e.target.closest('.story-close')) return;

                const rect = storyCard.getBoundingClientRect();
                const clickX = e.clientX - rect.left;

                if (clickX > rect.width / 2) {
                    currentStoryIndex = (currentStoryIndex + 1) % storyVideos.length;
                } else {
                    currentStoryIndex = (currentStoryIndex - 1 + storyVideos.length) % storyVideos.length;
                }
                loadStory(currentStoryIndex);
            });
        }

        window.addEventListener('load', () => {
            loadStory(0);
        });
