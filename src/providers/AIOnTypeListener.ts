import * as vscode from 'vscode';

/**
 * Contient les derniers caractères saisis par l'utilisateur.
 * Utilisé pour détecter si un mot-clé déclencheur a été tapé.
 */
let lastTyped: string = '';

/**
 * Liste des mots-clés déclencheurs qui peuvent être utilisés
 * pour activer des fonctionnalités basées sur l’IA (comme une complétion automatique).
 */
const triggerWords = ['def', 'function', 'class', 'public', 'private'];

/**
 * Gère les événements de frappe clavier dans l’éditeur VSCode.
 * 
 * À chaque modification du document, cette fonction vérifie si le texte saisi
 * contient un mot déclencheur (ex: "function ") pour éventuellement exécuter
 * une action contextuelle, comme un appel anticipé à un LLM.
 * 
 * @param event - L’événement de modification du document capturé par VSCode.
 */
export function handleTypingEvents(event: vscode.TextDocumentChangeEvent): void {
  const editor = vscode.window.activeTextEditor;

  // Ignore l'événement si aucun éditeur actif ou si l'événement ne concerne pas le document affiché
  if (!editor || event.document !== editor.document) return;

  // Récupère la première modification de texte dans l’événement
  const change = event.contentChanges[0];

  // Ignore si la modification est vide
  if (!change || !change.text) return;

  // Ajoute le texte tapé aux derniers caractères enregistrés
  lastTyped += change.text;

  // Garde uniquement les 50 derniers caractères pour limiter la mémoire utilisée
  lastTyped = lastTyped.slice(-50);

  // Vérifie si la séquence se termine par un mot-clé déclencheur suivi d’un espace
  for (const trigger of triggerWords) {
    if (lastTyped.endsWith(trigger + ' ')) {
      console.log(`[FastCoding] ✨ Déclencheur détecté : "${trigger}"`);
      
      // 💡 Tu peux déclencher ici une action : ex. pré-appel à l'IA ou suggestion contextuelle
    }
  }
}
