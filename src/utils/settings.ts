/// import * as vscode from 'vscode';

/**
 * 🔧 Récupère le modèle LLM choisi par l'utilisateur depuis les paramètres de l'extension.
 * 
 * Cette fonction est conçue pour lire la configuration personnalisée définie dans
 * le fichier `settings.json` de VSCode sous la clé `Fast_Coding.model`.
 * 
 * Si aucun modèle n’est défini, elle retourne par défaut `'GPT-4'`.
 * 
 * @returns Le nom du modèle sélectionné par l'utilisateur (ex : 'GPT-4', 'StarCoder', 'CodeLlama', etc.)
 */
export function getConfigurationModel(): string {
  // 📌 Lorsque la configuration sera activée :
  // const config = vscode.workspace.getConfiguration('Fast_Coding');
  // const model = config.get<string>('model', 'GPT-4');

  // 🧪 Pour l’instant, on retourne un modèle en dur (mock)
  const model = "GPT-4";

  console.log('[FastCoding] ⚙️ Modèle LLM sélectionné dans settings :', model);
  return model;
}
