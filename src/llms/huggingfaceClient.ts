import * as dotenv from 'dotenv';
import * as path from 'path';
import * as vscode from 'vscode';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const HF_API_KEY = process.env.HF_API_KEY;
const HF_TOKEN = HF_API_KEY;
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/bigcode/starcoder";

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export async function callHuggingFaceModelFIM(prefix: string, suffix: string): Promise<string> {
  try {
    const fullPrompt = `<fim_prefix>${prefix}<fim_suffix>${suffix}<fim_middle>`;
    console.log("[FastCoding] 🧠 Prompt FIM :", fullPrompt);

    const response = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7
        }
      })
    });

    const result = await response.json() as HuggingFaceResponse[];
    console.log("[FastCoding] ✅ Reponse générée :", result);

    if (result[0]?.error) {
      throw new Error(result[0].error);
    }

    const fullOutput = result[0]?.generated_text || "";

    const generated = fullOutput.replace(fullPrompt, "").trim();
   
    return generated;

  } catch (err: any) {
    console.error("❌ Erreur HuggingFace FIM :", err.message);
    vscode.window.showErrorMessage("Erreur de génération FIM : " + err.message);
    return "// Erreur de génération.";
  }
}
