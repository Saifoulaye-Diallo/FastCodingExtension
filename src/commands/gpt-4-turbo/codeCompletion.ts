import * as vscode from 'vscode';
import { openai } from '../../llms/openaiClient.ts';
import { callHuggingFaceModelFIM } from '../../llms/huggingfaceClient';
import { getConfigurationModel } from '../../utils/settings';

/**
 * Génère une complétion IA pour du code à partir du contexte autour du curseur,
 * en choisissant dynamiquement le modèle LLM selon les préférences utilisateur.
 * @param before - Code avant le curseur
 * @param after - Code après le curseur (optionnel)
 * @returns Suggestion de code à insérer
 */
export async function codeCompletion(before: string, after: string = ''): Promise<string> {
  const prompt = `${before}<CURSOR>${after}`;
  const model = getConfigurationModel();

  try {
   switch (model) {
  case 'StarCoder': {
    const prefix = "def say_hello():\n    ";
    const suffix = "\n    print('done')";
    const generated = await callHuggingFaceModelFIM(prefix, suffix);


    console.log("[FastCoding] 🤖 Modèle sélectionné : StarCoder");
    vscode.window.showInformationMessage("💡 Modèle IA utilisé : StarCoder (Hugging Face)");
    
    return generated;
  }

  case 'CodeLlama': {
    console.warn("[FastCoding] ⚠️ CodeLlama non disponible avec cette clé Hugging Face.");
    vscode.window.showWarningMessage("🚫 Le modèle CodeLlama n'est pas encore accessible avec votre clé Hugging Face.");
    
    return '';
  }

  case 'GPT-4':
  default: {
    console.log("[FastCoding] 🤖 Modèle sélectionné : GPT-4");
    vscode.window.showInformationMessage("💡 Modèle IA utilisé : GPT-4 Turbo");

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Tu es une IA de complétion de code comme GitHub Copilot.

Ton rôle est de prédire ce que l’utilisateur est en train de taper, à partir du contexte fourni.

❗ Règles strictes :
- Ne retourne que du **code brut** (aucun commentaire, explication ou markdown).
- Le code doit être prêt à être inséré immédiatement après le curseur.
- Chaque ligne de code doit être correctement indentée.
- Si plusieurs instructions sont générées, elles doivent être séparées par des retours à la ligne (\\n).
- Le code généré ne doit pas causer d'erreurs de syntaxe.
- Aucune phrase, aucun texte explicatif ou décoratif.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 80,
      temperature: 0.1,
      top_p: 1,
      stop: ["\n\n"]
    });

    return completion.choices[0]?.message?.content?.trim() ?? '';
  }
}
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur LLM inline :', error);
    return '';
  }
}
