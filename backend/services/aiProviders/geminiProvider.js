const BaseAIProvider = require('./baseProvider');

class GeminiProvider extends BaseAIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async callGeminiAPI(promptText) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in backend environment');
    }

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response payload from Gemini API');
    }
    return candidateText;
  }

  async generateRecommendationReason(studentProfile, scholarshipData, matchResult) {
    const prompt = `
You are an expert AI scholarship advisor. Provide a clear, encouraging 2-3 sentence explanation of why the scholarship "${scholarshipData.title}" by ${scholarshipData.provider} is a great match for this student.

Student Context:
- Course: ${studentProfile.course || 'N/A'} (${studentProfile.educationLevel || 'N/A'})
- CGPA/Marks: ${studentProfile.cgpaOrPercentage || 'N/A'}
- Family Income: ₹${studentProfile.familyIncomeAnnual ? studentProfile.familyIncomeAnnual.toLocaleString('en-IN') : 'N/A'}
- Domicile State: ${studentProfile.stateOfDomicile || 'N/A'}
- Category: ${studentProfile.category || 'N/A'}

Matched Eligibility Criteria:
${matchResult.matchedCriteria.map((m) => `- ${m.field}: ${m.detail}`).join('\n')}

Scholarship Benefits: ${scholarshipData.amountText}
Deadline: ${new Date(scholarshipData.deadline).toLocaleDateString('en-IN')}

Rule: Do not invent any new rules or eligibility requirements not present above. Keep the explanation professional and concise.
`;

    return await this.callGeminiAPI(prompt);
  }

  async parseNaturalLanguageQuery(userQuery) {
    const prompt = `
You are a structured query parsing assistant for an Indian scholarship finder platform.
Extract student details from this natural language query into JSON format.

User Query: "${userQuery}"

Return ONLY a valid raw JSON object (no markdown formatting, no backticks) with these exact keys:
{
  "educationLevel": string or null ("Undergraduate", "Postgraduate", "Diploma", "School"),
  "course": string or null (e.g. "B.Tech", "B.Sc", "MBBS"),
  "stateOfDomicile": string or null (e.g. "Bihar", "Uttar Pradesh", "Maharashtra"),
  "category": string or null ("General", "OBC", "SC", "ST", "EWS", "Minority"),
  "cgpaOrPercentage": number or null,
  "familyIncomeAnnual": number or null (numeric value in INR, e.g., 250000 for 2.5 lakh),
  "gender": string or null ("Female", "Male")
}
`;

    const rawOutput = await this.callGeminiAPI(prompt);
    // Strip code block markers if present
    const cleaned = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }

  async generateSummary(scholarshipDescription) {
    const prompt = `
Summarize the following scholarship description into 3 clean, highly readable bullet points focusing on benefits, who should apply, and key requirements.

Description:
"${scholarshipDescription}"

Return 3 bullet points only.
`;
    return await this.callGeminiAPI(prompt);
  }
}

module.exports = GeminiProvider;
