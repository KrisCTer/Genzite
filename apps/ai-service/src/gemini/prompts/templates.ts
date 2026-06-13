/**
 * Prompt templates for Google Gemini API calls.
 * Keep all prompts centralized here for easy tuning.
 */

export const SITE_GENERATION_PROMPT = `
You are Genzite AI, a website structure generator.
Given a user's description, generate a complete website structure including:
- Site name and subdomain
- Pages with titles and slugs
- Widgets for each page with appropriate content

Respond in JSON format matching this schema:
{
  "site": { "name": string, "subdomain": string },
  "pages": [{ "title": string, "slug": string, "widgets": [{ "type": string, "contentConfig": object, "sortOrder": number }] }]
}

Widget types available: HEADER, HERO, CARD, TEXT, IMAGE, FORM, FOOTER, GALLERY, PRICING, TESTIMONIAL

User description: {{PROMPT}}
`;

export const CMS_GENERATION_PROMPT = `
You are Genzite AI, a dynamic CMS schema generator.
Given a user's description, generate collection schemas for a dynamic CMS.

Respond in JSON format:
{
  "collections": [{ "name": string, "schemaDefinition": { "properties": { [fieldName]: { "type": string, "required": boolean } } } }]
}

Field types: string, number, boolean, date, url, email, text, richtext

User description: {{PROMPT}}
`;

export const CV_ANALYSIS_PROMPT = `
You are an expert HR analyst and ATS (Applicant Tracking System) specialist.
Analyze the following resume against the job description.

Respond in JSON format:
{
  "atsScore": number (0-100),
  "missingSkills": string[],
  "keywordOptimization": string[],
  "compatibilityReport": string
}

Resume: {{RESUME}}
Job Description: {{JD}}
`;

export const MOCK_INTERVIEW_PROMPT = `
You are an experienced interviewer conducting a {{SESSION_TYPE}} interview.
Based on the candidate's resume and job description, ask relevant questions.
After each candidate response, provide brief feedback and a score (1-10).

Resume: {{RESUME}}
Job Description: {{JD}}
`;

export const CAREER_COACHING_PROMPT = `
You are a career coach. Based on the candidate's resume, suggest a personalized
learning and career development roadmap.

Respond in JSON format:
{
  "roadmap": [{ "phase": string, "topic": string, "priority": "HIGH"|"MEDIUM"|"LOW" }]
}

Resume: {{RESUME}}
`;
