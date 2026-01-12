// Index page script (characters, modal, search, animations)
const characters = [
    {
        name: "Basilio",
        description: "Isang medical student; matalino, masipag, at nagdurusa sa kawalang-katarungan. Naging biktima ng pang-aapi ng pamahalaan at simbahan.",
        image: "images/Basilio.png"
    },
    {
        name: "Ben-Zayb",
        description: "Mayabang na mamamahayag; naniniwalang siya lamang ang tunky na nag-iisip sa Pilipinas.",
        image: "images/Ben-Zayb.png"
    },
    {
        name: "Don Custodio",
        description: "Opisyal ng pamahalaan na kilala sa 'mabilis' ngunit walang kuwentang solusyon; malakas ang impluwensiya sa Kapitan Heneral.",
        image: "images/Don Custodio.png"
    },
    {
        name: "Donya Victorina",
        description: "Matapobreng babae, mestisahin, at naghahanap palagi ng atensyon; kasama sa biyahe sa bapor.",
        image: "images/Donya Victorina.png"
    },
    {
        name: "Huli (Juli)",
        description: "Anak ni Kabesang Tales; simbolo ng inosenteng kababaihang naaapi. Nagsakripisyo upang iligtas si Basilio.",
        image: "images/Huli (Juli).png"
    },
    {
        name: "Isagani",
        description: "Makata at prinsipalyong estudyante; idealistiko at maka-bayan.",
        image: "images/Isagani.png"
    },
    {
        name: "Juanito Pelaez",
        description: "Mayamang estudyante, paborito ng mga prayle; ginagamit sa pang-aapi sa mga Pilipino.",
        image: "images/Juanito Pelaez.png"
    },
    {
        name: "Kabesang Tales (Telesforo)",
        description: "Dating kainginero na inagawan ng lupa ng prayle; naging tulisan dahil sa matinding pang-aapi.",
        image: "images/Kabesang Tales.png"
    },
    {
        name: "Kapitan Heneral",
        description: "Pinakamakapangyarihang opisyal sa Pilipinas; madaling maimpluwensiyahan, lalo na ni Simoun.",
        image: "images/Kapitan Heneral.png"
    },
    {
        name: "Kapitan Tiago",
        description: "Ama-amahan ni Maria Clara; nalulong sa opyo at namatay nang mawalan ng pag-asa.",
        image: "images/Kapitan Tiago.png"
    },
    {
        name: "Makaraig",
        description: "Mayamang estudyante at lider ng kilusan para sa Akademya ng Wikang Kastila.",
        image: "images/Makaraig.png"
    },
    {
        name: "Maria Clara",
        description: "Dating kasintahan ni Ibarra; namatay sa Sta. Clara. Simbolo ng kawalang-laya at pagdurusa ng kababaihan.",
        image: "images/Maria Clara.png"
    },
    {
        name: "Padre Camorra",
        description: "Mapanamantala at marahas na pari; may masamang hangarin kay Huli.",
        image: "images/Padre Camorra.png"
    },
    {
        name: "Padre Fernandez",
        description: "Liberal at mabait na pari; nakikinig at nakikisimpatiya sa mga estudyante.",
        image: "images/Padre Fernandez.png"
    },
    {
        name: "Padre Florentino",
        description: "Pari at tiyuhin ni Isagani; naging tagapagbantay kay Simoun sa huli.",
        image: "images/Padre Florentino.png"
    },
    {
        name: "Padre Irene",
        description: "Paring nag-aangking 'tagapagtanggol' ng mga estudyante ngunit kadalasan ay pakitang-tao lamang.",
        image: "images/Padre Irene.png"
    },
    {
        name: "Padre Millon",
        description: "Mapang-abusong guro sa pisika; sinisimbolo ang bulok na sistema ng edukasyon.",
        image: "images/Padre Millon.png"
    },
    {
        name: "Hermana Penchang",
        description: "Mapagkunwaring relihiyosa; amo ni Huli at nagpapabasa sa kanya ng aklat na panlilinlang.",
        image: "images/Hermana Penchang.png"
    },
    {
        name: "Padre Salvi",
        description: "Mapanlinlang at makapangyarihang pari; pangunahing dahilan ng pagkapariwara ni Maria Clara.",
        image: "images/Padre Salvi.png"
    },
    {
        name: "Padre Sibyla",
        description: "Isang mataas na prayle sa unibersidad; kontra sa mga pagbabago.",
        image: "images/Padre Sibyla.png"
    },
    {
        name: "Placido Penitente",
        description: "Estudyanteng nawalan ng pag-asa dahil sa pang-aabuso ng mga guro at prayle.",
        image: "images/Placido Penitente.png"
    },
    {
        name: "Sandoval",
        description: "Kastilang estudyante na maka-Pilipino; tagapagtaguyod ng karapatan ng mga kabataan.",
        image: "images/Sandoval.png"
    },
    {
        name: "Simoun (Crisostomo Ibarra)",
        description: "Mag-aalahas na nagbalik upang maghiganti; utak ng rebolusyon. Nagpanggap upang maimpluwensiyahan ang Heneral, mga prayle, at lipunan.",
        image: "images/Simoun.png"
    },
    {
        name: "Tadeo",
        description: "Tamad na estudyante; magandang representasyon ng maling pag-uugali sa paaralan.",
        image: "images/Tadeo.png"
    },
    {
        name: "Tandang Selo",
        description: "Ama ni Kabesang Tales; simbolo ng magsasakang lubusang inapi hanggang mawalan ng boses.",
        image: "images/Tandang Selo.png"
    },
    {
        name: "Tano",
        description: "Anak ni Tales; sapilitang kinuha bilang sundalo.",
        image: "images/Tano.png"
    }
];

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;
    if (page === "home") {
        initializeCharacterGrid();
        initializeCharacterSearch();
        initializeModal();
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
                card.dataset.image
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
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    });
}

function showCharacterModal(name, description, image) {
    const modal = document.getElementById('characterModal');
    const modalName = document.getElementById('modalCharacterName');
    const modalDescription = document.getElementById('modalCharacterDescription');
    const modalImageContainer = document.querySelector('.modal-image');
    
    if (!modal || !modalName || !modalDescription || !modalImageContainer) return;
    
    modalName.textContent = name;
    modalDescription.textContent = description;
    
    // Clear previous content and set up new modal image with frame
    modalImageContainer.innerHTML = '';
    modalImageContainer.innerHTML = `
        <img id="modalCharacterImage" src="${image}" alt="${name}" 
             onerror="handleModalImageError(this, '${name}')" />
    `;
    
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // Scroll to top of modal content
    modalImageContainer.scrollTop = 0;
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
            audios.forEach((other) => { if (other !== audio && !other.paused) { try { other.pause(); } catch (e) {} } });
        });
    });
}

document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        const activeSearch = document.querySelector(".search-input:focus") || document.querySelector(".search-input");
        if (activeSearch) { activeSearch.focus(); activeSearch.select(); }
    }
    if (e.key === "Escape") {
        const activeSearch = document.querySelector(".search-input:focus");
        if (activeSearch) { activeSearch.value = ""; if (activeSearch.id === "characterSearch") filterCharacters(); }
    }
});
