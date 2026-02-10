// unified-chapter-control.js - Everything in one file
(function() {
    'use strict';
    
    const ChapterControl = {
        config: {
            sessionTimeout: 120000,
            tokenTimeout: 30000,
            redirectUrl: 'index.html'
        },
        
        // Determine page type
        getPageType: function() {
            const path = window.location.pathname.toLowerCase();
            
            if (path.includes('chapters.html')) return 'chapters';
            if (path.includes('talasalitaan')) return 'talasalitaan';
            if (path.includes('chapter') && path.includes('.html') && 
                !path.includes('chapters.html')) return 'chapter';
            
            return 'other';
        },
        
        // Main initialization
        init: function() {
            const pageType = this.getPageType();
            
            switch(pageType) {
                case 'chapters':
                    this.initChaptersPage();
                    break;
                case 'talasalitaan':
                    this.initTalasalitaanPage();
                    break;
                case 'chapter':
                    this.initChapterPage();
                    break;
                default:
                    // Do nothing for other pages
                    break;
            }
        },
        
        // Initialize chapters.html
        initChaptersPage: function() {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupChapterLinks();
                this.setupBackButton();
            });
        },
        
        // Initialize talasalitaan pages
        initTalasalitaanPage: function() {
            document.addEventListener('DOMContentLoaded', () => {
                this.setTalasalitaanMarker();
                this.setupChapterLinksFromTalasalitaan();
            });
        },
        
        // Initialize chapter pages (access control)
        initChapterPage: function() {
            document.addEventListener('DOMContentLoaded', () => {
                if (this.checkChapterAccess()) {
                    this.grantChapterAccess();
                } else {
                    this.redirectToIndex();
                }
            });
        },
        
        // Check access for chapter pages
        checkChapterAccess: function() {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check URL parameters
            if (urlParams.get('nav') === 'direct') return true;
            
            // Check token
            const token = urlParams.get('token');
            if (token && this.validateToken(token)) return true;
            
            // Check referrer
            if (this.hasValidReferrer()) return true;
            
            // Check session
            if (this.hasRecentAccess()) return true;
            
            // Check talasalitaan marker
            if (this.fromTalasalitaan()) return true;
            
            return false;
        },
        
        // Validate token
        validateToken: function(token) {
            try {
                const stored = sessionStorage.getItem('chapterAccessToken') || 
                              localStorage.getItem('chapterAccessToken');
                if (!stored) return false;
                
                const data = JSON.parse(stored);
                const now = Date.now();
                
                return data.token === token && 
                       data.timestamp && 
                       (now - data.timestamp) < this.config.tokenTimeout;
            } catch (e) {
                return false;
            }
        },
        
        // Check referrer
        hasValidReferrer: function() {
            const referrer = document.referrer.toLowerCase();
            if (!referrer) return false;
            
            return referrer.includes('chapters.html') || 
                   referrer.includes('talasalitaan') ||
                   referrer.includes('chapter');
        },
        
        // Check recent access
        hasRecentAccess: function() {
            const time = sessionStorage.getItem('chapterAccessTime');
            if (!time) return false;
            
            return (Date.now() - parseInt(time)) < this.config.sessionTimeout;
        },
        
        // Check talasalitaan marker
        fromTalasalitaan: function() {
            const marker = sessionStorage.getItem('fromTalasalitaan');
            const time = sessionStorage.getItem('talasalitaanNavTime');
            
            if (!marker || !time) return false;
            
            return (Date.now() - parseInt(time)) < 30000;
        },
        
        // Grant access to chapter
        grantChapterAccess: function() {
            sessionStorage.setItem('chapterAccessTime', Date.now().toString());
            this.cleanUrl();
            this.clearTalasalitaanMarker();
        },
        
        // Redirect to index
        redirectToIndex: function() {
            this.cleanStorage();
            window.location.href = this.config.redirectUrl;
        },
        
        // Setup chapter links in chapters.html
        setupChapterLinks: function() {
            const links = document.querySelectorAll('.chapter-card[href*="chapter"]');
            
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const href = link.getAttribute('href');
                    const chapterNum = link.getAttribute('data-chapter-num');
                    
                    if (!href || !chapterNum) {
                        window.location.href = href;
                        return;
                    }
                    
                    // Generate token
                    const token = 'token_' + Date.now() + '_' + 
                        Math.random().toString(36).substr(2, 9);
                    
                    const tokenData = {
                        token: token,
                        chapter: chapterNum,
                        timestamp: Date.now()
                    };
                    
                    sessionStorage.setItem('chapterAccessToken', JSON.stringify(tokenData));
                    
                    // Navigate with token
                    const url = new URL(href, window.location.origin);
                    url.searchParams.set('nav', 'direct');
                    url.searchParams.set('token', token);
                    
                    setTimeout(() => {
                        window.location.href = url.toString();
                    }, 50);
                });
            });
        },
        
        // Setup back button in chapters.html
        setupBackButton: function() {
            const backBtn = document.querySelector('.back-button[href*="index.html"]');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.cleanStorage();
                });
            }
        },
        
        // Set talasalitaan marker
        setTalasalitaanMarker: function() {
            sessionStorage.setItem('fromTalasalitaan', 'true');
            sessionStorage.setItem('talasalitaanNavTime', Date.now().toString());
        },
        
        // Setup chapter links from talasalitaan
        setupChapterLinksFromTalasalitaan: function() {
            const links = document.querySelectorAll('a[href*="chapter"]');
            
            links.forEach(link => {
                link.addEventListener('click', () => {
                    // Update timestamp
                    sessionStorage.setItem('talasalitaanNavTime', Date.now().toString());
                });
            });
            
            // Auto-clear after 30 seconds
            setTimeout(() => {
                this.clearTalasalitaanMarker();
            }, 30000);
        },
        
        // Clean URL parameters
        cleanUrl: function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('token') || urlParams.has('nav')) {
                const cleanParams = new URLSearchParams();
                
                for (const [key, value] of urlParams.entries()) {
                    if (key !== 'token' && key !== 'nav') {
                        cleanParams.set(key, value);
                    }
                }
                
                const newUrl = window.location.pathname + 
                              (cleanParams.toString() ? '?' + cleanParams.toString() : '');
                
                window.history.replaceState({}, document.title, newUrl);
            }
        },
        
        // Clear storage
        cleanStorage: function() {
            ['chapterAccessToken', 'chapterAccessTime', 
             'fromTalasalitaan', 'talasalitaanNavTime'].forEach(key => {
                sessionStorage.removeItem(key);
                localStorage.removeItem(key);
            });
        },
        
        // Clear talasalitaan marker
        clearTalasalitaanMarker: function() {
            sessionStorage.removeItem('fromTalasalitaan');
            sessionStorage.removeItem('talasalitaanNavTime');
        }
    };
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ChapterControl.init());
    } else {
        ChapterControl.init();
    }
    
})();