// --- 1. CONFIGURATION DE LA CARTE ---
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
var colorfulLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });

var map = L.map('map', {
    center: [50.6365, 3.0635],
    zoom: 14,
    zoomControl: false,
    layers: [colorfulLayer] 
});

var baseMaps = { "🎨 Colorful": colorfulLayer, "🌙 Dark Mode": darkLayer, "🛰️ Satellite": satelliteLayer };
L.control.layers(baseMaps).addTo(map);
L.control.zoom({ position: 'bottomleft' }).addTo(map);


// --- 2. FONCTION ICÔNES ---
function createCustomIcon(emoji, colorClass) {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div class="pin-marker ${colorClass}"><div class="pin-icon">${emoji}</div></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48]
    });
}


// --- 3. GESTION DES MARQUEURS ---
var allMarkers = [];

// Variable globale pour savoir si on modifie un marqueur existant
let currentEditingMarker = null;

function addMarker(lat, lng, icon, category, popupText, isUserEvent = false, rawData = null) {
    var marker = L.marker([lat, lng], {icon: icon});
    
    marker.category = category; 
    // On nettoie le texte pour la recherche
    marker.searchText = popupText.replace(/<[^>]*>?/gm, '').toLowerCase();

    // Si c'est un événement utilisateur, on stocke les données brutes (pour l'édition)
    if (isUserEvent && rawData) {
        marker.data = rawData; // On garde le nom, l'adresse, etc. en mémoire
        
        // On ajoute les boutons Edit/Delete dans la popup
        popupText += `
            <div class="popup-controls">
                <button class="popup-btn btn-edit" onclick="editEvent(${allMarkers.length})">✏️ Edit</button>
                <button class="popup-btn btn-delete" onclick="deleteEvent(${allMarkers.length})">🗑️ Delete</button>
            </div>
        `;
        // Astuce : on utilise l'index du marqueur dans le tableau allMarkers pour le retrouver
    }

    marker.bindPopup(popupText).addTo(map);
    
    // On ajoute l'ID interne au marqueur pour le retrouver facilement
    marker.internalId = allMarkers.length;
    
    allMarkers.push(marker);
}

// Création des marqueurs
var iconCafe = createCustomIcon('☕', ''); 
addMarker(50.6386, 3.0602, iconCafe, 'food', "<b>Elizabeth's Tea Room</b><br>Cozy cakes & tea.");

var iconParty = createCustomIcon('🍺', 'bg-red');
addMarker(50.6373, 3.0614, iconParty, 'events', "<b>Dernier Bar</b><br>Geek culture & beers.");

var iconPark = createCustomIcon('🌳', 'bg-green');
addMarker(50.6383, 3.0480, iconPark, 'study', "<b>La Citadelle</b><br>Perfect for reading on the grass.");

var iconPartner = createCustomIcon('🤝', 'bg-blue');
addMarker(50.6369, 3.0634, iconPartner, 'partners', "<b>Student Welcome Desk</b><br>Help & paperwork.");


// --- 4. FILTRAGE PAR CATÉGORIE (Sidebar) ---
const filterButtons = document.querySelectorAll('.sidebar .icon-btn');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Reset visuel
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // On vide la barre de recherche pour éviter les conflits
        document.getElementById('search-input').value = "";

        const selectedCategory = btn.getAttribute('data-category');

        allMarkers.forEach(marker => {
            if (selectedCategory === 'all' || marker.category === selectedCategory) {
                if (!map.hasLayer(marker)) map.addLayer(marker);
            } else {
                if (map.hasLayer(marker)) map.removeLayer(marker);
            }
        });
    });
});


// --- 5. NOUVEAU : FILTRAGE PAR RECHERCHE (Search Bar) ---
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (e) => {
    // Ce que l'utilisateur tape (en minuscule)
    const term = e.target.value.toLowerCase();

    // Si on cherche, on désactive visuellement les filtres de catégorie
    if(term.length > 0) {
        filterButtons.forEach(b => b.classList.remove('active'));
    } else {
        // Si on efface tout, on remet "All" actif par défaut
        filterButtons[0].classList.add('active');
    }

    allMarkers.forEach(marker => {
        // Est-ce que le texte du marqueur contient ce qu'on tape ?
        if (marker.searchText.includes(term)) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });
});

// --- 6. GESTION DE LA MODALE "HOST ACTIVITY" ---

const modal = document.getElementById('modal-overlay');
const hostBtn = document.querySelector('.host-btn');
const closeBtn = document.getElementById('close-modal');
const form = document.getElementById('activity-form');

// Ouvrir la modale
hostBtn.addEventListener('click', () => {
    modal.classList.add('open');
});

// Fermer la modale (Bouton X)
closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
});

// Fermer si on clique en dehors de la carte (sur le fond gris)
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('open');
    }
});


// --- 7. SOUMISSION DU FORMULAIRE AVEC GÉOCODAGE ---

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Récupérer les données
    const name = document.getElementById('event-name').value;
    const address = document.getElementById('event-address').value;
    const city = document.getElementById('event-city').value;
    const type = document.getElementById('event-type').value;
    const desc = document.getElementById('event-desc').value;
    const submitBtn = form.querySelector('.submit-btn');

    // Feedback visuel
    submitBtn.textContent = "Processing... ⏳";
    submitBtn.disabled = true;

    // 2. Géocodage
    const searchQuery = `${address}, ${city}, France`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("Address not found!");
                resetButton();
                return;
            }

            const firstResult = data[0];
            const lat = firstResult.lat;
            const lng = firstResult.lon;

            // 3. Créer l'icône
            let emoji = '📍';
            let colorClass = '';
            if (type === 'party') { emoji = '🎉'; colorClass = 'bg-red'; }
            if (type === 'food')  { emoji = '🍔'; colorClass = 'bg-yellow'; }
            if (type === 'study') { emoji = '📚'; colorClass = ''; }
            if (type === 'sport') { emoji = '⚽'; colorClass = 'bg-green'; }

            const newIcon = createCustomIcon(emoji, colorClass);

            // --- C'EST ICI QUE CA CHANGE ---
            
            // Si on éditait un marqueur, on supprime l'ancien d'abord !
            if (currentEditingMarker) {
                map.removeLayer(currentEditingMarker);
            }

            // On crée le nouveau (ou le remplaçant)
            // Note le "true" à la fin pour dire "C'est un user event"
            // Et on passe l'objet {name, address...} pour pouvoir le rééditer plus tard
            addMarker(lat, lng, newIcon, type, 
                `<b>${name}</b><br>${desc}<br><i>📍 ${address}, ${city}</i>`, 
                true, 
                {name, address, city, type, desc}
            );

            // 4. Reset
            modal.classList.remove('open');
            resetFormMode(); // Remet le formulaire en mode "Création"
            resetButton();

            map.flyTo([lat, lng], 16);
        })
        .catch(error => {
            console.error(error);
            alert("Error connecting to map service.");
            resetButton();
        });

    function resetButton() {
        if(!currentEditingMarker) submitBtn.textContent = "Create Event";
        else submitBtn.textContent = "Update Event 🔄";
        submitBtn.disabled = false;
    }
});

// --- 8. FONCTIONS EDIT & DELETE ---

// Fonction appelée par le bouton 🗑️
window.deleteEvent = function(id) {
    const marker = allMarkers[id];
    if (confirm("Are you sure you want to delete this event?")) {
        map.removeLayer(marker); // On l'enlève de la carte visuellement
        // Note: Dans un vrai site, on supprimerait aussi de la base de données ici
    }
};

// Fonction appelée par le bouton ✏️
window.editEvent = function(id) {
    const marker = allMarkers[id];
    
    // 1. On remplit le formulaire avec les infos du marqueur
    document.getElementById('event-name').value = marker.data.name;
    document.getElementById('event-address').value = marker.data.address;
    document.getElementById('event-city').value = marker.data.city;
    document.getElementById('event-type').value = marker.data.type;
    document.getElementById('event-desc').value = marker.data.desc;

    // 2. On change le bouton pour dire "Update"
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.textContent = "Update Event 🔄";

    // 3. On stocke le marqueur qu'on est en train de modifier
    currentEditingMarker = marker;

    // 4. On ouvre la modale
    modal.classList.add('open');
    modal.querySelector('h2').textContent = "✏️ Edit Activity";
};

// Petit fix : Quand on ferme la modale, on remet tout à zéro
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === closeBtn) {
        resetFormMode();
    }
});

function resetFormMode() {
    currentEditingMarker = null;
    form.reset();
    form.querySelector('.submit-btn').textContent = "Create Event";
    modal.querySelector('h2').textContent = "✨ Host an Activity";
}