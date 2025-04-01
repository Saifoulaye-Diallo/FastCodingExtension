import * as vscode from 'vscode';

/**
 * Commande pour enregistrer la clé API dans le contexte global.
 */
export async function setApiKey(context: vscode.ExtensionContext) {
  const apiKey = await vscode.window.showInputBox({
    prompt: 'Entrez votre clé API OpenAI',
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'sk-...'
  });

  if (apiKey) {
    await context.globalState.update('fastCoding.apiKey', apiKey);
    vscode.window.showInformationMessage('✅ Clé API enregistrée avec succès !');
  }
}
