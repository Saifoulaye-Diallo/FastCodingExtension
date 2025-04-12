import * as vscode from 'vscode';
import { getOpenAIClient } from '../../llms/openaiClient.ts';

/**
 * 🔍 Effectue une revue de code à l’aide de GPT-4 Turbo.
 * 
 * Cette fonction :
 * - Récupère le code sélectionné dans l’éditeur.
 * - L’envoie à OpenAI pour obtenir une analyse et une version corrigée.
 * - Affiche le résultat soit dans un panneau WebView (si présent), soit via une notification.
 * 
 * @param panel - (Optionnel) Panneau WebView dans lequel afficher la réponse du modèle.
 */
export async function reviewCode(panel?: vscode.Webview) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // 📄 Récupère le code sélectionné dans l’éditeur
  const selectedCode = editor.document.getText(editor.selection).trim();
  console.log("code recu :",selectedCode)
  // 🚨 Si aucun code n’est sélectionné, on avertit l'utilisateur
  if (!selectedCode) {
    vscode.window.showWarningMessage("⚠ Veuillez sélectionner du code à analyser.");
    return;
  }

  try {
    // 🤖 Envoi de la requête au modèle GPT-4 avec des instructions très précises
    const openai = getOpenAIClient();
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.1, 
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en revue de code Python, rigoureux sur les conventions de style, de sécurité et de documentation.

          Ta mission est divisée en deux sections obligatoires :
          
          ---REVIEW---
          - Analyse en FRANÇAIS uniquement.
          - Tu dois commenter la qualité du code, son style, sa lisibilité, sa sécurité, sa robustesse et la clarté de sa documentation.
          - Identifie précisément les manques (docstring, types, indentations, vérifications, etc.).
          
          ---CODE---
          - Fournis le code corrigé **dans un bloc Markdown bien formaté** comme ceci : \`\`\`python ... \`\`\`
          - Le code doit être **valide, complet, bien indenté**, et suivre les conventions PEP 8.
          - S'il y a une fonction, ajoute **toujours** une docstring multi-ligne formelle (avec triple guillemets \`"""\`), sur une ligne propre et bien indentée.
          - Inclure toujours les sections :param: et :return: si applicable.
          - Si un argument peut poser problème, ajoute une vérification avec isinstance(...) et raise ValueError(...).
          
          🚫 INTERDIT :
          - Ne change pas le nom des variables sauf si nécessaire.
          - N'ajoute aucune phrase introductive ou décorative.
          - Réponds strictement selon les deux blocs définis.
          
          ✅ Résultat attendu :
          - Une section REVIEW claire.
          - Un bloc CODE bien formatté en Markdown.
          ` 
          
          
        },
        {
          role: "user",
          content: `Analyse et corrige ce code si nécessaire :\n\n${selectedCode}`
        }
      ]
    });

    // 📤 Récupère le contenu brut de la réponse
    const rawOutput = res.choices[0].message?.content ?? "❌ Aucune suggestion reçue.";

    // 🪓 Découpe le texte selon les balises personnalisées ---REVIEW--- et ---CODE---
    const reviewMatch = rawOutput.match(/---REVIEW---([\s\S]*?)(?:---CODE---|$)/);
    const codeMatch = rawOutput.match(/---CODE---([\s\S]*)$/);

    const reviewPart = reviewMatch?.[1]?.trim();
    const codePart = codeMatch?.[1]?.trim();
    const fixedCodePart = codePart ? fixPythonDocstring(codePart) : '';

    console.log("Reponse du LLM :", rawOutput)
    console.log("La revue est : ",reviewMatch)

    if (panel && (reviewPart || fixedCodePart)) {
      const fullMessage = [
        reviewPart ? `📝 Revue du code\n\n${reviewPart.trim()}` : '',
        fixedCodePart ? `💡 Code suggéré\n\n${fixedCodePart.trim()}` : ''
      ].join('\n\n').trim();
      
    
      panel.postMessage({ command: 'botReply', text: fullMessage });
    }
    
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur lors de la revue :', error);
    vscode.window.showErrorMessage("Erreur pendant la revue de code.");
  }
}

function fixPythonDocstring(code: string): string {
  return code.replace(
    /^(\s*def .*?\)):\s*"""/gm,
    (_match, defLine) => {
      const indentLevel = defLine.match(/^\s*/)?.[0] ?? '';
      return `${defLine}:\n${indentLevel}    """`;
    }
  );
}

