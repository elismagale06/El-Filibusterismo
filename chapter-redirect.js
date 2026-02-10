// chapter-redirect.js - Add this to EVERY chapter page
(function() {
    'use strict';
    
    // Define valid referrer pages
    const VALID_REFERRERS = [
        'chapters.html',
        'talasalitaan1-3.html',
        'talasalitaan4.html',  // Add more if needed
        'talasalitaan5-7.html',
        'talasalitaan8-10.html',
        'talasalitaan11.html',
        'talasalitaan12-15.html',
        'talasalitaan16-18.html',
        'talasalitaan19.html',
        'talasalitaan20-22.html',
        'talasalitaan23.html',
        'talasalitaan24-28.html',
        'talasalitaan29.html',
        'talasalitaan30-31.html',
        'talasalitaan32.html',
        'talasalitaan33-35.html',   
        'talasalitaan36-37.html',
        'talasalitaan38-39.html'
    ];
    
    // Check if we should redirect
    function checkAccessAndRedirect() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        // Get referrer information
        const referrer = document.referrer || '';
        
        // Try to get stored token
        let storedTokenData = null;
        try {
            const storedData = sessionStorage.getItem('chapterAccessToken');
            if (storedData) {
                storedTokenData = JSON.parse(storedData);
            }
        } catch (e) {
            console.warn('Could not parse stored token data');
        }
        
        // Check if referrer is valid
        let hasValidReferrer = false;
        for (const validPage of VALID_REFERRERS) {
            if (referrer.includes(validPage)) {
                hasValidReferrer = true;
                break;
            }
        }
        
        // Conditions for valid access:
        const isValidAccess = 
            // 1. Came directly from any valid page (chapters or talasalitaan)
            hasValidReferrer ||
            // 2. Has valid token in URL that matches stored token
            (urlToken && storedTokenData && urlToken === storedTokenData.token) ||
            // 3. Has valid token data that's not expired (less than 30 seconds old)
            (storedTokenData && 
             storedTokenData.timestamp && 
             (Date.now() - storedTokenData.timestamp) < 30000);
        
        // If NOT valid access, redirect to index.html
        if (!isValidAccess) {
            console.log('Invalid chapter access. Redirecting to homepage.');
            console.log('Referrer was:', referrer);
            
            // Optional: Show a brief message
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                text-align: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            message.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 16px;">
                    Mangyaring pumili ng kabanata mula sa listahan.
                </p>
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                    Nagre-redirect sa homepage...
                </p>
            `;
            document.body.appendChild(message);
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
            return false;
        }
        
        // If we have a valid access, clean up
        console.log('Valid chapter access detected');
        console.log('Referrer:', referrer);
        
        // Clear the token from session storage
        sessionStorage.removeItem('chapterAccessToken');
        
        // Remove token from URL without page reload
        if (urlToken) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        
        return true;
    }
    
    // Run check when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccessAndRedirect);
    } else {
        checkAccessAndRedirect();
    }
    
    // Also check on page show (for browser back/forward)
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was restored from cache, check access again
            setTimeout(checkAccessAndRedirect, 100);
        }
    });
})();