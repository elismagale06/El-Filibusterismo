// chapter-redirect.js - EASIEST VERSION
(function() {
    'use strict';
    
    function checkAccessAndRedirect() {
        // Get where the user came from
        const referrer = document.referrer || '';
        
        // List of ALLOWED pages that can link to chapter pages
        const allowedPages = [
            'chapters.html',
            'talasalitaan1-3.html',
            'talasalitaan4.html',
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
        
        // Check if user came from ANY allowed page
        let cameFromAllowedPage = false;
        for (let page of allowedPages) {
            if (referrer.includes(page)) {
                cameFromAllowedPage = true;
                break;
            }
        }
        
        // ALSO check if user has the special cookie we set
        const hasAccessCookie = document.cookie.includes('chapter_access=true');
        
        // If user didn't come from allowed page AND doesn't have cookie, REDIRECT
        if (!cameFromAllowedPage && !hasAccessCookie) {
            console.log('Blocking direct access to chapter page');
            window.location.href = 'index.html';
            return false;
        }
        
        console.log('Allowing access to chapter page');
        return true;
    }
    
    // Run the check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAccessAndRedirect);
    } else {
        checkAccessAndRedirect();
    }
})();