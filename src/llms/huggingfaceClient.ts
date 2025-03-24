import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const HF_API_KEY = process.env.HF_API_KEY;

type  HFResponse = {
    generated_text: string;
  }[];
  
  export async function callHuggingFaceModel(prompt: string): Promise<string> {
    if (!HF_API_KEY) {
      throw new Error("Clé API Hugging Face non définie dans .env (HF_API_KEY).");
    }
  
    const response = await fetch(
      'https://api-inference.huggingface.co/models/bigcode/starcoder',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.3,
          },
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`[HuggingFace] ❌ Erreur HTTP : ${response.status} - ${response.statusText}`);
    }
  
    const data = await response.json() as HFResponse;
  
    const result = data[0]?.generated_text || '';
    return result.trim();
  }
  