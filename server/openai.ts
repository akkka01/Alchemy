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

    try {
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
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Provide fallback content based on assessment
      return generateFallbackGuidance(userId, assessment);
    }
  } catch (error) {
    console.error("Error generating guidance:", error);
    throw new Error("Failed to generate AI guidance");
  }
}

// Generate fallback guidance when OpenAI API fails
async function generateFallbackGuidance(userId: number, assessment: any): Promise<any> {
  const language = assessment.languages.length > 0 ? assessment.languages[0] : "JavaScript";
  const level = assessment.experienceLevel.toLowerCase().includes("beginner") ? "beginner" : 
               assessment.experienceLevel.toLowerCase().includes("intermediate") ? "intermediate" : "advanced";
  
  // Create a basic guidance content based on assessment data
  let content = `**Welcome to your personalized learning journey!**\n\n`;
  content += `Based on your assessment, we've identified that you're at the ${assessment.experienceLevel} level `;
  content += `and want to focus on ${assessment.learningGoal}.\n\n`;
  content += `We recommend starting with the following learning path:\n\n`;
  content += `- Build a strong foundation in ${language}\n`;
  content += `- Practice with small projects that align with your learning goals\n`;
  content += `- Commit to a consistent learning schedule (${assessment.timeCommitment})\n\n`;
  content += `Following your preferred ${assessment.learningStyle} learning style will help you progress effectively.`;

  // Create a code example based on the language
  let codeExample = {
    title: `${language} Example`,
    language: language.toLowerCase(),
    code: ""
  };

  // Simple code examples for commonly selected languages
  if (language === "JavaScript" || language === "TypeScript") {
    codeExample.code = `// Simple function to demonstrate JavaScript concepts
function calculateLearningTime(hoursPerWeek, weeksCommitted) {
  const totalHours = hoursPerWeek * weeksCommitted;
  console.log("After " + weeksCommitted + " weeks, you will have studied for " + totalHours + " hours!");
  return totalHours;
}

// Call the function
calculateLearningTime(5, 12);`;
  } else if (language === "Python") {
    codeExample.code = `# Simple function to demonstrate Python concepts
def calculate_learning_time(hours_per_week, weeks_committed):
    total_hours = hours_per_week * weeks_committed
    print(f"After {weeks_committed} weeks, you will have studied for {total_hours} hours!")
    return total_hours

# Call the function
calculate_learning_time(5, 12)`;
  } else if (language === "Java") {
    codeExample.code = `// Simple class to demonstrate Java concepts
public class LearningTracker {
    public static int calculateLearningTime(int hoursPerWeek, int weeksCommitted) {
        int totalHours = hoursPerWeek * weeksCommitted;
        System.out.println("After " + weeksCommitted + " weeks, you will have studied for " + totalHours + " hours!");
        return totalHours;
    }

    public static void main(String[] args) {
        calculateLearningTime(5, 12);
    }
}`;
  } else {
    // Generic code example for other languages
    codeExample.code = `// Example code structure for programming fundamentals
// 1. Variables and data types
// 2. Control structures (if/else, loops)
// 3. Functions/methods
// 4. Classes and objects (for OOP languages)

// This is a placeholder - replace with actual ` + language + ` syntax
// as you learn more about the language!`;
  }

  // Create fallback resources
  const resources = [
    {
      type: "course",
      title: `${language} Fundamentals`,
      description: `Learn the basics of ${language} with hands-on exercises`,
      level: level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced",
      duration: "20 hours",
      link: `https://www.freecodecamp.org/`,
      imageUrl: "https://cdn.iconscout.com/icon/free/png-256/free-code-280-460136.png"
    },
    {
      type: "documentation",
      title: `${language} Official Documentation`,
      description: `Complete reference guide for ${language}`,
      link: "https://developer.mozilla.org/",
      imageUrl: "https://cdn.iconscout.com/icon/free/png-256/free-document-1767563-1502550.png"
    },
    {
      type: "challenge",
      title: "Coding Challenges",
      description: "Practice your skills with interactive challenges",
      level: level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced",
      duration: "Self-paced",
      link: "https://exercism.org/",
      imageUrl: "https://cdn.iconscout.com/icon/free/png-256/free-challenge-1817231-1537877.png"
    }
  ];

  // Create fallback progress metrics
  const progress = [
    {
      name: `${language} Basics`,
      percentage: 0
    },
    {
      name: "Problem Solving",
      percentage: 0
    },
    {
      name: "Project Development",
      percentage: 0
    }
  ];

  // Store guidance
  const guidanceData = {
    userId,
    content,
    codeExample,
  };
  const createdGuidance = await storage.createOrUpdateGuidance(guidanceData);

  // Store resources
  for (const resource of resources) {
    await storage.createResource({
      userId,
      ...resource,
    });
  }

  // Store progress
  for (const progressItem of progress) {
    await storage.createOrUpdateProgress({
      userId,
      ...progressItem,
    });
  }

  return createdGuidance;
}
