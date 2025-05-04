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
  
  // Create a more comprehensive and personalized guidance content based on assessment data
  let content = `**Welcome to your personalized learning journey!**\n\n`;
  content += `Based on your assessment, we've identified that you're at the **${assessment.experienceLevel}** level `;
  content += `and want to focus on **${assessment.learningGoal}**. Given your preference for a ${assessment.learningStyle.toLowerCase()} learning style and `;
  content += `${assessment.timeCommitment.toLowerCase()} time commitment, we've created a tailored plan for you.\n\n`;
  
  content += `### Personalized Learning Path\n\n`;
  
  // Add beginner-specific advice
  if (level === "beginner") {
    content += `**Getting Started with ${language}**\n\n`;
    content += `As a beginner, it's important to build a solid foundation in ${language} fundamentals:\n\n`;
    content += `1. **Learn the syntax and basic concepts** - Start with variables, data types, and control structures\n`;
    content += `2. **Master functions and basic algorithms** - Practice writing reusable code and solving simple problems\n`;
    content += `3. **Understand error handling** - Learn to debug and troubleshoot common issues\n`;
    content += `4. **Build small projects** - Apply what you've learned to create simple applications\n\n`;
    
    content += `**Recommended Learning Schedule (${assessment.timeCommitment})**:\n\n`;
    content += `- **Week 1-2:** Focus on syntax and basic concepts\n`;
    content += `- **Week 3-4:** Practice with functions and simple algorithms\n`;
    content += `- **Week 5-6:** Build your first small project\n`;
    content += `- **Week 7-8:** Review concepts and expand your project\n\n`;
  } 
  // Add intermediate-specific advice
  else if (level === "intermediate") {
    content += `**Advancing Your ${language} Skills**\n\n`;
    content += `As an intermediate developer, focus on deeper concepts and building more complex applications:\n\n`;
    content += `1. **Advanced programming concepts** - Dive into OOP, functional programming, and design patterns\n`;
    content += `2. **Data structures and algorithms** - Learn efficient ways to organize and process data\n`;
    content += `3. **Build more complex projects** - Create applications that solve real-world problems\n`;
    content += `4. **Explore frameworks and libraries** - Learn industry-standard tools for ${language}\n\n`;
    
    content += `**Recommended Learning Schedule (${assessment.timeCommitment})**:\n\n`;
    content += `- **Week 1-2:** Study advanced programming concepts\n`;
    content += `- **Week 3-4:** Practice with data structures and algorithms\n`;
    content += `- **Week 5-8:** Build a comprehensive project using frameworks/libraries\n\n`;
  }
  // Add advanced-specific advice
  else {
    content += `**Mastering ${language} and Software Engineering**\n\n`;
    content += `As an advanced developer, focus on mastery, optimization, and specialized areas:\n\n`;
    content += `1. **Software architecture** - Design scalable, maintainable systems\n`;
    content += `2. **Performance optimization** - Fine-tune your code for efficiency\n`;
    content += `3. **Specialized domains** - Explore areas like AI/ML, security, or cloud computing\n`;
    content += `4. **Contribute to open source** - Share your expertise with the community\n\n`;
    
    content += `**Recommended Learning Schedule (${assessment.timeCommitment})**:\n\n`;
    content += `- **Week 1-2:** Study software architecture patterns\n`;
    content += `- **Week 3-4:** Practice optimization techniques\n`;
    content += `- **Week 5-8:** Develop an advanced project in your specialized domain\n\n`;
  }
  
  // Add learning style recommendations
  content += `### Learning Style Recommendations\n\n`;
  if (assessment.learningStyle.toLowerCase().includes("visual")) {
    content += `Since you prefer visual learning, we recommend:\n\n`;
    content += `- Video tutorials and courses with demonstrations\n`;
    content += `- Diagrams and flowcharts for conceptual understanding\n`;
    content += `- Coding sessions with highlighted syntax\n`;
    content += `- Visual debugging tools\n\n`;
  } else if (assessment.learningStyle.toLowerCase().includes("reading")) {
    content += `Since you prefer learning through reading, we recommend:\n\n`;
    content += `- Comprehensive documentation and books\n`;
    content += `- In-depth articles and tutorials\n`;
    content += `- Code analysis with detailed comments\n`;
    content += `- Written guides and best practices\n\n`;
  } else if (assessment.learningStyle.toLowerCase().includes("interactive") || assessment.learningStyle.toLowerCase().includes("hands-on")) {
    content += `Since you prefer hands-on/interactive learning, we recommend:\n\n`;
    content += `- Coding challenges and exercises\n`;
    content += `- Project-based learning\n`;
    content += `- Interactive tutorials and coding playgrounds\n`;
    content += `- Pair programming or coding meetups\n\n`;
  } else {
    content += `Based on your learning style, we recommend:\n\n`;
    content += `- A mix of resources (videos, documentation, challenges)\n`;
    content += `- Regular practice with coding exercises\n`;
    content += `- Building projects that match your interests\n`;
    content += `- Consistent review of concepts\n\n`;
  }
  
  content += `### Next Steps\n\n`;
  content += `1. Explore the recommended resources in the dashboard\n`;
  content += `2. Set up a consistent study schedule based on your ${assessment.timeCommitment.toLowerCase()} availability\n`;
  content += `3. Track your progress through the skills listed below\n`;
  content += `4. Build projects that align with your goals in ${assessment.learningGoal}\n\n`;
  
  content += `Remember, consistent practice is key to improving your programming skills. Good luck on your coding journey!`;

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

  // Create specific, high-quality fallback resources based on language and level
  let resources = [];
  
  // Language-specific resource recommendations
  if (language === "JavaScript") {
    resources = [
      {
        type: "course",
        title: "JavaScript - The Complete Guide",
        description: "Comprehensive JavaScript course covering fundamentals to advanced concepts",
        level: level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced",
        duration: "40 hours",
        link: "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/240px-JavaScript-logo.png"
      },
      {
        type: "video",
        title: "JavaScript Crash Course For Beginners",
        description: "Quick introduction to JavaScript fundamentals with practical examples",
        level: "Beginner",
        duration: "1.5 hours",
        link: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
        imageUrl: "https://i.ytimg.com/vi/hdI2bqOjy3c/hqdefault.jpg"
      },
      {
        type: "documentation",
        title: "MDN JavaScript Guide, JavaScript Info, W3Schools JavaScript",
        description: "Official JavaScript reference, In-depth JavaScript tutorials, Simple JavaScript examples",
        link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      },
      {
        type: "challenge",
        title: "JavaScript 30",
        description: "Build 30 things in 30 days with vanilla JavaScript",
        level: "Intermediate",
        duration: "30 days",
        link: "https://javascript30.com/",
        imageUrl: "https://javascript30.com/images/JS3-social-share.png"
      }
    ];
  } else if (language === "Python") {
    resources = [
      {
        type: "course",
        title: "Python for Everybody",
        description: "Learn Python from scratch with Dr. Charles Severance",
        level: "Beginner",
        duration: "30 hours",
        link: "https://www.coursera.org/specializations/python",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/240px-Python-logo-notext.svg.png"
      },
      {
        type: "video",
        title: "Python Tutorial - Python Full Course for Beginners",
        description: "Comprehensive Python tutorial covering all the basics",
        level: "Beginner",
        duration: "4.5 hours",
        link: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        imageUrl: "https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg"
      },
      {
        type: "documentation",
        title: "Python.org Documentation, Real Python, W3Schools Python",
        description: "Official Python documentation, Practical Python tutorials, Simple Python examples with exercises",
        link: "https://docs.python.org/3/",
      },
      {
        type: "challenge",
        title: "Python Projects for Beginners",
        description: "Build 10 real-world Python applications",
        level: level === "beginner" ? "Beginner" : "Intermediate",
        duration: "15 hours",
        link: "https://www.youtube.com/watch?v=8ext9G7xspg",
        imageUrl: "https://i.ytimg.com/vi/8ext9G7xspg/hqdefault.jpg"
      }
    ];
  } else if (language === "Java") {
    resources = [
      {
        type: "course",
        title: "Java Programming Masterclass",
        description: "Comprehensive Java course covering core concepts and advanced topics",
        level: level === "beginner" ? "Beginner to Intermediate" : "Intermediate to Advanced",
        duration: "80 hours",
        link: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Java_programming_language_logo.svg/182px-Java_programming_language_logo.svg.png"
      },
      {
        type: "video",
        title: "Java Tutorial for Beginners",
        description: "Step-by-step Java tutorial for beginners",
        level: "Beginner",
        duration: "7 hours",
        link: "https://www.youtube.com/watch?v=eIrMbAQSU34",
        imageUrl: "https://i.ytimg.com/vi/eIrMbAQSU34/hqdefault.jpg"
      },
      {
        type: "documentation",
        title: "Oracle Java Tutorials, Baeldung, JavaTpoint",
        description: "Official Java tutorials, In-depth Java articles, Simplified Java concepts with examples",
        link: "https://docs.oracle.com/javase/tutorial/",
      },
      {
        type: "challenge",
        title: "Learn Java by Building Projects",
        description: "Hands-on Java development with practical projects",
        level: "Intermediate",
        duration: "20 hours",
        link: "https://www.codecademy.com/learn/learn-java",
        imageUrl: "https://www.codecademy.com/resources/blog/content/images/2021/05/java-projects-for-beginners.png"
      }
    ];
  } else {
    // Default resources for other languages
    resources = [
      {
        type: "course",
        title: `${language} Comprehensive Course`,
        description: `Complete ${language} course from fundamentals to advanced topics`,
        level: level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced",
        duration: "40 hours",
        link: `https://www.freecodecamp.org/learn/`,
        imageUrl: "https://cdn.iconscout.com/icon/free/png-256/free-code-280-460136.png"
      },
      {
        type: "video",
        title: `${language} Tutorial for Beginners`,
        description: `Learn ${language} basics through video tutorials`,
        level: "Beginner",
        duration: "3 hours",
        link: "https://www.youtube.com/c/programmingwithmosh",
        imageUrl: "https://yt3.googleusercontent.com/ytc/APkrFKY455xp16s2AIHalRjK60zas-DitxAHmRjQsQ5J=s176-c-k-c0x00ffffff-no-rj"
      },
      {
        type: "documentation",
        title: `${language} Official Documentation, W3Schools ${language}, TutorialsPoint`,
        description: `Official ${language} reference, Simple ${language} tutorials, Comprehensive ${language} guides`,
        link: "https://www.w3schools.com/",
      },
      {
        type: "challenge",
        title: "Coding Challenges and Exercises",
        description: "Improve your programming skills with interactive exercises",
        level: level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced",
        duration: "Self-paced",
        link: "https://exercism.org/",
        imageUrl: "https://cdn.iconscout.com/icon/free/png-256/free-challenge-1817231-1537877.png"
      }
    ];
  }

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
