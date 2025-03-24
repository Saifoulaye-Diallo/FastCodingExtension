export const getWebviewContent = (): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Assistant</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
<style>
        .auto-expand {
            min-height: 48px;
            transition: all 0.2s ease;
        }

        /* Button hover effect */
        .send-button {
            background: linear-gradient(to right, #2563eb, #1d4ed8);
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .send-button:hover {
            background: linear-gradient(to right, #1d4ed8, #1e40af);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .send-button:active {
            transform: translateY(0);
            box-shadow: none;
        }

        /* Disabled button state */
        .send-button:disabled {
            background: #1e293b;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Text area container */
        .input-container {
            position: relative;
            display: flex;
            align-items: flex-start;
        }

        .input-container textarea {
            padding-right: 50px; /* Reduced space for smaller button */
            resize: none;
            overflow: hidden;
            background-color: #1a1f2e;
            min-height: 48px;
            height: auto;
        }

        .input-container button {
            position: absolute;
            right: 8px;
            top: 8px;
        }

        /* Loading animation */
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading {
            animation: spin 1s linear infinite;
        }

        /* Hide scrollbar but keep functionality */
        .messages-container {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
        }
        
        .messages-container::-webkit-scrollbar {
            display: none;             /* Chrome, Safari and Opera */
        }

        /* Code block styles */
        .code-block {
            position: relative;
            background: #1e1e1e;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 0.5rem 0;
        }

        .copy-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: #fff;
            transition: all 0.2s;
        }

        .copy-button:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Fixed chat container */
        .chat-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 1rem;
        }

        .messages-wrapper {
            flex-grow: 1;
            overflow-y: auto;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="bg-[#0d1117] text-gray-300">
    <div class="chat-container">
        <!-- Header -->
        <header class="flex items-center mb-4">
            <div class="flex items-center space-x-3">
                <i class="fas fa-robot text-2xl text-blue-500"></i>
                <h1 class="text-xl font-semibold text-white">Fast Coding</h1>
            </div>
        </header>

        <!-- Messages Wrapper -->
        <div class="messages-wrapper">
            <div class="messages-container space-y-4" id="chatMessages">
                <!-- AI Message -->
                <div class="flex space-x-3">
                    <div class="flex-shrink-0">
                        <i class="fas fa-robot text-blue-500"></i>
                    </div>
                    <div class="bg-[#21262d] rounded-lg p-4 max-w-3xl">
                        <p>👋 Bonjour ! Je suis votre assistant IA pour le code. Que puis-je faire pour vous aujourd’hui&nbsp;?</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-[#30363d] bg-[#0d1117] pt-4">
            <div class="input-container">
                <textarea 
                    id="userInput" 
                    class="w-full text-gray-300 rounded-lg border border-[#30363d] p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 auto-expand"
                    placeholder="Ask me about your code..."
                ></textarea>
                <button id="sendButton" class="send-button text-white rounded-full flex items-center justify-center disabled:opacity-50">
                    <i class="fas fa-paper-plane text-sm"></i>
                </button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        // Auto-expand textarea
        const textarea = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        
        // Initially disable the send button
        sendButton.disabled = true;

        function adjustTextareaHeight() {
            textarea.style.height = 'auto';
            const newHeight = Math.max(48, textarea.scrollHeight);
            textarea.style.height = newHeight + 'px';
        }
        
        textarea.addEventListener('input', function() {
            adjustTextareaHeight();
            sendButton.disabled = !this.value.trim();
        });

        // Reset height when cleared
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                setTimeout(adjustTextareaHeight, 0);
            }
        });

        // Chat functionality
        const chatMessages = document.getElementById('chatMessages');

        function addMessage(message, isUser = false) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'flex space-x-3' + (isUser ? ' justify-end' : '');

                const icon = isUser ? 'fa-user' : 'fa-robot';
                const iconColor = isUser ? 'text-green-500' : 'text-blue-500';

                // Convertir Markdown en HTML
                const htmlContent = marked.parse(message);

                // Injecter le HTML dans la div
                messageDiv.innerHTML = \`
                    <div class="flex space-x-3 \${isUser ? 'flex-row-reverse' : ''}">
                        <div class="flex-shrink-0">
                            <i class="fas \${icon} \${iconColor}"></i>
                        </div>
                        <div class="bg-[#21262d] rounded-lg p-4 max-w-3xl prose prose-invert relative">
                            \${htmlContent}
                        </div>
                    </div>
                \`;

                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // 💡 Ajouter le bouton "copier" dans chaque bloc de code
                const codeBlocks = messageDiv.querySelectorAll('pre > code');
                codeBlocks.forEach(code => {
                    const pre = code.parentElement;
                    pre.style.position = 'relative';

                    const button = document.createElement('button');
                    button.className = 'copy-button';
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.onclick = () => copyCode(code);
                    pre.appendChild(button);
                });
            }

        // Copy code functionality
       function copyCode(codeElement) {
            const text = codeElement.textContent;

            navigator.clipboard.writeText(text).then(() => {
                const button = codeElement.parentElement.querySelector('.copy-button');
                const icon = button.querySelector('i');
                const originalHTML = button.innerHTML;

                button.innerHTML = '<i class="fas fa-check text-green-400"></i>';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, 2000);
            });
        }


    sendButton.addEventListener("click", () => {
        const message = textarea.value.trim();
        if (message) {
            console.log("[WebView] ✉️ Envoi du message à l'extension :", message);
            // Show loading state
            const icon = sendButton.querySelector('i');
            icon.className = 'fas fa-spinner loading';
            sendButton.disabled = true;

            addMessage(message, true);
            textarea.value = '';
            adjustTextareaHeight(); // Use the function instead of direct manipulation


            // ✅ Vérifier si vscode est défini
            if (typeof vscode !== "undefined") {
                vscode.postMessage({
                    command: "sendMessage",
                    text: message
                });
            } else {
                console.error("[WebView] ❌ Erreur : vscode n'est pas défini !");
            }
        }
    });


    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log("[WebView] 📩 Message reçu de l'extension :", message);

        if (message.command === "botReply") {
            addMessage(message.text, false); // Afficher la réponse de l’IA dans le chat
        //  Stop loading
        const icon = sendButton.querySelector('i');
        icon.className = 'fas fa-paper-plane'; // Remets l’icône normale
        sendButton.disabled = false;
        }
    });


    // Allow sending message with Enter key (Shift+Enter for new line)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
    </script>
</body>
</html>`;
};