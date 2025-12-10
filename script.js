// Character data with descriptions
const characters = [
    {
        name: "Basilio",
        description: "Isang medical student; matalino, masipag, at nagdurusa sa kawalang-katarungan. Naging biktima ng pang-aapi ng pamahalaan at simbahan.",
        image: "Basilio.png"
    },
    {
        name: "Ben-Zayb",
        description: "Mayabang na mamamahayag; naniniwalang siya lamang ang tunky na nag-iisip sa Pilipinas.",
        image: "Ben-Zayb.png"
    },
    {
        name: "Don Custodio",
        description: "Opisyal ng pamahalaan na kilala sa 'mabilis' ngunit walang kuwentang solusyon; malakas ang impluwensiya sa Kapitan Heneral.",
        image: "Don Custodio.png"
    },
    {
        name: "Donya Victorina",
        description: "Matapobreng babae, mestisahin, at naghahanap palagi ng atensyon; kasama sa biyahe sa bapor.",
        image: "Donya Victorina.png"
    },
    {
        name: "Huli (Juli)",
        description: "Anak ni Kabesang Tales; simbolo ng inosenteng kababaihang naaapi. Nagsakripisyo upang iligtas si Basilio.",
        image: "Huli (Juli).png"
    },
    {
        name: "Isagani",
        description: "Makata at prinsipalyong estudyante; idealistiko at maka-bayan.",
        image: "Isagani.png"
    },
    {
        name: "Juanito Pelaez",
        description: "Mayamang estudyante, paborito ng mga prayle; ginagamit sa pang-aapi sa mga Pilipino.",
        image: "Juanito Pelaez.png"
    },
    {
        name: "Kabesang Tales (Telesforo)",
        description: "Dating kainginero na inagawan ng lupa ng prayle; naging tulisan dahil sa matinding pang-aapi.",
        image: "Kabesang Tales.png"
    },
    {
        name: "Kapitan Heneral",
        description: "Pinakamakapangyarihang opisyal sa Pilipinas; madaling maimpluwensiyahan, lalo na ni Simoun.",
        image: "Kapitan Heneral.png"
    },
    {
        name: "Kapitan Tiago",
        description: "Ama-amahan ni Maria Clara; nalulong sa opyo at namatay nang mawalan ng pag-asa.",
        image: "Kapitan Tiago.png"
    },
    {
        name: "Makaraig",
        description: "Mayamang estudyante at lider ng kilusan para sa Akademya ng Wikang Kastila.",
        image: "Makaraig.png"
    },
    {
        name: "Maria Clara",
        description: "Dating kasintahan ni Ibarra; namatay sa Sta. Clara. Simbolo ng kawalang-laya at pagdurusa ng kababaihan.",
        image: "Maria Clara.png"
    },
    {
        name: "Padre Camorra",
        description: "Mapanamantala at marahas na pari; may masamang hangarin kay Huli.",
        image: "Padre Camorra.png"
    },
    {
        name: "Padre Fernandez",
        description: "Liberal at mabait na pari; nakikinig at nakikisimpatiya sa mga estudyante.",
        image: "Padre Fernandez.png"
    },
    {
        name: "Padre Florentino",
        description: "Pari at tiyuhin ni Isagani; naging tagapagbantay kay Simoun sa huli.",
        image: "Padre Florentino.png"
    },
    {
        name: "Padre Irene",
        description: "Paring nag-aangking 'tagapagtanggol' ng mga estudyante ngunit kadalasan ay pakitang-tao lamang.",
        image: "Padre Irene.png"
    },
    {
        name: "Padre Millon",
        description: "Mapang-abusong guro sa pisika; sinisimbolo ang bulok na sistema ng edukasyon.",
        image: "Padre Millon.png"
    },
    {
        name: "Hermana Penchang",
        description: "Mapagkunwaring relihiyosa; amo ni Huli at nagpapabasa sa kanya ng aklat na panlilinlang.",
        image: "Hermana Penchang.png"
    },
    {
        name: "Padre Salvi",
        description: "Mapanlinlang at makapangyarihang pari; pangunahing dahilan ng pagkapariwara ni Maria Clara.",
        image: "Padre Salvi.png"
    },
    {
        name: "Padre Sibyla",
        description: "Isang mataas na prayle sa unibersidad; kontra sa mga pagbabago.",
        image: "Padre Sibyla.png"
    },
    {
        name: "Placido Penitente",
        description: "Estudyanteng nawalan ng pag-asa dahil sa pang-aabuso ng mga guro at prayle.",
        image: "Placido Penitente.png"
    },
    {
        name: "Sandoval",
        description: "Kastilang estudyante na maka-Pilipino; tagapagtaguyod ng karapatan ng mga kabataan.",
        image: "Sandoval.png"
    },
    {
        name: "Simoun (Crisostomo Ibarra)",
        description: "Mag-aalahas na nagbalik upang maghiganti; utak ng rebolusyon. Nagpanggap upang maimpluwensiyahan ang Heneral, mga prayle, at lipunan.",
        image: "Simoun.png"
    },
    {
        name: "Tadeo",
        description: "Tamad na estudyante; magandang representasyon ng maling pag-uugali sa paaralan.",
        image: "Tadeo.png"
    },
    {
        name: "Tandang Selo",
        description: "Ama ni Kabesang Tales; simbolo ng magsasakang lubusang inapi hanggang mawalan ng boses.",
        image: "Tandang Selo.png"
    },
    {
        name: "Tano",
        description: "Anak ni Tales; sapilitang kinuha bilang sundalo.",
        image: "Tano.png"
    }
];

// Initialize based on current page
document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    // Initialize character grid and search for home page
    if (page === "home") {
        initializeCharacterGrid();
        initializeCharacterSearch();
        initializeModal();
    }

    // Initialize search functionality for chapter selection page
    if (page === "chapters") {
        initializeChapterSearch();
    }

    // Initialize audio player for chapter pages
    if (page === "chapter") {
        initializeChapterAudio();
    }

    // Add animations to cards on page load
    addCardAnimations();
});

// Initialize character grid
function initializeCharacterGrid() {
    const characterGrid = document.getElementById("characterGrid");
    if (!characterGrid) return;

    // Clear existing content
    characterGrid.innerHTML = "";

    // Add character cards
    characters.forEach(character => {
        const characterCard = document.createElement("div");
        characterCard.className = "character-card";
        characterCard.dataset.name = character.name;
        characterCard.dataset.description = character.description;
        characterCard.dataset.image = character.image;
        
        characterCard.innerHTML = `
            <div class="character-img">
                <img src="images/${character.image}" alt="${character.name}"
                    onerror="this.style.display='none'; this.parentElement.textContent='${character.name}';" />
            </div>
            <div class="character-name">${character.name}</div>
        `;
        
        characterGrid.appendChild(characterCard);
    });

    // Add click event listeners to character cards
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            showCharacterModal(
                card.dataset.name,
                card.dataset.description,
                card.dataset.image
            );
        });
    });
}

// Initialize character modal
function initializeModal() {
    const modal = document.getElementById('characterModal');
    const closeButton = document.querySelector('.modal-close');
    
    // Close modal when close button is clicked
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    });
    
    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
}

// Show character modal
function showCharacterModal(name, description, image) {
    const modal = document.getElementById('characterModal');
    const modalName = document.getElementById('modalCharacterName');
    const modalDescription = document.getElementById('modalCharacterDescription');
    const modalImage = document.getElementById('modalCharacterImage');
    
    // Set modal content
    modalName.textContent = name;
    modalDescription.textContent = description;
    modalImage.src = `images/${image}`;
    modalImage.alt = name;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // Add error handling for modal image
    modalImage.onerror = function() {
        this.style.display = 'none';
        const modalImageContainer = document.querySelector('.modal-image');
        const fallbackText = document.createElement('div');
        fallbackText.className = 'image-fallback';
        fallbackText.textContent = name;
        fallbackText.style.cssText = `
            color: #f4ead5;
            font-size: 1.5em;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: linear-gradient(135deg, #d4a574 0%, #a0826d 100%);
        `;
        modalImageContainer.appendChild(fallbackText);
    };
}

// Character search functionality for home page
function initializeCharacterSearch() {
    const characterSearch = document.getElementById("characterSearch");
    if (!characterSearch) return;

    characterSearch.addEventListener("input", filterCharacters);
    characterSearch.addEventListener("keyup", filterCharacters);

    // Initial filter to show all
    filterCharacters();
}

// Chapter search functionality for chapter selection page
function initializeChapterSearch() {
    const chapterSearch = document.getElementById("chapterSearch");
    if (!chapterSearch) return;

    chapterSearch.addEventListener("input", filterChapters);
    chapterSearch.addEventListener("keyup", filterChapters);

    // Initial filter to show all
    filterChapters();
}

// Audio player functionality for chapter pages
function initializeChapterAudio() {
    const audioElement = document.getElementById("chapterAudio");
    if (!audioElement) return;

    const chapterNum = parseInt(document.body.dataset.chapter);

    // Add ended event listener for auto-next
    audioElement.addEventListener("ended", function () {
        // For chapter 3, redirect to talasalitaan page
        if (chapterNum === 3) {
            // Show message and redirect after 1 second delay
            const audioNote = document.querySelector(".audio-note");
            if (audioNote) {
                audioNote.textContent = "Dinadala ka sa pahina ng Talasalitaan...";
            }
            setTimeout(() => {
                window.location.href = "talasalitaan.html";
            }, 1000);
        } else {
            // For other chapters, go to next chapter
            const nextChapterNum = chapterNum + 1;
            if (nextChapterNum <= 3) {
                // Only if next chapter exists
                // Show next chapter after 1 second delay
                setTimeout(() => {
                    window.location.href = `chapter${nextChapterNum}.html`;
                }, 1000);
            }
        }
    });

    // Add error handling
    audioElement.addEventListener("error", function (e) {
        console.error("Audio error:", e);
        const audioControls = document.querySelector(".audio-controls");
        if (audioControls) {
            const errorNote = document.createElement("p");
            errorNote.className = "audio-note";
            errorNote.style.color = "#cc0000";
            errorNote.innerHTML = `<em>Hindi ma-play ang audio file. Paki-check ang file path.</em>`;
            audioControls.appendChild(errorNote);
        }
    });

    // Handle autoplay restrictions
    const playPromise = audioElement.play();
    if (playPromise !== undefined) {
        playPromise.catch((error) => {
            console.log("Autoplay prevented:", error);
            // Show a play button if autoplay is blocked
            showAutoplayFallback(audioElement);
        });
    }
}

// Show fallback play button when autoplay is blocked
function showAutoplayFallback(audioElement) {
    const audioContainer = document.querySelector(".audio-controls");
    const overlay = document.createElement("div");
    overlay.className = "play-overlay";
    overlay.innerHTML = `
        <button class="play-overlay-btn" onclick="startAudio(this)">
            I-play ang Audio
        </button>
    `;
    audioContainer.appendChild(overlay);
}

// Start audio from fallback button
function startAudio(button) {
    const audioElement = document.getElementById("chapterAudio");
    if (audioElement) {
        audioElement
            .play()
            .then(() => {
                // Remove the overlay when play starts
                const overlay = button.closest(".play-overlay");
                if (overlay) {
                    overlay.remove();
                }
            })
            .catch((error) => {
                console.error("Error playing audio:", error);
                const audioContainer = document.querySelector(".audio-controls");
                audioContainer.innerHTML += `
                    <p class="audio-note" style="color: #cc0000;">
                        <em>Hindi ma-play ang audio. Pindutin ang play button sa audio player.</em>
                    </p>
                `;
            });
    }
}

// Search functionality for characters
function filterCharacters() {
    const searchTerm = document
        .getElementById("characterSearch")
        .value.toLowerCase();
    const characterCards = document.querySelectorAll(
        ".character-grid .character-card"
    );
    const noResults = document.getElementById("noCharacterResults");
    const searchTermSpan = document.getElementById("characterSearchTerm");

    let visibleCount = 0;
    let delay = 0;

    characterCards.forEach((card) => {
        const characterName = card
            .querySelector(".character-name")
            .textContent.toLowerCase();

        if (searchTerm === "" || characterName.includes(searchTerm)) {
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

// Search functionality for chapters
function filterChapters() {
    const searchTerm = document
        .getElementById("chapterSearch")
        .value.toLowerCase();
    const chapterCards = document.querySelectorAll("#chapterGrid .chapter-card");
    const noResults = document.getElementById("noChapterResults");
    const searchTermSpan = document.getElementById("chapterSearchTerm");

    let visibleCount = 0;
    let delay = 0;

    chapterCards.forEach((card) => {
        const chapterTitle = card.querySelector("h3").textContent.toLowerCase();
        const chapterDesc = card.querySelector("p").textContent.toLowerCase();

        if (
            searchTerm === "" ||
            chapterTitle.includes(searchTerm) ||
            chapterDesc.includes(searchTerm)
        ) {
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

// Add animations to cards on page load
function addCardAnimations() {
    setTimeout(() => {
        const cards = document.querySelectorAll(
            ".character-card, .chapter-card:not(.disabled)"
        );
        cards.forEach((card, index) => {
            card.classList.remove("hidden");
            card.style.animation = `fadeInCard 0.5s ease ${index * 0.05}s forwards`;
        });
    }, 100);
}

// Add keyboard shortcut for search (Ctrl+F or Cmd+F)
document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const activeSearch =
            document.querySelector(".search-input:focus") ||
            document.querySelector(".search-input");
        if (activeSearch) {
            activeSearch.focus();
            activeSearch.select();
        }
    }

    // Escape key to clear search
    if (e.key === "Escape") {
        const activeSearch = document.querySelector(".search-input:focus");
        if (activeSearch) {
            activeSearch.value = "";
            if (activeSearch.id === "characterSearch") {
                filterCharacters();
            } else if (activeSearch.id === "chapterSearch") {
                filterChapters();
            }
        }
    }
});

// Handle page visibility change (when user switches tabs/minimizes window)
document.addEventListener("visibilitychange", function () {
    const audioElement = document.getElementById("chapterAudio");
    if (document.hidden && audioElement) {
        audioElement.pause();
    }
});

// Handle page unload (when user closes tab or navigates away)
window.addEventListener("beforeunload", function () {
    const audioElement = document.getElementById("chapterAudio");
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
});