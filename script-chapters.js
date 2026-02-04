// ============================================
// REFINED CHAPTERS SCRIPT - RELIABLE AUTO-PLAY
// ============================================

// Global variables to track audio state
let audioPlayer = null;
let isPlaying = false;
let currentChapter = null;

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    
    if (page === "chapters") {
        initializeChapterSearch();
    }
    
    if (page === "chapter" || page === "chapter-multi") {
        currentChapter = getCurrentChapterId();
        initializeChapterAudio();
        setTimeout(initiateAudioPlayback, 500); // Slightly longer delay for better reliability
    }

    addCardAnimations();
    ensureSingleAudio();
    addAutoPlayStyles();
});

// ============================================
// CHAPTER SEARCH FUNCTIONALITY
// ============================================

function initializeChapterSearch() {
    const chapterSearch = document.getElementById("chapterSearch");
    if (!chapterSearch) return;
    chapterSearch.addEventListener("input", filterChapters);
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
// AUDIO INITIALIZATION
// ============================================

function initializeChapterAudio() {
    const audios = document.querySelectorAll('audio');
    
    if (audios.length === 0) return;
    
    audioPlayer = audios[0];
    
    // Set proper ID for tracking
    if (!audioPlayer.id) {
        audioPlayer.id = 'chapter_audio_' + currentChapter;
    }
    
    audioPlayer.dataset.chapterId = currentChapter;
    audioPlayer.preload = "auto";
    
    // Restore position for this chapter
    const savedTime = getSavedAudioTime();
    if (savedTime > 0) {
        audioPlayer.currentTime = savedTime;
    }
    
    // Mark user interaction on ANY audio interaction
    audioPlayer.addEventListener('play', function() {
        markUserInteracted();
        setAudioState(true);
        isPlaying = true;
    });
    
    audioPlayer.addEventListener('pause', function() {
        setAudioState(false);
        isPlaying = false;
    });
    
    audioPlayer.addEventListener('ended', function() {
        setAudioState(false);
        isPlaying = false;
        markChapterCompleted();
    });
    
    // Handle audio ready state
    audioPlayer.addEventListener('loadedmetadata', function() {
        console.log('Audio metadata loaded for', currentChapter);
    });
    
    // Save time periodically
    audioPlayer.addEventListener('timeupdate', function() {
        if (!audioPlayer.paused) {
            saveCurrentTime();
        }
    });
}

function getCurrentChapterId() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    return pageName.replace('.html', '').replace('.php', '');
}

// ============================================
// AUTO-PLAY STRATEGY - FIXED
// ============================================

function initiateAudioPlayback() {
    if (!audioPlayer) return;
    
    const isFirstVisit = !hasUserInteractedWithAudio();
    const wasPlayingGlobally = getGlobalPlaybackState();
    const wasPlayingThisChapter = getChapterPlaybackState(currentChapter);
    
    console.log('Audio playback state:', {
        currentChapter,
        isFirstVisit,
        wasPlayingGlobally,
        wasPlayingThisChapter
    });
    
    // First-time users: show modal prompt
    if (isFirstVisit) {
        console.log('First visit - showing modal prompt');
        showSimplePlayPrompt();
        return;
    }
    
    // Returning users who were playing audio globally
    if (wasPlayingGlobally) {
        console.log('Was playing globally - attempting auto-resume');
        attemptAutoResume();
        return;
    }
    
    // Returning users but audio was paused
    console.log('Audio was not playing globally - showing floating button');
    showFloatingPlayButton();
}

function attemptAutoResume() {
    if (!audioPlayer) return;
    
    // Check if we should resume from saved position
    const savedTime = getSavedAudioTime();
    const isThisChapterCompleted = isChapterCompleted();
    
    if (isThisChapterCompleted) {
        console.log('Chapter already completed - not auto-playing');
        showFloatingPlayButton();
        return;
    }
    
    // Set the saved time
    if (savedTime > 0 && savedTime < audioPlayer.duration - 1) {
        audioPlayer.currentTime = savedTime;
    }
    
    // Attempt to play
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Auto-play successful for', currentChapter);
                removeAllPrompts();
                isPlaying = true;
            })
            .catch(error => {
                console.log('Auto-play blocked for', currentChapter);
                // If auto-play is blocked, show resume button
                showResumeButton();
            });
    }
}

// ============================================
// USER INTERACTION TRACKING
// ============================================

function markUserInteracted() {
    localStorage.setItem('user_audio_interaction', 'true');
    localStorage.setItem('last_audio_interaction', Date.now().toString());
}

function hasUserInteractedWithAudio() {
    return localStorage.getItem('user_audio_interaction') === 'true';
}

// ============================================
// STATE MANAGEMENT - FIXED
// ============================================

function getGlobalPlaybackState() {
    const lastChapter = localStorage.getItem('last_active_chapter');
    const wasPlaying = localStorage.getItem(`${lastChapter}_playing`) === 'true';
    return wasPlaying && lastChapter !== currentChapter; // Only if it was a different chapter
}

function getChapterPlaybackState(chapterId) {
    return localStorage.getItem(`${chapterId}_playing`) === 'true';
}

function setAudioState(playing) {
    localStorage.setItem(`${currentChapter}_playing`, playing.toString());
    
    if (playing) {
        localStorage.setItem('last_active_chapter', currentChapter);
        localStorage.setItem('last_play_timestamp', Date.now().toString());
    }
}

function getSavedAudioTime() {
    const savedTime = localStorage.getItem(`${currentChapter}_time`);
    return savedTime ? parseFloat(savedTime) : 0;
}

function saveCurrentTime() {
    if (audioPlayer) {
        localStorage.setItem(`${currentChapter}_time`, audioPlayer.currentTime.toString());
    }
}

function markChapterCompleted() {
    localStorage.setItem(`${currentChapter}_completed`, 'true');
}

function isChapterCompleted() {
    return localStorage.getItem(`${currentChapter}_completed`) === 'true';
}

// ============================================
// PROMPTS AND UI ELEMENTS - FIXED
// ============================================

function showSimplePlayPrompt() {
    removeAllPrompts();
    
    const overlay = document.createElement('div');
    overlay.id = 'simple-play-prompt';
    overlay.innerHTML = `
        <div class="prompt-content">
            <h3>Simulan ang Audio ng Kabanata</h3>
            <p>Ang audio ay awtomatikong magpe-play sa mga susunod na kabanata.</p>
            <div class="prompt-buttons">
                <button class="secondary-btn" onclick="closePrompt()">Huwag muna</button>
                <button class="primary-btn" onclick="playFromPrompt()">
                    <span class="play-icon">▶</span> I-play Ngayon
                </button>
            </div>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    overlay.querySelector('.prompt-content').style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease-out;
    `;
    
    overlay.querySelector('.primary-btn').style.cssText = `
        background: #5c2e0f;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        margin: 5px;
        font-weight: bold;
        font-size: 1em;
        transition: background 0.2s;
    `;
    
    overlay.querySelector('.secondary-btn').style.cssText = `
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        margin: 5px;
        font-weight: bold;
        font-size: 1em;
        transition: background 0.2s;
    `;
    
    // Add hover effects
    overlay.querySelector('.primary-btn').onmouseover = function() {
        this.style.background = '#4a240c';
    };
    overlay.querySelector('.primary-btn').onmouseout = function() {
        this.style.background = '#5c2e0f';
    };
    
    overlay.querySelector('.secondary-btn').onmouseover = function() {
        this.style.background = '#e8e8e8';
    };
    overlay.querySelector('.secondary-btn').onmouseout = function() {
        this.style.background = '#f5f5f5';
    };
    
    document.body.appendChild(overlay);
}

function showFloatingPlayButton() {
    removeAllPrompts();
    
    const button = document.createElement('div');
    button.id = 'floating-play-button';
    button.innerHTML = `
        <div class="floating-content">
            <div class="play-icon">▶</div>
            <div class="floating-text">Pindutin para pakinggan</div>
        </div>
    `;
    
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(to bottom, #5c2e0f, #4a240c);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: floatIn 0.5s ease-out;
        transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    button.querySelector('.play-icon').style.cssText = `
        font-size: 1.5em;
    `;
    
    button.querySelector('.floating-text').style.cssText = `
        font-size: 0.95em;
        font-weight: bold;
    `;
    
    button.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    };
    
    button.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    };
    
    button.onclick = function() {
        if (audioPlayer) {
            audioPlayer.play().then(() => {
                removeAllPrompts();
                isPlaying = true;
            }).catch(e => {
                console.log('Play failed:', e);
            });
        }
    };
    
    document.body.appendChild(button);
    
    // Auto-remove after 60 seconds if not clicked
    setTimeout(() => {
        removeAllPrompts();
    }, 60000);
}

function showResumeButton() {
    removeAllPrompts();
    
    const button = document.createElement('div');
    button.id = 'resume-audio-btn';
    button.innerHTML = `
        <div class="resume-content">
            <div class="resume-icon">▶</div>
            <div class="resume-text">Ipagpatuloy ang Audio</div>
        </div>
    `;
    
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(to bottom, #5c2e0f, #4a240c);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        animation: floatIn 0.5s ease-out;
        transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    button.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    };
    
    button.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    };
    
    button.onclick = function() {
        if (audioPlayer) {
            audioPlayer.play().then(() => {
                removeAllPrompts();
                isPlaying = true;
            }).catch(e => {
                console.log('Resume failed:', e);
            });
        }
    };
    
    document.body.appendChild(button);
    
    // Auto-remove after 45 seconds if not clicked
    setTimeout(() => {
        removeAllPrompts();
    }, 45000);
}

function removeAllPrompts() {
    const floatingBtn = document.getElementById('floating-play-button');
    const resumeBtn = document.getElementById('resume-audio-btn');
    const prompt = document.getElementById('simple-play-prompt');
    
    if (floatingBtn) floatingBtn.remove();
    if (resumeBtn) resumeBtn.remove();
    if (prompt) prompt.remove();
}

// Global functions
window.playFromPrompt = function() {
    if (audioPlayer) {
        markUserInteracted();
        audioPlayer.play().then(() => {
            closePrompt();
            isPlaying = true;
        }).catch(e => {
            console.log('Play from prompt failed:', e);
        });
    }
};

window.closePrompt = function() {
    const prompt = document.getElementById('simple-play-prompt');
    if (prompt) {
        prompt.remove();
        markUserInteracted(); // Mark as interacted even if closed
        showFloatingPlayButton(); // Show floating button instead
    }
};

// ============================================
// NAVIGATION AND PAGE TRANSITION HANDLING
// ============================================

// Save state before navigating away
window.addEventListener('beforeunload', function() {
    if (audioPlayer) {
        saveCurrentTime();
        setAudioState(!audioPlayer.paused);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && audioPlayer) {
        // Page became visible - check if we should resume
        const shouldResume = getGlobalPlaybackState() && !isPlaying;
        
        if (shouldResume) {
            setTimeout(() => {
                if (audioPlayer && !audioPlayer.paused) {
                    // Already playing, do nothing
                    return;
                }
                
                const savedTime = getSavedAudioTime();
                if (savedTime > 0) {
                    audioPlayer.currentTime = savedTime;
                }
                
                audioPlayer.play().then(() => {
                    isPlaying = true;
                }).catch(e => {
                    console.log('Visibility resume failed:', e);
                    showResumeButton();
                });
            }, 300);
        }
    }
});

// Listen for navigation events
window.addEventListener('popstate', function() {
    // Handle browser back/forward navigation
    setTimeout(() => {
        const page = document.body.dataset.page;
        if (page === "chapter" || page === "chapter-multi") {
            currentChapter = getCurrentChapterId();
            initializeChapterAudio();
            setTimeout(initiateAudioPlayback, 100);
        }
    }, 100);
});

// ============================================
// OTHER FUNCTIONS
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
    if (document.getElementById('auto-play-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'auto-play-styles';
    style.textContent = `
        @keyframes fadeInCard {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
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
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .hidden { display: none !important; }
        
        .primary-btn:hover {
            background: #4a240c !important;
        }
        
        .secondary-btn:hover {
            background: #e8e8e8 !important;
        }
        
        #floating-play-button:hover,
        #resume-audio-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
        }
        
        /* Floating button animations */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        #floating-play-button .play-icon,
        #resume-audio-btn .resume-icon {
            animation: pulse 2s infinite;
        }
    `;
    
    document.head.appendChild(style);
}