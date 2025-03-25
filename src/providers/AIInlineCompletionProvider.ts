import * as vscode from 'vscode';
import { codeCompletion } from '../commands/gpt-4-turbo/codeCompletion';

/**
 * Fournisseur de complétion de code en ligne (inline) utilisant GPT-4 Turbo.
 * 
 * Ce provider intercepte les saisies de l'utilisateur dans VSCode et propose
 * une suggestion de code (ghost text) basée sur le contexte autour de la position du curseur.
 */
export const AIInlineCompletionProvider: vscode.InlineCompletionItemProvider = {
  /**
   * Méthode appelée par VSCode pour fournir des suggestions de code inline.
   * 
   * @param document - Le document en cours d'édition.
   * @param position - La position actuelle du curseur dans l'éditeur.
   * @returns Une promesse qui résout à un tableau de `InlineCompletionItem` contenant une suggestion.
   */
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.InlineCompletionItem[]> {
    
    // Récupère le texte avant la position du curseur (depuis le début du fichier)
    const before = document.getText(new vscode.Range(new vscode.Position(0, 0), position));

    // Récupère le texte après la position du curseur (jusqu’à 10 lignes ou la fin du document)
    const after = document.getText(
      new vscode.Range(
        position,
        new vscode.Position(
          Math.min(document.lineCount - 1, position.line + 10),
          1000 // Limite la longueur maximale de la ligne
        )
      )
    );

    // Appelle la fonction de complétion (basée sur GPT-4 Turbo)
    const suggestion = await codeCompletion(before, after);

    // Retourne une liste vide si aucune suggestion n’est trouvée
    if (!suggestion?.trim()) return [];

    const ghostText = suggestion.trim();

    // Crée un objet de complétion inline à la position actuelle
    return [
      new vscode.InlineCompletionItem(ghostText, new vscode.Range(position, position))
    ];
  }
};
