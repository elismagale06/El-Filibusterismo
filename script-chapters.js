// Chapters page script (chapter search, audio handling, animations)
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    
    // Initialize based on page type
    if (page === "chapters") {
        initializeChapterSearch();
    }
    
    // Initialize audio for ALL chapter pages (both single and multi)
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
    }

    addCardAnimations();
    ensureSingleAudio();
});

function initializeChapterSearch() {
    const chapterSearch = document.getElementById("chapterSearch");
    if (!chapterSearch) return;
    
    chapterSearch.addEventListener("input", filterChapters);
    chapterSearch.addEventListener("keyup", filterChapters);
    filterChapters(); // Initial filter on load
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
        
        if (searchTerm === "" || 
            chapterTitle.includes(searchTerm) || 
            chapterDesc.includes(searchTerm)) {
            // Show card with animation
            card.classList.remove("hidden");
            card.style.animation = `fadeInCard 0.3s ease ${delay}s forwards`;
            visibleCount++;
            delay += 0.05;
        } else {
            // Hide card
            card.classList.add("hidden");
            card.style.animation = "none";
        }
    });
    
    // Show/hide no results message
    if (visibleCount === 0 && searchTerm !== "") {
        if (searchTermSpan) searchTermSpan.textContent = searchTerm;
        if (noResults) noResults.classList.remove("hidden");
    } else {
        if (noResults) noResults.classList.add("hidden");
    }
}

function initializeChapterAudio() {
    // Get ALL audio elements on the page (handles both single and multiple)
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;

    // Debug log to confirm audio elements are found
    console.log(`Found ${audios.length} audio element(s) on page:`, audios.map(a => a.id || 'unnamed'));

    audios.forEach((audioElement) => {
        console.log(`Initializing audio: ${audioElement.id || 'unnamed'}, src: ${audioElement.querySelector('source')?.src || 'none'}`);
        
        // Ensure controls are enabled and interactive
        audioElement.controls = true;
        audioElement.style.pointerEvents = 'auto';
        audioElement.style.cursor = 'pointer';
        audioElement.tabIndex = 0;
        
        // Remove any blocking overlays
        const container = audioElement.closest('.audio-controls') || audioElement.parentElement;
        if (container) {
            const overlays = container.querySelectorAll('.play-overlay');
            overlays.forEach(o => o.remove());
            
            // Also check for any elements with pointer-events: none
            const allElements = container.querySelectorAll('*');
            allElements.forEach(el => {
                if (window.getComputedStyle(el).pointerEvents === 'none') {
                    el.style.pointerEvents = 'auto';
                }
            });
        }

        // Add ended listener
        audioElement.addEventListener('ended', function () {
            const audioNote = audioElement.closest('.audio-controls')?.querySelector('.audio-note') ||
                            document.querySelector('.audio-note');
            if (audioNote) {
                audioNote.textContent = 'Tapos na ang audio.';
                audioNote.style.color = '#2e7d32'; // Green color for completion
            }
        });

        // Add error listener
        audioElement.addEventListener('error', function (e) {
            console.error('Audio error:', e);
            const audioControls = audioElement.closest('.audio-controls') || 
                                document.querySelector('.audio-controls');
            if (audioControls) {
                const errorNote = document.createElement('p');
                errorNote.className = 'audio-note';
                errorNote.style.color = '#cc0000';
                errorNote.innerHTML = `<em>Hindi ma-play ang audio file. Paki-check ang file path o network connection.</em>`;
                audioControls.appendChild(errorNote);
            }
        });

        // Try to play audio automatically (with user gesture requirement handling)
        setTimeout(() => {
            if (!audioElement.paused || audioElement.currentTime > 0) {
                // Already playing or has been played
                return;
            }
            
            // Check if audio is ready
            if (audioElement.readyState >= 2) { // HAVE_CURRENT_DATA or more
                audioElement.play().catch(error => {
                    console.log('Autoplay prevented, waiting for user interaction:', error);
                    // Show play button overlay if autoplay fails
                    showAutoplayFallback(audioElement);
                });
            } else {
                // Wait for audio to load
                audioElement.addEventListener('loadeddata', function() {
                    audioElement.play().catch(error => {
                        console.log('Autoplay prevented after load:', error);
                        showAutoplayFallback(audioElement);
                    });
                }, { once: true });
            }
        }, 500); // Small delay to ensure page is ready
    });
}

function showAutoplayFallback(audioElement) {
    const audioContainer = audioElement.closest('.audio-controls') || 
                          document.querySelector('.audio-controls');
    if (!audioContainer) return;
    
    // Remove any existing overlay
    const existingOverlay = audioContainer.querySelector('.play-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.className = 'play-overlay';
    overlay.style.cssText = `
        position: relative;
        margin-top: 10px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        text-align: center;
    `;
    
    const playButton = document.createElement('button');
    playButton.className = 'play-overlay-btn';
    playButton.textContent = '▶ I-play ang Audio';
    playButton.style.cssText = `
        background: #5c2e0f;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.3s;
    `;
    
    playButton.addEventListener('click', function() {
        audioElement.play().then(() => {
            overlay.remove();
        }).catch(error => {
            console.error('Play failed:', error);
        });
    });
    
    overlay.appendChild(playButton);
    
    // Insert after the audio element
    audioElement.parentNode.insertBefore(overlay, audioElement.nextSibling);
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

function ensureSingleAudio() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;
    
    audios.forEach((audio) => {
        audio.addEventListener('play', function () {
            audios.forEach((other) => {
                if (other !== audio && !other.paused) {
                    try {
                        other.pause();
                        other.currentTime = 0;
                    } catch (e) {
                        console.error('Error pausing other audio:', e);
                    }
                }
            });
        });
    });
}

// Pause all audios when page is hidden
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        const audios = Array.from(document.querySelectorAll('audio'));
        audios.forEach(a => {
            try {
                if (!a.paused) a.pause();
            } catch (e) {
                console.error('Error pausing audio on visibility change:', e);
            }
        });
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function () {
    const audios = Array.from(document.querySelectorAll('audio'));
    audios.forEach(a => {
        try {
            a.pause();
            a.currentTime = 0;
        } catch (e) {
            // Silent fail
        }
    });
});

// Add global click handler for audio play buttons if needed
document.addEventListener('click', function(e) {
    if (e.target.closest('.play-overlay-btn')) {
        e.preventDefault();
        const overlay = e.target.closest('.play-overlay');
        if (overlay && overlay.previousElementSibling && 
            overlay.previousElementSibling.tagName === 'AUDIO') {
            overlay.previousElementSibling.play().then(() => {
                overlay.remove();
            });
        }
    }
});