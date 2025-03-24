import * as vscode from 'vscode';
import { openai } from '../../llms/openaiClient.ts';

export async function reviewCode(panel?: vscode.Webview) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selectedCode = editor.document.getText(editor.selection).trim();
  if (!selectedCode) {
    vscode.window.showWarningMessage("⚠ Veuillez sélectionner du code à analyser.");
    return;
  }

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant de revue et de débogage de code. 
            Tu dois faire deux choses :
            1. Donner une analyse du code (qualité, style, erreurs potentielles, améliorations).
            2. Proposer une version corrigée ou améliorée du code si nécessaire.
            Retourne les deux sections clairement séparées avec les balises suivantes :
            ---REVIEW---
            [Analyse du code]
            ---CODE---
            [Code corrigé ou optimisé]
            Règles strictes :
            Ne retourne jamais de balises Markdown comme \`\`\` ou des annotations de langage comme \`\`\`python.
            - Réponds uniquement en FRANÇAIS.
            - N'invente pas de noms de fonctions ou variables qui ne sont pas présents dans le code d'origine.
            - Ne change pas la logique du code sans raison valable.
            - Si le code est déjà optimal, indique-le clairement dans la section REVIEW.`
        },
        {
          role: "user",
          content: `Analyse et corrige ce code si nécessaire :\n\n${selectedCode}`
        }
      ]
    });

    const rawOutput = res.choices[0].message?.content ?? "❌ Aucune suggestion reçue.";

    // Découpe la réponse en deux parties : review + code
    const [_, reviewPart, codePart] = rawOutput.split(/---REVIEW---|---CODE---/);

    if (panel) {
      if (reviewPart?.trim()) {
        panel.postMessage({ command: 'botReply', text: `\n\n###  Code revue :\n\n${reviewPart.trim()}` });
      }
      if (codePart?.trim()) {
        panel.postMessage({ command: 'botReply', text: `\n\n### Code suggéré :\n\n${codePart.trim()}` });
      }
    } else {
      vscode.window.showInformationMessage("✅ Revue générée, mais aucun panneau WebView n’est ouvert.");
    }
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur lors de la revue :', error);
    vscode.window.showErrorMessage("Erreur pendant la revue de code.");
  }
}