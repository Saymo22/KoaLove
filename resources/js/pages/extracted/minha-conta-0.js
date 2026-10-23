
        document.addEventListener("DOMContentLoaded", () => {
            const stardust = document.getElementById("stardust");
            if (stardust) {
                for (let i = 0; i < 40; i++) {
                    const star = document.createElement("div");
                    star.className = "star-dust";
                    star.style.left = Math.random() * 100 + "%";
                    star.style.animationDuration = (10 + Math.random() * 20) + "s";
                    star.style.animationDelay = (-Math.random() * 20) + "s";
                    const size = 1 + Math.random() * 2.5;
                    star.style.width = size + "px";
                    star.style.height = size + "px";
                    stardust.appendChild(star);
                }
            }
        });
