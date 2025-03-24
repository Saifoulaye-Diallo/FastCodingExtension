import * as vscode from 'vscode';
import { openai } from '../../llms/openaiClient.ts';

export async function generateDocumentation() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selectedCode = editor.document.getText(editor.selection).trim();
  if (!selectedCode) {
    vscode.window.showWarningMessage("⚠ Veuillez sélectionner une fonction, une classe ou un bloc de code.");
    return;
  }

  const isFunctionOrClass = /^(\s*)(def |class |async |public |function )/.test(selectedCode);

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Tu es un assistant expert en documentation de code, spécialisé dans plusieurs langages (Python, JavaScript, TypeScript, etc.).

        🎯 Ta mission :
        - Si le code sélectionné est une **fonction ou une classe**, génère un **docstring clair, structuré et en FRANÇAIS**, à insérer dans le corps de la fonction.
        - Si c’est un **bloc de code isolé**, génère un **commentaire explicatif concis**, à insérer **au-dessus du bloc**.

        📌 Règles obligatoires :
        - La réponse doit être exclusivement du **texte de documentation**, sans aucun code complet, sans balises Markdown (ex : \`\`\`), sans indentation globale.
        - N’utilise **aucune balise de langage** ni entête inutile.
        - Rédige en **français professionnel**, adapté à un environnement de développement.
        - Ne jamais ajouter d’introduction, ni de conclusion.

        Exemples :
        - Pour une fonction Python → retourne un docstring triple guillemet (\"\"\" ... \"\"\")
        - Pour un bloc JavaScript → retourne des commentaires // ...`
        },
        {
          role: "user",
          content: selectedCode
        }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    const doc = res.choices[0].message?.content?.trim();
    if (!doc) {
      vscode.window.showWarningMessage("⚠ Aucune documentation générée.");
      return;
    }

    const selection = editor.selection;
    const startLine = selection.start.line;
    const lineText = editor.document.lineAt(startLine).text;
    const indentMatch = lineText.match(/^\s*/);
    const indentation = indentMatch ? indentMatch[0] + '    ' : '    ';

    editor.edit(editBuilder => {
      if (isFunctionOrClass) {
        const formattedDocstring = doc
          .split('\n')
          .map(line => indentation + line)
          .join('\n') + '\n';

        const insertPosition = new vscode.Position(startLine + 1, 0);
        editBuilder.insert(insertPosition, formattedDocstring);
      } else {
        const commentPrefix = lineText.trimStart().startsWith('//') ? '// ' : '# ';
        const formattedComment = doc
          .split('\n')
          .map(line => commentPrefix + line)
          .join('\n') + '\n';

        editBuilder.insert(selection.start, formattedComment);
      }
    });
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur lors de la génération de documentation :', error);
    vscode.window.showErrorMessage("Erreur pendant la génération de documentation.");
  }
}
