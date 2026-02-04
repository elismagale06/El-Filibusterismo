// ============================================
// REFINED CHAPTERS SCRIPT - RELIABLE AUTO-PLAY
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    
    if (page === "chapters") {
        initializeChapterSearch();
    }
    
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
        // Try auto-play immediately but also with a slight delay
        setTimeout(attemptAutoPlay, 100);
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
    const currentChapter = getCurrentChapterId();
    
    audios.forEach((audioElement) => {
        if (!audioElement.id) {
            audioElement.id = 'chapter_audio_' + currentChapter;
        }
        
        audioElement.dataset.chapterId = currentChapter;
        audioElement.preload = "auto";
        
        // Mark user interaction on ANY audio interaction
        audioElement.addEventListener('play', function() {
            markUserInteracted();
            saveAudioState(this, true);
        });
        
        audioElement.addEventListener('pause', function() {
            saveAudioState(this, false);
        });
        
        audioElement.addEventListener('ended', function() {
            saveAudioState(this, false);
            localStorage.setItem(`${currentChapter}_completed`, 'true');
        });
        
        // Restore position for this chapter
        const savedTime = localStorage.getItem(`${currentChapter}_time`);
        if (savedTime && savedTime !== '0') {
            audioElement.currentTime = parseFloat(savedTime);
        }
    });
}

function getCurrentChapterId() {
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);
    return pageName.replace('.html', '');
}

// ============================================
// AUTO-PLAY STRATEGY
// ============================================

function attemptAutoPlay() {
    const page = document.body.dataset.page;
    if (page !== "chapter" && page !== "chapter-multi") return;
    
    const audios = document.querySelectorAll('audio');
    if (audios.length === 0) return;
    
    const audio = audios[0];
    const currentChapter = getCurrentChapterId();
    const hasUserInteracted = hasUserInteractedWithAudio();
    
    // Strategy 1: Try direct auto-play first
    tryDirectAutoPlay(audio, currentChapter, hasUserInteracted);
}

function tryDirectAutoPlay(audio, chapterId, hasUserInteracted) {
    // Check if we should resume from saved position
    const wasPlaying = localStorage.getItem(`${chapterId}_playing`) === 'true';
    const savedTime = localStorage.getItem(`${chapterId}_time`);
    
    if (wasPlaying && savedTime && savedTime !== '0') {
        const time = parseFloat(savedTime);
        if (audio.duration && time < audio.duration - 5) {
            audio.currentTime = time;
        }
    }
    
    // First-time users: show prompt, don't try auto-play
    if (!hasUserInteracted) {
        showSimplePlayPrompt(audio);
        return;
    }
    
    // Returning users: try to auto-play
    const playAudio = () => {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Auto-play successful for', chapterId);
                    localStorage.setItem(`${chapterId}_playing`, 'true');
                    removeAllPrompts();
                })
                .catch(error => {
                    console.log('Auto-play blocked for', chapterId);
                    
                    // If audio was previously playing, show resume button
                    if (wasPlaying) {
                        showResumeButton(audio);
                    } else {
                        // For new chapters, show a subtle play prompt
                        showFloatingPlayButton(audio);
                    }
                });
        }
    };
    
    // Wait for audio to be ready
    if (audio.readyState >= 3) {
        playAudio();
    } else {
        audio.addEventListener('canplaythrough', playAudio, { once: true });
        setTimeout(playAudio, 1500);
    }
}

// ============================================
// USER INTERACTION TRACKING
// ============================================

function markUserInteracted() {
    localStorage.setItem('user_audio_interaction', 'true');
    // Also set a timestamp to track when interaction happened
    localStorage.setItem('last_audio_interaction', Date.now().toString());
}

function hasUserInteractedWithAudio() {
    return localStorage.getItem('user_audio_interaction') === 'true';
}

// ============================================
// PROMPTS AND UI ELEMENTS
// ============================================

function showSimplePlayPrompt(audio) {
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
    
    // Store audio ID in global variable for easy access
    window.currentPromptAudio = audio;
}

function showFloatingPlayButton(audio) {
    removeFloatingButton();
    
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
        audio.play().then(() => {
            removeFloatingButton();
        }).catch(e => {
            console.log('Play failed:', e);
        });
    };
    
    document.body.appendChild(button);
    
    // Auto-remove after 60 seconds if not clicked
    setTimeout(() => {
        removeFloatingButton();
    }, 60000);
}

function showResumeButton(audio) {
    removeFloatingButton();
    
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
        audio.play().then(() => {
            removeFloatingButton();
        }).catch(e => {
            console.log('Resume failed:', e);
        });
    };
    
    document.body.appendChild(button);
    
    // Auto-remove after 45 seconds if not clicked
    setTimeout(() => {
        removeFloatingButton();
    }, 45000);
}

function removeFloatingButton() {
    const floatingBtn = document.getElementById('floating-play-button');
    const resumeBtn = document.getElementById('resume-audio-btn');
    if (floatingBtn) floatingBtn.remove();
    if (resumeBtn) resumeBtn.remove();
}

function removeAllPrompts() {
    removeFloatingButton();
    const prompt = document.getElementById('simple-play-prompt');
    if (prompt) prompt.remove();
}

// Global functions
window.playFromPrompt = function() {
    if (window.currentPromptAudio) {
        markUserInteracted();
        window.currentPromptAudio.play().then(() => {
            closePrompt();
        }).catch(e => {
            console.log('Play from prompt failed:', e);
        });
    }
};

window.closePrompt = function() {
    const prompt = document.getElementById('simple-play-prompt');
    if (prompt) {
        prompt.remove();
        // If user closes prompt without playing, still mark as interacted
        // so they don't see it again on other chapters
        markUserInteracted();
    }
};

// ============================================
// STATE MANAGEMENT
// ============================================

function saveAudioState(audioElement, isPlaying) {
    const currentChapter = getCurrentChapterId();
    if (!currentChapter) return;
    
    localStorage.setItem(`${currentChapter}_time`, audioElement.currentTime.toString());
    localStorage.setItem(`${currentChapter}_playing`, isPlaying.toString());
    
    if (isPlaying) {
        localStorage.setItem('last_active_chapter', currentChapter);
    }
}

// Save state on page unload
window.addEventListener('beforeunload', function() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        saveAudioState(audio, !audio.paused);
    });
});

// Resume when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const page = document.body.dataset.page;
        if (page !== "chapter" && page !== "chapter-multi") return;
        
        const currentChapter = getCurrentChapterId();
        const wasPlaying = localStorage.getItem(`${currentChapter}_playing`) === 'true';
        
        if (wasPlaying && hasUserInteractedWithAudio()) {
            setTimeout(() => {
                const audios = document.querySelectorAll('audio');
                if (audios.length > 0) {
                    const audio = audios[0];
                    const savedTime = localStorage.getItem(`${currentChapter}_time`);
                    if (savedTime) {
                        audio.currentTime = parseFloat(savedTime);
                    }
                    audio.play().catch(e => {
                        // Auto-play blocked, show resume button
                        showResumeButton(audio);
                    });
                }
            }, 300);
        }
    }
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
    `;
    
    document.head.appendChild(style);
}