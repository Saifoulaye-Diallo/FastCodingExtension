import * as vscode from 'vscode';
import { CodeGenViewProvider } from './providers/CodeGenViewProvider';
import { AIInlineCompletionProvider } from './providers/AIInlineCompletionProvider';
import { handleTypingEvents } from './providers/AIOnTypeListener';
import { reviewCode } from './commands/gpt-4-turbo/reviewCode';
import { generateDocumentation } from './commands/gpt-4-turbo/generateDocumentation';

/**
 * 📌 7️⃣ Fonction appelée automatiquement lors de l'activation de l’extension.
 * 
 * Elle enregistre les différentes commandes, providers et écouteurs nécessaires au bon fonctionnement
 * de l’extension Fast Coding (WebView, complétion IA, écoute des frappes, etc.).
 * 
 * @param context - Le contexte d’exécution de l’extension VSCode.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🎉 Fast Coding est maintenant actif !');

    // 📌 Enregistrement du WebviewViewProvider pour afficher une interface dans la barre latérale
	const viewProvider = new CodeGenViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('fastCoding', viewProvider)
    );

    // 📌 Commande fictive pour tester la génération de code (affiche juste une notification pour le moment)
	context.subscriptions.push(
        vscode.commands.registerCommand("fastCoding.generateCode", () => {
            console.log("[FastCoding] 🎯 Commande 'fastCoding.generateCode' exécutée !");
            vscode.window.showInformationMessage("🔄 Génération de code en cours...");
        })
    );

    // 📌 Enregistrement du provider de complétion inline 
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
            { scheme: 'file' }, // Ne fonctionne que sur les fichiers (pas dans la console, par exemple)
            AIInlineCompletionProvider
        )
    );

    // 📌 Commande pour effectuer une revue de code à l'aide de l'IA
    context.subscriptions.push(
        vscode.commands.registerCommand('fastCoding.reviewCode', async () => {
            const webview = viewProvider.getWebview();
            await reviewCode(webview);
        })
    );

    // 📌 Commande pour générer de la documentation à partir du code sélectionné
    context.subscriptions.push(
        vscode.commands.registerCommand('fastCoding.generateDocumentation', generateDocumentation)
    );

    // 📌 Écoute les frappes clavier pour détecter les mots-clés (ex : "function ")
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(handleTypingEvents)
    );

    console.log("[FastCoding] ✅ WebviewViewProvider enregistré !");
}

/**
 * 📌 8️⃣ Fonction appelée automatiquement lors de la désactivation de l’extension.
 * 
 * Permet de nettoyer ou loguer la fin d’utilisation de l’extension.
 */
export function deactivate() {
    console.log('❌ Fast Coding a été désactivé.');
}
