// 📁 src/utils/settings.ts
import * as vscode from 'vscode';

/**
 * Récupère le modèle LLM choisi par l'utilisateur depuis les paramètres de l'extension.
 * @returns Le nom du modèle sélectionné ('GPT-4', 'StarCoder', 'CodeLlama', etc.)
 */
export function getConfigurationModel(): string {
    const config = vscode.workspace.getConfiguration('Fast_Coding');
    const model = config.get<string>('model', 'GPT-4');
  
    console.log('[FastCoding] ⚙️ Modèle LLM sélectionné dans settings:', model);
    return model;
  }
