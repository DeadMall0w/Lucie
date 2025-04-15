// Données JSON parsées depuis le fichier Excel
let spreadsheetData;
let selectedElements;
// Éléments du DOM
const fileInputContainer = document.getElementById("select-file");
const selectElement = document.getElementById("descriptif-select");
const container1 = document.getElementById("container1");
const container2 = document.getElementById("container2");
const container3 = document.getElementById("container3");
const container = document.getElementById("container");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupField = document.getElementById("popupField");
const noteInput = document.getElementById("noteInput");

const searchInput = document.getElementById("search");

const descriptifFields = document.getElementById("descriptifs-fields");

const searchWrapper = document.getElementById("search-wrapper");
// Champs à sélectionner automatiquement (en minuscules)
const autoSelectedFields = ["prénom", "prenom", "nom", "promo", "tel"];


let selectedPerson = -1;
let isPopupOpen = false;


// ajout des raccourcis clavier 
document.addEventListener("keydown", function(e) {
    // Echap est placé ici, car même si on est entrain d'écrire on veut quitter le menu
    if (e.key == "Escape"){
        if (isPopupOpen){
            hidePopup();
        }
    }
    // Si on est en train de taper dans un champ texte, on ignore
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    switch (e.key) {
        case "Enter":
            if (isPopupOpen){
                hidePopup();
            }
            break;            
            case " ":
        case "Spacebar": // vieux navigateurs
            e.preventDefault(); // Évite le scroll
            break;
        case "f":
        case "F":
            console.log("Touche F pressée");
            break;
        case "Escape":
            if (isPopupOpen){
                hidePopup();
            }
            break;
        case "1":
            console.log("Touche 1 pressée");
            break;
        case "2":
            console.log("Touche 2 pressée");
            break;
        case "3":
            console.log("Touche 3 pressée");
            break;
    }
});

function init(){

    // Demande une confirmation avant de faire de recharger la page
    // window.addEventListener("beforeunload", function (e) {
    //     e.preventDefault(); // Nécessaire pour certains navigateurs
    //     e.returnValue = ""; // Obligatoire pour afficher le prompt de confirmation
    // });


    container.style.display = "none";
    descriptifFields.style.display = "none";
    fileInputContainer.style.display = "block";
    popup.style.display = "none";
    searchWrapper.style.display = "none";
}
/*
 * Fonction appelée lors de la sélection d'un fichier Excel par l'utilisateur
*/
function handleFileSelection(event) {
    console.log("Fichier sélectionné par l'utilisateur.");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Conversion de la feuille en JSON
        spreadsheetData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // On ajoute le champ catégorie à chaque objet
        spreadsheetData.forEach(obj => {
            obj._categorie = 0;
        });

        console.log(spreadsheetData);

        // Cache l'input de fichier et génère le <select>
        fileInputContainer.style.display = "none";
        descriptifFields.style.display = "block";

        //TODO : rajouter des vérifications (notamment si des champs ont le nom : _note ou _categorie)
        populateDescriptiveFieldsSelect();
    };
    
    reader.readAsArrayBuffer(file);
}

/*
 * Crée les options du <select> en fonction des clés du fichier Excel
*/
function populateDescriptiveFieldsSelect() {
    if (!Array.isArray(spreadsheetData) || spreadsheetData.length === 0) {
        console.warn("Les données Excel sont vides ou invalides.");
        return;
    }

    const columnNames = Object.keys(spreadsheetData[0]);
    selectElement.innerHTML = ""; // vide les options existantes

    columnNames.forEach(columnName => {
        if (columnName == "_note" || columnName == "_categorie") return;
        const option = document.createElement("option");
        option.value = columnName;
        option.textContent = columnName;

        if (autoSelectedFields.includes(columnName.toLowerCase())) {
            option.selected = true;
        }

        selectElement.appendChild(option);
    });

}

// Fonction pour récupérer sur quels sont les éléments que l’utilisateur à coché 
function getSelectedOptionValues() {
    const selectedOptions = Array.from(selectElement.selectedOptions);
    selectedElements = selectedOptions.map(option => option.value);
}

function UserValidateDescriptiveOptions(){
    getSelectedOptionValues();  // On récupère les données sélectionné par l'utilisateur  
    displayCommandes(); // On instancie toutes les commandes
    descriptifFields.style.display = "none";
    container.style.display = "flex";
    searchWrapper.style.display = "block";
}


function displayCommandes(){

    //! il faut tout supprimer avant 
    KillAllChild(container1);
    KillAllChild(container3);
    KillAllChild(container2);

    // Instancie dans les trois containers
    createElements();
    
}


function createElements(){


    const searchValue = searchInput.value.trim();
    if(searchValue != ""){
        let filteredData = filterAndSortElements(spreadsheetData, searchValue, 2);

        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].data._categorie == 0){
                createCommandeElement(filteredData[i].data, container1, filteredData[i].key);
            }else if(filteredData[i].data._categorie == 1){
                createCommandeElement(filteredData[i].data, container2, filteredData[i].key);
            }else if(filteredData[i].data._categorie == 2){
                createCommandeElement(filteredData[i].data, container3, filteredData[i].key);
            }
        }
    }else{
        Object.entries(spreadsheetData).forEach(([key, value]) => {
                if (value._categorie == 0){
                    createCommandeElement(value, container1, key);
                }else if(value._categorie == 1){
                    createCommandeElement(value, container2, key);
                }else if(value._categorie == 2){
                    createCommandeElement(value, container3, key);
                }
        });
    }
}

function filterAndSortElements(elements, searchQuery, threshold = 3) {
    const query = searchQuery.trim().toLowerCase();

    return Object.entries(elements)
        .map(([key, data]) => {

            let fields = [];
            for (let i = 0; i < selectedElements.length; i++) {
                fields.push(data[selectedElements[i]]);
            }
            // console.log(fields);
            const distances = fields.map(field =>
                levenshtein(query, (field || "").toLowerCase())
            );
            const minDistance = Math.min(...distances);
            return { key, data, distance: minDistance };
        })
        .filter(item => item.distance <= threshold)
        .sort((a, b) =>  a.distance - b.distance);
}

function createCommandeElement(data, parent, id) {
    const fieldset = document.createElement("div");
    fieldset.classList.add("element");

    const legend = document.createElement("p");

    // TODO : Il y a moyen de regrouper les deux boucles en une seule même, mais est-ce vrm utile ?

    // créer la légende
    Object.entries(data).forEach(([key, value]) => { 
        if (selectedElements.includes(key)){ // TODO : rajouter un tri pour savoir quels éléments sont affiché en premier ?
            legend.textContent += value + " - ";
        }
    });

    // rajoute la légende dans le fieldset
    fieldset.appendChild(legend);

    // Crée dynamiquement les <p> pour chaque champ à afficher
    // Object.entries(data).forEach(([key, value]) => {
    //     if (selectedElements.includes(key)) return;

    //     const p = document.createElement("p");
    //     p.textContent = `${key} : ${value}`;
    //     fieldset.appendChild(p);
    // });

    if(data._note != ""){
        const note = document.createElement("p");
        note.classList.add("noteText");
        note.textContent = data._note;
        fieldset.appendChild(note);
    }
    
    
    fieldset.addEventListener('click', function () {
        ShowPopup(this); // `this` ici fait référence à l'élément cliqué
    });

    fieldset.id = id;

    parent.appendChild(fieldset);
}

// Fonction appelé quand on clique sur élément 
function ShowPopup(element){
    isPopupOpen = true;
    popup.style.display = "block";
    selectedPerson = element.id;
    popupTitle.textContent = "";
    Object.entries(spreadsheetData[selectedPerson]).forEach(([key, value]) => { 
        if (selectedElements.includes(key)){ // TODO : rajouter un tri pour savoir quels éléments sont affiché en premier ?
            popupTitle.textContent += value + " - ";
        }
    });

    if(spreadsheetData[selectedPerson]._note != "" && spreadsheetData[selectedPerson]._note != undefined){
        noteInput.value = spreadsheetData[selectedPerson]._note;
    }else{
        noteInput.value = "";
    }

    KillAllChild(popupField);

    Object.entries(spreadsheetData[selectedPerson]).forEach(([key, value]) => {
        // Permet d'enlever les éléments deja affichés, ou ceux qui sont utilisé pour le fonctionnement de l'application (_note, _categorie)
        if (selectedElements.includes(key) || key == "_note" || key == "_categorie") return;

        const p = document.createElement("p");
        p.textContent = `${key} : ${value}`;
        popupField.appendChild(p);
    });

}


function hidePopup(){
    isPopupOpen = false;
    popup.style.display = "none";
    displayCommandes();    
}

function SwitchToPaidClass(){
    spreadsheetData[selectedPerson]._categorie = 2;
    hidePopup();
}

function SwitchToNoneServedClass(){
    spreadsheetData[selectedPerson]._categorie = 1;
    hidePopup();
}

function SwitchToNonePaidClass(){
    spreadsheetData[selectedPerson]._categorie = 0;
    hidePopup();
}


function changeCommandNote(){
    // console.log(noteInput.value);
    spreadsheetData[selectedPerson]["_note"] = noteInput.value;
}

// Don't worry, it's not real child, is it ?
function KillAllChild(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}



// fonction pour avoir le nombre de modification minimale entre deux mots (trouvé sur internet)
function levenshtein(query, target) {
    if (!query || !target) return Infinity;

    query = query.toLowerCase();
    target = target.toLowerCase();

    if (target.includes(query)) {
        return 0; // correspondance partielle directe
    }

    const m = query.length;
    const n = target.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (query[i - 1] === target[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],    // suppression
                    dp[i][j - 1],    // insertion
                    dp[i - 1][j - 1] // substitution
                );
            }
        }
    }

    return dp[m][n];
}



// Attache la fonction au champ fichier (si pas d'attribut inline dans HTML)
// document.getElementById("input-excel").addEventListener("change", handleFileSelection);
// TODO liste : 
/*
*D'abord l'utilisateur va donner le fichier excel
Afficher les données dans un tableau pour être sûr que ca fonctionne bien ?
*Ensuite le programme va demander quelles sont les champs descriptif (menu de sélection avec des cases à cocher, certaine cases coché de base si elles sont présente nom, email, prenon, classe, ect...)
*Une fois l'étape précédente validé, il sera sur une page divisé en 2, avec à gauche les personnes qui n'ont pas payé et à droite les personnes qui ont payé 
*Dans ces deux case ont peut filtrer avec la fonction de distance de leveintein 
*On peut transférer une personne d'un coté ou de l'autre
En haut il y a le nombre de personne de chaque coté
*Quand on clique sur une personne ca nous affiche tout les informations sur son menu



POUVOIR EXPORTER QUI A PAYE OU NON

*POSTER LE SITE SUR GITHUB
*/


init(); // appelle à la fonction d'initialisation