// Index page script (characters, modal, search, animations)

// Global variables for audio management
let currentAudio = null;
let isAudioPlaying = false;

const characters = [
    {
        name: "Basilio",
        description: "Isang medical student; matalino, masipag, at nagdurusa sa kawalang-katarungan. Naging biktima ng pang-aapi ng pamahalaan at simbahan.",
        image: "images/Basilio.png",
        audio: "audio/Basilio.mp3"
    },
    {
        name: "Ben-Zayb",
        description: "Mayabang na mamamahayag; naniniwalang siya lamang ang tunky na nag-iisip sa Pilipinas.",
        image: "images/Ben-Zayb.png",
        audio: "audio/BenZayb.mp3"
    },
    {
        name: "Don Custodio",
        description: "Opisyal ng pamahalaan na kilala sa 'mabilis' ngunit walang kuwentang solusyon; malakas ang impluwensiya sa Kapitan Heneral.",
        image: "images/Don Custodio.png",
        audio: "audio/DonCustodio.mp3"
    },
    {
        name: "Donya Victorina",
        description: "Matapobreng babae, mestisahin, at naghahanap palagi ng atensyon; kasama sa biyahe sa bapor.",
        image: "images/Donya Victorina.png",
        audio: "audio/DonyaVictorina.mp3"
    },
    {
        name: "Huli (Juli)",
        description: "Anak ni Kabesang Tales; simbolo ng inosenteng kababaihang naaapi. Nagsakripisyo upang iligtas si Basilio.",
        image: "images/Huli (Juli).png",
        audio: "audio/Huli.mp3"
    },
    {
        name: "Isagani",
        description: "Makata at prinsipalyong estudyante; idealistiko at maka-bayan.",
        image: "images/Isagani.png",
        audio: "audio/Isagani.mp3"
    },
    {
        name: "Juanito Pelaez",
        description: "Mayamang estudyante, paborito ng mga prayle; ginagamit sa pang-aapi sa mga Pilipino.",
        image: "images/Juanito Pelaez.png",
        audio: "audio/Juanito.mp3"
    },
    {
        name: "Kabesang Tales (Telesforo)",
        description: "Dating kainginero na inagawan ng lupa ng prayle; naging tulisan dahil sa matinding pang-aapi.",
        image: "images/Kabesang Tales.png",
        audio: "audio/Kabesang Tales.mp3"
    },
    {
        name: "Kapitan Heneral",
        description: "Pinakamakapangyarihang opisyal sa Pilipinas; madaling maimpluwensiyahan, lalo na ni Simoun.",
        image: "images/Kapitan Heneral.png",
        audio: "audio/Kapitan Heneral.mp3"
    },
    {
        name: "Kapitan Tiago",
        description: "Ama-amahan ni Maria Clara; nalulong sa opyo at namatay nang mawalan ng pag-asa.",
        image: "images/Kapitan Tiago.png",
        audio: "audio/Kapitan Tiago.mp3"
    },
    {
        name: "Makaraig",
        description: "Mayamang estudyante at lider ng kilusan para sa Akademya ng Wikang Kastila.",
        image: "images/Makaraig.png",
        audio: "audio/Makaraig.mp3"
    },
    {
        name: "Maria Clara",
        description: "Dating kasintahan ni Ibarra; namatay sa Sta. Clara. Simbolo ng kawalang-laya at pagdurusa ng kababaihan.",
        image: "images/Maria Clara.png",
        audio: "audio/Maria Clara.mp3"
    },
    {
        name: "Padre Camorra",
        description: "Mapanamantala at marahas na pari; may masamang hangarin kay Huli.",
        image: "images/Padre Camorra.png",
        audio: "audio/Padre Camorra.mp3"
    },
    {
        name: "Padre Fernandez",
        description: "Liberal at mabait na pari; nakikinig at nakikisimpatiya sa mga estudyante.",
        image: "images/Padre Fernandez.png",
        audio: "audio/Padre Fernandez.mp3"
    },
    {
        name: "Padre Florentino",
        description: "Pari at tiyuhin ni Isagani; naging tagapagbantay kay Simoun sa huli.",
        image: "images/Padre Florentino.png",
        audio: "audio/Padre Florentino.mp3"
    },
    {
        name: "Padre Irene",
        description: "Paring nag-aangking 'tagapagtanggol' ng mga estudyante ngunit kadalasan ay pakitang-tao lamang.",
        image: "images/Padre Irene.png",
        audio: "audio/Padre Irene.mp3"
    },
    {
        name: "Padre Millon",
        description: "Mapang-abusong guro sa pisika; sinisimbolo ang bulok na sistema ng edukasyon.",
        image: "images/Padre Millon.png",
        audio: "audio/Padre Millon.mp3"
    },
    {
        name: "Hermana Penchang",
        description: "Mapagkunwaring relihiyosa; amo ni Huli at nagpapabasa sa kanya ng aklat na panlilinlang.",
        image: "images/Hermana Penchang.png",
        audio: "audio/Hermana Penchang.mp3"
    },
    {
        name: "Padre Salvi",
        description: "Mapanlinlang at makapangyarihang pari; pangunahing dahilan ng pagkapariwara ni Maria Clara.",
        image: "images/Padre Salvi.png",
        audio: "audio/Padre Salvi.mp3"
    },
    {
        name: "Padre Sibyla",
        description: "Isang mataas na prayle sa unibersidad; kontra sa mga pagbabago.",
        image: "images/Padre Sibyla.png",
        audio: "audio/Padre Sibyla.mp3"
    },
    {
        name: "Placido Penitente",
        description: "Estudyanteng nawalan ng pag-asa dahil sa pang-aabuso ng mga guro at prayle.",
        image: "images/Placido Penitente.png",
        audio: "audio/Placido Penitente.mp3"
    },
    {
        name: "Sandoval",
        description: "Kastilang estudyante na maka-Pilipino; tagapagtaguyod ng karapatan ng mga kabataan.",
        image: "images/Sandoval.png",
        audio: "audio/Sandoval.mp3"
    },
    {
        name: "Simoun (Crisostomo Ibarra)",
        description: "Mag-aalahas na nagbalik upang maghiganti; utak ng rebolusyon. Nagpanggap upang maimpluwensiyahan ang Heneral, mga prayle, at lipunan.",
        image: "images/Simoun.png",
        audio: "audio/Simoun.mp3"
    },
    {
        name: "Tadeo",
        description: "Tamad na estudyante; magandang representasyon ng maling pag-uugali sa paaralan.",
        image: "images/Tadeo.png",
        audio: "audio/Tadeo.mp3"
    },
    {
        name: "Tandang Selo",
        description: "Ama ni Kabesang Tales; simbolo ng magsasakang lubusang inapi hanggang mawalan ng boses.",
        image: "images/Tandang Selo.png",
        audio: "audio/Tandang Selo.mp3"
    },
    {
        name: "Tano",
        description: "Anak ni Tales; sapilitang kinuha bilang sundalo.",
        image: "images/Tano.png",
        audio: "audio/Tano.mp3"
    },
    {
        name: "Pecson",
        description: "Isang estudyanteng mapanlait at puno ng pagdududa sa pagbabago; kinakatawan ang kawalan ng pag-asa ng ilang kabataan.",
        image: "images/Pecson.png",
        audio: "audio/Pecson.mp3"
    },
    {
        name: "Quiroga",
        description: "Isang mayamang negosyanteng Tsino na nag-iimbak ng armas para sa pansariling kapakinabangan; simbolo ng oportunismo at pakikipagsabwatan.",
        image: "images/Quiroga.png",
        audio: "audio/Quiroga.mp3"
    },
    {
        name: "Mr. Leeds",
        description: "Isang Amerikanong salamangkero na gumagamit ng ilusyon upang ilantad ang mga lihim na krimen ng mga prayle; kinakatawan ang katotohanang lumalabas.",
        image: "images/Mr. Leeds.png",
        audio: "audio/Mr Leeds.mp3"
    },
    {
        name: "Kapitan Basilio",
        description: "Isang lokal na opisyal na yumaman at nakisangkot sa pang-aapi sa mga estudyante; sumasagisag sa mga abusadong Pilipino.",
        image: "images/Kapitan Basilio.png",
        audio: "audio/Kapitan Basilio.mp3"
    },
    {
        name: "Sinang",
        description: "Masayahin at tapat na kaibigan ni Maria Clara; kinakatawan ang kabutihang-loob at pagiging totoo.",
        image: "images/Sinang.png",
        audio: "audio/Sinang.mp3"
    },
    {
        name: "Don Timoteo Palaez",
        description: "Isang mayamang Pilipino na sunud-sunuran sa mga Kastila; larawan ng bulag na pagsunod sa kolonyal na kapangyarihan.",
        image: "images/Don Timoteo Pelaez.png",
        audio: "audio/Don Timoteo Palaez.mp3"
    },
    {
        name: "Kabesang Andang",
        description: "Isang inang nawalan ng anak dahil sa kawalang-katarungan; larawan ng paghihirap at pagtitiis ng karaniwang Pilipino.",
        image: "images/Kabesang Andang.png",
        audio: "audio/Kabesang Andang.mp3"
    },
    {
        name: "Pepay",
        description: "Isang mananayaw na kinagigiliwan ng mga opisyal; kinakatawan ang pagsasamantala at kabulukan ng moralidad.",
        image: "images/Pepay.png",
        audio: "audio/Pepay.mp3"
    },
    {
        name: "Hermana Bali",
        description: "Isang mabait na babae na tumulong kay Basilio; simbolo ng malasakit at pagkakawanggawa.",
        image: "images/Hermana Bali.png",
        audio: "audio/Hermana Bali.mp3"
    },
    {
        name: "Kutserong Dining",
        description: "Isang kutsero na ikinulong dahil sa paglabag sa utos ng prayle; kinakatawan ang pang-aapi sa karaniwang mamamayan.",
        image: "images/Kutserong Sinong.png",
        audio: "audio/Kutserong Dining.mp3"
    },
    {
        name: "Lucia",
        description: "Ang selosang kapatid ni Paulita Gomez; ipinapakita ang inggit at pagiging mapagmataas.",
        image: "images/Lucia.png",
        audio: "audio/Lucia.mp3"
    },
    {
        name: "Padre Valerio",
        description: "Isang tiwaling prayle na gumagawa ng imoral na gawain; kinakatawan ang pagkukunwari ng ilang relihiyosong pinuno.",
        image: "images/Padre Valerio.png",
        audio: "audio/Padre Valerio.mp3"
    },
    {
        name: "Gertrude",
        description: "Anak ng lalaking pinaslang ng prayle na ibinunyag sa palabas ni Mr. Leeds; simbolo ng tinatagong kawalang-katarungan.",
        image: "images/Gertrude.png",
        audio: "audio/Gertrude.mp3"
    },
    {
        name: "Don Primitivo",
        description: "Isang Kastilang opisyal na labis ang pagkahumaling sa titulo at pormalidad; kinakatawan ang kayabangan ng burukrasya.",
        image: "images/Don Primitivo.png",
        audio: "audio/Don Primitivo.mp3"
    },
    {
        name: "Doña Patrocinio",
        description: "Isang babaeng Pilipina na ginagaya ang asal at kultura ng mga Kastila; larawan ng kolonyal na kaisipan.",
        image: "images/Doña Patrocinio.png",
        audio: "audio/Donya Patrocinio.mp3"
    },
    {
        name: "Chikoy",
        description: "Isang batang lansangan na napapasok sa maliliit na krimen; kinakatawan ang kahirapan at kapabayaan ng lipunan.",
        image: "images/Chikoy.png",
        audio: "audio/Chikoy.mp3"
    },
    {
        name: "Momoy",
        description: "Kasama ni Chikoy na isa ring batang mahirap; simbolo ng kawalan ng pagkakataon ng kabataang maralita.",
        image: "images/Momoy.png",
        audio: "audio/Momoy.mp3"
    },
    {
        name: "Carolino",
        description: "Isang Guardia Civil na unti-unting namulat sa maling sistemang kanyang pinaglilingkuran; kinakatawan ang nagigising na konsensya.",
        image: "images/Carolino.png",
        audio: "audio/Carolino.mp3"
    }
];

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "home") {
        initializeCharacterGrid();
        initializeCharacterSearch();
        initializeModal();
        initializeAudioControls();
    }

    addCardAnimations();
    ensureSingleAudio();
});

function initializeCharacterGrid() {
    const characterGrid = document.getElementById("characterGrid");
    if (!characterGrid) return;
    characterGrid.innerHTML = "";
    
    characters.forEach(character => {
        const characterCard = document.createElement("div");
        characterCard.className = "character-card";
        characterCard.dataset.name = character.name;
        characterCard.dataset.description = character.description;
        characterCard.dataset.image = character.image;
        characterCard.dataset.audio = character.audio || "";
        
        characterCard.innerHTML = `
            <div class="character-img">
                <div class="golden-frame">
                    <div class="golden-frame-inner">
                        <img src="${character.image}" alt="${character.name}" 
                             onerror="handleImageError(this, '${character.name}')" />
                    </div>
                </div>
            </div>
            <div class="character-name">${character.name}</div>
        `;
        
        characterGrid.appendChild(characterCard);
    });

    // Add click event listeners
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            showCharacterModal(
                card.dataset.name, 
                card.dataset.description, 
                card.dataset.image,
                card.dataset.audio
            );
        });
    });
}

// Add this helper function for image error handling
function handleImageError(imgElement, characterName) {
    const frameInner = imgElement.parentElement;
    frameInner.innerHTML = `
        <div class="image-fallback">
            ${characterName}
        </div>
    `;
}

function initializeModal() {
    const modal = document.getElementById('characterModal');
    const closeButton = document.querySelector('.modal-close');
    
    if (!modal || !closeButton) return;
    
    // Close button event
    closeButton.addEventListener('click', () => {
        closeModalAndStopAudio();
    });
    
    // Click outside modal to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalAndStopAudio();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModalAndStopAudio();
        }
    });
}

// Helper function to close modal and stop audio
function closeModalAndStopAudio() {
    const modal = document.getElementById('characterModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    
    // Stop and reset current audio
    stopAudio();
}

// Initialize audio controls
function initializeAudioControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (!playPauseBtn || !stopBtn) return;
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    stopBtn.addEventListener('click', stopAudio);
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (currentAudio) {
                currentAudio.volume = this.value;
            }
        });
    }
}

// Toggle play/pause
function togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (!currentAudio) return;
    
    if (isAudioPlaying) {
        currentAudio.pause();
        playPauseBtn.classList.remove('playing');
        isAudioPlaying = false;
    } else {
        currentAudio.play()
            .then(() => {
                playPauseBtn.classList.add('playing');
                isAudioPlaying = true;
            })
            .catch(error => {
                console.error('Error playing audio:', error);
            });
    }
}

// Stop audio completely
function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        isAudioPlaying = false;
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) playPauseBtn.classList.remove('playing');
        updateAudioTimeDisplay();
    }
}

// Update time display
function updateAudioTimeDisplay() {
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    
    if (!currentAudio || !currentTimeEl || !durationEl) return;
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    durationEl.textContent = formatTime(currentAudio.duration || 0);
}

function showCharacterModal(name, description, image, audioPath) {
    const modal = document.getElementById('characterModal');
    const modalName = document.getElementById('modalCharacterName');
    const modalDescription = document.getElementById('modalCharacterDescription');
    const modalImageContainer = document.querySelector('.modal-image');
    const audioControls = document.getElementById('audioControls');
    
    if (!modal || !modalName || !modalDescription || !modalImageContainer) return;
    
    // Stop any currently playing audio
    stopAudio();
    currentAudio = null;
    
    modalName.textContent = name;
    modalDescription.textContent = description;
    
    // Clear previous content and set up new modal image with frame
    modalImageContainer.innerHTML = '';
    modalImageContainer.innerHTML = `
        <img id="modalCharacterImage" src="${image}" alt="${name}" 
             onerror="handleModalImageError(this, '${name}')" />
    `;
    
    // Show the modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // Scroll to top of modal content
    modalImageContainer.scrollTop = 0;
    
    // Handle audio
    if (audioPath) {
        setupCharacterAudio(audioPath);
        if (audioControls) {
            audioControls.classList.remove('hidden');
        }
    } else {
        if (audioControls) {
            audioControls.classList.add('hidden');
        }
    }
}

// Set up character audio
function setupCharacterAudio(audioPath) {
    const audioControls = document.getElementById('audioControls');
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    // Hide audio controls initially while loading
    if (audioControls) {
        audioControls.style.opacity = '0.5';
    }
    
    // Reset play button state
    if (playPauseBtn) {
        playPauseBtn.classList.remove('playing');
    }
    
    // Create and configure audio
    currentAudio = new Audio(audioPath);
    currentAudio.preload = 'auto';
    currentAudio.volume = document.getElementById('volumeSlider')?.value || 0.7;
    
    // Set up event listeners
    currentAudio.addEventListener('loadedmetadata', () => {
        updateAudioTimeDisplay();
        if (audioControls) {
            audioControls.style.opacity = '1';
        }
    });
    
    currentAudio.addEventListener('timeupdate', updateAudioTimeDisplay);
    
    currentAudio.addEventListener('ended', () => {
        isAudioPlaying = false;
        if (playPauseBtn) playPauseBtn.classList.remove('playing');
        updateAudioTimeDisplay();
    });
    
    currentAudio.addEventListener('pause', () => {
        isAudioPlaying = false;
        if (playPauseBtn) playPauseBtn.classList.remove('playing');
    });
    
    currentAudio.addEventListener('play', () => {
        isAudioPlaying = true;
        if (playPauseBtn) playPauseBtn.classList.add('playing');
    });
    
    currentAudio.addEventListener('error', () => {
        console.error('Error loading audio:', audioPath);
        if (audioControls) {
            audioControls.style.opacity = '1';
        }
    });
    
    // Auto-play when modal opens (will be subject to browser autoplay policies)
    currentAudio.play().catch(error => {
        console.log('Autoplay prevented or audio error:', error);
        // User can still click play button manually
    });
}

// Add this helper function for modal image errors
function handleModalImageError(imgElement, characterName) {
    const modalImageContainer = imgElement.parentElement;
    modalImageContainer.innerHTML = `
        <div class="image-fallback" style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8em;
        ">
            ${characterName}
        </div>
    `;
}

function initializeCharacterSearch() {
    const characterSearch = document.getElementById("characterSearch");
    if (!characterSearch) return;
    characterSearch.addEventListener("input", filterCharacters);
    characterSearch.addEventListener("keyup", filterCharacters);
    filterCharacters();
}

function filterCharacters() {
    const el = document.getElementById("characterSearch");
    if (!el) return;
    const searchTerm = el.value.toLowerCase();
    const characterCards = document.querySelectorAll(".character-grid .character-card");
    const noResults = document.getElementById("noCharacterResults");
    const searchTermSpan = document.getElementById("characterSearchTerm");
    let visibleCount = 0;
    let delay = 0;
    characterCards.forEach((card) => {
        const characterName = card.querySelector(".character-name").textContent.toLowerCase();
        if (searchTerm === "" || characterName.includes(searchTerm)) {
            card.classList.remove("hidden");
            card.style.animation = `fadeInCard 0.3s ease ${delay}s forwards`;
            visibleCount++; delay += 0.05;
        } else {
            card.classList.add("hidden"); card.style.animation = "none";
        }
    });
    if (visibleCount === 0 && searchTerm !== "") {
        if (searchTermSpan) searchTermSpan.textContent = searchTerm;
        if (noResults) noResults.classList.remove("hidden");
    } else {
        if (noResults) noResults.classList.add("hidden");
    }
}

function addCardAnimations() {
    setTimeout(() => {
        const cards = document.querySelectorAll(".character-card, .chapter-card:not(.disabled)");
        cards.forEach((card, index) => {
            card.classList.remove("hidden");
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
                    } catch (e) {} 
                } 
            });
        });
    });
}

document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const activeSearch = document.querySelector(".search-input:focus") || document.querySelector(".search-input");
        if (activeSearch) { 
            activeSearch.focus(); 
            activeSearch.select(); 
        }
    }
    if (e.key === "Escape") {
        const activeSearch = document.querySelector(".search-input:focus");
        if (activeSearch) { 
            activeSearch.value = ""; 
            if (activeSearch.id === "characterSearch") filterCharacters(); 
        }
    }
});