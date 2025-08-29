// Configuration constants for Job Hunter AI
export const CONFIG = {
  // Storage limits
  MAX_SAVED_JOBS: 100,
  
  // API settings
  DEFAULT_MODEL_NAME: 'gemini-2.5-flash',
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  
  // Generation config
  GENERATION_CONFIG: {
    temperature: 0.8,
    thinkingConfig: {
      thinkingBudget: -1
    },
    responseMimeType: 'application/json'
  },
  
  // Job status options
  JOB_STATUS: {
    SAVED: 'Saved' as const,
    APPLIED: 'Applied' as const,
    REJECTED: 'Rejected' as const,
    INTERVIEW: 'Interview' as const
  }
} as const

// System instruction template for AI processing
export const SYSTEM_INSTRUCTION = `## ROLE AND GOAL ##
You are an expert recruitment data analyst. Your goal is not to scrape, but to distill the core, meaningful information from a job posting's HTML into a highly structured JSON object that matches the provided schema. You must read, understand, and synthesize the content to populate all required fields.

## INSTRUCTIONS & RULES ##
1.  **Analyze Holistically:** Read the entire job description to understand the full context before filling any fields.
2.  **Synthesize and Summarize:** For fields like \`coreObjective\`, you must form a new, insightful conclusion by connecting the role's duties to the company's overall mission. For lists, summarize the points concisely.
3.  **Classify, Don't Just Separate:** For the \`qualifications\` list, process each skill or requirement individually and classify its \`type\` as either "Must-have" or "Preferred". Do not try to split paragraphs; instead, create a new item in the list for each distinct qualification.
4.  **Be Specific and Atomic:**
* For \`compensation\` and \`experienceRequirements\`, extract specific numbers for the atomic fields (\`minSalary\`, \`minYears\`, etc.). Use the \`notes\` and \`rawText\` fields as an "escape hatch" to store the original text or any details that don't fit the structured fields.
* For \`workModel\` and \`jobType\`, you must use one of the specified \`enum\` values. If the work model is not mentioned, your default is "On-site".
5.  **Handle Missing Data:** If a non-required field's information (like \`compensation\`) is not present in the text, omit the field entirely from the output. If no salary is mentioned, do not copy phrases like "competitive salary".

## HTML CONTENT TO ANALYZE ##`

// JSON schema for AI response validation
export const JOB_ANALYSIS_SCHEMA = {
  type: 'object',
  description: "A deeply analyzed and structured summary of a job posting, designed for reliable AI extraction based on classification and specific, atomic fields.",
  required: ["jobTitle", "companyName", "location", "workModel", "jobType", "coreObjective", "keySkillsAndTools", "experienceRequirements", "qualifications", "companyCulture", "applicationLogistics"],
  properties: {
    jobTitle: {
      type: 'string',
      description: "The exact, full job title as listed in the posting."
    },
    companyName: {
      type: 'string',
      description: "The name of the company that is hiring."
    },
    location: {
      type: 'object',
      description: "Structured location data.",
      required: ["rawText"],
      properties: {
        city: {
          type: 'string',
          description: "The city where the job is located."
        },
        state: {
          type: 'string',
          description: "The state, province, or region."
        },
        country: {
          type: 'string',
          description: "The country where the job is located."
        },
        rawText: {
          type: 'string',
          description: "The original, full location string as it appears in the posting (e.g., 'Horsley Park, Sydney NSW')."
        }
      }
    },
    workModel: {
      type: 'string',
      description: "Classify the work model. If not specified, assume 'On-site'.",
      enum: ["On-site", "Hybrid", "Remote"]
    },
    jobType: {
      type: 'string',
      description: "Classify the employment type.",
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary"]
    },
    compensation: {
      type: 'object',
      description: "Structured salary and compensation details. Leave fields null if not present.",
      properties: {
        minSalary: {
          type: 'number',
          description: "The lower end of the base salary range as a number. Exclude symbols and letters."
        },
        maxSalary: {
          type: 'number',
          description: "The upper end of the base salary range as a number. Exclude symbols and letters."
        },
        currency: {
          type: 'string',
          description: "The 3-letter currency code (e.g., 'AUD', 'USD')."
        },
        period: {
          type: 'string',
          description: "The pay period.",
          enum: ["yearly", "hourly", "monthly"]
        },
        notes: {
          type: 'string',
          description: "The original salary text and any non-salary details (e.g., 'competitive bonus', 'stock options', 'negotiable'). This is the 'escape hatch'."
        }
      }
    },
    coreObjective: {
      type: 'string',
      description: "Synthesize the purpose of the role into a single, concise sentence. Answer the question: 'Why does this job exist?'"
    },
    keySkillsAndTools: {
      type: 'object',
      description: "A categorized list of all skills and technologies mentioned.",
      required: ["hardSkills", "softSkills", "toolsAndSoftware"],
      properties: {
        hardSkills: {
          type: 'array',
          description: "List technical, measurable skills (e.g., 'Order Management', 'Data Analysis').",
          items: {
            type: 'string'
          }
        },
        softSkills: {
          type: 'array',
          description: "List interpersonal skills and traits (e.g., 'Leadership', 'Communication').",
          items: {
            type: 'string'
          }
        },
        toolsAndSoftware: {
          type: 'array',
          description: "List specific software, platforms, or methodologies (e.g., 'SAP SD', 'Agile').",
          items: {
            type: 'string'
          }
        }
      }
    },
    experienceRequirements: {
      type: 'object',
      description: "Structured experience requirements.",
      required: ["rawText"],
      properties: {
        minYears: {
          type: 'number',
          description: "The minimum years of experience required, as a number."
        },
        maxYears: {
          type: 'number',
          description: "The maximum years of experience, as a number (if a range is given)."
        },
        rawText: {
          type: 'string',
          description: "The original, full text describing the experience requirement (e.g., '5+ years in a related field'). This is the 'escape hatch'."
        }
      }
    },
    qualifications: {
      type: 'array',
      description: "A comprehensive list of all qualifications, with each item individually classified.",
      items: {
        type: 'object',
        required: ["detail", "type"],
        properties: {
          detail: {
            type: 'string',
            description: "The specific skill, certification, or qualification."
          },
          type: {
            type: 'string',
            description: "Classify if the skill is essential or a nice-to-have.",
            enum: ["Must-have", "Preferred"]
          }
        }
      }
    },
    companyCulture: {
      type: 'object',
      description: "Analysis of the company's culture and tone from the text.",
      properties: {
        tone: {
          type: 'string',
          description: "Analyze the text to classify the company tone (e.g., 'Corporate & Formal', 'Startup & Casual', 'Mission-Driven')."
        },
        keyAdjectives: {
          type: 'array',
          description: "List specific, impactful adjectives used to describe the company, team, or role.",
          items: {
            type: 'string'
          }
        }
      }
    },
    applicationLogistics: {
      type: 'object',
      description: "Key details for the application process.",
      properties: {
        instructions: {
          type: 'string',
          description: "Summarize any specific instructions for how to apply."
        },
        closingDate: {
          type: 'string',
          description: "The application closing date in YYYY-MM-DD format, if available.",
          format: "date"
        }
      }
    }
  }
}
