
// 📁 src/ai/generateInlineFunction.ts
import { openai } from '../../llms/openaiClient.ts';
/**
 * Envoie un message à OpenAI et retourne la réponse
 */
export async function sendMessageToAI(userMessage: string): Promise<string> {
    console.log("[Extension] 🧠 Envoi du message au modèle OpenAI :", userMessage);
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
Tu es un assistant de développement avancé spécialisé en programmation et en intelligence artificielle. Assure-toi de **toujours** respecter ce format :

📌 **Format des réponses** :
1️ **Code** : Utilise **toujours** des blocs de code Markdown (ex. \`\`\`python ... \`\`\`, \`\`\`javascript ... \`\`\`).
2️ **Explications** : Structure avec des titres (###), des listes (\`- item\`), et des paragraphes clairs.
3️ **Exemple d'utilisation** : Ajoute un test concret après chaque code.

 **Exemple de réponse correcte** :
---
### 🔹 Implémentation du Tri par Insertion en Python
Voici un code bien documenté :

\`\`\`python
def insertion_sort(arr):
    """
    Trie une liste d'entiers avec l'algorithme de tri par insertion.
    """
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
            return arr

        # Exemple d'utilisation
        liste = [12, 11, 13, 5, 6]
        print("Liste triée :", insertion_sort(liste))
        \`\`\`

        ### 🔍 Explication :
        - L’algorithme parcourt la liste et insère chaque élément à sa bonne place.
        - Les éléments plus grands sont déplacés pour faire de la place à \`key\`.
        - Cet algorithme est efficace pour les petites listes ou partiellement triées.

        ⚠️ **Si l'utilisateur demande un autre langage (ex. JavaScript), adapte le code en conséquence.**
        ---
        Si une demande est ambiguë, demande des précisions avant de générer du code.
                    `,
                },
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
        console.log("[Extension] 🤖 Réponse OpenAI reçue :", aiResponse);
        return aiResponse;

    } catch (error) {
        console.error('[Extension] ❌ Erreur lors de la génération de la réponse :', error);
        return "Une erreur s'est produite lors de la génération de la réponse.";
    }
}
