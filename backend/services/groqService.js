import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

export const generateNotesFromGroq = async (payload) => {
  const { stream, semester, subject, moduleNum, topics, depth, includeExamples, includeTips } = payload;
  
  const prompt = `You are an expert engineering professor writing a premium textbook chapter. Please generate comprehensive notes for engineering students.
Stream: ${stream} Engineering
Semester: ${semester}
Subject: ${subject}
Module: ${moduleNum}
Topics to cover: ${topics}
Depth/Style: ${depth === 'exam' ? 'Exam-oriented (focus on key points, definitions, formulas, and common exam questions)' : 'In-depth (detailed explanations, background theory, derivations)'}
Include Practical Examples: ${includeExamples ? 'Yes' : 'No'}
Include Exam Tips/Tricks: ${includeTips ? 'Yes' : 'No'}

FORMATTING REQUIREMENTS:
1. Math: Use standard LaTeX math notation. ALL math MUST be wrapped in $ (inline) or $$ (block). DO NOT use backticks (\`) for math formulas.
2. Block Math: MUST be on its own separate line. DO NOT put math inside Markdown code blocks.
3. Diagrams & Tables: DO NOT generate any flowcharts, diagrams, mind maps, ASCII art, or tables of any kind. Use ONLY plain text, bullet points, and headers to structure information.
6. Start with a Cover Page layout using markdown headers:
# MODULE ${moduleNum}: ${subject}
## ${stream} Engineering - Semester ${semester}
### Comprehensive University Study Guide
---
7. Structure the rest like a textbook chapter. Use ## for main sections (e.g., 1. Functional Units), ### for subsections.
8. Do not include any pleasantries.`;

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Attempting generation with model: ${model}`);
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        temperature: 0.7,
        max_tokens: 8000,
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error(`Error with model ${model}:`, error.message);
      lastError = error;
      
      // If it's a 400 Bad Request, it's likely a prompt issue, no point in retrying.
      // We specifically want to retry on 429 (Rate Limit), 503 (Capacity), or timeouts.
      if (error.status === 400) {
        throw error;
      }
      
      console.log(`Falling back to next model...`);
    }
  }

  // If we exhaust all models, throw the last error
  throw new Error(`All models failed. Last error: ${lastError?.message}`);
};
