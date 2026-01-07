// Chapters page script (chapter search, audio handling, animations)
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "chapters") {
        initializeChapterSearch();
    }
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
    filterChapters();
}

function filterChapters() {
    const el = document.getElementById("chapterSearch");
    if (!el) return;
    const searchTerm = el.value.toLowerCase();
    const chapterCards = document.querySelectorAll("#chapterGrid .chapter-card");
    const noResults = document.getElementById("noChapterResults");
    const searchTermSpan = document.getElementById("chapterSearchTerm");
    let visibleCount = 0; let delay = 0;
    chapterCards.forEach((card) => {
        const chapterTitle = card.querySelector("h3").textContent.toLowerCase();
        const chapterDesc = card.querySelector("p").textContent.toLowerCase();
        if (searchTerm === "" || chapterTitle.includes(searchTerm) || chapterDesc.includes(searchTerm)) {
            card.classList.remove("hidden"); card.style.animation = `fadeInCard 0.3s ease ${delay}s forwards`; visibleCount++; delay += 0.05;
        } else { card.classList.add("hidden"); card.style.animation = "none"; }
    });
    if (visibleCount === 0 && searchTerm !== "") { if (searchTermSpan) searchTermSpan.textContent = searchTerm; if (noResults) noResults.classList.remove("hidden"); }
    else { if (noResults) noResults.classList.add("hidden"); }
}

function initializeChapterAudio() {
    // Support pages that have one or multiple audio elements
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;

    audios.forEach((audioElement) => {
        // Add ended listener behavior based on data-chapter attribute if present
        audioElement.addEventListener('ended', function () {
            // Do not auto-redirect when audio ends. Leave a completion note if present.
            const audioNote = audioElement.closest('.audio-controls')?.querySelector('.audio-note') || document.querySelector('.audio-note');
            if (audioNote) audioNote.textContent = 'Tapos na ang audio.';
        });

        audioElement.addEventListener('error', function (e) {
            console.error('Audio error:', e);
            const audioControls = audioElement.closest('.audio-controls') || document.querySelector('.audio-controls');
            if (audioControls) {
                const errorNote = document.createElement('p');
                errorNote.className = 'audio-note'; errorNote.style.color = '#cc0000';
                errorNote.innerHTML = `<em>Hindi ma-play ang audio file. Paki-check ang file path.</em>`;
                audioControls.appendChild(errorNote);
            }
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
                const overlays = container.querySelectorAll('.play-overlay');
                overlays.forEach(o => o.remove());
            }
        } catch (e) {
            // ignore
        }
    });
}

function showAutoplayFallback(audioElement) {
    const audioContainer = audioElement.closest('.audio-controls') || document.querySelector('.audio-controls');
    if (!audioContainer) return;
    const overlay = document.createElement('div'); overlay.className = 'play-overlay';
    overlay.innerHTML = `<button class="play-overlay-btn" onclick="this.closest('.play-overlay').previousElementSibling.play(); this.closest('.play-overlay').remove();">I-play ang Audio</button>`;
    audioContainer.appendChild(overlay);
}

function addCardAnimations() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.character-card, .chapter-card:not(.disabled)');
        cards.forEach((card, index) => { card.classList.remove('hidden'); card.style.animation = `fadeInCard 0.5s ease ${index * 0.05}s forwards`; });
    }, 100);
}

function ensureSingleAudio() {
    const audios = Array.from(document.querySelectorAll('audio'));
    if (!audios || audios.length === 0) return;
    audios.forEach((audio) => {
        audio.addEventListener('play', function () { audios.forEach((other) => { if (other !== audio && !other.paused) { try { other.pause(); } catch (e) {} } }); });
    });
}

document.addEventListener('visibilitychange', function () {
    const pausedAudios = Array.from(document.querySelectorAll('audio'));
    if (document.hidden) pausedAudios.forEach(a => { try { a.pause(); } catch (e) {} });
});

window.addEventListener('beforeunload', function () {
    const audios = Array.from(document.querySelectorAll('audio'));
    audios.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
});
