// ============================================
// SIMPLIFIED CHAPTERS SCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    
    // Initialize based on page type
    if (page === "chapters") {
        initializeChapterSearch();
    }
    
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
        // More immediate auto-play attempt
        setTimeout(() => {
            attemptAutoPlay();
        }, 100);
    }

    addCardAnimations();
    ensureSingleAudio();
    
    // Add auto-play CSS styles
    addAutoPlayStyles();
});

// ============================================
// CHAPTER SEARCH FUNCTIONALITY (unchanged)
// ============================================

function initializeChapterSearch() {
    const chapterSearch = document.getElementById("chapterSearch");
    if (!chapterSearch) return;
    chapterSearch.addEventListener("input", filterChapters);
    chapterSearch.addEventListener("keyup", filterChapters);
    filterChapters();
}

function filterChapters() {
    const el = document.getElementById("chapterSearch");
    if (!el) return;
    const searchTerm = el.value.toLowerCase();
    const chapterCards = document.querySelectorAll("#chapterGrid .chapter-card");
    const noResults = document.getElementById("noChapterResults");
    const searchTermSpan = document.getElementById("chapterSearchTerm");
    let visibleCount = 0; 
    let delay = 0;
    
    chapterCards.forEach((card) => {
        const chapterTitle = card.querySelector("h3").textContent.toLowerCase();
        const chapterDesc = card.querySelector("p").textContent.toLowerCase();
        if (searchTerm === "" || chapterTitle.includes(searchTerm) || chapterDesc.includes(searchTerm)) {
            card.classList.remove("hidden"); 
            card.style.animation = `fadeInCard 0.3s ease ${delay}s forwards`; 
            visibleCount++; 
            delay += 0.05;
        } else { 
            card.classList.add("hidden"); 
            card.style.animation = "none"; 
        }
    });
    
    if (visibleCount === 0 && searchTerm !== "") { 
        if (searchTermSpan) searchTermSpan.textContent = searchTerm; 
        if (noResults) noResults.classList.remove("hidden"); 
    } else { 
        if (noResults) noResults.classList.add("hidden"); 
    }
}

// ============================================
// SIMPLIFIED AUDIO AUTO-PLAY
// ============================================

function initializeChapterAudio() {
    const audios = document.querySelectorAll('audio');
    
    audios.forEach((audioElement) => {
        // Ensure audio element has an ID
        if (!audioElement.id) {
            audioElement.id = 'audio_' + Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Preload audio
        audioElement.preload = "auto";
        
        // Save audio state when playing/pausing
        audioElement.addEventListener('play', function() {
            saveAudioState(this, true);
        });
        
        audioElement.addEventListener('pause', function() {
            saveAudioState(this, false);
        });
        
        audioElement.addEventListener('ended', function() {
            saveAudioState(this, false);
            // Mark as completed
            localStorage.setItem(`${this.id}_completed`, 'true');
        });
        
        // Try to resume from saved position
        const savedTime = localStorage.getItem(`${audioElement.id}_time`);
        if (savedTime && savedTime !== '0') {
            audioElement.currentTime = parseFloat(savedTime);
        }
    });
}

function attemptAutoPlay() {
    const page = document.body.dataset.page;
    if (page !== "chapter" && page !== "chapter-multi") return;
    
    // Get all audio elements on the page
    const audios = document.querySelectorAll('audio');
    if (audios.length === 0) return;
    
    // Use the first audio element (for multi-chapter pages, there should only be one)
    const audio = audios[0];
    
    // Check if user has interacted with audio before (to avoid annoying prompts)
    const hasInteracted = localStorage.getItem('user_interacted') === 'true';
    
    // Check if audio was playing when user left
    const wasPlaying = localStorage.getItem(`${audio.id}_playing`) === 'true';
    const savedTime = localStorage.getItem(`${audio.id}_time`);
    
    // Try to play immediately - simpler approach
    const playAudio = () => {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Auto-play successful');
                    // Mark that audio started playing
                    localStorage.setItem(`${audio.id}_playing`, 'true');
                    
                    // If this is first time auto-play, mark as interacted
                    if (!hasInteracted) {
                        localStorage.setItem('user_interacted', 'true');
                    }
                })
                .catch(error => {
                    console.log('Auto-play prevented, showing prompt');
                    
                    // Only show prompt if user hasn't interacted before
                    if (!hasInteracted) {
                        showSimplePlayPrompt(audio);
                    } else if (wasPlaying) {
                        // User had interacted before and audio was playing
                        // Show a subtle resume button
                        showResumeButton(audio);
                    }
                });
        }
    };
    
    // Check if we should resume from saved position
    if (wasPlaying && savedTime && savedTime !== '0') {
        const time = parseFloat(savedTime);
        if (time < audio.duration - 5) { // Don't resume if less than 5 seconds left
            audio.currentTime = time;
        }
    }
    
    // Wait a bit for audio to load, then try to play
    if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
        playAudio();
    } else {
        audio.addEventListener('canplaythrough', playAudio, { once: true });
        // Fallback in case canplaythrough doesn't fire
        setTimeout(playAudio, 1000);
    }
}

// ============================================
// SIMPLE PLAY PROMPTS
// ============================================

function showSimplePlayPrompt(audio) {
    // Remove any existing prompts
    removePlayPrompts();
    
    const overlay = document.createElement('div');
    overlay.id = 'simple-play-prompt';
    overlay.innerHTML = `
        <div class="prompt-content">
            <h3>Gusto mo bang pakinggan ang audio?</h3>
            <p>Ang audio ay maaaring i-play awtomatiko para sa mas magandang karanasan.</p>
            <div class="prompt-buttons">
                <button class="secondary-btn" onclick="closePrompt()">Huwag muna</button>
                <button class="primary-btn" onclick="playFromPrompt(this)">
                    <span class="play-icon">▶</span> I-play Ngayon
                </button>
            </div>
        </div>
    `;
    
    // Style the prompt
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    overlay.querySelector('.prompt-content').style.cssText = `
        background: white;
        padding: 25px;
        border-radius: 10px;
        max-width: 400px;
        text-align: center;
    `;
    
    overlay.querySelector('.primary-btn').style.cssText = `
        background: #5c2e0f;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
    `;
    
    overlay.querySelector('.secondary-btn').style.cssText = `
        background: #f0f0f0;
        color: #333;
        border: 1px solid #ccc;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
    `;
    
    document.body.appendChild(overlay);
    
    // Store audio reference
    overlay.dataset.audioId = audio.id;
}

function showResumeButton(audio) {
    const button = document.createElement('button');
    button.id = 'resume-audio-btn';
    button.innerHTML = '▶ Ipagpatuloy ang Audio';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #5c2e0f;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    button.onclick = function() {
        audio.play().catch(e => console.log('Play failed:', e));
        this.remove();
    };
    
    document.body.appendChild(button);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (document.getElementById('resume-audio-btn')) {
            document.getElementById('resume-audio-btn').remove();
        }
    }, 30000);
}

// Global functions for prompt
window.playFromPrompt = function(button) {
    const prompt = document.getElementById('simple-play-prompt');
    const audioId = prompt.dataset.audioId;
    const audio = document.getElementById(audioId);
    
    if (audio) {
        localStorage.setItem('user_interacted', 'true');
        audio.play().then(() => {
            closePrompt();
        });
    }
};

window.closePrompt = function() {
    const prompt = document.getElementById('simple-play-prompt');
    if (prompt) prompt.remove();
};

function removePlayPrompts() {
    const prompt = document.getElementById('simple-play-prompt');
    const resumeBtn = document.getElementById('resume-audio-btn');
    if (prompt) prompt.remove();
    if (resumeBtn) resumeBtn.remove();
}

// ============================================
// SIMPLIFIED STATE MANAGEMENT
// ============================================

function saveAudioState(audioElement, isPlaying) {
    if (!audioElement.id) return;
    
    // Save current time
    localStorage.setItem(`${audioElement.id}_time`, audioElement.currentTime.toString());
    
    // Save playing state
    localStorage.setItem(`${audioElement.id}_playing`, isPlaying.toString());
    
    // Mark last active audio
    if (isPlaying) {
        localStorage.setItem('last_active_audio', audioElement.id);
    }
}

// Save state when page is about to unload
window.addEventListener('beforeunload', function() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        saveAudioState(audio, !audio.paused);
    });
});

// Try to resume when page becomes visible again
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Check if there was an active audio
        const lastAudioId = localStorage.getItem('last_active_audio');
        if (lastAudioId) {
            const audio = document.getElementById(lastAudioId);
            if (audio && localStorage.getItem(`${lastAudioId}_playing`) === 'true') {
                // Small delay to ensure page is fully visible
                setTimeout(() => {
                    const savedTime = localStorage.getItem(`${lastAudioId}_time`);
                    if (savedTime) {
                        audio.currentTime = parseFloat(savedTime);
                    }
                    audio.play().catch(e => {
                        // Auto-play might be blocked, show resume button
                        showResumeButton(audio);
                    });
                }, 300);
            }
        }
    }
});

// ============================================
// OTHER FUNCTIONS (unchanged)
// ============================================

function ensureSingleAudio() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;
    
    let currentlyPlaying = null;
    
    audios.forEach((audio) => {
        audio.addEventListener('play', function () { 
            currentlyPlaying = audio;
            audios.forEach((other) => { 
                if (other !== audio && !other.paused) { 
                    try { 
                        other.pause(); 
                    } catch (e) {} 
                } 
            }); 
        });
    });
}

function addCardAnimations() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.character-card, .chapter-card:not(.disabled)');
        cards.forEach((card, index) => { 
            card.classList.remove('hidden'); 
            card.style.animation = `fadeInCard 0.5s ease ${index * 0.05}s forwards`; 
        });
    }, 100);
}

function addAutoPlayStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Simple animation for cards */
        @keyframes fadeInCard {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Hidden class */
        .hidden { display: none !important; }
    `;
    
    // Only add once
    if (!document.getElementById('auto-play-styles')) {
        style.id = 'auto-play-styles';
        document.head.appendChild(style);
    }
}