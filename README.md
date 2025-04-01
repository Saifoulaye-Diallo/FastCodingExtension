# ⚡ Fast Coding – Extension VS Code

**Fast Coding** est une extension VS Code alimentée par GPT-4 Turbo (OpenAI) qui permet aux développeurs de gagner du temps grâce à l’intelligence artificielle. Elle propose un panneau de chat interactif, la génération de code à partir de commentaires, la documentation automatique, la revue de code, et même la complétion de code en temps réel.

> 🚀 Conçue pour les développeurs Python (et bientôt multi-langages).

---

## 📦 Installation

### Depuis la Marketplace

1. Ouvrez VS Code
2. Allez dans l’onglet Extensions (`Ctrl + Shift + X`)
3. Recherchez **Fast Coding**
4. Cliquez sur **Installer**

Ou installez directement avec la ligne de commande :

```bash
code --install-extension ton-publisher-id.fast-coding
```


## 🔐 Configuration

L’extension requiert une **clé API OpenAI** pour fonctionner.

### Étapes :

1. Ouvrir la palette de commandes (`Ctrl + Shift + P`)
2. Taper `Fast Coding: Set API Key`
3. Entrer votre clé API (GPT-4 ou GPT-3.5)

Vous pouvez aussi configurer le modèle par défaut dans les **Paramètres utilisateur** :

```json
"fastcoding.model": "gpt-4"
```

---

## 💻 Fonctionnalités

### 💬 Panneau de chat intelligent

- Accessible via l’icône Fast Coding dans la barre latérale gauche.
- Discutez avec l’IA : posez des questions, demandez de l’aide, générez du code.

### ⚡ Génération de code (palette)

- Écrivez un commentaire ou placez le curseur dans le fichier.
- Ouvrez la palette (`Ctrl + Shift + P`) → `Fast Coding: Générer du code`
- Le code généré s’insère automatiquement.

### 🧠 Revue de code (clic droit)

- Sélectionnez un bloc de code
- Clic droit → `Revue de code Fast Coding`
- Résultat affiché dans le panneau, avec possibilité de copier les suggestions

### 📘 Documentation automatique (clic droit)

- Sélectionnez une fonction ou classe
- Clic droit → `Générer la documentation Fast Coding`
- Documentation générée et affichée dans le panneau

### ✍️ Complétion automatique (inline)

- Suggestions affichées automatiquement pendant la saisie
- Appuyez sur `Tab` ou `Entrée` pour accepter

---

## 🔧 Personnalisation

Personnalisez l’expérience dans les **paramètres VS Code** (`Ctrl + ,`) :

| Paramètre | Description | Exemple |
|----------|-------------|---------|
| `fastcoding.apiKey` | Clé API OpenAI | `"sk-..."` |
| `fastcoding.model` | Modèle IA | `"gpt-4"` ou `"gpt-3.5-turbo"` |
| `fastcoding.prompts.generate` | Prompt personnalisé pour génération | `"Écris un code Python propre pour..."` |
| `fastcoding.prompts.review` | Prompt pour revue de code | `"Optimise ce code et détecte les erreurs"` |
| `fastcoding.prompts.doc` | Prompt pour documentation | `"Génère une doc Python claire"` |

---

## 🧪 Exemples d'utilisation (Python)

### ✅ Génération de code

```python
# Créer une fonction qui retourne le carré d’un nombre
```

➡️ Résultat :

```python
def carre(nombre):
    return nombre * nombre
```

---

### 🧠 Revue de code

Code sélectionné :

```python
def division(a, b):
    return a / b
```

➡️ Suggestion :

```python
def division(a, b):
    if b == 0:
        raise ValueError("Impossible de diviser par zéro")
    return a / b
```

---

### 📘 Documentation automatique

Avant :

```python
def soustraction(a, b):
    return a - b
```

Après :

```python
def soustraction(a, b):
    """
    Soustrait deux nombres.

    Args:
        a (int or float): Le premier nombre.
        b (int or float): Le deuxième nombre.

    Returns:
        int or float: Résultat de la soustraction.
    """
    return a - b
```

---

### ✍️ Complétion inline

Tapez :

```python
def somme(a, b):
```

➡️ Suggestion automatique :

```python
    return a + b
```

---

## ❓ FAQ

**Q : Est-ce que l’extension fonctionne avec GPT-3.5 ?**  
Oui, vous pouvez la configurer dans les paramètres avec `"gpt-3.5-turbo"`.

**Q : Est-ce que mes données sont enregistrées ?**  
Non. Aucune donnée personnelle ou de code n’est stockée par l’extension.

**Q : Comment changer le modèle ou le prompt ?**  
Via les paramètres VS Code dans `fastcoding.model` ou `fastcoding.prompts.*`.

---

## 📄 Licence

MIT © [Ton Nom ou Organisation]

---

## 📬 Contact

- GitHub : [https://github.com/ton-utilisateur/fast-coding](https://github.com/ton-utilisateur/fast-coding)
- Email : ton.email@example.com

```

---

Tu veux que je te génère ce `README.md` en fichier que tu peux télécharger directement ? Je peux aussi t’aider à ajouter des **badges GitHub**, **GIF de démonstration**, ou encore un **lien vers ta fiche Marketplace** si tu me donnes l’URL.
