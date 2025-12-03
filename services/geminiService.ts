import { GoogleGenAI, Type } from "@google/genai";
import { Task, LLMUpdateSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an intelligent assistant for a productivity app called "Focus Radar".
Your goal is to help the user reconcile their day by parsing their natural language reflection against their planned tasks.

You will receive:
1. A list of today's planned tasks (JSON).
2. A user's natural language description of what they actually did today.
3. A target language code (en or zh).

You must output a structured suggestion to update the tasks.

Rules:
- Identify if the user worked on existing tasks. If so, suggest an 'update_existing' action.
- If the user mentions working on something not in the list, suggest a 'create_new' action.
- Calculate time spent based on the user's text.
- Determine the new status (e.g., if they say "finished", status is "done").
- Be objective.
- The 'summary' field MUST be in the target language requested.
`;

export const analyzeDailyReview = async (
  currentTasks: Task[],
  userReflection: string,
  language: 'en' | 'zh'
): Promise<LLMUpdateSuggestion | null> => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const contextTasks = currentTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      estimate: t.estimateHours,
      actual_so_far: t.actualHours,
    }));

    const prompt = `
    Context Date: ${todayStr}
    Target Language: ${language === 'zh' ? 'Chinese (Simplified)' : 'English'}
    
    Current Tasks in System:
    ${JSON.stringify(contextTasks, null, 2)}

    User's Reflection:
    "${userReflection}"

    Generate a list of actions to update the system to match reality.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "The date of the review YYYY-MM-DD" },
            summary: { type: Type.STRING, description: "A very brief encouraging summary of the day in the Target Language" },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["update_existing", "create_new"] },
                  taskId: { type: Type.STRING, description: "UUID of existing task if updating" },
                  title: { type: Type.STRING, description: "Title for new task" },
                  statusChange: {
                    type: Type.STRING,
                    enum: ["todo", "in_progress", "done", "dropped"],
                    description: "New status if changed",
                  },
                  addActualHours: { type: Type.NUMBER, description: "Hours to ADD to the existing actual total" },
                  initialActualHours: { type: Type.NUMBER, description: "Hours spent on this new task" },
                  estimateHours: { type: Type.NUMBER, description: "Retrospective estimate for new task" },
                  category: {
                    type: Type.STRING,
                    enum: ["project", "learning", "communication", "misc"],
                    description: "Category for new task",
                  },
                },
                required: ["type"],
              },
            },
          },
          required: ["actions", "date"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as LLMUpdateSuggestion;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};