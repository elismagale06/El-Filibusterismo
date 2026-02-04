// ============================================
// CHAPTER AUDIO SCRIPT - AUTO PLAY FIXED
// ============================================

let audioPlayer = null;
let currentChapter = null;
let isPlaying = false;

// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const page = document.body.dataset.page;

    if (page === "chapters") {
        initializeChapterSearch();
    }

    if (page === "chapter" || page === "chapter-multi") {
        currentChapter = getCurrentChapterId();
        initializeChapterAudio();
    }

    ensureSingleAudio();
    addCardAnimations();
    addAutoPlayStyles();
});


// ============================================
// AUDIO SETUP
// ============================================

function initializeChapterAudio() {

    const audio = document.querySelector("audio");
    if (!audio) return;

    audioPlayer = audio;

    audioPlayer.preload = "auto";
    audioPlayer.dataset.chapterId = currentChapter;

    // Restore time
    const savedTime = getSavedAudioTime();
    if (savedTime > 0) {
        audioPlayer.currentTime = savedTime;
    }

    // When ready → try autoplay
    audioPlayer.addEventListener("canplay", () => {
        initiateAudioPlayback();
    }, { once: true });


    // User interaction tracking
    audioPlayer.addEventListener("play", () => {
        markUserInteracted();
        setAudioState(true);
        isPlaying = true;
    });

    audioPlayer.addEventListener("pause", () => {
        setAudioState(false);
        isPlaying = false;
    });

    audioPlayer.addEventListener("ended", () => {
        setAudioState(false);
        isPlaying = false;
        markChapterCompleted();
    });


    // Save time
    audioPlayer.addEventListener("timeupdate", () => {
        if (!audioPlayer.paused) {
            saveCurrentTime();
        }
    });
}


// ============================================
// AUTO PLAY CORE
// ============================================

function initiateAudioPlayback() {

    if (!audioPlayer) return;

    if (isChapterCompleted()) {
        showFloatingPlayButton();
        return;
    }

    const playPromise = audioPlayer.play();

    if (!playPromise) return;

    playPromise
        .then(() => {

            console.log("Autoplay success");

            markUserInteracted();
            removeAllPrompts();
            isPlaying = true;

        })
        .catch(() => {

            console.log("Autoplay blocked");

            if (!hasUserInteractedWithAudio()) {
                showSimplePlayPrompt();
            } else {
                showFloatingPlayButton();
            }

        });
}


// ============================================
// STORAGE HELPERS
// ============================================

function markUserInteracted() {
    localStorage.setItem("user_audio_interaction", "true");
}

function hasUserInteractedWithAudio() {
    return localStorage.getItem("user_audio_interaction") === "true";
}


function setAudioState(playing) {

    localStorage.setItem(
        `${currentChapter}_playing`,
        playing.toString()
    );

    if (playing) {
        localStorage.setItem(
            "last_active_chapter",
            currentChapter
        );
    }
}


function getSavedAudioTime() {

    const t = localStorage.getItem(
        `${currentChapter}_time`
    );

    return t ? parseFloat(t) : 0;
}


function saveCurrentTime() {

    if (!audioPlayer) return;

    localStorage.setItem(
        `${currentChapter}_time`,
        audioPlayer.currentTime.toString()
    );
}


function markChapterCompleted() {

    localStorage.setItem(
        `${currentChapter}_completed`,
        "true"
    );
}


function isChapterCompleted() {

    return localStorage.getItem(
        `${currentChapter}_completed`
    ) === "true";
}



// ============================================
// UI PROMPTS
// ============================================

function showSimplePlayPrompt() {

    removeAllPrompts();

    const overlay = document.createElement("div");
    overlay.id = "simple-play-prompt";

    overlay.innerHTML = `
        <div class="prompt-content">
            <h3>Simulan ang Audio ng Kabanata</h3>
            <p>Awtomatikong magpe-play sa mga susunod na kabanata.</p>

            <div class="prompt-buttons">
                <button class="secondary-btn" onclick="closePrompt()">
                    Huwag muna
                </button>

                <button class="primary-btn" onclick="playFromPrompt()">
                    ▶ I-play Ngayon
                </button>
            </div>
        </div>
    `;


    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    document.body.appendChild(overlay);
}


function showFloatingPlayButton() {

    removeAllPrompts();

    const btn = document.createElement("div");
    btn.id = "floating-play-button";

    btn.innerHTML = `
        <div class="floating-content">
            <div class="play-icon">▶</div>
            <div>Pindutin para pakinggan</div>
        </div>
    `;

    btn.style.cssText = `
        position: fixed;
        bottom: 25px;
        right: 25px;
        background: #5c2e0f;
        color: #fff;
        padding: 14px 18px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        gap: 10px;
        align-items: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    `;


    btn.onclick = () => {

        if (!audioPlayer) return;

        audioPlayer.play()
            .then(() => {
                removeAllPrompts();
                isPlaying = true;
            })
            .catch(() => {});
    };


    document.body.appendChild(btn);
}



function removeAllPrompts() {

    [
        "floating-play-button",
        "simple-play-prompt"
    ].forEach(id => {

        const el = document.getElementById(id);
        if (el) el.remove();

    });
}



// ============================================
// GLOBAL FUNCTIONS (PROMPT)
// ============================================

window.playFromPrompt = function () {

    if (!audioPlayer) return;

    markUserInteracted();

    audioPlayer.play()
        .then(() => {
            closePrompt();
            isPlaying = true;
        })
        .catch(() => {});
};


window.closePrompt = function () {

    const p = document.getElementById("simple-play-prompt");

    if (p) p.remove();

    markUserInteracted();
    showFloatingPlayButton();
};



// ============================================
// HELPERS
// ============================================

function getCurrentChapterId() {

    const path = location.pathname;

    return path
        .split("/")
        .pop()
        .replace(".php", "")
        .replace(".html", "");
}


function ensureSingleAudio() {

    const audios = document.querySelectorAll("audio");

    audios.forEach(a => {

        a.addEventListener("play", () => {

            audios.forEach(o => {
                if (o !== a && !o.paused) {
                    o.pause();
                }
            });

        });

    });
}



function addCardAnimations() {

    setTimeout(() => {

        document
            .querySelectorAll(".character-card, .chapter-card:not(.disabled)")
            .forEach((card, i) => {

                card.classList.remove("hidden");

                card.style.animation =
                    `fadeInCard .4s ease ${i * .05}s forwards`;

            });

    }, 100);
}



function addAutoPlayStyles() {

    if (document.getElementById("auto-play-styles")) return;

    const style = document.createElement("style");

    style.id = "auto-play-styles";

    style.textContent = `

        @keyframes fadeInCard {
            from {opacity:0;transform:translateY(10px)}
            to {opacity:1;transform:translateY(0)}
        }

        .hidden {display:none!important}

        #floating-play-button:hover {
            transform: translateY(-2px);
        }

    `;

    document.head.appendChild(style);
}



// ============================================
// SEARCH (OPTIONAL)
// ============================================

function initializeChapterSearch() {

    const input = document.getElementById("chapterSearch");
    if (!input) return;

    input.addEventListener("input", filterChapters);
    filterChapters();
}


function filterChapters() {

    const el = document.getElementById("chapterSearch");
    if (!el) return;

    const val = el.value.toLowerCase();

    document
        .querySelectorAll("#chapterGrid .chapter-card")
        .forEach(card => {

            const t = card.innerText.toLowerCase();

            card.classList.toggle(
                "hidden",
                val && !t.includes(val)
            );

        });
}



// ============================================
// SAVE ON EXIT
// ============================================

window.addEventListener("beforeunload", () => {

    if (!audioPlayer) return;

    saveCurrentTime();
    setAudioState(!audioPlayer.paused);

});
