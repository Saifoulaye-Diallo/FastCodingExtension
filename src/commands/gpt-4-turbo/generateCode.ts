import * as vscode from 'vscode';
import { getOpenAIClient } from '../../llms/openaiClient.ts';
import {
  getLanguageFromExtension,
  extractLastUnresolvedComment,
  isFunctionAlreadyImplemented
} from '../../utils/langageUtils';

/**
 * 🧠 Génère du code automatiquement à partir d’un commentaire non résolu dans l’éditeur VSCode.
 * 
 * Fonctionnalités :
 * - Détecte le langage du fichier selon son extension.
 * - Récupère le commentaire utilisateur (dernière demande avant le curseur).
 * - Évite de régénérer des fonctions déjà présentes.
 * - Envoie le contexte (code avant/après + commentaire) à GPT-4.
 * - Insère le code généré à la position actuelle du curseur.
 */
export async function generateCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const position = editor.selection.active;

  // 📎 Déduction du langage à partir de l’extension du fichier
  const fileExtension = document.fileName.split('.').pop()?.toLowerCase();
  const { language: languageId, commentType, multiLineComment } = getLanguageFromExtension(fileExtension);

  if (!languageId) {
    vscode.window.showWarningMessage("⚠️ Impossible de détecter le langage. Vérifiez l'extension du fichier.");
    return;
  }

  // 📄 Récupère le contexte autour du curseur (±5 lignes)
  const startLine = Math.max(0, position.line - 5);
  const endLine = Math.min(document.lineCount, position.line + 5);
  const codeBeforeCursor = document.getText(new vscode.Range(startLine, 0, position.line, position.character));
  const codeAfterCursor = document.getText(new vscode.Range(position.line, position.character, endLine, 1000));

  // 📝 Extraction du dernier commentaire non résolu
  const lastUnresolvedComment = extractLastUnresolvedComment(document, languageId, commentType, multiLineComment);
  if (!lastUnresolvedComment) {
    vscode.window.showWarningMessage("⚠️ Aucun commentaire non résolu trouvé.");
    return;
  }

  // 🚫 Vérifie si la fonction demandée est déjà présente dans le fichier
  if (isFunctionAlreadyImplemented(document, lastUnresolvedComment, languageId)) {
    vscode.window.showWarningMessage("⚠️ La fonction demandée semble déjà exister.");
    return;
  }

  // 🧠 Détection du type de génération demandée (fonction, bloc, etc.)
  const isFunction = /\b(fonction|méthode|implémenter|classe|créer|définir|constructor|function|method|class|define|implement)\b/i.test(lastUnresolvedComment);
  const isBlockOfCode = /\b(bloc|exemple|snippet|code|assigner|calculer|trier|afficher|vérifier|example|snippet|sort|display|check)\b/i.test(lastUnresolvedComment);

  let generationType = "Détecte automatiquement le meilleur format de sortie.";
  if (isFunction) {
    generationType = "Génère une fonction ou une classe bien structurée avec documentation.";
  } else if (isBlockOfCode) {
    generationType = "Génère uniquement un extrait de code propre et optimisé.";
  }

  // 🔧 Formate le commentaire avec sa syntaxe selon le langage
  const commentStart = multiLineComment ? multiLineComment.start : commentType;
  const commentEnd = multiLineComment ? multiLineComment.end : "";
  const formattedComment = multiLineComment
    ? `${commentStart}\n${lastUnresolvedComment}\n${commentEnd}`
    : `${commentStart} ${lastUnresolvedComment}`;

  try {
    // 📡 Appel GPT-4 avec le contexte complet (avant, après, commentaire)
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Tu es une intelligence artificielle avancée spécialisée dans la génération de code, à la manière de GitHub Copilot, toujours repondre dans la langue detecter dans le contexte.

Ta tâche est de générer **uniquement** le code demandé, en suivant strictement les contraintes suivantes :

🔹 **Contexte** :
- Langage de programmation : ${languageId}
- Code avant le curseur :
${codeBeforeCursor}
- Code après le curseur :
${codeAfterCursor}
- Commentaire utilisateur (uniquement le dernier avant le curseur) :
${formattedComment}

🔹 **Règles de génération** :
- N’utilise que le dernier commentaire comme référence. Ignore les autres.
- Ne régénère jamais du code déjà existant (fonctions, classes, variables).
- Ne génère que le code requis : pas de commentaire, pas d’explication, pas de Markdown.
- Pas d’introduction, pas de conclusion.
- Respecte l’indentation, les conventions et les meilleures pratiques du langage.
- N’ajoute aucune dépendance externe ou import inutile.
- Si un import est requis, place-le en haut du fichier.
- Adapte parfaitement le code au contexte fourni.

🔹 **Contraintes supplémentaires** :
- La réponse ne doit contenir que le code pur.
- Si une fonction est demandée, ne retourner que la fonction.
- Si un snippet est demandé, ne retourner que le snippet.
- Si une classe est demandée, ne retourner que la classe et ses méthodes nécessaires.`
        },
        {
          role: "user",
          content: `Génère uniquement ${generationType} pour cette demande en ${languageId}. La réponse doit uniquement contenir le code, sans commentaire, explication ni balise Markdown. Ne régénère pas de code déjà présent. Commentaire : ${formattedComment}`
        }
      ],
      temperature: 0.1,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      max_tokens: 350,
    });

    // 🧼 Nettoyage de la sortie (suppression des ```python)
    let suggestion = response.choices[0]?.message?.content ?? "";
    suggestion = suggestion.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();

    // ❌ Si rien n'est généré, avertir
    if (!suggestion.trim()) {
      vscode.window.showWarningMessage("⚠️ L'IA n'a pas généré de code. Essayez d'être plus précis.");
      return;
    }

    // 🖊️ Insertion du code généré à la position du curseur
    editor.edit(editBuilder => {
      editBuilder.insert(position, suggestion);
    });

  } catch (error) {
    vscode.window.showErrorMessage(`❌ Erreur lors de la génération de code : ${error}`);
  }
}
