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


const descriptifFields = document.getElementById("descriptifs-fields");


// Champs à sélectionner automatiquement (en minuscules)
const autoSelectedFields = ["prénom", "prenom", "nom", "promo", "tel"];


let selectedPerson = -1;

function init(){
    container.style.display = "none";
    descriptifFields.style.display = "none";
    fileInputContainer.style.display = "block";
    popup.style.display = "none";
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
            obj.categorie = 0;
        });

        console.log(spreadsheetData);

        // Cache l'input de fichier et génère le <select>
        fileInputContainer.style.display = "none";
        descriptifFields.style.display = "block";
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
}


function displayCommandes(){
    // createCommandeElement();
    
    
    //! il faut tout supprimer avant 
    KillAllChild(container1);
    KillAllChild(container3);
    KillAllChild(container2);

    // Instancie dans les trois containers
    createElements();
    
}


function createElements(){
    Object.entries(spreadsheetData).forEach(([key, value]) => {
        // console.log(value.categorie);
        if (value.categorie == 0){
            createCommandeElement(value, container1, key);
        }else if(value.categorie == 1){
            createCommandeElement(value, container2, key);
        }else if(value.categorie == 2){
            createCommandeElement(value, container3, key);
        }
    });
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

    
    
    
    fieldset.addEventListener('click', function () {
        ShowPopup(this); // `this` ici fait référence à l'élément cliqué
    });

    fieldset.id = id;

    parent.appendChild(fieldset);
}

// Fonction appelé quand on clique sur élément 
function ShowPopup(element){
    // console.log(spreadsheetData[element.id]);
    popup.style.display = "block";
    selectedPerson = element.id;
    popupTitle.textContent = "";
    Object.entries(spreadsheetData[selectedPerson]).forEach(([key, value]) => { 
        if (selectedElements.includes(key)){ // TODO : rajouter un tri pour savoir quels éléments sont affiché en premier ?
            popupTitle.textContent += value + " - ";
        }
    });

    KillAllChild(popupField);

    Object.entries(spreadsheetData[selectedPerson]).forEach(([key, value]) => {
        if (selectedElements.includes(key)) return;

        const p = document.createElement("p");
        p.textContent = `${key} : ${value}`;
        popupField.appendChild(p);
    });

}


function hidePopup(){
    popup.style.display = "none";
}

function SwitchToPaidClass(){
    spreadsheetData[selectedPerson].categorie = 2;
    displayCommandes();
    hidePopup();
}

function SwitchToNoneServedClass(){
    spreadsheetData[selectedPerson].categorie = 1;
    displayCommandes();
    hidePopup();
}

function SwitchToNonePaidClass(){
    spreadsheetData[selectedPerson].categorie = 0;
    displayCommandes();
    hidePopup();
}

// Don't worry, it's not real child, is it ?
function KillAllChild(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
// Attache la fonction au champ fichier (si pas d'attribut inline dans HTML)
// document.getElementById("input-excel").addEventListener("change", handleFileSelection);
// TODO liste : 
/*
*D'abord l'utilisateur va donner le fichier excel
Afficher les données dans un tableau pour être sûr que ca fonctionne bien ?
*Ensuite le programme va demander quelles sont les champs descriptif (menu de sélection avec des cases à cocher, certaine cases coché de base si elles sont présente nom, email, prenon, classe, ect...)
Une fois l'étape précédente validé, il sera sur une page divisé en 2, avec à gauche les personnes qui n'ont pas payé et à droite les personnes qui ont payé 
Dans ces deux case ont peut filtrer avec la fonction de distance de leveintein 
On peut transférer une personne d'un coté ou de l'autre
En haut il y a le nombre de personne de chaque coté
!Quand on clique sur une personne ca nous affiche tout les informations sur son menu



POUVOIR EXPORTER QUI A PAYE OU NON

POSTER LE SITE SUR GITHUB
*/


init(); // appelle à la fonction d'initialisation