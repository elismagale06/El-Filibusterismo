// ============================================
// COMPLETE UPDATED CHAPTERS SCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "chapters") {
        initializeChapterSearch();
    }
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
        // Start auto-play attempt sooner with better strategy
        setTimeout(attemptAutoPlay, 300);
    }

    addCardAnimations();
    ensureSingleAudio();
    setupAudioStateManagement();
    
    // Add auto-play CSS styles
    addAutoPlayStyles();
});

// ============================================
// CHAPTER SEARCH FUNCTIONALITY
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
// AUDIO INITIALIZATION & AUTO-PLAY
// ============================================

function initializeChapterAudio() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;

    audios.forEach((audioElement) => {
        // Ensure audio element has an ID
        if (!audioElement.id) {
            audioElement.id = 'audio_' + Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Mark if audio has been preloaded
        audioElement.preload = "auto";
        
        // Track user interaction
        audioElement.addEventListener('play', function() {
            this.dataset.userInteracted = 'true';
            sessionStorage.setItem('userInteractedWithAudio', 'true');
            updateAudioState(this, 'playing');
            removePlayPrompts();
            removeFloatingPlayButton();
        });
        
        audioElement.addEventListener('pause', function() {
            updateAudioState(this, 'paused');
        });
        
        audioElement.addEventListener('ended', function () {
            updateAudioState(this, 'ended');
            const audioNote = this.closest('.audio-controls')?.querySelector('.audio-note') || document.querySelector('.audio-note');
            if (audioNote) audioNote.textContent = 'Tapos na ang audio.';
        });

        audioElement.addEventListener('error', function (e) {
            console.error('Audio error:', e);
            updateAudioState(this, 'error');
            
            // Show error message
            const audioControls = this.closest('.audio-controls') || document.querySelector('.audio-controls');
            if (audioControls) {
                const errorNote = document.createElement('p');
                errorNote.className = 'audio-note error-note';
                errorNote.innerHTML = `<em>Hindi ma-play ang audio file. Subukan muli o i-refresh ang pahina.</em>`;
                audioControls.appendChild(errorNote);
            }
        });
        
        // Add click handler to audio element itself for better UX
        audioElement.addEventListener('click', function(e) {
            // Prevent double handling if controls are clicked
            if (e.target === this) {
                this.dataset.userInteracted = 'true';
                sessionStorage.setItem('userInteractedWithAudio', 'true');
            }
        });
        
        // Make sure controls are visible and usable
        try {
            audioElement.style.pointerEvents = 'auto';
            audioElement.controls = true;
            audioElement.tabIndex = 0;
        } catch (e) {
            // Ignore minor errors
        }
    });
}

// Main auto-play function
function attemptAutoPlay() {
    const page = document.body.dataset.page;
    if (page !== "chapter" && page !== "chapter-multi") return;
    
    const audios = Array.from(document.querySelectorAll('audio'));
    if (audios.length === 0) return;
    
    // Check user's preference and previous interactions
    const userInteracted = sessionStorage.getItem('userInteractedWithAudio') === 'true';
    const hasAudioPlayedBefore = sessionStorage.getItem('audioWasPlaying') === 'true';
    
    // Determine which audio to prioritize (usually the first one)
    const primaryAudio = audios[0];
    
    if (!userInteracted) {
        // First visit - try aggressive auto-play
        tryAggressiveAutoPlay(primaryAudio);
    } else if (hasAudioPlayedBefore) {
        // Returning user who had audio playing - try to resume
        tryResumeAudio(primaryAudio);
    } else {
        // Returning user but didn't have audio playing last time
        // Show subtle prompt instead of auto-playing
        setTimeout(() => {
            showFloatingPlayButton(primaryAudio, true);
        }, 1000);
    }
}

function tryAggressiveAutoPlay(audioElement) {
    // First, ensure audio is loaded
    if (audioElement.readyState < 2) {
        // Audio not loaded yet, wait and retry
        setTimeout(() => tryAggressiveAutoPlay(audioElement), 300);
        return;
    }
    
    // Try muted auto-play first (most likely to work)
    const originalVolume = audioElement.volume;
    audioElement.muted = true;
    audioElement.volume = 0;
    
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Muted auto-play successful');
                // Gradually unmute
                setTimeout(() => {
                    audioElement.muted = false;
                    audioElement.volume = originalVolume;
                    audioElement.dataset.autoPlayed = 'true';
                    removePlayPrompts();
                }, 100);
            })
            .catch(mutedError => {
                // Muted auto-play failed, try normal auto-play
                audioElement.muted = false;
                audioElement.volume = originalVolume;
                
                setTimeout(() => {
                    audioElement.play()
                        .then(() => {
                            console.log('Normal auto-play successful');
                            audioElement.dataset.autoPlayed = 'true';
                            removePlayPrompts();
                        })
                        .catch(normalError => {
                            console.log('All auto-play attempts failed');
                            showEnhancedPlayPrompt(audioElement);
                        });
                }, 500);
            });
    }
}

function tryResumeAudio(audioElement) {
    const audioId = audioElement.id;
    if (!audioId) return;
    
    const wasPlaying = sessionStorage.getItem(`audio_${audioId}_playing`) === 'true';
    const savedPosition = sessionStorage.getItem(`audio_${audioId}_position`);
    
    if (wasPlaying && savedPosition) {
        // Restore position
        const position = parseFloat(savedPosition);
        if (position < audioElement.duration - 1) {
            audioElement.currentTime = position;
            
            // Try to resume
            setTimeout(() => {
                audioElement.play().catch(error => {
                    console.log('Resume prevented:', error);
                    showEnhancedPlayPrompt(audioElement, true);
                });
            }, 800);
        }
    }
}

// ============================================
// PLAY PROMPTS & USER INTERFACE
// ============================================

function showEnhancedPlayPrompt(audioElement, isResume = false) {
    removePlayPrompts();
    
    const promptContainer = document.createElement('div');
    promptContainer.id = 'audio-play-prompt';
    promptContainer.className = 'audio-prompt';
    
    const title = isResume ? 'Ipagpatuloy ang Audio' : 'Simulan ang Audio';
    const description = isResume 
        ? 'I-click ang button para ipagpatuloy ang pakikinig.'
        : 'I-click ang button para simulan ang audio ng kabanata.';
    
    promptContainer.innerHTML = `
        <div class="prompt-header">
            <div class="prompt-title">${title}</div>
            <div class="prompt-description">${description}</div>
        </div>
        <div class="prompt-buttons">
            <button class="prompt-secondary-btn" onclick="closePlayPrompt()">
                Huwag muna
            </button>
            <button class="prompt-primary-btn" onclick="playAudioFromPrompt('${audioElement.id}')">
                <span class="play-icon">▶</span> ${isResume ? 'Ipagpatuloy' : 'I-play'}
            </button>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.id = 'audio-prompt-overlay';
    overlay.className = 'prompt-overlay';
    overlay.appendChild(promptContainer);
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 60 seconds
    setTimeout(() => {
        if (document.getElementById('audio-prompt-overlay')) {
            closePlayPrompt();
            // Show floating button instead
            showFloatingPlayButton(audioElement);
        }
    }, 60000);
}

// Global function to play audio from prompt
window.playAudioFromPrompt = function(audioId) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    
    audio.dataset.userInteracted = 'true';
    sessionStorage.setItem('userInteractedWithAudio', 'true');
    
    audio.play().then(() => {
        closePlayPrompt();
    }).catch(error => {
        console.log('Play failed:', error);
        showPlayError();
    });
};

// Global function to close prompt
window.closePlayPrompt = function() {
    removePlayPrompts();
};

function removePlayPrompts() {
    const overlay = document.getElementById('audio-prompt-overlay');
    const prompt = document.getElementById('audio-play-prompt');
    if (overlay) overlay.remove();
    if (prompt) prompt.remove();
}

function showPlayError() {
    const errorMsg = document.createElement('div');
    errorMsg.id = 'audio-error-message';
    errorMsg.innerHTML = `
        <div class="error-content">
            <strong>Hindi ma-play ang audio.</strong>
            <p>Paki-check ang internet connection o subukan muli.</p>
        </div>
    `;
    
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        if (document.getElementById('audio-error-message')) {
            errorMsg.remove();
        }
    }, 5000);
}

// Floating play button (less intrusive)
function showFloatingPlayButton(audioElement, autoShow = false) {
    removeFloatingPlayButton();
    
    const floatingContainer = document.createElement('div');
    floatingContainer.id = 'floating-play-container';
    floatingContainer.className = 'floating-play-btn';
    
    floatingContainer.innerHTML = `
        <div class="floating-icon">▶</div>
        <div class="floating-text">
            <div class="floating-title">Pindutin para pakinggan</div>
            <div class="floating-subtitle">Audio ng kabanata</div>
        </div>
    `;
    
    floatingContainer.addEventListener('click', function() {
        audioElement.play().then(() => {
            removeFloatingPlayButton();
            audioElement.dataset.userInteracted = 'true';
            sessionStorage.setItem('userInteractedWithAudio', 'true');
        }).catch(err => {
            console.log('Manual play failed:', err);
            showEnhancedPlayPrompt(audioElement);
        });
    });
    
    document.body.appendChild(floatingContainer);
    
    // Auto-remove after 30 seconds unless autoShow is true
    if (!autoShow) {
        setTimeout(() => {
            removeFloatingPlayButton();
        }, 30000);
    }
}

function removeFloatingPlayButton() {
    const existing = document.getElementById('floating-play-container');
    if (existing) existing.remove();
}

// ============================================
// AUDIO STATE MANAGEMENT
// ============================================

function setupAudioStateManagement() {
    // Save audio state before page unload
    window.addEventListener('beforeunload', function () {
        const audios = Array.from(document.querySelectorAll('audio'));
        audios.forEach(a => { 
            try { 
                if (a.id) {
                    sessionStorage.setItem(`audio_${a.id}_position`, a.currentTime);
                    sessionStorage.setItem(`audio_${a.id}_playing`, !a.paused ? 'true' : 'false');
                    sessionStorage.setItem(`audio_${a.id}_duration`, a.duration);
                    
                    if (!a.paused) {
                        sessionStorage.setItem('audioWasPlaying', 'true');
                    }
                }
            } catch (e) {
                console.error('Error saving audio state:', e);
            } 
        });
    });
    
    // Handle page show for back/forward navigation
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            setTimeout(() => {
                const wasPlaying = sessionStorage.getItem('audioWasPlaying') === 'true';
                if (wasPlaying) {
                    setTimeout(attemptAutoPlay, 500);
                }
            }, 100);
        }
    });
    
    // Try to auto-play when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(() => {
                const audios = Array.from(document.querySelectorAll('audio'));
                const anyWasPlaying = audios.some(a => 
                    sessionStorage.getItem(`audio_${a.id}_playing`) === 'true'
                );
                
                if (anyWasPlaying) {
                    attemptAutoPlay();
                }
            }, 300);
        }
    });
    
    // Handle page load with hash (deep linking)
    if (window.location.hash) {
        setTimeout(attemptAutoPlay, 1000);
    }
}

function updateAudioState(audioElement, state) {
    if (!audioElement.id) return;
    
    switch(state) {
        case 'playing':
            sessionStorage.setItem('audioWasPlaying', 'true');
            sessionStorage.setItem(`audio_${audioElement.id}_playing`, 'true');
            break;
        case 'paused':
        case 'ended':
            sessionStorage.setItem(`audio_${audioElement.id}_playing`, 'false');
            if (state === 'ended') {
                sessionStorage.removeItem('audioWasPlaying');
            }
            break;
    }
}

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
                        other.dataset.lastPosition = other.currentTime;
                    } catch (e) {} 
                } 
            }); 
        });
        
        audio.addEventListener('ended', function() {
            if (currentlyPlaying === audio) {
                currentlyPlaying = null;
            }
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

// Handle page visibility - pause audio when page is hidden
document.addEventListener('visibilitychange', function () {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (document.hidden) {
        audios.forEach(a => { 
            try { 
                if (!a.paused) {
                    a.dataset.wasPlayingBeforeHide = 'true';
                    a.pause(); 
                }
            } catch (e) {} 
        });
    } else {
        audios.forEach(a => {
            if (a.dataset.wasPlayingBeforeHide === 'true' && a.paused) {
                delete a.dataset.wasPlayingBeforeHide;
                a.play().catch(e => console.log('Could not resume playback:', e));
            }
        });
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function () {
    const audios = Array.from(document.querySelectorAll('audio'));
    audios.forEach(a => { 
        try { 
            if (a.id && !a.ended) {
                sessionStorage.setItem(`audio_${a.id}_final_position`, a.currentTime);
                sessionStorage.setItem(`audio_${a.id}_final_playing`, !a.paused ? 'true' : 'false');
            }
        } catch (e) {} 
    });
});

// ============================================
// CSS STYLES FOR AUTO-PLAY UI
// ============================================

function addAutoPlayStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Auto-play prompt styles */
        .prompt-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .audio-prompt {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
            animation: slideUp 0.3s ease-out;
        }
        
        .prompt-header {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .prompt-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #5c2e0f;
            margin-bottom: 10px;
        }
        
        .prompt-description {
            color: #666;
            font-size: 0.95em;
            line-height: 1.4;
        }
        
        .prompt-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .prompt-primary-btn {
            padding: 12px 24px;
            background: #5c2e0f;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1em;
        }
        
        .prompt-secondary-btn {
            padding: 12px 24px;
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1em;
        }
        
        .play-icon {
            font-size: 1.2em;
        }
        
        /* Floating play button */
        .floating-play-btn {
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(to bottom, #5c2e0f, #4a240c);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            animation: floatIn 0.3s ease-out;
            max-width: 300px;
            transition: transform 0.2s;
        }
        
        .floating-play-btn:hover {
            transform: translateY(-2px);
        }
        
        .floating-icon {
            font-size: 1.5em;
            flex-shrink: 0;
        }
        
        .floating-text {
            flex-grow: 1;
        }
        
        .floating-title {
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .floating-subtitle {
            font-size: 0.8em;
            opacity: 0.9;
        }
        
        /* Error message */
        #audio-error-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 6px;
            z-index: 10001;
            animation: fadeIn 0.3s ease-out;
            border-left: 4px solid #c62828;
        }
        
        .error-content {
            text-align: center;
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes floatIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Audio note styling */
        .audio-note.error-note {
            color: #cc0000;
            font-style: italic;
            margin-top: 10px;
            padding: 8px;
            background: #fff0f0;
            border-radius: 4px;
            border-left: 3px solid #cc0000;
        }
    `;
    
    // Only add once
    if (!document.getElementById('auto-play-styles')) {
        style.id = 'auto-play-styles';
        document.head.appendChild(style);
    }
}