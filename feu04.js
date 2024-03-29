// Trouver le plus grand carré

const argTester = () => {

    const argument = process.argv.slice(2);
    const errorMsg = "Erreur: ";
    const fileFormats = [".txt", ".md"];

    const boardObj = {};
    boardObj.value = [];

    if (argument.length !== 1) {

        console.log(errorMsg + "Veuillez passer le chemin du fichier en argument.");
        console.log("Exemple: node feu04.js feu04_files/board1.txt");
        return false;

    } else {

        filePath = argument[0];

    }

     // Check les formats de fichiers 
     if (!checkFileFormat(filePath, fileFormats)) {

        console.log(errorMsg + "Vérifier le chemin et le format du fichier. (Format(s) lisible(s) : " + fileFormats + ").");
        return false;

    }

    const fileValue = getTxtArr(filePath);

    if (!fileValue) {

        console.log("Erreur : le fichier n'existe pas (Vérifier le chemin du fichier).");
        return false;

    }

    const boardSettings = fileValue[0];

    // checker les infos du plateau
    const boardInfoPattern = /^[1-9][0-9]*\D{3}$/g;
    const testBoardInfos = boardInfoPattern.test(boardSettings);
    const boardSettingsArr = boardSettings.split('');

    const lineNumArr = [];
    
    if (!testBoardInfos) {
        console.log("Erreur: la première ligne du fichier doit contenir les 4 informations pour lire le plateau");
        console.log("- nombre de lignes du plateau");
        console.log('- caractères pour “vide”, “obstacle” et “plein”');
        return false;
    }

    for (let i = 0; i < boardSettingsArr.length -3; i++) {
        lineNumArr.push(boardSettingsArr[i]);
    }
   
    const boardLine = parseInt(lineNumArr.join(''));
    boardObj.rowNum = boardLine;
    
    // récupérer dans l'objet du plateau les informations pour le lire
    boardObj.voidChar = boardSettings[boardSettingsArr.length -3];
    boardObj.obsChar = boardSettings[boardSettingsArr.length -2];
    boardObj.fillChar = boardSettings[boardSettingsArr.length -1];

    if (fileValue.length - 1 !== boardObj.rowNum) {
        console.log("Erreur: le nombre de lignes du plateau ne correspond pas à celui spécifié dans les informations en première ligne du fichier.");
        return false;
    }

    boardObj.colNum = fileValue[1].length;

    // identifier la dimension potentielle max d'un carré, en fonction de la longueur des côtés du plateau.    
    boardObj.maxDimension = boardObj.rowNum >= boardObj.colNum ? boardObj.colNum : boardObj.rowNum;

    let caseId = 0;

    for (let i = 1; i < fileValue.length; i++) {

        if (fileValue[i].length !== boardObj.colNum) {
            
            console.log("Erreur : les lignes du plateau ne sont pas de la même longueur.");
            return false;

        } else {

            for (let j = 0; j < fileValue[i].length; j++) {
                
                // création des objets pour chaque case du plateau
                const caseObj = {
                    id: caseId,
                    row: i - 1,
                    col: j,
                    caseValue: fileValue[i][j]
                };

                boardObj.value.push(caseObj);

                caseId++;
            }

        }   

    }

    for (let i = 0; i < boardObj.value.length; i++) {

        if (boardObj.value[i].caseValue !== boardObj.voidChar && boardObj.value[i].caseValue !== boardObj.obsChar) {
            console.log("Erreur: le plateau ne doit être composé que des caractères vides et obstacles, spécifiés en première ligne");
            return false;
        }

    }

    // création de méthodes pour manipuler des données dans l'objet du plateau
    
    // retourne l'objet d'une case du plateau, en fonction de son ID
    boardObj.getCaseObj = (caseId) => {return boardObj.value[caseId]};
    
    // retourne l'ID de la dernière case d'un carré, en fonction de l'ID de la première case, et la taille du carré
    boardObj.getSqrEndId = (sqrStartId, dimension) => {

        if (dimension === 0) {
            return false;
        }

        const startCaseObj = boardObj.getCaseObj(sqrStartId);
        const endCaseCol = startCaseObj.col - 1 + dimension;
        const endCaseRow = startCaseObj.row - 1 + dimension;

        for (let i = sqrStartId; i < boardObj.value.length; i++) {

            if (boardObj.value[i].col === endCaseCol && boardObj.value[i].row === endCaseRow) {
                return boardObj.value[i].id;
            }

        }

    }
    
    // retourne la liste des ID des cases composant un carré, en fonction de l'ID de la première case et la taille du carré
    boardObj.getSqrCasesId = (sqrStartId, dimension) => {

        const sqrEndId = boardObj.getSqrEndId(sqrStartId, dimension);
        const startCase = boardObj.getCaseObj(sqrStartId);
        const endCase = boardObj.getCaseObj(sqrEndId);
        const caseIdArr = [];

        for (let i = sqrStartId; i <= sqrEndId; i++) {

            const caseToCheck = boardObj.getCaseObj(i);
            const checkCaseRow = caseToCheck.row >= startCase.row && caseToCheck.row <= endCase.row;
            const checkCaseCol = caseToCheck.col >= startCase.col && caseToCheck.col <= endCase.col;

            if (checkCaseRow && checkCaseCol) {
                caseIdArr.push(caseToCheck.id);                
            }

        }

        if (caseIdArr.length === 0) {
            return false;
        }

        return caseIdArr;

    }
    
    // vérifie qu'un carré est valide (aucune case ne comporte d'obstacle)
    boardObj.isValidSquare = (sqrStartId, dimension) => {

        const sqrCasesIds = boardObj.getSqrCasesId(sqrStartId, dimension);

        if (!sqrCasesIds) {
            return false;
        }


        for (let i = 0; i < sqrCasesIds.length; i++) {
            const caseToCheck = boardObj.getCaseObj(sqrCasesIds[i]);

            if (caseToCheck.caseValue === boardObj.obsChar) {
                return false;
            }

        }

        return true;

    }
    
    // évalue la taille maximal du carré que l'on peut obtenir
    // La méthode prend en argument, l'ID d'une case (supposée être la première case du carré)
    boardObj.getMaxDimension = (caseId) => {

        const caseToCheck = boardObj.getCaseObj(caseId);

        if (caseToCheck.caseValue === boardObj.obsChar) {
            return 0;
        }

        for (let i = boardObj.maxDimension; i >= 1; i--) {

            const testValidSquare = boardObj.isValidSquare(caseId, i);

            if (testValidSquare) {
                return i;
            }
        }

        return 0;

    }
    
    // calcule pour chaque case, le plus grand carré que l'on puisse obtenir
    boardObj.getAllMaxDimension = () => {

        for (let i = 0; i < boardObj.value.length; i++) {

            boardObj.value[i].maxDimension = boardObj.getMaxDimension(boardObj.value[i].id);

        }

    }
    
    // affiche le plateau dans la console
    boardObj.printBoard = () => {

        const mainArr = [];
        let rowTracker = boardObj.value[0].row;
        let rowArr = [];

        for (let i = 0; i < boardObj.value.length; i++) {
            

            if (rowTracker !== boardObj.value[i].row) {

                mainArr.push(rowArr);
                rowArr = [];

                rowTracker++;
            }

            rowArr.push(boardObj.value[i].caseValue);

        }

        mainArr.push(rowArr);
        rowArr = [];

        for (let i = 0; i < mainArr.length; i++) {

            console.log(mainArr[i].join(''));
            
        }

    }
    
    // affiche tous les objets case composant le plateau
    boardObj.printAllData = () => {

        boardObj.getAllMaxDimension();

        for (let i = 0; i < boardObj.value.length; i++) {
            console.log(boardObj.value[i]);
        }

    }
    
    // recherche dans le plateau le premier carré que l'on puisse trouver, en fonction de sa taille
    boardObj.getFirstSquare = (dimensionToTest) => {

        boardObj.getAllMaxDimension();

        for (let i = 0; i < boardObj.value.length; i++) {

            if (boardObj.value[i].maxDimension === dimensionToTest) {

                return boardObj.value[i].id;

            }

        }

        return false;

    }
    
    // recherche dans le plateau le plus grand carré que l'on puisse trouver
    boardObj.getBiggestSquare = () => {

        for (let i = boardObj.maxDimension; i !== 0; i--) {

            const test = boardObj.getFirstSquare(i);
            if (test || test === 0) {
                return test;
            }

        }

        return false;

    }
    
    // écrit sur le plateau le plus grand carré 
    boardObj.writeBiggestSquare = () => {

        const firstCaseId = boardObj.getBiggestSquare();
        const firstCaseObj = boardObj.getCaseObj(firstCaseId);

        if (!firstCaseObj) {
            return false;
        }

        const squareCaseIds = boardObj.getSqrCasesId(firstCaseId, firstCaseObj.maxDimension);

        for (let i = 0; i < squareCaseIds.length; i++) {
            const caseToCheck = boardObj.getCaseObj(squareCaseIds[i]);
            caseToCheck.caseValue = boardObj.fillChar;
        }

    }

    return boardObj;

}

const checkFileFormat = (filePath, formatArr) => {

    for (let i = 0; i < formatArr.length; i++) {

        if (filePath.endsWith(formatArr[i])) {

            return filePath;

        }

    }

    return false;

}

// Récupérer les valeurs texte des fichiers
const getTxtArr = (file) => {

    try {

        const txtArr = [];

        const readline = require('readline');
        const fs = require('fs');
        const data = fs.readFileSync(file, 'utf8');

        // split the contents by new line
        const lines = data.split(/\r?\n/);

        lines.forEach((line) => {
            txtArr.push(line);
        });

        return txtArr;

    } catch (error) {

        return false;

    }

}

const main = () => {

    const boardObj = argTester();

    if (boardObj) {

        boardObj.writeBiggestSquare()
        boardObj.printBoard();

    }
}

main();
