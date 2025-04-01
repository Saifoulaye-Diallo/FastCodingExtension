
# ⚡ Fast Coding – Extension VS Code

**Fast Coding** est une extension pour Visual Studio Code qui propulse votre productivité avec l’intelligence artificielle (GPT-4 ou GPT-3.5 via OpenAI).  
Elle permet de **générer du code**, **documenter automatiquement**, **faire des revues de code**, et même **discuter avec un assistant IA** depuis un panneau latéral – le tout sans quitter votre éditeur.

---

## 📦 Installation

### Depuis la Marketplace

1. Ouvrez Visual Studio Code
2. Allez dans l’onglet **Extensions** (`Ctrl + Shift + X`)
3. Recherchez **Fast Coding**
4. Cliquez sur **Installer**
---

## 🔐 Configuration

Avant de commencer, configurez votre **clé API OpenAI** :

1. Ouvrir la palette de commandes (`Ctrl + Shift + P`)
2. Rechercher : `Fast Coding: Saisir la clé API`
3. Entrer votre clé API (`sk-...`)

Votre clé est **stockée localement** de manière sécurisée.

---

## 💡 Fonctionnalités

### 💬 Panneau de chat IA

- Cliquez sur l’icône **Fast Coding** dans la barre latérale gauche
- Posez vos questions ou discutez avec le modèle (ex: "Explique-moi ce code", "Génère une fonction tri")
- Les réponses s'affichent dans un panneau interactif

---

### ⚡ Génération de code (palette de commandes)

- Écrivez un commentaire dans votre fichier, comme :
  ```python
  # Créer une fonction qui retourne le carré d’un nombre
  ```
- Ouvrez la palette (`Ctrl + Shift + P`) → `Fast Coding: Générer du code`
- Le code est généré et automatiquement inséré dans le fichier

---

### 🧠 Revue de code (clic droit)

- Sélectionnez un bloc de code
- Cliquez droit → `Revue de code Fast Coding`
- Une analyse complète du code s’affiche dans le panneau
- Vous pouvez **copier le code suggéré** s’il y a des améliorations

---

### 📘 Documentation automatique (clic droit)

- Sélectionnez une fonction ou un bloc de code
- Cliquez droit → `Générer la documentation Fast Coding`
- La documentation est générée (ex: docstring Python)
- Le contenu est copiable directement depuis le panneau

---

### ✍️ Complétion automatique (inline)

- Pendant la saisie dans VS Code, l’extension propose des complétions IA en temps réel
- Suggestions affichées sous forme de texte grisé
- Acceptez avec `Tab` ou `Entrée`

---

## ⚙️ Personnalisation

Vous pouvez personnaliser les prompts et les modèles dans les paramètres de VS Code :

1. `Fichier > Préférences > Paramètres` (`Ctrl + ,`)
2. Recherchez `Fast Coding`

### Paramètres disponibles :

| Clé                       | Description                        | Exemple                            |
|---------------------------|------------------------------------|------------------------------------|
| `fastcoding.apiKey`       | Clé API OpenAI                     | `"sk-..."`                         |
| `fastcoding.model`        | Modèle utilisé                     | `"gpt-4"`, `"StarCoder"`,  `"CodeLlama"`   |

---

## 🧪 Exemples d’utilisation (Python)

### ✅ Génération

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

Sélection :

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
def addition(a, b):
    return a + b
```

Après :

```python
def addition(a, b):
    """
    Additionne deux nombres.

    Args:
        a (int or float): Le premier nombre.
        b (int or float): Le deuxième nombre.

    Returns:
        int or float: Résultat de l'addition.
    """
    return a + b
```

---

### ✍️ Complétion inline

Vous tapez :

```python
def somme(a, b):
```

➡️ Suggestion inline :

```python
    return a + b
```

---

## 📄 Licence

MIT © Saifoulaye Diallo – UQAR 2025

---

## 📬 Contact

- GitHub : [https://github.com/ton-utilisateur/fast-coding](https://github.com/ton-utilisateur/fast-coding)
- Email : dias0084@uqar.ca
```

---
