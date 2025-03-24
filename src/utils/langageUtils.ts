import * as vscode from 'vscode';

/**
 * 📌 Convertit l'extension de fichier en langage de programmation et retourne le type de commentaire.
 */
export function getLanguageFromExtension(extension?: string): { language: string | null; commentType: string; multiLineComment: { start: string, end: string } | null } {
    const languageMap: Record<string, { language: string; commentType: string; multiLineComment: { start: string, end: string } | null }> = {
        "py": { language: "python", commentType: "#", multiLineComment: { start: '"""', end: '"""' } }, // Python : '#' et '""" """'
        "js": { language: "javascript", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // JavaScript : '//' et '/* ... */'
        "ts": { language: "typescript", commentType: "//", multiLineComment: { start: "/**", end: "*/" } }, // TypeScript : '//' et '/** ... */'
        "java": { language: "java", commentType: "//", multiLineComment: { start: "/**", end: "*/" } }, // Java : '//' et '/** ... */'
        "c": { language: "c", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // C : '//' et '/* ... */'
        "cpp": { language: "cpp", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // C++ : '//' et '/* ... */'
        "cs": { language: "csharp", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // C# : '//' et '/* ... */'
        "go": { language: "go", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // Go : '//' et '/* ... */'
        "rs": { language: "rust", commentType: "//", multiLineComment: { start: "/*", end: "*/" } }, // Rust : '//' et '/* ... */'
        "html": { language: "html", commentType: "<!--", multiLineComment: { start: "<!--", end: "-->" } }, // HTML : '<!-- ... -->'
        "css": { language: "css", commentType: "/*", multiLineComment: { start: "/*", end: "*/" } }, // CSS : '/* ... */'
        "json": { language: "json", commentType: "", multiLineComment: null }, // JSON : Pas de commentaires
        "xml": { language: "xml", commentType: "<!--", multiLineComment: { start: "<!--", end: "-->" } }, // XML : '<!-- ... -->'
        "sql": { language: "sql", commentType: "--", multiLineComment: { start: "/*", end: "*/" } }, // SQL : '--' et '/* ... */'
        "sh": { language: "bash", commentType: "#", multiLineComment: null }, // Bash : '#'
    };

    return extension && languageMap[extension] 
        ? languageMap[extension] 
        : { language: null, commentType: "", multiLineComment: null };
}

/**
 * 📌 Échappe les caractères spéciaux pour éviter les erreurs de regex.
 */
export function escapeRegExp(string: string): string {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * 📌 Extrait le dernier commentaire du fichier en fonction du langage détecté.
 */
export function extractLastUnresolvedComment(
    document: vscode.TextDocument, 
    languageId: string, 
    commentType: string, 
    multiLineComment: { start: string, end: string } | null
): string | null {
    
    const text = document.getText();
    let lastUnresolvedComment = null;
    let match;

    // 📌 Détection des commentaires sur une seule ligne
    if (commentType) {
        const singleLineRegex = new RegExp(`${escapeRegExp(commentType)}\\s*(.*)`, "g");
        while ((match = singleLineRegex.exec(text)) !== null) {
            const comment = match[1]?.trim();
            if (comment && !isFunctionAlreadyImplemented(document, comment, languageId)) {
                lastUnresolvedComment = comment;
            }
        }
    }

    // 📌 Détection des commentaires multi-lignes si applicable
    if (multiLineComment) {
        const escapedStart = escapeRegExp(multiLineComment.start);
        const escapedEnd = escapeRegExp(multiLineComment.end);
        const multiLineRegex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, "g");

        while ((match = multiLineRegex.exec(text)) !== null) {
            const comment = match[0]
                ?.replace(new RegExp(`^${escapedStart}`), "")
                .replace(new RegExp(`${escapedEnd}$`), "")
                .trim();

            if (comment && !isFunctionAlreadyImplemented(document, comment, languageId)) {
                lastUnresolvedComment = comment;
            }
        }
    }

    return lastUnresolvedComment;
}



export function isFunctionAlreadyImplemented(document: vscode.TextDocument, comment: string, languageId: string): boolean {
    const text = document.getText();
    
    // 📌 Extraction du nom probable de la fonction à partir du commentaire
    const functionName = extractFunctionNameFromComment(comment);

    if (!functionName) {
        return false; // Si on ne peut pas extraire un nom de fonction, ne pas considérer comme résolu
    }

    // 📌 Modèles de détection de fonctions pour chaque langage
    const functionPatterns: Record<string, RegExp> = {
        "python": new RegExp(`def\\s+${functionName}\\s*\\(`, "g"),
        "javascript": new RegExp(`function\\s+${functionName}\\s*\\(|const\\s+${functionName}\\s*\\=\\s*\\(.*?\\)\\s*=>`, "g"),
        "typescript": new RegExp(`function\\s+${functionName}\\s*\\(|const\\s+${functionName}\\s*\\=\\s*\\(.*?\\)\\s*=>`, "g"),
        "java": new RegExp(`public\\s+\\w+\\s+${functionName}\\s*\\(`, "g"),
        "c": new RegExp(`\\w+\\s+${functionName}\\s*\\(`, "g"),
        "cpp": new RegExp(`\\w+\\s+${functionName}\\s*\\(`, "g"),
        "rust": new RegExp(`fn\\s+${functionName}\\s*\\(`, "g"),
        "go": new RegExp(`func\\s+${functionName}\\s*\\(`, "g"),
        "bash": new RegExp(`function\\s+${functionName}\\s*\\{`, "g"),
    };

    // 📌 Vérifie si une fonction correspondant au commentaire existe déjà
    const functionRegex = functionPatterns[languageId] || new RegExp(`def\\s+${functionName}\\s*\\(`, "g");
    return functionRegex.test(text);
}
export function extractFunctionNameFromComment(comment: string): string | null {
    // 📌 Transforme le texte du commentaire en nom de fonction potentiel
    return comment
        .toLowerCase() // Met en minuscules
        .replace(/[^a-z0-9\s]/g, '') // Supprime les caractères spéciaux
        .trim()
        .replace(/\s+/g, '_'); // Remplace les espaces par des underscores
}