import * as vscode from 'vscode';
import { getWebviewContent } from '../panels/ChatWebViewContent';
import { sendMessageToAI } from '../commands/gpt-4-turbo/chatWithAi'; 

export class CodeGenViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
    
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
    
        webviewView.webview.html = getWebviewContent();
    
        // Écouter les messages depuis la WebView
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'sendMessage') {
                console.log("[Extension] 📩 Message reçu depuis WebView :", message.text);
    
                const userMessage = message.text;
    
                // Afficher le message de l'utilisateur dans la WebView
                this.sendMessageToWebview(userMessage, 'userMessage');
    
                console.log("[Extension] 🚀 Envoi du message à OpenAI...");
                const aiResponse = await sendMessageToAI(userMessage);
                console.log("[Extension] ✅ Réponse reçue d'OpenAI :", aiResponse);
    
                // Afficher la réponse de l'IA dans la WebView
                this.sendMessageToWebview(aiResponse, 'botReply');
            }
        });
    }
    
    /**
     * Envoie un message à la WebView
     */
    private sendMessageToWebview(text: string, command: string) {
        console.log(`[Extension] 📤 Envoi du message à la WebView - Commande: ${command}, Texte: ${text}`);
        if (this._view) {
            this._view.webview.postMessage({ command, text });
        }
    }    
    public getWebview(): vscode.Webview | undefined {
        return this._view?.webview;
      }
      
}