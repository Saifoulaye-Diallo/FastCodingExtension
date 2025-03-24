// 📁 src/ai/generateInlineFunctionCompletion.ts
import { openai } from '../../llms/openaiClient.ts';

/**
 * Génère une complétion IA pour du code à partir du contexte autour du curseur.
 * @param before - Code avant le curseur
 * @param after - Code après le curseur
 * @returns Suggestion de code à insérer
 */
export async function codeCompletion(before: string, after: string = ''): Promise<string> {
  try {
    const prompt = `${before}<CURSOR>${after}`;

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
  } catch (error) {
    console.error('[FastCoding] ❌ Erreur OpenAI inline :', error);
    return '';
  }
}
