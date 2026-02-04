// Chapters page script (chapter search, audio handling, animations)
document.addEventListener("DOMContentLoaded", function () {
    const chapterImages = document.querySelectorAll('.chapter-image img');
    
    chapterImages.forEach(img => {
        // Add loading lazy for performance
        img.loading = 'lazy';
        
        // Handle image load errors
        img.onerror = function() {
            this.src = 'images/placeholder.jpg'; // Add a fallback image
            this.alt = 'Image not available';
        };
    });
    const page = document.body.dataset.page;
    
    // Initialize based on page type
    if (page === "chapters") {
        initializeChapterSearch();
    }
    
    // Initialize audio for ALL chapter pages (both single and multi)
    if (page === "chapter" || page === "chapter-multi") {
        initializeChapterAudio();
    }

    setTimeout(animateChapterCards, 300);
    handleChapterImages();  
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

// Add this function to handle chapter images
function handleChapterImages() {
    const chapterImages = document.querySelectorAll('.chapter-image img');
    
    chapterImages.forEach(img => {
        // Add loading attribute for lazy loading
        img.setAttribute('loading', 'lazy');
        
        // Check if image loads successfully
        img.addEventListener('load', function() {
            console.log(`Image loaded: ${this.src}`);
        });
        
        // Handle image errors
        img.addEventListener('error', function() {
            console.error(`Failed to load image: ${this.src}`);
            this.classList.add('error');
            
            // Show fallback content
            const frameInner = this.closest('.frame-inner');
            if (frameInner) {
                const fallbackText = document.createElement('div');
                fallbackText.className = 'image-fallback';
                fallbackText.textContent = img.alt || 'Chapter Image';
                frameInner.innerHTML = '';
                frameInner.appendChild(fallbackText);
            }
        });
    });
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

// Update the initializeChapterAudio function in script-chapters.js
function initializeChapterAudio() {
    // Get ALL audio elements on the page
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;

    console.log(`Found ${audios.length} audio element(s) on page`);

    // Configure each audio element
    audios.forEach((audioElement) => {
        console.log(`Initializing audio: ${audioElement.id || 'unnamed'}`);
        
        // Ensure controls are enabled
        audioElement.controls = true;
        audioElement.style.pointerEvents = 'auto';
        audioElement.style.cursor = 'pointer';
        audioElement.tabIndex = 0;
        
        // Remove any blocking overlays
        const container = audioElement.closest('.audio-controls') || audioElement.parentElement;
        if (container) {
            const overlays = container.querySelectorAll('.play-overlay');
            overlays.forEach(o => o.remove());
        }

        // Add event listeners
        audioElement.addEventListener('ended', function() {
            const audioNote = audioElement.closest('.audio-controls')?.querySelector('.audio-note') ||
                            document.querySelector('.audio-note');
            if (audioNote) {
                audioNote.textContent = 'Tapos na ang audio.';
                audioNote.style.color = '#2e7d32';
            }
        });

        audioElement.addEventListener('error', function(e) {
            console.error('Audio error:', e);
            const audioControls = audioElement.closest('.audio-controls') || 
                                document.querySelector('.audio-controls');
            if (audioControls) {
                const errorNote = document.createElement('p');
                errorNote.className = 'audio-note';
                errorNote.style.color = '#cc0000';
                errorNote.innerHTML = `<em>Hindi ma-play ang audio file.</em>`;
                audioControls.appendChild(errorNote);
            }
        });

        // Try to autoplay using the global manager
        attemptAutoplay(audioElement);
    });
}

// New function to handle autoplay attempts
function attemptAutoplay(audioElement) {
    // Check if we can autoplay
    const canAutoplay = window.audioAutoplay?.canAutoplay() || false;
    
    if (canAutoplay) {
        // User has interacted before, try to play
        setTimeout(() => {
            tryToPlayAudio(audioElement);
        }, 800); // Give page time to load
    } else {
        // No interaction yet, show play button
        showAutoplayPrompt(audioElement);
    }
}

function tryToPlayAudio(audioElement) {
    // Don't try if already playing or has been played
    if (!audioElement.paused || audioElement.currentTime > 0) {
        return;
    }
    
    // Set volume to a reasonable level
    audioElement.volume = 0.7;
    
    // Try to play
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Audio autoplay successful');
                // Hide any play prompts
                const overlay = audioElement.parentElement?.querySelector('.autoplay-prompt');
                if (overlay) overlay.remove();
            })
            .catch(error => {
                console.log('Autoplay prevented:', error);
                // Show play button
                showAutoplayPrompt(audioElement);
            });
    }
}

function showAutoplayPrompt(audioElement) {
    const container = audioElement.closest('.audio-controls') || 
                     audioElement.parentElement;
    if (!container) return;
    
    // Remove existing prompt
    const existingPrompt = container.querySelector('.autoplay-prompt');
    if (existingPrompt) existingPrompt.remove();
    
    // Create prompt
    const prompt = document.createElement('div');
    prompt.className = 'autoplay-prompt';
    prompt.style.cssText = `
        margin-top: 15px;
        padding: 12px;
        background: linear-gradient(135deg, #fff7e6, #f1dcc5);
        border: 2px solid #8b4513;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
    `;
    
    const playButton = document.createElement('button');
    playButton.innerHTML = '▶ I-play ang Audio';
    playButton.style.cssText = `
        background: linear-gradient(to bottom, #a0522d, #6f3410);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        margin-bottom: 8px;
        display: block;
        width: 100%;
    `;
    
    const infoText = document.createElement('p');
    infoText.innerHTML = '<em>Pindutin ang button para pakinggan ang kabanata</em>';
    infoText.style.cssText = `
        color: #5c2e0f;
        font-size: 0.9rem;
        margin: 0;
        padding-top: 5px;
        border-top: 1px dashed #8b4513;
    `;
    
    playButton.addEventListener('click', function() {
        // Mark user as interacted
        if (window.audioAutoplay) {
            window.audioAutoplay.markAsInteracted();
        }
        
        // Try to play audio
        audioElement.play()
            .then(() => {
                prompt.remove();
            })
            .catch(error => {
                console.error('Play failed:', error);
                infoText.innerHTML = '<em style="color:#cc0000">Hindi ma-play ang audio. Pakisubukan muli.</em>';
            });
    });
    
    prompt.appendChild(playButton);
    prompt.appendChild(infoText);
    container.appendChild(prompt);
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

// Add staggered animation to chapter cards
function animateChapterCards() {
    const chapterCards = document.querySelectorAll('.chapter-card');
    
    chapterCards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        // Animate with delay
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50); // 50ms delay between each card
    });
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