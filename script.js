// --- 1. CONFIGURATION DE LA CARTE ---
// Fonds de carte
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
var colorfulLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });

// Initialisation (Lille)
var map = L.map('map', {
    center: [50.6365, 3.0635],
    zoom: 14,
    zoomControl: false,
    layers: [colorfulLayer] // Mode coloré par défaut
});

// Contrôles
var baseMaps = { "🎨 Colorful": colorfulLayer, "🌙 Dark Mode": darkLayer, "🛰️ Satellite": satelliteLayer };
L.control.layers(baseMaps).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);


// --- 2. FONCTION DE CRÉATION D'ICÔNES ---
function createCustomIcon(emoji, colorClass) {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div class="pin-marker ${colorClass}"><div class="pin-icon">${emoji}</div></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48]
    });
}


// --- 3. GESTION DES MARQUEURS ET FILTRES ---

// On crée une liste vide pour stocker tous nos marqueurs
var allMarkers = [];

// Fonction pour ajouter un marqueur à la liste et à la carte
function addMarker(lat, lng, icon, category, popupText) {
    var marker = L.marker([lat, lng], {icon: icon});
    
    // On attache l'étiquette de catégorie directement au marqueur
    marker.category = category; 
    
    marker.bindPopup(popupText).addTo(map);
    
    // On l'ajoute à notre liste globale
    allMarkers.push(marker);
}

// --- CRÉATION DES MARQUEURS ---

// Food 🍔
var iconCafe = createCustomIcon('☕', ''); 
addMarker(50.6386, 3.0602, iconCafe, 'food', "<b>Elizabeth's Tea Room</b><br>Cozy cakes & tea.");

// Events 🎉
var iconParty = createCustomIcon('🍺', 'bg-red');
addMarker(50.6373, 3.0614, iconParty, 'events', "<b>Dernier Bar</b><br>Geek culture & beers.");

// Study 📚 (J'ai mis le Parc dans Study/Chill pour l'exemple)
var iconPark = createCustomIcon('🌳', 'bg-green');
addMarker(50.6383, 3.0480, iconPark, 'study', "<b>La Citadelle</b><br>Perfect for reading on the grass.");

// Partners 🤝
var iconPartner = createCustomIcon('🤝', 'bg-blue');
addMarker(50.6369, 3.0634, iconPartner, 'partners', "<b>Student Welcome Desk</b><br>Help & paperwork.");


// --- 4. LOGIQUE DE FILTRAGE (CLIC BOUTONS) ---

// On sélectionne tous les boutons de la sidebar
const filterButtons = document.querySelectorAll('.sidebar .icon-btn');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Gestion visuelle des boutons (Active / Inactif)
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 2. Le filtrage
        const selectedCategory = btn.getAttribute('data-category');

        allMarkers.forEach(marker => {
            // Si "All" est sélectionné OU si la catégorie correspond
            if (selectedCategory === 'all' || marker.category === selectedCategory) {
                // Si le marqueur n'est pas déjà sur la carte, on l'ajoute
                if (!map.hasLayer(marker)) {
                    map.addLayer(marker);
                }
            } else {
                // Sinon, on l'enlève de la carte
                if (map.hasLayer(marker)) {
                    map.removeLayer(marker);
                }
            }
        });
    });
});