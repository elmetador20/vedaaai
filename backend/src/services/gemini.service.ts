import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateQuestionPaper(
  title: string,
  questionTypes: Array<{ type: string; count: number; marks: number }>,
  additionalInstructions: string,
  fileContent?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  const typesDescription = questionTypes
    .map((q) => `- ${q.count} ${q.type} of ${q.marks} marks each`)
    .join('\n');

  const fileContextPrompt = fileContent
    ? `The questions must be generated based on the following text context:\n--- START CONTEXT ---\n${fileContent}\n--- END CONTEXT ---\n`
    : '';

  const prompt = `You are a world-class educational assessment specialist and expert exam paper creator.
  Your task is to design an exceptionally high-quality, professional, and rigorous academic examination paper for the topic/title: "${title}".

  ${fileContextPrompt}

  ${fileContent ? `CRITICAL CONTEXTUAL RULE:
  - You MUST generate all questions and answers STRICLY, EXCLUSIVELY, and DIRECTLY from the provided text context above.
  - Do NOT draw from external training data, generic knowledge, or facts/theories not specifically mentioned in the text.
  - Every question must be fully answerable using only the information in the provided text.
  - Do NOT include phrases like "based on the text", "according to the document", or "in the provided context" in the question text. The exam should read like a natural, stand-alone academic exam.` : ''}

  EXAM SPECIFICATION:
  Create exactly the following sections and question distribution:
  ${typesDescription}

  QUALITY CRITERIA FOR QUESTIONS:
  1. **Bloom's Taxonomy Alignment**:
     - For "Easy" questions: Focus on comprehension and clear application.
     - For "Moderate" questions: Focus on analysis, comparison, and multi-step inference.
     - For "Hard" questions: Focus on synthesis, evaluation, resolving complex conceptual scenarios, or predicting outcomes based on the text principles.
  2. **Plausible Distractors (for MCQs)**:
     - All 4 options must be highly plausible, grammatically consistent, and close in length. Avoid obvious or silly distractors.
     - Distractors should target common student misconceptions or misinterpretations of the text.
  3. **Rigorous Explanations**:
     - Provide a comprehensive, high-quality, and detailed "explanation" for every question.
     - For MCQs, explain why the correct option is correct and briefly why the key distractors are incorrect or incomplete.
     - For Short/Long questions, provide a clear model response ("correctAnswer") and a point-by-point grading guide in the "explanation" (e.g. "Award 2 marks for mentioning X, and 1 mark for Y").

  Additional Instructions for the exam paper:
  "${additionalInstructions || 'None'}"

  Group the questions logically into sections. For Multiple Choice Questions, you MUST provide exactly 4 options in the "options" array. For non-MCQ questions, "options" must be null or not present.

  Return the output strictly in this JSON format:
  {
    "sections": [
      {
        "title": "Section Title (e.g. Section A: Multiple Choice Questions)",
        "instruction": "Instructions for this section (e.g. Attempt all questions)",
        "questions": [
          {
            "text": "The full question text",
            "difficulty": "Easy" | "Moderate" | "Hard",
            "marks": number,
            "options": ["option 1", "option 2", "option 3", "option 4"],
            "correctAnswer": "For MCQs, specify the exact option text that is correct. For short/long answer questions, specify a detailed model answer.",
            "explanation": "Detailed explanation of the correct answer, concept alignment, and grading guide."
          }
        ]
      }
    ]
  }`;

  let lastError: any = null;
  let responseText = '';

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      if (responseText) {
        break;
      }
    } catch (e: any) {
      console.warn(`Model ${modelName} failed:`, e.message || e);
      lastError = e;
    }
  }

  if (!responseText) {
    throw lastError || new Error('All Gemini models failed to generate content');
  }

  const parsed = JSON.parse(responseText);

  if (parsed && Array.isArray(parsed.sections)) {
    parsed.sections = parsed.sections.map((section: any) => {
      return {
        title: section.title || 'Section',
        instruction: section.instruction || 'Attempt all questions',
        questions: Array.isArray(section.questions)
          ? section.questions.map((q: any) => {
            let diff: 'Easy' | 'Moderate' | 'Hard' = 'Moderate';
            const norm = (q.difficulty || '').toLowerCase().trim();
            if (norm === 'easy') {
              diff = 'Easy';
            } else if (norm === 'hard') {
              diff = 'Hard';
            }
            return {
              text: q.text || 'Question text',
              difficulty: diff,
              marks: Number(q.marks) || 1,
              options: Array.isArray(q.options) ? q.options.map(String) : undefined,
              correctAnswer: q.correctAnswer ? String(q.correctAnswer) : undefined,
              explanation: q.explanation ? String(q.explanation) : undefined
            };
          })
          : []
      };
    });
  }

  return parsed;
}

export async function enhancePrompt(promptText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  const prompt = `You are a world-class prompt engineer specializing in educational content.
  Your task is to take a simple, draft instruction for generating an exam paper/assignment and enhance it to be highly descriptive, professional, detailed, and clear.
  
  User draft instruction: "${promptText}"
  
  Rewrite it into a comprehensive, clear set of additional instructions. The enhanced version should:
  1. Specify formatting, tone, style, or structure details.
  2. Maintain the core request and topic.
  3. Be concise but highly actionable for an AI model.
  4. Only output the enhanced instruction text itself. Do not include introductory text, meta-commentary, or formatting characters like quotes. Just output the clean rewritten instructions.`;

  let lastError: any = null;
  let responseText = '';

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
      if (responseText) {
        break;
      }
    } catch (e: any) {
      console.warn(`Model ${modelName} failed:`, e.message || e);
      lastError = e;
    }
  }

  if (!responseText) {
    throw lastError || new Error('All Gemini models failed to enhance prompt');
  }

  return responseText.trim().replace(/^"|"$/g, '');
}
