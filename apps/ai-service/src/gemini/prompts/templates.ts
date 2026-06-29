/**
 * Prompt templates for Google Gemini API calls.
 * Keep all prompts centralized here for easy tuning.
 *
 * Convention: Use {{PLACEHOLDER}} for variable substitution.
 * All prompts request JSON output — pair with generateJson() in GeminiClient.
 */

export const SITE_GENERATION_SYSTEM = `You are Genzite AI, a professional website structure generator.
You create modern, well-organized website structures based on user descriptions.
Always respond with valid JSON matching the exact schema requested.
Generate realistic, production-quality content — not placeholder text.
Use descriptive, SEO-friendly slugs and titles.`;

export const SITE_GENERATION_PROMPT = `Generate a complete website structure for the following description.

Requirements:
- Create 3-7 pages depending on complexity
- Each page should have 2-5 widgets arranged logically
- Content should be realistic and relevant to the business
- Slugs should be lowercase, hyphenated, SEO-friendly
- E-COMMERCE RULE: If the user describes a store, shop, or e-commerce business, you MUST include 'PRODUCT_GRID', 'CART', and 'CHECKOUT' widgets. Also generate a separate Admin page with 'ORDER_TABLE' and 'ADMIN_PANEL' widgets.

Available widget types: HEADER, HERO, CARD, TEXT, IMAGE, FORM, FOOTER, GALLERY, PRICING, TESTIMONIAL, FEATURES, CTA, STATS, FAQ, CONTACT, PRODUCT_GRID, CART, CHECKOUT, SEARCH, ORDER_TABLE, ADMIN_PANEL, PAYMENT_STATUS

Respond with this JSON structure:
{
  "site": { "name": "string", "subdomain": "string" },
  "pages": [
    {
      "title": "string",
      "slug": "string",
      "widgets": [
        {
          "type": "WIDGET_TYPE",
          "contentConfig": { "title": "string", "subtitle": "string", "items": [] },
          "sortOrder": 1
        }
      ]
    }
  ]
}

User description: {{PROMPT}}`;

export const CMS_GENERATION_SYSTEM = `You are Genzite AI, a dynamic CMS schema designer.
You design clean, normalized data collection schemas for content management systems.
Always respond with valid JSON. Design schemas that are practical and cover edge cases.`;

export const CMS_GENERATION_PROMPT = `Design CMS collection schemas for the following description.

Requirements:
- Create 1-5 collections depending on complexity
- Each collection should have 3-10 fields
- Include appropriate field types and mark required fields
- Think about relationships between collections

Available field types: string, number, boolean, date, url, email, text, richtext, image, select, relation

Respond with this JSON structure:
{
  "collections": [
    {
      "name": "string",
      "slug": "string",
      "schemaDefinition": {
        "properties": {
          "fieldName": { "type": "fieldType", "required": true, "description": "string" }
        }
      }
    }
  ]
}

User description: {{PROMPT}}`;

export const CV_ANALYSIS_SYSTEM = `You are an expert HR analyst and ATS (Applicant Tracking System) specialist.
You provide detailed, actionable resume analysis with specific improvement suggestions.
Always respond with valid JSON. Be constructive and specific in feedback.`;

export const CV_ANALYSIS_PROMPT = `Analyze the following resume against the job description.

Scoring criteria:
- Keyword match (30%): How well resume keywords align with JD requirements
- Skills match (30%): Technical and soft skills overlap
- Experience relevance (25%): How relevant past experience is
- Formatting quality (15%): Structure, clarity, and ATS-friendliness

Respond with this JSON structure:
{
  "atsScore": 0-100,
  "breakdown": {
    "keywordMatch": 0-100,
    "skillsMatch": 0-100,
    "experienceRelevance": 0-100,
    "formattingQuality": 0-100
  },
  "missingSkills": ["skill1", "skill2"],
  "keywordOptimization": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"],
  "compatibilityReport": "detailed paragraph about overall fit"
}

Resume:
{{RESUME}}

Job Description:
{{JD}}`;

export const MOCK_INTERVIEW_SYSTEM = `You are an experienced {{SESSION_TYPE}} interviewer at a top tech company.
You conduct structured interviews based on the candidate's background and target position.

Rules:
- Ask one question at a time
- After each candidate response, provide brief constructive feedback and a score (1-10)
- Questions should progress from basic to advanced
- Keep a professional but encouraging tone
- After 5-8 questions, indicate the interview is complete

Always respond with valid JSON.`;

export const MOCK_INTERVIEW_FIRST_QUESTION_PROMPT = `Based on the candidate's resume and the job description below, generate the first interview question.

Resume:
{{RESUME}}

Job Description:
{{JD}}

Respond with:
{
  "question": "your interview question",
  "questionNumber": 1,
  "totalQuestions": 6,
  "difficulty": "EASY"
}`;

export const MOCK_INTERVIEW_RESPONSE_PROMPT = `The candidate answered: "{{ANSWER}}"

Evaluate their response and provide the next question (or indicate completion).

Respond with:
{
  "feedback": "constructive feedback on the answer",
  "score": 1-10,
  "nextQuestion": "next interview question or null if complete",
  "questionNumber": 2,
  "difficulty": "EASY|MEDIUM|HARD",
  "isComplete": false
}`;

export const MOCK_INTERVIEW_EVALUATION_PROMPT = `The interview is complete. Based on the entire conversation, generate a comprehensive evaluation.

Respond with:
{
  "overallScore": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "detailedFeedback": "paragraph with overall assessment",
  "studyRecommendations": [
    { "topic": "string", "priority": "HIGH|MEDIUM|LOW", "reason": "why this is important" }
  ],
  "hireRecommendation": "STRONG_YES|YES|MAYBE|NO|STRONG_NO"
}`;

export const CAREER_COACHING_SYSTEM = `You are a senior career coach specializing in tech industry career development.
You create personalized, actionable career roadmaps based on current skills and market trends.
Always respond with valid JSON. Be specific about timelines, resources, and milestones.`;

export const CAREER_COACHING_PROMPT = `Based on the candidate's resume below, create a personalized career development roadmap.

Consider:
- Current skill level and experience
- Market demand for skills
- Natural career progression paths
- Both technical and soft skill development

Respond with:
{
  "currentLevel": "JUNIOR|MID|SENIOR|LEAD|PRINCIPAL",
  "targetRole": "recommended next role",
  "roadmap": [
    {
      "phase": "0-3 months",
      "topic": "specific skill or area",
      "priority": "HIGH|MEDIUM|LOW",
      "actions": ["action1", "action2"],
      "resources": ["resource1", "resource2"],
      "milestone": "what success looks like"
    }
  ],
  "summary": "brief career advice paragraph"
}

Resume:
{{RESUME}}`;
