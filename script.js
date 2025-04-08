let jsonData; // variable contenant les données sous format JSON
const selectFile = document.getElementById("select-file");

// Récupérer le champ pour envoyer le fichier tableur et le transformer en json 
function UserSelectFile(event){
    console.log("The user selected a file !");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Prend la première feuille
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];

        // Convertit en JSON
        jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Affiche dans la console
        console.log(jsonData);

        // désactive la div pour choisir un fichier
        selectFile.style.display = "none";
    };

    reader.readAsArrayBuffer(file);
}



// TODO liste : 
/*
*D'abord l'utilisateur va donner le fichier excel
Affiché les données dans un tableau pour être sûr que ca fonctionne bien ?
Ensuite le programme va demander quelles sont les champs descriptif (menu de sélection avec des cases à cocher, certaine cases coché de base si elles sont présente nom, email, prenon, classe, ect...)
Une fois l'étape précédente validé, il sera sur une page divisé en 2, avec à gauche les personnes qui n'ont pas payé et à droite les personnes qui ont payé 
Dans ces deux case ont peut filtrer avec la fonction de distance de leveintein 
On peut transférer une personne d'un coté ou de l'autre
En haut il y a le nombre de personne de chaque coté
Quand on clique sur une personne ca nous affiche tout les informations sur son menu



POUVOIR EXPORTER QUI A PAYE OU NON

POSTER LE SITE SUR GITHUB
*/