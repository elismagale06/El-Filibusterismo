// Chapters page script (chapter search, audio handling, animations)
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "chapters") {
        initializeChapterSearch();
    }
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
        restoreAudioPlaybackState();
        setTimeout(autoPlayChapterAudio, 1000);
    }

    addCardAnimations();
    ensureSingleAudio();
    
    // Handle audio state for page refreshes
    setupAudioStateManagement();
});

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

function initializeChapterAudio() {
    // Support pages that have one or multiple audio elements
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;

    audios.forEach((audioElement) => {
        // Ensure audio element has an ID for state tracking
        if (!audioElement.id) {
            audioElement.id = 'audio_' + Date.now() + Math.random().toString(36).substr(2, 9);
        }
        
        // Add ended listener behavior based on data-chapter attribute if present
        audioElement.addEventListener('ended', function () {
            // Update audio state
            updateAudioState(audioElement, 'ended');
            
            // Do not auto-redirect when audio ends. Leave a completion note if present.
            const audioNote = audioElement.closest('.audio-controls')?.querySelector('.audio-note') || document.querySelector('.audio-note');
            if (audioNote) audioNote.textContent = 'Tapos na ang audio.';
        });

        audioElement.addEventListener('error', function (e) {
            console.error('Audio error:', e);
            const audioControls = audioElement.closest('.audio-controls') || document.querySelector('.audio-controls');
            if (audioControls) {
                const errorNote = document.createElement('p');
                errorNote.className = 'audio-note'; 
                errorNote.style.color = '#cc0000';
                errorNote.innerHTML = `<em>Hindi ma-play ang audio file. Paki-check ang file path.</em>`;
                audioControls.appendChild(errorNote);
            }
            
            // Update state
            updateAudioState(audioElement, 'error');
        });
        
        // Track play events for state management
        audioElement.addEventListener('play', function() {
            updateAudioState(audioElement, 'playing');
        });
        
        audioElement.addEventListener('pause', function() {
            updateAudioState(audioElement, 'paused');
        });

        // Ensure audio controls are interactive even if page CSS disables interaction
        try {
            // Inline style overrides external CSS that may set pointer-events:none
            audioElement.style.pointerEvents = 'auto';
            // Ensure controls attribute is present
            audioElement.controls = true;
            // Allow keyboard focus
            audioElement.tabIndex = 0;
            // Remove any play-overlay elements that might block interactions
            const container = audioElement.closest('.audio-controls');
            if (container) {
                const overlays = container.querySelectorAll('.play-overlay, .autoplay-fallback');
                overlays.forEach(o => o.remove());
            }
        } catch (e) {
            // ignore
        }
    });
}

function ensureSingleAudio() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;
    
    // Track which audio is currently playing
    let currentlyPlaying = null;
    
    audios.forEach((audio) => {
        audio.addEventListener('play', function () { 
            // Store the currently playing audio
            currentlyPlaying = audio;
            
            // Pause all other audios
            audios.forEach((other) => { 
                if (other !== audio && !other.paused) { 
                    try { 
                        other.pause(); 
                        // Save playback position for other audios if needed
                        other.dataset.lastPosition = other.currentTime;
                    } catch (e) {} 
                } 
            }); 
        });
        
        // When audio ends, clear the currently playing reference
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

// Audio State Management Functions
function setupAudioStateManagement() {
    // Save audio state before page unload
    window.addEventListener('beforeunload', function () {
        const audios = Array.from(document.querySelectorAll('audio'));
        audios.forEach(a => { 
            try { 
                // Save audio state
                if (a.id) {
                    sessionStorage.setItem(`audio_${a.id}_position`, a.currentTime);
                    sessionStorage.setItem(`audio_${a.id}_playing`, !a.paused ? 'true' : 'false');
                    sessionStorage.setItem(`audio_${a.id}_duration`, a.duration);
                }
            } catch (e) {
                console.error('Error saving audio state:', e);
            } 
        });
    });
    
    // Handle page show event for back/forward navigation
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was restored from bfcache, restore audio state
            setTimeout(restoreAudioPlaybackState, 100);
        }
    });
    
    // Also try to restore state when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(restoreAudioPlaybackState, 300);
        }
    });
}

function restoreAudioPlaybackState() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (audios.length === 0) return;
    
    // For combined chapter pages, use the specific combined audio logic
    if (document.body.dataset.page === 'chapter-multi') {
        // The logic is now in the inline script above
        return;
    }
    
    // Original logic for single chapter pages
    audios.forEach(audio => {
        if (!audio.id) return;
        
        const wasAudioPlaying = sessionStorage.getItem(`audio_${audio.id}_playing`);
        const position = sessionStorage.getItem(`audio_${audio.id}_position`);
        const duration = sessionStorage.getItem(`audio_${audio.id}_duration`);
        
        // Restore position if available
        if (position && duration) {
            const pos = parseFloat(position);
            const dur = parseFloat(duration);
            
            if (pos < dur - 1) {
                audio.currentTime = pos;
            }
        }
        
        // Try to resume if audio was playing
        if (wasAudioPlaying === 'true' && audio.paused) {
            // Check if user has interacted with audio before
            const userInteracted = sessionStorage.getItem('userInteractedWithAudio');
            
            setTimeout(() => {
                if (userInteracted === 'true') {
                    audio.play().catch(error => {
                        console.log('Auto-play on restore prevented:', error);
                        showAutoplayFallback(audio);
                    });
                } else {
                    showAutoplayFallback(audio);
                }
            }, 500);
        }
        
        // Clean up storage
        sessionStorage.removeItem(`audio_${audio.id}_position`);
        sessionStorage.removeItem(`audio_${audio.id}_playing`);
        sessionStorage.removeItem(`audio_${audio.id}_duration`);
    });
    
    sessionStorage.removeItem('audioWasPlaying');
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
            break;
    }
}

function showAutoplayFallback(audioElement) {
    const audioContainer = audioElement.closest('.audio-controls');
    if (!audioContainer) return;
    
    // Remove any existing overlay
    const existingOverlay = audioContainer.querySelector('.autoplay-fallback');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'autoplay-fallback';
    overlay.style.marginTop = '10px';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '10px';
    overlay.style.backgroundColor = '#f9f9f9';
    overlay.style.borderRadius = '5px';
    overlay.style.border = '1px solid #ddd';
    
    overlay.innerHTML = `
        <p style="margin-bottom: 8px; color: #5c2e0f; font-size: 0.9em;">
            <em>Audio auto-play ay naharang ng browser. Pindutin ang button para simulan ang playback.</em>
        </p>
        <button class="play-overlay-btn" 
                onclick="this.closest('.audio-controls').querySelector('audio').play(); 
                         this.closest('.autoplay-fallback').remove();"
                style="background-color: #5c2e0f; color: white; padding: 8px 16px; border: none; 
                       border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.9em;">
            ▶ I-play ang Audio
        </button>
    `;
    
    // Insert the overlay before the audio element or after the last child
    audioContainer.appendChild(overlay);
}

// Handle page visibility - pause audio when page is hidden
document.addEventListener('visibilitychange', function () {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (document.hidden) {
        // Pause all audios when page is hidden
        audios.forEach(a => { 
            try { 
                if (!a.paused) {
                    a.dataset.wasPlayingBeforeHide = 'true';
                    a.pause(); 
                }
            } catch (e) {} 
        });
    } else {
        // Try to resume playback when page becomes visible again
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
            // Save final state before leaving
            if (a.id && !a.ended) {
                sessionStorage.setItem(`audio_${a.id}_final_position`, a.currentTime);
                sessionStorage.setItem(`audio_${a.id}_final_playing`, !a.paused ? 'true' : 'false');
            }
            a.pause(); 
            a.currentTime = 0; 
        } catch (e) {} 
    });
});


// Auto-play for chapter audio with better UX
function autoPlayChapterAudio() {
    // Only run on chapter pages
    const page = document.body.dataset.page;
    if (page !== "chapter" && page !== "chapter-multi") return;
    
    // Get audio element(s)
    const audios = Array.from(document.querySelectorAll('audio'));
    if (audios.length === 0) return;
    
    // Try to auto-play each audio
    audios.forEach(audio => {
        // Skip if audio has been interacted with before
        if (audio.dataset.userInteracted === 'true') return;
        
        // Check if we have saved playback position
        const savedPosition = sessionStorage.getItem(`audio_${audio.id}_position`);
        const shouldResume = sessionStorage.getItem(`audio_${audio.id}_shouldResume`) === 'true';
        
        // Set a small delay to ensure DOM is ready
        setTimeout(() => {
            // Try to play
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Auto-play prevented:', error);
                    
                    // Show a visible play button at the TOP of the page
                    showFloatingPlayButton(audio);
                }).then(() => {
                    // Success! Remove any floating button
                    removeFloatingPlayButton();
                });
            }
        }, 500); // Increased delay to ensure page is stable
    });
}

// Show a floating play button at the top
function showFloatingPlayButton(audioElement) {
    // Remove existing floating button
    removeFloatingPlayButton();
    
    // Create floating button container
    const floatingContainer = document.createElement('div');
    floatingContainer.id = 'floating-play-container';
    floatingContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(to bottom, #5c2e0f, #4a240c);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        animation: floatIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    floatingContainer.innerHTML = `
        <div style="flex-shrink: 0; font-size: 1.5em;">▶</div>
        <div style="flex-grow: 1;">
            <div style="font-weight: bold; font-size: 0.9em;">Simulan ang Audio</div>
            <div style="font-size: 0.8em; opacity: 0.9;">I-click dito upang pakinggan ang kabanata</div>
        </div>
    `;
    
    // Add click handler
    floatingContainer.addEventListener('click', function() {
        audioElement.play().then(() => {
            removeFloatingPlayButton();
            // Mark as interacted
            audioElement.dataset.userInteracted = 'true';
            sessionStorage.setItem('userInteractedWithAudio', 'true');
        }).catch(err => {
            console.log('Manual play also prevented:', err);
        });
    });
    
    // Add to page
    document.body.appendChild(floatingContainer);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        removeFloatingPlayButton();
    }, 30000);
}

function removeFloatingPlayButton() {
    const existing = document.getElementById('floating-play-container');
    if (existing) existing.remove();
}

// Add floatIn animation to CSS
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Update DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "chapters") {
        initializeChapterSearch();
    }
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
        restoreAudioPlaybackState();
        // Try to auto-play after a delay
        setTimeout(autoPlayChapterAudio, 1000);
    }

    addCardAnimations();
    ensureSingleAudio();
    
    // Handle audio state for page refreshes
    setupAudioStateManagement();
});