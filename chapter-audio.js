// chapter-audio.js - Manages audio for chapter pages (with intro-to-main auto-play)
document.addEventListener('DOMContentLoaded', function() {
    const page = document.body.dataset.page;
    
    // Only run on chapter pages
    if (page !== 'chapter' && page !== 'chapter-multi') return;
    
    console.log('Chapter Audio Initialization - Page:', page);
    
    // Initialize audio system with improved state tracking
    initializeChapterAudioSystem();
    
    // Clean up URL but preserve state for refreshes
    cleanupUrlPreservingState();
});

function initializeChapterAudioSystem() {
    console.log('Initializing chapter audio system');
    
    // Find all audio elements
    const audioElements = Array.from(document.querySelectorAll('audio'));
    const endAudio = document.querySelector('#chapterAudio, #combinedChapterAudio, [id*="chapterAudio"], audio');
    
    if (!endAudio) {
        console.warn('No end audio player found');
        return;
    }
    
    console.log('Found end audio:', endAudio);
    
    // Disable autoplay for end audio initially
    endAudio.autoplay = false;
    endAudio.removeAttribute('autoplay');
    
    // Create floating button (will be hidden when main audio auto-plays)
    createFloatingAudioButton(endAudio);
    
    // Setup intro-to-main audio transition
    setupIntroToMainTransition(endAudio);
    
    // Check if we should play intro
    checkAndPlayIntroAudio(endAudio);
    
    // Setup scroll listener to hide floating button
    setupScrollListener(endAudio);
}

function setupIntroToMainTransition(endAudio) {
    console.log('Setting up intro-to-main audio transition');
    
    // Store reference to end audio
    window.chapterEndAudio = endAudio;
    
    // Add ended event listener to end audio to reset state
    endAudio.addEventListener('ended', function() {
        console.log('Chapter audio ended');
        
        // Update floating button if exists
        const floatingBtn = document.getElementById('floatingAudioBtn');
        if (floatingBtn) {
            updateButtonState(floatingBtn, endAudio);
        }
    });
}

function checkAndPlayIntroAudio(endAudio) {
    // Multiple ways to determine if we should play intro
    const shouldPlayIntro = shouldPlayChapterIntro();
    
    if (shouldPlayIntro) {
        console.log('Should play intro audio');
        
        // Clear session storage after checking
        sessionStorage.removeItem('lastClickedChapter');
        
        // Play intro, and auto-play end audio after intro finishes
        setTimeout(() => {
            playChapterIntroAudio(endAudio);
        }, 800); // Delay to ensure page is loaded
    } else {
        console.log('Should NOT play intro audio');
        
        // Still show notification without audio
        const currentChapter = getCurrentChapterNumber();
        if (currentChapter) {
            const chapterData = getChapterData();
            setTimeout(() => {
                showIntroNotification(`Kabanata ${currentChapter}`, '📖', 'Ang kabanata ay handa na.');
            }, 1000);
        }
    }
}

function shouldPlayChapterIntro() {
    const urlParams = new URLSearchParams(window.location.search);
    const playIntroParam = urlParams.get('playIntro');
    
    console.log('Checking if should play intro:');
    console.log('- URL playIntro parameter:', playIntroParam);
    
    // Check for refresh scenario
    const isRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD || 
                     performance.getEntriesByType("navigation")[0]?.type === "reload";
    
    // Method 1: Check if URL has playIntro parameter
    if (playIntroParam === 'true') {
        console.log('Method 1: URL parameter says play intro');
        return true;
    }
    
    // Method 2: Check if this is a page refresh
    if (isRefresh) {
        console.log('Page refresh detected');
        
        // Check if we have audio state in localStorage
        const audioState = localStorage.getItem('chapterAudioState');
        if (audioState) {
            try {
                const state = JSON.parse(audioState);
                const currentChapter = getCurrentChapterNumber();
                
                // Check if we're on the same chapter and recently played
                if (state.chapter === currentChapter && 
                    (Date.now() - state.timestamp) < 300000) { // 5 minutes
                    console.log('Method 2: Recent audio state found for refresh');
                    return true;
                }
            } catch (e) {
                console.error('Error parsing audio state:', e);
            }
        }
        
        // For refresh, don't try to autoplay without user interaction
        return false;
    }
    
    // Method 3: Check sessionStorage for recent navigation
    const storedData = sessionStorage.getItem('lastClickedChapter');
    console.log('- Session storage data:', storedData);
    
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            const now = Date.now();
            
            // Play intro if chapter was clicked within last 30 seconds
            if (data.timestamp && (now - data.timestamp) <= 30000) {
                const currentChapter = getCurrentChapterNumber();
                
                if (currentChapter && data.number === currentChapter) {
                    console.log('Method 3: Recent chapter navigation detected');
                    return true;
                }
            }
        } catch (e) {
            console.error('Error parsing stored data:', e);
        }
    }
    
    // Method 4: Check referrer
    const referrer = document.referrer;
    console.log('- Referrer:', referrer);
    
    if (referrer) {
        try {
            const referrerUrl = new URL(referrer);
            const currentUrl = new URL(window.location);
            
            if (referrerUrl.pathname.includes('talasalitaan') && 
                currentUrl.pathname.includes('chapter')) {
                console.log('Method 4: Returning from talasalitaan page');
                return true;
            }
            
            if (referrerUrl.pathname.includes('activities') && 
                currentUrl.pathname.includes('chapter')) {
                console.log('Method 4: Returning from activities page');
                return true;
            }
        } catch (e) {
            console.log('Error parsing referrer URL:', e);
        }
    }
    
    console.log('No conditions met for playing intro');
    return false;
}




function cleanupUrlPreservingState() {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldPlayIntro = urlParams.get('playIntro') === 'true';
    const navId = urlParams.get('navId');
    
    // Store navigation ID for refresh handling
    if (navId) {
        sessionStorage.setItem('lastNavId', navId);
    }
    
    // Only clean URL if we have parameters
    if ((shouldPlayIntro || navId) && window.history.replaceState) {
        const newUrl = new URL(window.location);
        
        // Remove playIntro parameter if present
        if (shouldPlayIntro) {
            newUrl.searchParams.delete('playIntro');
        }
        
        // Keep navId but mark intro as processed
        if (navId) {
            newUrl.searchParams.set('introProcessed', 'true');
        }
        
        // Add a timestamp to prevent caching issues
        newUrl.searchParams.set('_t', Date.now().toString());
        
        window.history.replaceState({}, document.title, newUrl);
        console.log('URL cleaned up:', newUrl.toString());
    }
}

function getCurrentChapterNumber() {
    // Try multiple ways to get current chapter number
    
    // 1. Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlChapter = urlParams.get('chapter');
    if (urlChapter) {
        console.log('Got chapter from URL parameter:', urlChapter);
        return urlChapter;
    }
    
    // 2. Extract from page title - UPDATED REGEX
    const pageTitle = document.querySelector('h1')?.textContent || '';
    console.log('Page title:', pageTitle);
    
    // UPDATED: Match numbers with either en dash (–), hyphen (-), OR "at"
    const chapterMatch = pageTitle.match(/Kabanata\s+(\d+)(?:\s*(?:[–\-]|at)\s*(\d+))?/i);
    if (chapterMatch) {
        // If we have two numbers (like "30 at 31"), combine them with hyphen
        if (chapterMatch[2]) {
            const combined = `${chapterMatch[1]}-${chapterMatch[2]}`;
            console.log('Got chapter from page title match (combined):', combined);
            return combined;
        }
        // If only one number
        console.log('Got chapter from page title match:', chapterMatch[1]);
        return chapterMatch[1];
    }
    
    // 3. Try to match just numbers in title
    const numberMatch = pageTitle.match(/(\d+)(?:\s*(?:[–\-]|at)\s*(\d+))?/);
    if (numberMatch) {
        if (numberMatch[2]) {
            const combined = `${numberMatch[1]}-${numberMatch[2]}`;
            console.log('Got chapter from number match (combined):', combined);
            return combined;
        }
        console.log('Got chapter from number match:', numberMatch[1]);
        return numberMatch[1];
    }
    
    // 4. Try to extract from URL path
    const pathMatch = window.location.pathname.match(/chapter(\d+[–\-]?\d*)/i);
    if (pathMatch) {
        console.log('Got chapter from path match:', pathMatch[1]);
        return pathMatch[1].replace(/–/g, '-');
    }
    
    // 5. Check for chapter in the URL without "chapter" prefix
    const altPathMatch = window.location.pathname.match(/(\d+[–\-]?\d*)\.html$/);
    if (altPathMatch) {
        console.log('Got chapter from alt path match:', altPathMatch[1]);
        return altPathMatch[1].replace(/–/g, '-');
    }
    
    console.log('Could not determine chapter number');
    return null;
}

function getChapterData() {
    const chapterNumber = getCurrentChapterNumber();
    const pageTitle = document.querySelector('h1')?.textContent || `Kabanata ${chapterNumber}`;
    
    return {
        number: chapterNumber,
        title: pageTitle
    };
}

function createFloatingAudioButton(audioElement) {
    // Check if button already exists
    if (document.getElementById('floatingAudioBtn')) return;
    
    // Create button
    const btn = document.createElement('button');
    btn.id = 'floatingAudioBtn';
    btn.className = 'floating-audio-btn';
    btn.innerHTML = '🔊<br>Audio';
    btn.title = 'I-play ang audio ng kabanata';
    
    // Style the button
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b4513, #5c2e0f)',
        color: 'white',
        border: '3px solid #d4af37',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
        zIndex: '1000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        fontFamily: '"Times New Roman", serif',
        animation: 'pulse 2s infinite'
    });
    
    // Hover effect
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 16px rgba(139, 69, 19, 0.5)';
        this.style.background = 'linear-gradient(135deg, #a0522d, #6f3410)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        this.style.background = 'linear-gradient(135deg, #8b4513, #5c2e0f)';
    });
    
    // Click handler
    btn.addEventListener('click', function() {
        toggleAudioPlayback(audioElement, this);
    });
    
    // Add to document
    document.body.appendChild(btn);
    
    // Update button state based on audio status
    updateButtonState(btn, audioElement);
    
    // Listen to audio events
    audioElement.addEventListener('play', () => updateButtonState(btn, audioElement));
    audioElement.addEventListener('pause', () => updateButtonState(btn, audioElement));
    audioElement.addEventListener('ended', () => updateButtonState(btn, audioElement));
}

function toggleAudioPlayback(audioElement, button) {
    if (audioElement.paused) {
        // Try to play
        audioElement.play()
            .then(() => {
                console.log('Audio playing from floating button');
                updateButtonState(button, audioElement);
            })
            .catch(error => {
                console.error('Play failed:', error);
                showPlayError(button);
            });
    } else {
        audioElement.pause();
        updateButtonState(button, audioElement);
    }
}

function updateButtonState(button, audioElement) {
    if (audioElement.paused) {
        button.innerHTML = '▶<br>Play';
        button.style.animation = 'pulse 2s infinite';
    } else {
        button.innerHTML = '⏸<br>Pause';
        button.style.animation = 'none';
    }
}

function showPlayError(button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = '❌<br>Error';
    button.style.background = 'linear-gradient(135deg, #cc0000, #990000)';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = 'linear-gradient(135deg, #8b4513, #5c2e0f)';
    }, 2000);
}

function playChapterIntroAudio(endAudio) {
    const chapterData = getChapterData();
    
    if (!chapterData.number) {
        console.log('No chapter number found for intro audio');
        showIntroNotification('Kabanata', '📖', 'Ang kabanata ay handa na.');
        return;
    }
    
    console.log('Playing intro for chapter:', chapterData.number);
    
    // Get intro audio file for this chapter
    const introAudioPath = getChapterIntroAudio(chapterData.number);
    
    if (!introAudioPath) {
        console.log(`No intro audio found for chapter ${chapterData.number}`);
        showIntroNotification(chapterData.title, '📖', 'Ang kabanata ay handa na.');
        
        // Save state for refresh detection
        saveAudioState();
        
        setTimeout(() => {
            attemptToPlayEndAudio(endAudio);
        }, 1000);
        return;
    }
    
    console.log('Intro audio path:', introAudioPath);
    
    // Check if user has interacted
    if (!window.audioAutoplay?.canAutoplay()) {
        console.log('Cannot autoplay intro - no user interaction');
        
        // Check if this is a refresh
        const isRefresh = performance.navigation.type === performance.navigation.TYPE_RELOAD;
        if (isRefresh) {
            showIntroNotification(chapterData.title, '🔄', 'Refresh detected. Pindutin ang play button upang pakinggan.');
        } else {
            showIntroNotification(chapterData.title, '📖', 'Pindutin ang play button upang pakinggan.');
        }
        
        // Try to unlock audio
        window.audioAutoplay?.unlockWithSilentAudio();
        return;
    }
    
    // Create and play intro audio
    const introAudio = new Audio(introAudioPath);
    introAudio.volume = 0.7;
    
    // Save state
    saveAudioState();
    
    // Add error handler
    introAudio.addEventListener('error', function(e) {
        console.error('Intro audio loading error:', e);
        showIntroNotification(chapterData.title, '❌', 'Hindi ma-play ang intro audio.');
        clearAudioState();
    });
    
    // When intro ends, play the main chapter audio
    introAudio.addEventListener('ended', function() {
        console.log('Intro audio ended, now playing main chapter audio');
        
        // Hide floating button
        const floatingBtn = document.getElementById('floatingAudioBtn');
        if (floatingBtn) {
            floatingBtn.style.display = 'none';
        }
        
        // Auto-play the main chapter audio
        attemptToPlayEndAudio(endAudio);
    });
    
    // Try to play intro
    const playPromise = introAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log(`Playing intro audio for chapter ${chapterData.number}`);
                showIntroNotification(chapterData.title, '🔊', 'Pinapakinggan ang intro...');
            })
            .catch(error => {
                console.error('Intro audio play failed:', error);
                showIntroNotification(chapterData.title, '❌', 'Hindi ma-play ang audio.');
                clearAudioState();
                
                if (error.name === 'NotAllowedError') {
                    console.log('Autoplay not allowed. Need user interaction.');
                }
            });
    }
}



function saveAudioState() {
    const chapterData = getChapterData();
    const state = {
        chapter: chapterData.number,
        timestamp: Date.now(),
        path: window.location.pathname
    };
    localStorage.setItem('chapterAudioState', JSON.stringify(state));
}

function clearAudioState() {
    localStorage.removeItem('chapterAudioState');
}

// Update the attemptToPlayEndAudio function:
function attemptToPlayEndAudio(endAudio) {
    if (!endAudio) {
        console.error('No end audio element found');
        return;
    }
    
    console.log('Attempting to play main chapter audio');
    
    // Save state before attempting to play
    saveAudioState();
    
    // Check if user has interacted
    if (!window.audioAutoplay?.canAutoplay()) {
        console.log('Cannot autoplay main audio - no user interaction');
        
        // Show notification that user needs to click to play
        showIntroNotification('Kabanata', '▶', 'Pindutin ang play button upang simulan.');
        return;
    }
    
    // Set volume
    endAudio.volume = 0.8;
    
    // Add error handler
    endAudio.addEventListener('error', function(e) {
        console.error('Main audio error:', e);
        showIntroNotification('Kabanata', '❌', 'Hindi ma-play ang audio.');
        clearAudioState();
    });
    
    // Add ended handler to update state
    endAudio.addEventListener('ended', function() {
        console.log('Main audio ended');
        clearAudioState();
    });
    
    // Try to play
    const playPromise = endAudio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Main chapter audio playing automatically');
                
                // Update floating button if it exists
                const floatingBtn = document.getElementById('floatingAudioBtn');
                if (floatingBtn) {
                    updateButtonState(floatingBtn, endAudio);
                }
                
                // Show notification that audio is playing
                showIntroNotification('Kabanata', '🔊', 'Pinapakinggan ang kabanata...');
            })
            .catch(error => {
                console.error('Main audio autoplay failed:', error);
                clearAudioState();
                
                // Fallback: Show notification to play manually
                showIntroNotification('Kabanata', '▶', 'Pindutin ang play button sa ibaba.');
            });
    }
}

// SINGLE NOTIFICATION FUNCTION - Replaces all other notification functions
function showIntroNotification(title, icon = '📖', message = '') {
    // Remove existing notification if any
    const existing = document.querySelector('.intro-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'intro-notification';
    
    notification.innerHTML = `
        <div class="intro-notification-content">
            <div class="intro-notification-header">
                <span class="intro-icon">${icon}</span>
                <strong>${title}</strong>
            </div>
            ${message ? `<p>${message}</p>` : ''}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds (shorter for better UX)
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function getChapterIntroAudio(chapterNumber) {
    // Audio file paths - make sure these are correct
    const introMap = {
        '1-3': 'audio/intro1-3.mp3',
        '4': 'audio/intro4.mp3',
        '5-7': 'audio/intro5-7.mp3',
        '8-10': 'audio/intro8-10.mp3',
        '11': 'audio/intro11.mp3',
        '12-15': 'audio/intro12-15.mp3',
        '16-18': 'audio/intro16-18.mp3',
        '19': 'audio/intro19.mp3',
        '20-22': 'audio/intro20-22.mp3',
        '23': 'audio/intro23.mp3',
        '24-28': 'audio/intro24-28.mp3',
        '29': 'audio/intro29.mp3',
        '30-31': 'audio/intro30-31.mp3',
        '32': 'audio/intro32.mp3',
        '33-35': 'audio/intro33-35.mp3',
        '36-37': 'audio/intro36-37.mp3',
        '38-39': 'audio/intro38-39.mp3'
    };
    
    const path = introMap[chapterNumber];
    console.log(`Looking up intro for chapter ${chapterNumber}:`, path);
    
    // Optional: Verify file exists
    if (path && typeof verifyAudioFile === 'function') {
        verifyAudioFile(path);
    }
    
    return path || null;
}

// Helper to verify audio file exists
async function verifyAudioFile(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`Audio file ${url} exists:`, response.ok);
        return response.ok;
    } catch (error) {
        console.warn(`Audio file ${url} may not exist:`, error);
        return false;
    }
}

function setupScrollListener(audioElement) {
    const floatingBtn = document.getElementById('floatingAudioBtn');
    if (!floatingBtn) return;
    
    const audioPlayerSection = audioElement.closest('.combined-audio-player, .audio-controls');
    if (!audioPlayerSection) return;
    
    let isHidden = false;
    let hideTimeout;
    
    function checkScroll() {
        const rect = audioPlayerSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If audio player is in viewport (with some margin)
        if (rect.top >= -50 && rect.top <= windowHeight - 100) {
            if (!isHidden) {
                floatingBtn.style.opacity = '0.3';
                floatingBtn.style.pointerEvents = 'none';
                floatingBtn.style.transform = 'scale(0.8)';
                isHidden = true;
            }
        } else {
            if (isHidden) {
                floatingBtn.style.opacity = '1';
                floatingBtn.style.pointerEvents = 'auto';
                floatingBtn.style.transform = 'scale(1)';
                isHidden = false;
            }
        }
    }
    
    // Throttle scroll events
    window.addEventListener('scroll', function() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(checkScroll, 50);
    });
    
    // Initial check
    checkScroll();
}

// Add CSS for notifications and animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3); }
        50% { transform: scale(1.05); box-shadow: 0 6px 16px rgba(139, 69, 19, 0.5); }
        100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    }
    
    .intro-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        animation: slideIn 0.5s ease;
        max-width: 320px;
    }
    
    .intro-notification-content {
        background: linear-gradient(135deg, #fdfbf5, #f4ead5);
        color: #5c2e0f;
        padding: 15px;
        border-radius: 10px;
        border-left: 5px solid #d4af37;
        border-right: 2px solid #8b4513;
        border-top: 2px solid #8b4513;
        border-bottom: 2px solid #8b4513;
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        font-family: "Times New Roman", serif;
    }
    
    .intro-notification-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        font-size: 1.1em;
    }
    
    .intro-icon {
        font-size: 1.3em;
    }
    
    .intro-notification p {
        margin: 0;
        line-height: 1.4;
        font-size: 0.95em;
        color: #6b4423;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .floating-audio-btn {
            width: 60px !important;
            height: 60px !important;
            bottom: 15px !important;
            right: 15px !important;
            font-size: 10px !important;
        }
        
        .intro-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

console.log('Simplified Chapter audio script loaded with intro-to-main auto-play');