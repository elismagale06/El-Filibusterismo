// ============================================
// CHAPTER AUDIO SCRIPT - AUTO PLAY FIXED
// ============================================

let audioPlayer = null;
let currentChapter = null;
let isPlaying = false;
let wasPlayingBeforeUnload = false;

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
        
        // Check if this chapter was playing before page unload
        const lastChapter = localStorage.getItem("last_active_chapter");
        wasPlayingBeforeUnload = lastChapter === currentChapter && 
                                 localStorage.getItem(`${currentChapter}_playing`) === "true";
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
        console.log("Audio started playing");
    });

    audioPlayer.addEventListener("pause", () => {
        setAudioState(false);
        isPlaying = false;
        console.log("Audio paused");
    });

    audioPlayer.addEventListener("ended", () => {
        setAudioState(false);
        isPlaying = false;
        markChapterCompleted();
        console.log("Audio ended");
    });

    // Save time periodically
    audioPlayer.addEventListener("timeupdate", () => {
        if (!audioPlayer.paused) {
            saveCurrentTime();
        }
    });

    // Save time when seeking
    audioPlayer.addEventListener("seeked", () => {
        saveCurrentTime();
    });
}


// ============================================
// AUTO PLAY CORE
// ============================================

function initiateAudioPlayback() {

    if (!audioPlayer) return;

    // Check if user has already interacted with audio before
    const hasInteracted = hasUserInteractedWithAudio();
    
    // If chapter is completed, don't autoplay
    if (isChapterCompleted()) {
        console.log("Chapter already completed, not autoplaying");
        return;
    }

    // Try to resume playback if it was playing before unload
    if (wasPlayingBeforeUnload && hasInteracted) {
        console.log("Resuming playback from where it left off");
        const playPromise = audioPlayer.play();
        
        playPromise
            .then(() => {
                console.log("Resume playback successful");
                markUserInteracted();
                isPlaying = true;
            })
            .catch((error) => {
                console.log("Resume playback blocked:", error);
                // If resume fails, show prompt if no interaction yet
                if (!hasInteracted) {
                    showSimplePlayPrompt();
                }
            });
    }
    // First visit to chapter - try autoplay if user has interacted before
    else if (hasInteracted) {
        console.log("User has interacted before, attempting autoplay");
        const playPromise = audioPlayer.play();
        
        playPromise
            .then(() => {
                console.log("Autoplay success");
                markUserInteracted();
                isPlaying = true;
            })
            .catch((error) => {
                console.log("Autoplay blocked:", error);
            });
    }
    // First time user - show prompt
    else {
        console.log("First time user, showing play prompt");
        showSimplePlayPrompt();
    }
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
// UI PROMPTS (SIMPLIFIED - NO FLOATING BUTTON)
// ============================================

function showSimplePlayPrompt() {
    removeAllPrompts();

    const overlay = document.createElement("div");
    overlay.id = "simple-play-prompt";

    overlay.innerHTML = `
        <div class="prompt-content">
            <h3>Simulan ang Audio ng Kabanata</h3>
            <p>Audio ng kabanata ay awtomatikong magpe-play.</p>
            <p>Magre-resume sa huling pinakinggan sa mga susunod na pagbisita.</p>

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

function removeAllPrompts() {
    const el = document.getElementById("simple-play-prompt");
    if (el) el.remove();
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
        .catch((error) => {
            console.log("Play from prompt failed:", error);
        });
};

window.closePrompt = function () {
    removeAllPrompts();
    markUserInteracted();
    // No floating button to show
};


// ============================================
// PAGE VISIBILITY HANDLING
// ============================================

// Pause when page is hidden (tab switch, minimize)
document.addEventListener("visibilitychange", () => {
    if (!audioPlayer) return;
    
    if (document.hidden) {
        // Page is hidden - save state
        if (!audioPlayer.paused) {
            wasPlayingBeforeUnload = true;
            setAudioState(true);
            saveCurrentTime();
        }
    } else {
        // Page is visible again - check if we should resume
        const shouldResume = localStorage.getItem(`${currentChapter}_playing`) === "true";
        const lastChapter = localStorage.getItem("last_active_chapter");
        
        if (shouldResume && lastChapter === currentChapter && hasUserInteractedWithAudio()) {
            // Small delay to ensure page is fully visible
            setTimeout(() => {
                if (audioPlayer && !audioPlayer.paused) {
                    audioPlayer.play().catch(error => {
                        console.log("Resume after visibility change failed:", error);
                    });
                }
            }, 300);
        }
    }
});


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
                card.style.animation = `fadeInCard .4s ease ${i * .05}s forwards`;
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
            card.classList.toggle("hidden", val && !t.includes(val));
        });
}


// ============================================
// SAVE ON EXIT
// ============================================

window.addEventListener("beforeunload", () => {
    if (!audioPlayer) return;
    
    saveCurrentTime();
    
    // Save playing state
    if (audioPlayer && currentChapter) {
        setAudioState(!audioPlayer.paused);
    }
    
    // If audio was playing, mark it for resume
    if (!audioPlayer.paused) {
        wasPlayingBeforeUnload = true;
    }
});


// ============================================
// NAVIGATION HANDLING
// ============================================

// Listen for link clicks to save state before navigation
document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && audioPlayer && currentChapter) {
        // Save current state before navigating away
        saveCurrentTime();
        setAudioState(!audioPlayer.paused);
    }
}, true);