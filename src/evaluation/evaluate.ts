import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { generateCodeCore } from './generateCodeCore';
import * as os from 'os';

// 🧠 Commande Python selon le système d’exploitation (Windows vs Unix)
const PYTHON_CMD = os.platform() === 'win32' ? 'python' : 'python3';

/**
 * Représente un problème de programmation à résoudre par l’IA.
 */
interface Problem {
  task_id: string;
  prompt: string;
  test: string;
  entry_point: string;
}

// 📁 Fichiers utilisés
const PROBLEMS_FILE = path.join(__dirname, 'example_problem.jsonl'); // Liste des problèmes
const TEMP_FILE = path.join(__dirname, 'temp_test.py');              // Fichier temporaire pour exécution
const RESULTS_FILE = path.join(__dirname, 'results.json');           // Fichier de sortie avec les résultats

// 📊 Statistiques globales
let total = 0;
let passed = 0;
const results: any[] = [];

/**
 * 🚀 Fonction principale pour évaluer les capacités du modèle à résoudre des problèmes de code.
 * 
 * - Lit les problèmes dans un fichier JSONL.
 * - Génère une solution avec l'IA pour chaque prompt.
 * - Exécute le code généré avec les tests.
 * - Stocke les résultats dans un fichier JSON.
 */
async function runEvaluation() {
  // 🔄 Lecture et préparation des lignes JSON valides
  const lines = fs.readFileSync(PROBLEMS_FILE, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.startsWith('{'));

  // 🧪 Limite à 10 tâches pour l’évaluation
  for (const line of lines.slice(0, 10)) {
    total++;
    const task: Problem = JSON.parse(line);
    console.log(`\n🧪 Task: ${task.task_id}`);

    try {
      // 📤 Génération de code via le cœur du système IA
      let completion = await generateCodeCore(task.prompt);

      // 🔧 Nettoyage du bloc markdown (si encadré par ```python)
      completion = stripMarkdownCodeBlock(completion);

      console.log(`[FastCoding] 📝 Prompt envoyé au modèle :\n${task.prompt}`);
      console.log(`[FastCoding] 💡 Code généré par l'IA :\n${completion}`);

      // 🧩 Construction du fichier de test
      const functionCode = completion.trim();
      const fullCode = `${functionCode}\n\n${task.test}\n\ncheck(${task.entry_point})`;

      // 💾 Écriture du fichier temporaire à exécuter
      fs.writeFileSync(TEMP_FILE, fullCode);
      console.log("[FastCoding] ✅ Code final envoyé à Python :\n" + fullCode);

      try {
        // ⚙️ Exécution du script Python
        execSync(`${PYTHON_CMD} "${TEMP_FILE}"`, { stdio: 'inherit' });

        // ✅ Test réussi
        console.log(`✅ ${task.task_id} PASSED`);
        passed++;
        results.push({
          task_id: task.task_id,
          passed: true,
          prompt: task.prompt,
          completion
        });

      } catch (error: any) {
        // ❌ Test échoué
        console.log(`❌ ${task.task_id} FAILED`);
        console.log("💥 Erreur Python :", error.stderr?.toString() || error.message);
        results.push({
          task_id: task.task_id,
          passed: false,
          prompt: task.prompt,
          completion,
          error: error.stderr?.toString() || error.message
        });
      }

    } finally {
      // 🧹 Nettoyage du fichier temporaire
      if (fs.existsSync(TEMP_FILE)) {
        fs.unlinkSync(TEMP_FILE);
      }
    }
  }

  // 📊 Résumé de la session
  const score = ((passed / total) * 100).toFixed(2);
  console.log(`\n📊 Résultat final : ${passed}/${total} réussis (${score}%)`);

  // 💾 Sauvegarde des résultats détaillés
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ total, passed, score, results }, null, 2));
  console.log(`📁 Résultats exportés : ${RESULTS_FILE}`);
}

/**
 * 🔧 Nettoie une chaîne contenant un bloc Markdown ```python.
 * 
 * @param code - Le texte généré par l’IA potentiellement encadré de ```.
 * @returns Le code purifié, sans balises Markdown.
 */
function stripMarkdownCodeBlock(code: string): string {
  return code
    .replace(/^```(python)?/, '') // Supprime ``` ou ```python en début
    .replace(/```$/, '')         // Supprime ``` en fin
    .trim();
}

// 🚀 Lancement automatique à l'exécution du fichier
runEvaluation();
