
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT_TEMPLATE = `
You are a world-class game developer with deep expertise in Python and the Pygame library.
A user has submitted the following Python code for a 'Flappy Bird' game.
Your task is to provide a thorough, expert code review.

Analyze the code based on the following classic Flappy Bird mechanics that the user was trying to implement:
- Objective: Endless runner, survive as long as possible.
- Controls: SPACEBAR or mouse click to flap upwards.
- Physics: Constant gravity pulling down, upward velocity on flap, terminal velocity cap.
- Obstacles: Pairs of green pipes scrolling from right to left with a random vertical gap.
- Collision Detection: Game ends on collision with pipes or the ground.
- Scoring: Score increments by 1 for each pair of pipes passed.
- Game States: A clear distinction between Menu/Start, Playing, and Game Over states.
- Visuals: 400x600 screen, simple colored shapes for bird, pipes, and background.
- Performance: Game loop running at a steady 60 FPS.

Provide your review in clear, well-structured Markdown format. Structure your response with the following sections:

### 🏆 Overall Impression
Start with a brief, encouraging summary of the code's quality and its current state as a 'Flappy Bird' game.

### ✅ Strengths
Use a bulleted list to highlight what the code does well. Mention any parts that are implemented correctly or show good practice.

### 💡 Areas for Improvement
This is the most important section. Provide specific, actionable suggestions for improvement. Refer to line numbers or code snippets if possible. Suggestions could include improving game physics, organizing code into functions or classes, making collision detection more robust, or managing game states more effectively.

### 🐛 Potential Bugs
Identify any potential bugs, logical errors, or parts of the code that might not work as intended. Explain why it's a bug and how to fix it.

### ⭐ Best Practices & Next Steps
Suggest Python or Pygame best practices that could be applied. For example, using constants for colors and screen dimensions, creating a Player class, or adding a high score system. Provide ideas for the next features the developer could add.

Now, please review the user's code below.
---
**User's Code:**
\`\`\`python
{CODE}
\`\`\`
---
`;

export async function reviewPythonCode(code: string): Promise<string> {
  try {
    const prompt = PROMPT_TEMPLATE.replace('{CODE}', code);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error interacting with Gemini API: ${error.message}`;
    }
    return "An unknown error occurred while fetching the review.";
  }
}
