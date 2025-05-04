import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

// Function to generate AI guidance based on user assessment
export async function generateGuidance(userId: number, assessment: any): Promise<any> {
  try {
    const prompt = `
      Based on the following coding proficiency assessment, provide personalized learning guidance 
      for a student. Include specific advice, learning path recommendations, and a relevant code example.
      
      User Assessment:
      - Experience Level: ${assessment.experienceLevel}
      - Programming Languages: ${assessment.languages.join(', ')}
      - Learning Goal: ${assessment.learningGoal}
      - Additional Goal Details: ${assessment.goalDetails || 'None provided'}
      - Learning Style: ${assessment.learningStyle}
      - Time Commitment: ${assessment.timeCommitment}
      
      Provide:
      1. Personalized learning guidance (3-4 paragraphs)
      2. Specific recommendations for learning resources
      3. A code example related to their learning goals
      
      Respond in JSON format with these fields:
      {
        "guidance": {
          "content": "your personalized guidance here with markdown formatting including **bold** for emphasis and lists with - bullets",
          "codeExample": {
            "title": "Example Title (e.g. JavaScript Example)",
            "code": "// The actual code goes here",
            "language": "language name (e.g. javascript)"
          }
        },
        "resources": [
          {
            "type": "course",
            "title": "Resource Title",
            "description": "Brief description",
            "level": "Beginner/Intermediate/Advanced",
            "duration": "Estimated time (e.g. 12 hours)",
            "link": "https://example.com"
          },
          {
            "type": "challenge",
            "title": "Practice Challenge Title",
            "description": "Brief description",
            "level": "Difficulty level",
            "duration": "Estimated time",
            "link": "https://example.com"
          },
          {
            "type": "documentation",
            "title": "Resource Name 1, Resource Name 2, Resource Name 3",
            "description": "Brief description 1, Brief description 2, Brief description 3",
            "link": "https://example.com"
          }
        ],
        "progress": [
          {
            "name": "Topic/Skill 1",
            "percentage": number
          },
          {
            "name": "Topic/Skill 2",
            "percentage": number
          },
          {
            "name": "Topic/Skill 3",
            "percentage": number
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a coding education expert specialized in creating personalized learning plans.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(responseContent);
    const { guidance, resources, progress } = parsedResponse;

    // Store guidance
    const guidanceData = {
      userId,
      content: guidance.content,
      codeExample: guidance.codeExample,
    };
    const createdGuidance = await storage.createOrUpdateGuidance(guidanceData);

    // Store resources
    if (resources && Array.isArray(resources)) {
      for (const resource of resources) {
        await storage.createResource({
          userId,
          ...resource,
        });
      }
    }

    // Store progress
    if (progress && Array.isArray(progress)) {
      for (const progressItem of progress) {
        await storage.createOrUpdateProgress({
          userId,
          ...progressItem,
        });
      }
    }

    return createdGuidance;
  } catch (error) {
    console.error("Error generating guidance:", error);
    throw new Error("Failed to generate AI guidance");
  }
}
