// chapter-redirect.js
(function() {
    'use strict';
    
    const REDIRECT_DELAY_MS = 100; // 0.1 second delay
    const NAVIGATION_TIMEOUT = 30000; // 30 seconds
    
    function shouldRedirect() {
        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const navParam = urlParams.get('nav');
        
        // If nav=direct is in URL, this is a valid navigation
        if (navParam === 'direct') {
            return false;
        }
        
        // Check sessionStorage for recent navigation
        const navData = sessionStorage.getItem('lastClickedChapter');
        if (navData) {
            try {
                const data = JSON.parse(navData);
                const now = Date.now();
                
                // Check if navigation data is fresh (within 30 seconds)
                if (data.timestamp && (now - data.timestamp) < NAVIGATION_TIMEOUT) {
                    // Check if this is the intended chapter
                    const currentChapter = urlParams.get('chapter') || 
                                         window.location.pathname.match(/chapter(\d+-\d+|\d+)\.html/)?.[1];
                    
                    if (currentChapter && data.number.includes(currentChapter)) {
                        // Valid navigation - clear the flag
                        sessionStorage.removeItem('lastClickedChapter');
                        return false;
                    }
                } else {
                    // Stale data - remove it
                    sessionStorage.removeItem('lastClickedChapter');
                }
            } catch(e) {
                sessionStorage.removeItem('lastClickedChapter');
            }
        }
        
        // Check referrer - if coming from chapters.html, allow it
        const referrer = document.referrer;
        if (referrer && referrer.includes('chapters.html')) {
            return false;
        }
        
        // No valid navigation detected - redirect
        return true;
    }
    
    // Execute on page load
    document.addEventListener('DOMContentLoaded', function() {
        if (shouldRedirect()) {
            console.log('Redirecting to index.html - invalid navigation detected');
            
            // Add a small delay for better UX
            setTimeout(function() {
                // Optionally store where they tried to go
                sessionStorage.setItem('attemptedAccess', window.location.href);
                
                // Redirect to home
                window.location.href = 'index.html';
            }, REDIRECT_DELAY_MS);
        }
    });
    
    // Also handle beforeunload to clear flags
    window.addEventListener('beforeunload', function() {
        // Keep the data if they might use back button
        // Or clear it if you want to force fresh start
        // sessionStorage.removeItem('lastClickedChapter');
    });
})();