# 🗺️ CityMate - Student City Guide (Lille Edition)

## 📝 Description du Projet
CityMate est une application web progressive (PWA) destinée aux étudiants lillois. Elle permet de découvrir les meilleurs spots de la ville (bars, restos, lieux d'étude), de localiser ses amis et d'organiser des événements spontanés.
L'application est conçue avec une approche **"Mobile and Laptop Usability"** et un design moderne en **Glassmorphism**.

---

## ✨ Fonctionnalités Actuelles

### 1. Carte Interactive (Map)
- **Moteur :** Leaflet.js avec fond de carte CartoDB (Voyager).
- **Marqueurs Personnalisés :**
  - Design moderne avec dégradés de couleurs (Gradients).
  - Bordure blanche et ombre portée pour effet 3D.
  - Icônes spécifiques par catégorie (🍺, 🍔, 📚, 🌳, 🛒).
- **Données Réelles :** Intégration de lieux populaires à Lille (Rue Solférino, Café Joyeux, Crous, Citadelle, etc.).
- **Bouton Itinéraire :** Chaque popup contient un bouton "🚀 Itinéraire" qui ouvre Google Maps/Waze automatiquement.

### 2. Système de Filtres Hybride (UI/UX)
- **Navigation "Sliding Pill" :** Une pilule violette animée suit la sélection.
- **Adaptabilité (Responsive) :**
  - **Mobile :** Barre horizontale en bas avec émojis uniquement (gain de place).
  - **Desktop :** Liste verticale transparente en haut à gauche avec texte complet.
- **Recherche :** Barre de recherche en temps réel qui filtre les marqueurs par nom.

### 3. Création d'Événements (Host Activity)
- **Formulaire Complet :** Nom, Adresse, Ville, Catégorie, Description.
- **Gestion Date & Heure :**
  - Ajout de sélecteurs `date` et `time`.
  - **Sécurité :** Impossible de sélectionner une date antérieure à aujourd'hui.
- **Géocodage :** Conversion automatique de l'adresse en coordonnées GPS via l'API OpenStreetMap (Nominatim).
- **Persistance :** Sauvegarde des événements dans le `localStorage` du navigateur.
- **Auto-Nettoyage :** Les événements dont la date/heure est passée sont supprimés automatiquement au chargement de la page.

### 4. Design & Thème
- **Thème Sombre :** Fond `#0f0f12` avec éléments en transparence (Glassmorphism).
- **Correctifs UI :**
  - Adaptation des `select` (listes déroulantes) pour être lisibles sur fond sombre.
  - Adaptation des `select` (listes déroulantes) pour être lisibles sur fond sombre.
  - Calendriers (Datepicker) forcés en mode sombre.

### 5. Deals & Avantages Étudiants (Redesign)
- **Design Coupons "Dual-Action" :**
  - **Mobile :** Affichage vertical (Marque/Offre au-dessus, Code en-dessous).
  - **Laptop :** Ticket horizontal large (Offre à gauche, Code à droite avec ligne pointillée).
- **Pop-up "More Info" :** Chaque deal possède un bouton info (i) ouvrant les conditions spécifiques (horaires, exclusions) sans encombrer la carte.
- **Interaction :** Copie du code au clic avec feedback visuel.

### 6. Guides de Survie (Modal Reader)
- **Lecture Focus Texte :** Design épuré sans distractions (pas d'images lourdes).
- **Modale Text-Only :** Largeur optimisée (800px max) et typographie ajustée pour un confort de lecture maximal sur tous les écrans.
- **Contenu Riche :** Supporte le HTML (h3, listes, astuces encadrées).

---

## 🛠️ Architecture Technique

- **Langages :** HTML5, CSS3, JavaScript (Vanilla ES6).
- **Librairies :**
  - `Leaflet.js` (Carte).
  - `Nominatim API` (Géocodage adresses).
- **Stockage :** `localStorage` (pour garder les événements utilisateur après fermeture).
- **CSS :** Utilisation de CSS Variables (`var(--accent-color)`), Flexbox et Grid.

---

## 📅 Journal des Modifications (Changelog)

### [Dernières modifications]
- **Feature :** Ajout de la logique "Auto-Delete". Si `Date Event < Date Actuelle`, l'événement est supprimé du stockage et de la carte.
- **Feature :** Ajout de la contrainte `min` sur le calendrier pour bloquer les dates passées.
- **UI Update :** Transformation des marqueurs plats en sphères avec dégradés (Gradients CSS).
- **UI Fix :** Correction du menu déroulant "Category" qui s'affichait en blanc (forcé en `#1a1a1d`).
- **Feature :** Ajout du bouton "Itinéraire" générant un lien dynamique `maps.google.com` dans les popups.
- **Data :** Remplacement des données bidons par de vraies adresses lilloises géolocalisées.
- **UI Fix :** Suppression des rectangles gris parasites sous les filtres en mode Desktop.
- **UI Update :** Passage des filtres en mode "Emojis seuls" sur mobile pour l'esthétique.
### [Dernières modifications - Session de Polish]
- **Deals :** Refonte complète du design "Ticket" (Responsive Vertical/Horizontal). Ajout de la modale "Conditions".
- **Guides :** Suppression des images "Hero" dans les modales pour un design 100% utilitaire et rapide (Text-First).
- **Responsive :** Optimisation majeure du CSS pour Laptop/Desktop (Grilles sur 2-3 colonnes, modales larges, conteneurs centrés).
- **Mobile UX :** Amélioration de la lisibilité des textes (padding et interlignage augmentés).
