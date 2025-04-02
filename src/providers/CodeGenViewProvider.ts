import * as vscode from 'vscode';
import { getWebviewContent } from '../panels/ChatWebViewContent';
import { sendMessageToAI } from '../commands/gpt-4-turbo/chatWithAi';

/**
 * Fournisseur de WebviewView pour la vue de génération de code avec IA.
 * 
 * Cette classe permet d'intégrer une WebView dans la barre latérale de VSCode
 * et de gérer la communication entre la WebView et l'extension (notamment les échanges avec GPT-4 Turbo).
 */
export class CodeGenViewProvider implements vscode.WebviewViewProvider {
    
    /**
     * Référence à la vue WebView.
     */
    private _view?: vscode.WebviewView;

    /**
     * Constructeur du fournisseur de WebView.
     * 
     * @param _extensionUri - URI racine de l’extension, utilisé pour charger des ressources locales.
     */
    constructor(private readonly _extensionUri: vscode.Uri) {}

    /**
     * Méthode appelée automatiquement par VSCode lorsqu’il faut afficher ou restaurer la WebView.
     * 
     * @param webviewView - L'objet WebView fourni par VSCode.
     * @param _context - Contexte de résolution (non utilisé ici).
     * @param _token - Jeton d’annulation (non utilisé ici).
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext<unknown>,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        // Configuration de la WebView : autoriser les scripts et charger les ressources locales
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Contenu HTML affiché dans la WebView
        webviewView.webview.html = getWebviewContent();

        // Écoute des messages envoyés par la WebView (frontend)
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'sendMessage') {
                console.log("[Extension] 📩 Message reçu depuis WebView :", message.text);

                const userMessage = message.text;

                // Affiche le message de l'utilisateur dans l'interface
                this.sendMessageToWebview(userMessage, 'userMessage');

                // Envoie le message à GPT-4 Turbo via l'API
                const aiResponse = await sendMessageToAI(userMessage);
        

                // Affiche la réponse de l'IA dans la WebView
                this.sendMessageToWebview(aiResponse, 'botReply');
            }
        });
    }

    /**
     * Envoie un message à la WebView (frontend).
     * 
     * @param text - Le texte à envoyer.
     * @param command - Le type de message (ex : 'userMessage', 'botReply').
     */
    private sendMessageToWebview(text: string, command: string) {
        if (this._view) {
            this._view.webview.postMessage({ command, text });
        }
    }

    /**
     * Permet d’accéder à la WebView actuelle depuis l’extérieur (utile pour des mises à jour dynamiques).
     * 
     * @returns L’objet `vscode.Webview` si disponible, sinon `undefined`.
     */
    public getWebview(): vscode.Webview | undefined {
        return this._view?.webview;
    }
}
