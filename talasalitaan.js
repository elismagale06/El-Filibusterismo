          // Auto-play talasalitaan audio on page load (similar to 1-3_activity1.html)
      document.addEventListener('DOMContentLoaded', function() {
        // Initialize audio context
        let audioCtx = null;
        let masterGain = null;
        
        function initAudio() {
          if (audioCtx) return;
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.9;
            masterGain.connect(audioCtx.destination);
          } catch (e) {
            audioCtx = null;
          }
        }

        function resumeAudioContext() {
          if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }
        }

        function fadeInAudio(el, target = 0.5, duration = 800) {
          if (!el) return;
          el.volume = 0;
          const playPromise = el.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.log('Talasalitaan audio play failed:', e);
              // Try to unlock audio with silent audio
              if (window.audioAutoplay) {
                window.audioAutoplay.unlockWithSilentAudio();
                // Retry after unlocking
                setTimeout(() => {
                  el.play().catch(() => {});
                }, 300);
              }
            });
          }
          
          const start = Date.now();
          const id = setInterval(() => {
            const t = Math.min(1, (Date.now() - start) / duration);
            el.volume = t * target;
            if (t === 1) clearInterval(id);
          }, 30);
        }

        // Check if audio autoplay is allowed
        function canAutoplay() {
          // Check if user has interacted with the site
          if (window.audioAutoplay && window.audioAutoplay.canAutoplay()) {
            return true;
          }
          
          // Check localStorage for previous interaction
          const stored = localStorage.getItem('userHasInteracted');
          const timestamp = localStorage.getItem('interactionTimestamp');
          
          if (stored === 'true' && timestamp) {
            // Check if interaction was within last 24 hours
            const hoursSince = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            if (hoursSince < 24) {
              return true;
            }
          }
          
          return false;
        }

        // Function to try playing audio
        function tryPlayTalasalitaanAudio() {
          const audioEl = document.getElementById('talasalitaanAudio');
          
          if (!audioEl) {
            console.log('Talasalitaan audio element not found');
            return;
          }

          // Check if we can autoplay
          if (canAutoplay()) {
            console.log('Auto-playing talasalitaan audio');
            initAudio();
            resumeAudioContext();
            fadeInAudio(audioEl, 0.5, 700);
          } else {
            console.log('Waiting for user interaction to play talasalitaan audio');
            
            // Set up a one-time interaction listener
            const interactionListener = function() {
              console.log('User interacted, now playing talasalitaan audio');
              initAudio();
              resumeAudioContext();
              fadeInAudio(audioEl, 0.5, 700);
              
              // Remove listener after first interaction
              document.removeEventListener('click', interactionListener);
              document.removeEventListener('touchstart', interactionListener);
              document.removeEventListener('keydown', interactionListener);
            };
            
            // Listen for user interaction
            document.addEventListener('click', interactionListener);
            document.addEventListener('touchstart', interactionListener);
            document.addEventListener('keydown', interactionListener);
            
            // Also try silent audio unlock
            if (window.audioAutoplay) {
              window.audioAutoplay.unlockWithSilentAudio();
              
              // Try playing after 500ms (in case silent audio worked)
              setTimeout(() => {
                if (canAutoplay()) {
                  initAudio();
                  resumeAudioContext();
                  fadeInAudio(audioEl, 0.5, 700);
                }
              }, 500);
            }
          }
        }

        // Try to play the audio after a short delay to ensure DOM is ready
        setTimeout(() => {
          tryPlayTalasalitaanAudio();
        }, 500);

        // Also try when the user interacts with the page (for browsers that block autoplay)
        document.addEventListener('click', function() {
          const audioEl = document.getElementById('talasalitaanAudio');
          if (audioEl && audioEl.paused) {
            // Check if user has already interacted with this page
            if (!localStorage.getItem('talasalitaanPlayed')) {
              initAudio();
              resumeAudioContext();
              audioEl.play().catch(() => {});
              localStorage.setItem('talasalitaanPlayed', 'true');
            }
          }
        }, { once: true });

        // Store that user has interacted with this page
        document.addEventListener('click', function() {
          localStorage.setItem('userHasInteracted', 'true');
          localStorage.setItem('interactionTimestamp', Date.now().toString());
        }, { once: true });
      });
