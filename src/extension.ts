import * as vscode from 'vscode';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { CodeGenViewProvider } from '../providers/CodeGenViewProvider'; 


// 📌 1️⃣ Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 📌 2️⃣ Vérifier que la clé API OpenAI est bien chargée
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    vscode.window.showErrorMessage("🚨 Erreur : Clé API OpenAI non trouvée dans le fichier .env !");
    throw new Error("Clé API OpenAI non définie.");
}

// 📌 3️⃣ Fonction qui retourne le client OpenAI
function getOpenAIClient(): OpenAI {
    return new OpenAI({ apiKey: apiKey }); 
}
/**
 * Envoie un message à OpenAI et retourne la réponse
 */
export async function sendMessageToAI(userMessage: string): Promise<string> {
    console.log("[Extension] 🧠 Envoi du message au modèle OpenAI :", userMessage);
    
    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
Tu es un assistant de développement avancé spécialisé en programmation et en intelligence artificielle. Assure-toi de **toujours** respecter ce format :

📌 **Format des réponses** :
1️⃣ **Code** : Utilise **toujours** des blocs de code Markdown (ex. \`\`\`python ... \`\`\`, \`\`\`javascript ... \`\`\`).
2️⃣ **Explications** : Structure avec des titres (###), des listes (\`- item\`), et des paragraphes clairs.
3️⃣ **Exemple d'utilisation** : Ajoute un test concret après chaque code.

✅ **Exemple de réponse correcte** :
---
### 🔹 Implémentation du Tri par Insertion en Python
Voici un code bien documenté :

\`\`\`python
def insertion_sort(arr):
    """
    Trie une liste d'entiers avec l'algorithme de tri par insertion.
    """
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

# Exemple d'utilisation
liste = [12, 11, 13, 5, 6]
print("Liste triée :", insertion_sort(liste))
\`\`\`

### 🔍 Explication :
- L’algorithme parcourt la liste et insère chaque élément à sa bonne place.
- Les éléments plus grands sont déplacés pour faire de la place à \`key\`.
- Cet algorithme est efficace pour les petites listes ou partiellement triées.

⚠️ **Si l'utilisateur demande un autre langage (ex. JavaScript), adapte le code en conséquence.**
---
Si une demande est ambiguë, demande des précisions avant de générer du code.
                    `,
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
        console.log("[Extension] 🤖 Réponse OpenAI reçue :", aiResponse);
        return aiResponse;

    } catch (error) {
        console.error('[Extension] ❌ Erreur lors de la génération de la réponse :', error);
        return "Une erreur s'est produite lors de la génération de la réponse.";
    }
}




async function generateCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const position = editor.selection.active;
    const fileExtension = document.fileName.split('.').pop()?.toLowerCase();
    const { language: languageId, commentType, multiLineComment } = getLanguageFromExtension(fileExtension);

    if (!languageId) {
        vscode.window.showWarningMessage("⚠️ Impossible de détecter le langage. Vérifiez l'extension du fichier.");
        return;
    }

    // 📌 Capture du contexte du fichier (code avant et après le curseur)
    const startLine = Math.max(0, position.line - 5);
    const endLine = Math.min(document.lineCount, position.line + 5);
    const codeBeforeCursor = document.getText(new vscode.Range(startLine, 0, position.line, position.character));
    const codeAfterCursor = document.getText(new vscode.Range(position.line, position.character, endLine, 1000));

    // 📌 Trouver le dernier commentaire non résolu
    const lastUnresolvedComment = extractLastUnresolvedComment(document, languageId, commentType, multiLineComment);
    if (!lastUnresolvedComment) {
        vscode.window.showWarningMessage("⚠️ Aucun commentaire non résolu trouvé.");
        return;
    }

    // 📌 Vérifier si une fonction similaire existe déjà
    if (isFunctionAlreadyImplemented(document, lastUnresolvedComment, languageId)) {
        vscode.window.showWarningMessage("⚠️ La fonction demandée semble déjà exister.");
        return;
    }

    // 📌 Détection avancée du type de code à générer
    const isFunction = /\b(fonction|méthode|implémenter|classe|créer|définir|constructor|function|method|class|define|implement)\b/i.test(lastUnresolvedComment);
    const isBlockOfCode = /\b(bloc|exemple|snippet|code|assigner|calculer|trier|afficher|vérifier|example|snippet|sort|display|check)\b/i.test(lastUnresolvedComment);

    let generationType = "Detect the best output format automatically.";
    if (isFunction) {
        generationType = "Generate a well-structured function or class with proper documentation.";
    } else if (isBlockOfCode) {
        generationType = "Generate only a clean and optimized code snippet.";
    }

    // 📌 Gestion du type de commentaire pour formater correctement la requête
    const commentStart = multiLineComment ? multiLineComment.start : commentType;
    const commentEnd = multiLineComment ? multiLineComment.end : "";
    const formattedComment = multiLineComment 
        ? `${commentStart}\n${lastUnresolvedComment}\n${commentEnd}` 
        : `${commentStart} ${lastUnresolvedComment}`;

    const openai = getOpenAIClient();
    try {
        const response = await openai.chat.completions.create({
			model: "gpt-4-turbo",
			messages: [
				{
					role: "system",
					content: `You are an advanced AI coding assistant similar to GitHub Copilot.
					Your task is to generate **only the requested code, strictly following the given constraints**.
			
					## 🔹 Context Information:
					- **Programming Language:** ${languageId}
					- **Code Before Cursor:** 
					\`\`\`${languageId}
					${codeBeforeCursor}
					\`\`\`
					- **Code After Cursor:** 
					\`\`\`${languageId}
					${codeAfterCursor}
					\`\`\`
					- **User Comment or Request (ONLY the last comment before cursor):**
					"${formattedComment}"
			
					## 🔹 Code Generation Rules:
					- **Detect the language of the comment and ensure the response is in the same language.**
					- **Use ONLY the last comment before the cursor as a reference. Ignore all previous comments.**
					- **Generate only the requested code without any comments, explanations, or markdown formatting (\`\`\`).**
					- **DO NOT regenerate functions, classes, or variables that already exist in the provided code context.**
					- **DO NOT include any introductory or concluding text.**
					- **Ensure proper indentation, formatting, and consistency with best practices for ${languageId}.**
					- **DO NOT add extra imports or dependencies unless explicitly required.**
					- **If an import is required, place it at the top of the file.**
					- **Ensure that all variables and function names follow standard naming conventions for ${languageId}.**
					- **Optimize the code for performance and maintainability.**
					- **Use built-in functions and best practices of ${languageId} whenever applicable.**
					- **Ensure the generated code integrates seamlessly with the existing context.**
					- **For sorting functions with a comparator, use cmp_to_key() correctly in Python or a valid comparator function in JavaScript.**
			
					## 🔹 Additional Constraints:
					- **DO NOT include any form of explanation, reasoning, or additional instructions in the response.**
					- **DO NOT wrap the response in Markdown (\`\`\`${languageId} ... \`\`\`).**
					- **Only return the exact code snippet needed to fulfill the user’s request.**
					- **If a function is requested, return only the function.**
					- **If a snippet is requested, return only the required code block.**
					- **If a class is requested, return only the class and its necessary methods.**`
				},
				{ 
					role: "user", 
					content: `Generate only the required ${generationType} for the following request in ${languageId}.
					The response **MUST** contain only the code, with no comments, explanations, or markdown formatting.
					The response **MUST NOT** regenerate functions, variables, or classes already defined in the provided code.
					The response **MUST ONLY** be based on the LAST user comment before the cursor.
					Comment: ${formattedComment}`
				}
			],			
            temperature: 0.1,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
            max_tokens: 350,
        });

        let suggestion = response.choices[0]?.message?.content ?? "";
        suggestion = suggestion.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();

        if (!suggestion.trim()) {
            vscode.window.showWarningMessage("⚠️ L'IA n'a pas généré de code. Essayez d'être plus précis.");
            return;
        }

        editor.edit(editBuilder => {
            editBuilder.insert(position, suggestion);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`❌ Error generating code: ${error}`);
    }
}



/**
 * 📌 Convertit l'extension de fichier en langage de programmation et retourne le type de commentaire.
 */
function getLanguageFromExtension(extension?: string): { language: string | null; commentType: string; multiLineComment: { start: string, end: string } | null } {
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
function escapeRegExp(string: string): string {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * 📌 Extrait le dernier commentaire du fichier en fonction du langage détecté.
 */
function extractLastUnresolvedComment(
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



function isFunctionAlreadyImplemented(document: vscode.TextDocument, comment: string, languageId: string): boolean {
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
function extractFunctionNameFromComment(comment: string): string | null {
    // 📌 Transforme le texte du commentaire en nom de fonction potentiel
    return comment
        .toLowerCase() // Met en minuscules
        .replace(/[^a-z0-9\s]/g, '') // Supprime les caractères spéciaux
        .trim()
        .replace(/\s+/g, '_'); // Remplace les espaces par des underscores
}


// 📌 5️⃣ Fonction de revue et debug de code
async function reviewCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selectedCode = editor.document.getText(editor.selection);
    if (!selectedCode) {
        vscode.window.showWarningMessage("⚠ Veuillez sélectionner du code pour le réviser.");
        return;
    }

    const openai = getOpenAIClient();
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: `Review this code and suggest improvements:\n${selectedCode}` }],
        });

        vscode.window.showInformationMessage("💡 Suggestion : " + response.choices[0].message.content);
    } catch (error) {
        vscode.window.showErrorMessage("❌ Erreur lors de la revue du code : " + error);
    }
}

// 📌 6️⃣ Fonction de génération automatique de documentation
async function generateDocumentation() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selectedCode = editor.document.getText(editor.selection);
    if (!selectedCode) {
        vscode.window.showWarningMessage("⚠ Veuillez sélectionner une fonction ou une classe pour générer la documentation.");
        return;
    }

    const openai = getOpenAIClient();
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: `Generate a clear and well-structured docstring for this function:\n${selectedCode}` }],
            temperature: 0.7,
            max_tokens: 150,
        });

        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, `\n${response.choices[0].message.content}`);
        });
    } catch (error) {
        vscode.window.showErrorMessage("❌ Erreur lors de la génération de documentation : " + error);
    }
}

// 📌 Ajoute des règles spécifiques selon le langage détecté
function getLanguageSpecificRules(languageId: string): string {
    switch (languageId) {
        case "python":
            return `- Follow PEP8 styling conventions.
                    - Use list comprehensions when possible.
                    - Prefer f-strings over format() for better readability.
                    - Type hints should be included for function parameters and return values.`;

        case "javascript":
        case "typescript":
            return `- Use modern ES6+ syntax (let, const, arrow functions).
                    - Prefer async/await over Promises when dealing with asynchronous operations.
                    - Avoid using var; use const or let instead.
                    - Ensure proper error handling with try/catch when needed.`;

        case "java":
            return `- Follow Java naming conventions (PascalCase for classes, camelCase for methods).
                    - Use Streams API where applicable for better performance.
                    - Avoid unnecessary object creation; prefer reusing instances.
                    - Use proper exception handling (try-catch-finally).`;

        case "cpp":
            return `- Use smart pointers (std::unique_ptr, std::shared_ptr) for memory management.
                    - Prefer std::vector over raw arrays for safety and performance.
                    - Ensure exception safety by using RAII (Resource Acquisition Is Initialization).
                    - Follow C++ Core Guidelines for best practices.`;

        case "rust":
            return `- Follow Rust ownership and borrowing principles properly.
                    - Use Result and Option types for error handling instead of panic.
                    - Prefer functional programming patterns (iterators, map, filter).
                    - Use cargo fmt and clippy for code formatting and linting.`;

        default:
            return `- Follow the best practices of the detected language.
                    - Ensure the generated code is efficient and maintainable.
                    - Adapt to the surrounding code in the file.`;
    }
}

// 📌 7️⃣ Activation des commandes dans VSCode
export function activate(context: vscode.ExtensionContext) {
    console.log('🎉 Fast Coding est maintenant actif !');
	 // 📌 Enregistrement du WebviewViewProvider
	 const provider = new CodeGenViewProvider(context.extensionUri);
     context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('fastCoding', provider)
    );
	context.subscriptions.push(
        vscode.commands.registerCommand("fastCoding.generateCode", () => {
            console.log("[FastCoding] 🎯 Commande 'fastCoding.generateCode' exécutée !");
            vscode.window.showInformationMessage("🔄 Génération de code en cours...");
        })
    );
    console.log("[FastCoding] ✅ WebviewViewProvider enregistré !");
    context.subscriptions.push(
        vscode.commands.registerCommand('fast-coding.generateCode', generateCode),
        vscode.commands.registerCommand('fast-coding.reviewCode', reviewCode),
        vscode.commands.registerCommand('fast-coding.generateDocumentation', generateDocumentation)
    );
}

// 📌 8️⃣ Désactivation propre de l'extension
export function deactivate() {
    console.log('❌ Fast Coding a été désactivé.');
}
