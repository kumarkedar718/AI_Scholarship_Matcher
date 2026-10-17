const GeminiProvider = require('./aiProviders/geminiProvider');

class AIService {
  constructor() {
    this.providerName = process.env.AI_PROVIDER || 'gemini';
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || '';

    if (this.apiKey) {
      this.provider = new GeminiProvider(this.apiKey);
    } else {
      this.provider = null;
    }
  }

  // Smart fallback explanation generator (Used when AI API key is missing/invalid or offline)
  fallbackRecommendationReason(studentProfile, scholarshipData, matchResult) {
    const matchedFields = matchResult.matchedCriteria.map((m) => m.field).join(', ');
    const benefit = scholarshipData.amountText || 'Financial Assistance';
    return `This scholarship is highly recommended for you because your profile successfully matches key criteria including ${matchedFields || 'academic criteria'}. Offered by ${scholarshipData.provider}, it provides ${benefit} to support your educational expenses.`;
  }

  // Robust deterministic fallback regex query extractor for natural language search
  fallbackParseQuery(query) {
    const q = (query || '').toLowerCase();
    const result = {
      educationLevel: null,
      course: null,
      branch: null,
      stateOfDomicile: null,
      category: null,
      cgpaOrPercentage: null,
      familyIncomeAnnual: null,
      gender: null,
      categoryType: null
    };

    // 1. Income extraction (e.g., 2.5 lakh, 5 lakh, 500000, 3.5 lakhs, under 6 lakh)
    const lakhMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)/);
    if (lakhMatch) {
      result.familyIncomeAnnual = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = q.match(/(?:income|below|under|<=|=|less than)?\s*₹?\s*(\d{5,7})/);
      if (numMatch) {
        result.familyIncomeAnnual = parseFloat(numMatch[1]);
      }
    }

    // 2. Academic Score / CGPA extraction (e.g. 8 cgpa, 8.5 cgpa, 75%)
    const cgpaMatch = q.match(/(\d(?:\.\d+)?)\s*(?:cgpa|gpa)/);
    if (cgpaMatch) {
      result.cgpaOrPercentage = parseFloat(cgpaMatch[1]);
    } else {
      const pctMatch = q.match(/(\d{2}(?:\.\d+)?)\s*%/);
      if (pctMatch) {
        result.cgpaOrPercentage = parseFloat(pctMatch[1]);
      }
    }

    // 3. Education Level
    if (q.includes('undergraduate') || q.includes('ug') || q.includes('bachelor')) {
      result.educationLevel = 'Undergraduate';
    } else if (q.includes('postgraduate') || q.includes('pg') || q.includes('master')) {
      result.educationLevel = 'Postgraduate';
    } else if (q.includes('diploma')) {
      result.educationLevel = 'Diploma';
    } else if (q.includes('phd') || q.includes('doctorate')) {
      result.educationLevel = 'PhD';
    } else if (q.includes('school') || q.includes('class 10') || q.includes('class 12')) {
      result.educationLevel = 'School';
    }

    // 4. Course / Degree
    if (q.includes('b.tech') || q.includes('btech') || q.includes('b.e') || q.includes('engineering')) {
      result.course = 'B.Tech';
      if (!result.educationLevel) result.educationLevel = 'Undergraduate';
    } else if (q.includes('b.sc') || q.includes('bsc')) {
      result.course = 'B.Sc';
      if (!result.educationLevel) result.educationLevel = 'Undergraduate';
    } else if (q.includes('m.tech') || q.includes('mtech')) {
      result.course = 'M.Tech';
      if (!result.educationLevel) result.educationLevel = 'Postgraduate';
    } else if (q.includes('m.sc') || q.includes('msc')) {
      result.course = 'M.Sc';
      if (!result.educationLevel) result.educationLevel = 'Postgraduate';
    } else if (q.includes('mba')) {
      result.course = 'MBA';
      if (!result.educationLevel) result.educationLevel = 'Postgraduate';
    } else if (q.includes('b.com') || q.includes('bcom')) {
      result.course = 'B.Com';
      if (!result.educationLevel) result.educationLevel = 'Undergraduate';
    } else if (q.includes('b.a') || q.includes('ba ')) {
      result.course = 'B.A';
      if (!result.educationLevel) result.educationLevel = 'Undergraduate';
    }

    // 5. Branch / Field of Study
    if (q.includes('computer science') || q.includes('cse') || q.includes('cs') || q.includes('software')) {
      result.branch = 'Computer Science';
    } else if (q.includes('mechanical')) {
      result.branch = 'Mechanical';
    } else if (q.includes('electrical') || q.includes('ee') || q.includes('ece')) {
      result.branch = 'Electrical';
    } else if (q.includes('civil')) {
      result.branch = 'Civil';
    } else if (q.includes('biotechnology') || q.includes('biotech')) {
      result.branch = 'Biotechnology';
    }

    // 6. State Domicile extraction
    const states = [
      'Odisha', 'Bihar', 'Uttar Pradesh', 'Delhi', 'Maharashtra',
      'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Punjab',
      'Madhya Pradesh', 'Kerala', 'Gujarat', 'Haryana', 'Andhra Pradesh', 'Telangana'
    ];
    for (const st of states) {
      if (q.includes(st.toLowerCase())) {
        result.stateOfDomicile = st;
        break;
      }
    }
    // Handle short state aliases (e.g. "up")
    if (!result.stateOfDomicile && (q.includes(' up ') || q.endsWith(' up') || q.startsWith('up '))) {
      result.stateOfDomicile = 'Uttar Pradesh';
    }

    // 7. Category
    if (q.includes('obc')) result.category = 'OBC';
    else if (q.includes('sc') && !q.includes('bsc') && !q.includes('science')) result.category = 'SC';
    else if (q.includes('st') && !q.includes('student') && !q.includes('state')) result.category = 'ST';
    else if (q.includes('ews')) result.category = 'EWS';
    else if (q.includes('minority') || q.includes('muslim') || q.includes('christian')) result.category = 'Minority';
    else if (q.includes('general')) result.category = 'General';

    // 8. Gender
    if (q.includes('girl') || q.includes('female') || q.includes('woman') || q.includes('women')) {
      result.gender = 'Female';
    } else if (q.includes('boy') || q.includes('male') || q.includes('men')) {
      result.gender = 'Male';
    }

    // 9. Category Type (Merit/Need/Government/Private)
    if (q.includes('government') || q.includes('govt') || q.includes('central')) {
      result.categoryType = 'Government';
    } else if (q.includes('private') || q.includes('foundation') || q.includes('csr')) {
      result.categoryType = 'Private';
    } else if (q.includes('merit-cum-means')) {
      result.categoryType = 'Merit-cum-Means';
    } else if (q.includes('merit')) {
      result.categoryType = 'Merit-Based';
    } else if (q.includes('need')) {
      result.categoryType = 'Need-Based';
    }

    return result;
  }

  async getRecommendationReason(studentProfile, scholarshipData, matchResult) {
    if (this.provider && this.apiKey) {
      try {
        return await this.provider.generateRecommendationReason(studentProfile, scholarshipData, matchResult);
      } catch (err) {
        console.warn('AI Provider failed, using smart fallback explanation:', err.message);
      }
    }
    return this.fallbackRecommendationReason(studentProfile, scholarshipData, matchResult);
  }

  async parseNaturalLanguageQuery(userQuery) {
    if (this.provider && this.apiKey) {
      try {
        const aiParsed = await this.provider.parseNaturalLanguageQuery(userQuery);
        if (aiParsed && typeof aiParsed === 'object') {
          return aiParsed;
        }
      } catch (err) {
        console.warn('AI NLP Parser failed, using fallback query parser:', err.message);
      }
    }
    return this.fallbackParseQuery(userQuery);
  }

  async getSummary(description) {
    if (this.provider && this.apiKey) {
      try {
        return await this.provider.generateSummary(description);
      } catch (err) {
        console.warn('AI Summary failed, using fallback summary:', err.message);
      }
    }
    // Fallback concise summary
    const cleanDesc = (description || '').replace(/\s+/g, ' ').trim();
    const sentences = cleanDesc.split('. ').filter(s => s.length > 5);
    const bullets = sentences.slice(0, 3).map(s => `• ${s.trim()}${s.endsWith('.') ? '' : '.'}`);
    return bullets.join('\n');
  }
}

module.exports = new AIService();
