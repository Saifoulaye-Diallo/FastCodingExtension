import * as vscode from 'vscode';
import { CodeGenViewProvider } from './providers/CodeGenViewProvider';
import { AIInlineCompletionProvider } from './providers/AIInlineCompletionProvider';
import { handleTypingEvents } from './providers/AIOnTypeListener';
import { generateCode } from './commands/gpt-4-turbo/generateCode';
import { reviewCode } from './commands/gpt-4-turbo/reviewCode';
import { generateDocumentation } from './commands/gpt-4-turbo/generateDocumentation';
import { callHuggingFaceModelFIM } from './llms/huggingfaceClient'; // adapte le chemin
// 📌 7️⃣ Activation des commandes dans VSCode
export function activate(context: vscode.ExtensionContext) {
    console.log('🎉 Fast Coding est maintenant actif !');
	 // 📌 Enregistrement du WebviewViewProvider
	 const viewProvider = new CodeGenViewProvider(context.extensionUri);
     context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('fastCoding', viewProvider)
    );

	context.subscriptions.push(
        vscode.commands.registerCommand("fastCoding.generateCode", () => {
            console.log("[FastCoding] 🎯 Commande 'fastCoding.generateCode' exécutée !");
            vscode.window.showInformationMessage("🔄 Génération de code en cours...");
        })
    );
    context.subscriptions.push(
        vscode.languages.registerInlineCompletionItemProvider(
        { scheme: 'file' },
        AIInlineCompletionProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('fastCoding.reviewCode', async () => {
          const webview = viewProvider.getWebview();
          await reviewCode(webview);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('fastCoding.generateDocumentation', generateDocumentation)
      );
      
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(handleTypingEvents)
    );
      
    console.log("[FastCoding] ✅ WebviewViewProvider enregistré !");
}

// 📌 8️⃣ Désactivation propre de l'extension
export function deactivate() {
    console.log('❌ Fast Coding a été désactivé.');
}
