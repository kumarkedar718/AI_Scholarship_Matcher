/**
 * Base AI Provider Abstract Class
 * All AI providers (Gemini, Groq, OpenAI) extend this class to ensure modularity.
 */

class BaseAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateRecommendationReason(studentProfile, scholarshipData, matchResult) {
    throw new Error('generateRecommendationReason method must be implemented by AI provider');
  }

  async parseNaturalLanguageQuery(userQuery) {
    throw new Error('parseNaturalLanguageQuery method must be implemented by AI provider');
  }

  async generateSummary(scholarshipDescription) {
    throw new Error('generateSummary method must be implemented by AI provider');
  }
}

module.exports = BaseAIProvider;
