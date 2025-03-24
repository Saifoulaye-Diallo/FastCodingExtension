import * as vscode from 'vscode';

let lastTyped: string = '';
const triggerWords = ['def', 'function', 'class', 'public', 'private'];

export function handleTypingEvents(event: vscode.TextDocumentChangeEvent) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || event.document !== editor.document) return;

  const change = event.contentChanges[0];
  if (!change || !change.text) return;

  lastTyped += change.text;
  lastTyped = lastTyped.slice(-20); // Ne garde que les 20 derniers caractères tapés

  for (const trigger of triggerWords) {
    if (lastTyped.endsWith(trigger + ' ')) {
      console.log(`[FastCoding] ✨ Déclencheur détecté : "${trigger}"`);
      // Ici tu pourrais préchauffer un appel au LLM ou stocker un contexte
    }
  }
}
