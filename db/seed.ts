import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check if demo user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "demo"),
    });

    // Create demo user if it doesn't exist
    let userId;
    if (!existingUser) {
      console.log("Creating demo user...");
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: await hashPassword("password123!"),
      }).returning();
      userId = user.id;
      console.log(`Created demo user with id ${userId}`);
    } else {
      userId = existingUser.id;
      console.log(`Demo user already exists with id ${userId}`);
    }

    // Check if demo user has an assessment
    const existingAssessment = await db.query.assessments.findFirst({
      where: (assessments, { eq }) => eq(assessments.userId, userId),
    });

    // Create demo assessment if it doesn't exist
    if (!existingAssessment) {
      console.log("Creating demo assessment...");
      await db.insert(schema.assessments).values({
        userId,
        experienceLevel: "Intermediate (comfortable with basics, learning more complex concepts)",
        languages: ["JavaScript", "HTML", "CSS", "Python"],
        learningGoal: "Build web applications",
        goalDetails: "I want to become a full-stack developer focusing on JavaScript technologies",
        learningStyle: "Building projects (hands-on approach)",
        timeCommitment: "10-15 hours per week",
      });
      console.log("Created demo assessment");
    }

    // Check if demo user has guidance
    const existingGuidance = await db.query.guidance.findFirst({
      where: (guidance, { eq }) => eq(guidance.userId, userId),
    });

    // Create demo guidance if it doesn't exist
    if (!existingGuidance) {
      console.log("Creating demo guidance...");
      await db.insert(schema.guidance).values({
        userId,
        content: "Based on your assessment, I recommend starting with **JavaScript fundamentals** to build a solid foundation for web development.\n\nYour goal of becoming a full-stack developer will require knowledge of both front-end and back-end technologies. Here's what I suggest:\n\n- Focus on JavaScript fundamentals for 2-3 weeks (variables, functions, arrays, objects)\n- Then move to DOM manipulation and basic front-end concepts\n- Gradually introduce React.js for building user interfaces\n- Later, explore Node.js for back-end development\n\nGiven your time commitment of 10-15 hours per week, this approach will allow you to make steady progress while building practical skills.",
        codeExample: {
          title: "JavaScript Example",
          code: "// A simple JavaScript function example\nfunction calculateTotal(items) {\n  return items.reduce((total, item) => {\n    return total + item.price * item.quantity;\n  }, 0);\n}\n\n// Example usage\nconst cart = [\n  { name: 'Laptop', price: 999, quantity: 1 },\n  { name: 'Headphones', price: 99, quantity: 2 }\n];\n\nconst total = calculateTotal(cart);\nconsole.log(`Total: $${total}`); // Total: $1197",
          language: "javascript"
        }
      });
      console.log("Created demo guidance");
    }

    // Check if demo user has resources
    const existingResources = await db.query.resources.findMany({
      where: (resources, { eq }) => eq(resources.userId, userId),
    });

    // Create demo resources if they don't exist
    if (existingResources.length === 0) {
      console.log("Creating demo resources...");
      
      // Course resource
      await db.insert(schema.resources).values({
        userId,
        type: "course",
        title: "JavaScript Fundamentals",
        description: "A comprehensive guide to JavaScript basics for beginners",
        level: "Beginner",
        duration: "12 hours",
        imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww",
        link: "https://javascript.info/",
      });
      
      // Challenge resource
      await db.insert(schema.resources).values({
        userId,
        type: "challenge",
        title: "Array Manipulation",
        description: "Practice transforming and filtering arrays with JavaScript",
        level: "Beginner",
        duration: "45 minutes",
        link: "https://coderbyte.com/",
      });
      
      // Documentation resource
      await db.insert(schema.resources).values({
        userId,
        type: "documentation",
        title: "MDN Web Docs, JavaScript.info, React Documentation",
        description: "Comprehensive JavaScript reference, Modern JavaScript tutorial, Official React.js guides and API",
        link: "https://developer.mozilla.org/",
      });
      
      console.log("Created demo resources");
    }

    // Check if demo user has progress
    const existingProgress = await db.query.progress.findMany({
      where: (progress, { eq }) => eq(progress.userId, userId),
    });

    // Create demo progress if it doesn't exist
    if (existingProgress.length === 0) {
      console.log("Creating demo progress...");
      
      await db.insert(schema.progress).values([
        {
          userId,
          name: "JavaScript Fundamentals",
          percentage: 62,
        },
        {
          userId,
          name: "DOM Manipulation",
          percentage: 28,
        },
        {
          userId,
          name: "React Basics",
          percentage: 10,
        }
      ]);
      
      console.log("Created demo progress");
    }

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
