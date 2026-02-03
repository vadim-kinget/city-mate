// --- ENREGISTREMENT PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

// --- 1. CONFIGURATION DE LA CARTE ---
var voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

// Création de la carte avec ce seul calque
var map = L.map('map', {
    center: [50.62925, 3.057256], // Coordonnées de Lille
    zoom: 13,
    zoomControl: false, // On désactive le zoom par défaut pour le placer nous-mêmes si besoin
    layers: [voyager]   // <--- C'est ici qu'on impose le style unique
});




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

// Fonction d'ajout (Avec bouton Itinéraire et lien corrigé)
function addMarker(lat, lng, icon, category, popupText, isUserEvent = false, rawData = null) {
    var marker = L.marker([lat, lng], {icon: icon});
    
    marker.category = category; 
    marker.isUserEvent = isUserEvent; 
    marker.searchText = popupText.replace(/<[^>]*>?/gm, '').toLowerCase();

    // --- LIEN GOOGLE MAPS (CORRIGÉ) ---
    // Ouvre l'app GPS sur mobile ou le site sur PC avec l'itinéraire
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    // Ajout du bouton à la fin de la popup
    popupText += `
        <br>
        <a href="${googleMapsUrl}" target="_blank" class="direction-btn">
            🚀 Itinéraire
        </a>
    `;

    // Gestion des boutons Edit/Delete pour les événements utilisateur
    if (isUserEvent && rawData) {
        if (!rawData.id) rawData.id = Date.now();
        marker.data = { ...rawData, lat: lat, lng: lng, id: rawData.id }; 
        
        popupText += `
            <div class="popup-controls">
                <button class="popup-btn btn-edit" onclick="editEvent(${rawData.id})">✏️ Edit</button>
                <button class="popup-btn btn-delete" onclick="deleteEvent(${rawData.id})">🗑️ Delete</button>
            </div>
        `;
    }

    marker.bindPopup(popupText).addTo(map);
    marker.internalId = allMarkers.length;
    allMarkers.push(marker);
}

// --- DÉFINITION DES ICÔNES ---
var iconParty = createCustomIcon('🍻', 'bg-red');    // Pour boire/fête
var iconFood  = createCustomIcon('🍔', 'bg-yellow'); // Pour manger
var iconCoffee= createCustomIcon('☕', 'bg-blue');   // Pour étudier (cafés)
var iconPark  = createCustomIcon('🌳', 'bg-green');  // Parcs
var iconEvent = createCustomIcon('🎉', 'bg-red');    // Rue de la soif
var iconMarket= createCustomIcon('🛒', 'bg-yellow'); // Marché


// --- AJOUT DES LIEUX (LES VOILÀ DE RETOUR !) ---

// 🍻 BOIRE UN VERRE
addMarker(50.6322, 3.0550, iconEvent, 'events', 
    "<b>Rue Solférino (Rue de la Soif)</b><br>Le QG des étudiants en soirée.");

addMarker(50.6360, 3.0590, iconParty, 'events', 
    "<b>La Trav Bar</b><br>Ambiance étudiante conviviale, idéal avant de sortir.");

addMarker(50.6405, 3.0600, iconParty, 'events', 
    "<b>La Capsule</b><br>Le temple de la bière artisanale. Bonne ambiance.");

addMarker(50.6373, 3.0614, iconParty, 'events', 
    "<b>Dernier Bar avant la Fin du Monde</b><br>Cocktails créatifs & culture Geek.");

// 🍽️ MANGER
addMarker(50.6366, 3.0637, iconFood, 'food', 
    "<b>Café Joyeux</b><br>Cuisine solidaire et ambiance douce.");

addMarker(50.6420, 3.0580, iconFood, 'food', 
    "<b>OHAMO</b><br>Bistro moderne, sain et relax.");

addMarker(50.6393, 3.0645, iconFood, 'food', 
    "<b>Paddo Café</b><br>Le spot brunch incontournable.");

addMarker(50.6349, 3.0455, iconFood, 'food', 
    "<b>All Resto (Crous)</b><br>Prix étudiants imbattables.");

addMarker(50.6272, 3.0515, iconMarket, 'food', 
    "<b>Marché de Wazemmes</b><br>Mardi, Jeudi & Dimanche. Le moins cher !");

// ☕ ÉTUDIER
addMarker(50.6338, 3.0667, iconCoffee, 'study', 
    "<b>Coffee Makers</b><br>Le meilleur café pour bosser (Wifi top).");

addMarker(50.6392, 3.0595, iconCoffee, 'study', 
    "<b>CUP Tiny Café</b><br>Petit, cosy, parfait pour une session focus.");

addMarker(50.6335, 3.0570, iconCoffee, 'study', 
    "<b>Mü Café</b><br>Ambiance relax pour réviser sans stress.");

addMarker(50.6360, 3.0630, iconCoffee, 'study', 
    "<b>Columbus Café (Rihour)</b><br>Grandes tables, souvent rempli d'étudiants.");

// 🌳 PARCS
addMarker(50.6258, 3.0665, iconPark, 'study', 
    "<b>Parc Jean-Baptiste Lebas</b><br>Pique-nique et révisions sur l'herbe.");

addMarker(50.6370, 3.0470, iconPark, 'study', 
    "<b>Parc de la Citadelle (Vauban)</b><br>Le poumon vert pour courir ou chiller.");


// --- 4. FILTRAGE ET ANIMATION "SLIDING PILL" ---

// Fonction pour bouger la pilule violette
function moveHighlighter(targetBtn) {
    const highlighter = document.getElementById('filter-highlighter');
    const wrapper = document.querySelector('.filter-group');
    
    if (!highlighter || !wrapper) return;

    // On vérifie si on est en mode Vertical (PC) ou Horizontal (Mobile)
    const isVertical = window.getComputedStyle(wrapper).flexDirection === 'column';

    if (isVertical) {
        // MODE PC : On bouge de haut en bas
        highlighter.style.width = '100%';
        highlighter.style.height = targetBtn.offsetHeight + 'px';
        highlighter.style.top = targetBtn.offsetTop + 'px';
        highlighter.style.left = '0';
    } else {
        // MODE MOBILE : On bouge de gauche à droite
        highlighter.style.height = '100%';
        highlighter.style.width = targetBtn.offsetWidth + 'px';
        highlighter.style.left = targetBtn.offsetLeft + 'px';
        highlighter.style.top = '0';
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    const allBtn = document.getElementById('filter-all');
    // Petit délai pour assurer que le CSS est chargé
    if(allBtn) setTimeout(() => moveHighlighter(allBtn), 100);
});

// Recalcul si on redimensionne la fenêtre (passage PC <-> Mobile)
window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.filter-option.active');
    if (activeBtn) moveHighlighter(activeBtn);
});

// La nouvelle fonction de filtrage appelée par onclick
window.filterMap = function(category) {
    // 1. GESTION DE L'ANIMATION
    const clickedBtn = event.currentTarget; // Le bouton cliqué
    
    // Reset classes
    document.querySelectorAll('.filter-option').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    
    // Animation
    moveHighlighter(clickedBtn);

    // 2. LOGIQUE DE LA CARTE
    // Reset recherche texte
    document.getElementById('search-input').value = "";

    allMarkers.forEach(marker => {
        if (category === 'all' || marker.category === category) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
        }
    });
};


// --- 5. FILTRAGE PAR RECHERCHE (Search Bar) ---
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (e) => {
    // Ce que l'utilisateur tape (en minuscule)
    const term = e.target.value.toLowerCase();
    
    // On récupère les nouveaux boutons pour gérer leur état visuel
    const filterOptions = document.querySelectorAll('.filter-option');
    const allBtn = document.getElementById('filter-all');

    // GESTION VISUELLE DES BOUTONS
    if(term.length > 0) {
        // Si on cherche, on enlève le violet de tous les filtres
        filterOptions.forEach(b => b.classList.remove('active'));
        // On cache la pilule violette temporairement (optionnel, ou on la met sur 0)
        const highlighter = document.getElementById('filter-highlighter');
        if(highlighter) highlighter.style.width = '0px';

    } else {
        // Si on efface la recherche, on remet "All" actif par défaut
        if(allBtn) {
            allBtn.classList.add('active');
            // IMPORTANT : On remet la pilule violette sur "All"
            if(typeof moveHighlighter === "function") {
                moveHighlighter(allBtn);
            }
        }
    }

    // LOGIQUE DE RECHERCHE
    allMarkers.forEach(marker => {
        // On vérifie si marker.searchText existe avant de chercher dedans
        if (marker.searchText && marker.searchText.includes(term)) {
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
            if (type === 'activity') { emoji = '🎳'; colorClass = 'bg-pink'; }

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

            saveUserEvents();

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
    if (confirm("Are you sure you want to delete this event?")) {
        // On cherche le marqueur qui a cet ID précis
        const markerToDelete = allMarkers.find(marker => marker.data && marker.data.id === id);
        
        if (markerToDelete) {
            // On le marque comme "plus un événement utilisateur" pour qu'il ne soit pas sauvegardé
            markerToDelete.isUserEvent = false;
            
            saveUserEvents(); // On sauvegarde la liste (sans cet événement)
            location.reload(); // On recharge pour mettre à jour
        }
    }
};

// Fonction appelée par le bouton ✏️
window.editEvent = function(id) {
    // On cherche le marqueur par son ID
    const marker = allMarkers.find(m => m.data && m.data.id === id);
    
    if (marker) {
        // 1. On remplit le formulaire
        document.getElementById('event-name').value = marker.data.name;
        document.getElementById('event-address').value = marker.data.address;
        document.getElementById('event-city').value = marker.data.city;
        document.getElementById('event-type').value = marker.data.type;
        document.getElementById('event-desc').value = marker.data.desc;

        // 2. Interface
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.textContent = "Update Event 🔄";
        currentEditingMarker = marker; // On garde en mémoire lequel on modifie
        
        // 3. Ouvre la modale
        modal.classList.add('open');
        modal.querySelector('h2').textContent = "✏️ Edit Activity";
    }
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

/* --- LOGIQUE DU TCHAT --- */

const chatDrawer = document.getElementById('chat-drawer');
const chatToggle = document.getElementById('chat-toggle');
const closeChatBtn = document.getElementById('close-chat');

// Ouvrir / Fermer le tiroir
chatToggle.addEventListener('click', () => {
    chatDrawer.classList.toggle('open');
});

closeChatBtn.addEventListener('click', () => {
    chatDrawer.classList.remove('open');
});

// Navigation Liste <-> Conversation
const listView = document.getElementById('chat-list-view');
const convoView = document.getElementById('chat-conversation-view');
const chatTitle = document.getElementById('current-chat-name');

// Fonction appelée quand on clique sur une personne dans la liste
window.openConversation = function(name, isGroup) {
    listView.classList.remove('active');
    convoView.classList.add('active');
    
    chatTitle.textContent = name;
    
    // Si c'est un groupe, on pourrait changer l'icône etc.
}

// Fonction retour arrière
window.closeConversation = function() {
    convoView.classList.remove('active');
    listView.classList.add('active');
}

// --- 9. SYSTÈME DE SAUVEGARDE (LOCALSTORAGE) ---

function saveUserEvents() {
    // 1. On filtre pour ne garder que les événements créés par l'utilisateur
    // (Ceux qui ont la propriété 'isUserEvent' que nous avons ajoutée plus tôt)
    const userEvents = allMarkers
        .filter(marker => marker.isUserEvent) 
        .map(marker => marker.data); // On ne garde que les données (Nom, adresse...), pas l'objet Leaflet entier

    // 2. On sauvegarde en texte dans la mémoire du navigateur
    localStorage.setItem('citymate_events', JSON.stringify(userEvents));
    console.log("Events saved!", userEvents);
}

// --- 10. CHARGEMENT AU DÉMARRAGE ---

function loadUserEvents() {
    const savedData = localStorage.getItem('citymate_events');
    
    if (savedData) {
        const events = JSON.parse(savedData);
        
        events.forEach(data => {
            // On recrée l'icône
            let emoji = '📍';
            let colorClass = '';
            if (data.type === 'party') { emoji = '🎉'; colorClass = 'bg-red'; }
            if (data.type === 'food')  { emoji = '🍔'; colorClass = 'bg-yellow'; }
            if (data.type === 'study') { emoji = '📚'; colorClass = ''; }
            if (data.type === 'sport') { emoji = '⚽'; colorClass = 'bg-green'; }
            if (data.type === 'activity') { emoji = '🎳'; colorClass = 'bg-pink'; }

            const newIcon = createCustomIcon(emoji, colorClass);
            
            // On remet le marqueur sur la carte sans rappeler l'API !
            addMarker(
                data.lat, 
                data.lng, 
                newIcon, 
                data.type, 
                `<b>${data.name}</b><br>${data.desc}<br><i>📍 ${data.address}, ${data.city}</i>`,
                true,
                data
            );
        });
    }
}

// Lancer le chargement
loadUserEvents();

// --- 11. GÉOLOCALISATION ---

const locateBtn = document.getElementById('locate-btn');
let userMarker = null;

// On stocke le code HTML de l'icône flèche pour pouvoir la remettre après le chargement
const arrowSVG = `
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
       <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
   </svg>`;

if (locateBtn) {
    locateBtn.addEventListener('click', () => {
        // Feedback visuel (Spinner simple)
        locateBtn.innerHTML = '⏳'; 
        locateBtn.classList.add('loading');

        map.locate({
            setView: true,
            maxZoom: 16
        });
    });

    // SUCCÈS
    map.on('locationfound', (e) => {
        // 1. On remet l'icône Flèche (au lieu de l'émoji 📍)
        locateBtn.innerHTML = arrowSVG;
        locateBtn.classList.remove('loading');
        
        // Petit bonus visuel : on colore le bouton en bleu pour dire "C'est actif"
        locateBtn.style.color = '#0984e3';

        if (userMarker) {
            map.removeLayer(userMarker);
        }

        const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="
                background-color: #0984e3; 
                width: 20px; height: 20px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                animation: pulse 2s infinite;">
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        userMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map);
        
        // 2. SUPPRESSION DU POPUP : La ligne bindPopup a été retirée !
        // On ne fait rien d'autre, le zoom se fait tout seul via setView: true
    });

    // ERREUR
    map.on('locationerror', (e) => {
        locateBtn.innerHTML = arrowSVG; // On remet l'icône
        locateBtn.classList.remove('loading');
        alert("⚠️ Impossible de vous localiser.");
    });
}