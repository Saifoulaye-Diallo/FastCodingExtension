import * as fs from 'fs';
import * as path from 'path';
import { codeCompletion } from './codeCompletionEval';

const PROBLEM_PATH = path.join(__dirname, 'human-eval', 'data', 'HumanEval.jsonl');
const OUTPUT_PATH = path.join(__dirname, 'samples.jsonl');

async function main() {
  const lines = fs.readFileSync(PROBLEM_PATH, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '');

  const samples = [];

  for (const line of lines) {
    const problem = JSON.parse(line);
    const taskId = problem.task_id;
    const prompt = problem.prompt;

    let completion = await codeCompletion(prompt);
    

    if (completion.startsWith('def') && prompt.includes(completion.split('\n')[0].trim())) {
      completion = completion.split('\n').slice(1).join('\n');
    }

    const fullCompletion = completion;

    samples.push({
      task_id: taskId,
      completion: fullCompletion
    });
  }

  fs.writeFileSync(OUTPUT_PATH, samples.map(sample => JSON.stringify(sample)).join('\n'));
  console.log(`✅ Terminé : ${samples.length} complétions générées dans ${OUTPUT_PATH}`);
}

main().catch(console.error);
