import * as vscode from 'vscode';

let extensionContext: vscode.ExtensionContext;

/**
 * 📌 Appelé dans `activate()` pour stocker le contexte global
 */
export function setExtensionContext(context: vscode.ExtensionContext) {
  extensionContext = context;
}

/**
 * 📌 Appelé ailleurs pour accéder à `globalState`, etc.
 */
export function getExtensionContext(): vscode.ExtensionContext {
  if (!extensionContext) {
    throw new Error('Extension context not initialized');
  }
  return extensionContext;
}
