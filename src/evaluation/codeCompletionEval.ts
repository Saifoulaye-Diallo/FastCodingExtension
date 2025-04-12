import { codeCompletion as baseCompletion } from '../commands/gpt-4-turbo/codeCompletion';

/**
 * Fonction intermédiaire pour générer une complétion à partir d'un prompt HumanEval.
 * Cette fonction est utilisée pour évaluer la performance de  l'extension.
 */
export async function codeCompletion(prompt: string): Promise<string> {
  return await baseCompletion(prompt);
}
