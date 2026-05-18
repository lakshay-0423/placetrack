const pdfParse = require('pdf-parse');

/**
 * Parse a PDF buffer and extract structured student profile data.
 */
exports.parseResume = async (buffer) => {
  // Parse the full PDF buffer
  const data = await pdfParse(buffer);
  const text = data.text || '';


  const parsed = {
    name: extractName(text),
    branch: extractBranch(text),
    cgpa: extractCGPA(text),
    passingYear: extractPassingYear(text),
    skills: extractSkills(text),
    experience: extractExperience(text)
  };



  return parsed;
};

function extractName(text) {
  // The first non-empty line is usually the candidate's name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    // Validate: should look like a name (2-5 words, mostly letters)
    if (/^[A-Za-z\s.\-']{2,60}$/.test(firstLine) && firstLine.split(/\s+/).length <= 5) {
      return firstLine;
    }
  }
  return null;
}

function extractBranch(text) {


  // Strict whitelist of common branches to avoid false positives from project names
  const branches = [
    { match: ['computer science', 'cse', 'computer engineering'], name: 'Computer Science' },
    { match: ['information technology', 'it'], name: 'Information Technology' },
    { match: ['electronics', 'ece', 'electronics and communication'], name: 'Electronics & Communication' },
    { match: ['electrical', 'eee', 'electrical and electronics'], name: 'Electrical' },
    { match: ['mechanical', 'mech'], name: 'Mechanical' },
    { match: ['civil'], name: 'Civil' },
    { match: ['chemical'], name: 'Chemical' },
    { match: ['biotechnology', 'biotech'], name: 'Biotechnology' },
    { match: ['data science'], name: 'Data Science' },
    { match: ['artificial intelligence', 'ai & ml', 'ai/ml'], name: 'Artificial Intelligence' }
  ];

  for (const branch of branches) {
    for (const keyword of branch.match) {
      // Use word boundaries. For 'it', be extra careful not to match the word 'it'
      if (keyword === 'it') {
        if (/(?:branch|degree|stream|specialization)\s*[:\-–]?\s*it\b/i.test(text) || /\bB\.?Tech\s+in\s+IT\b/i.test(text)) {
          return branch.name;
        }
      } else {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
          return branch.name;
        }
      }
    }
  }

  return null;
}

function extractCGPA(text) {
  const patterns = [
    /(?:cgpa|cpi|gpa|grade\s*point)\s*[:\-–]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:\/\s*10)?/i,
    /(\d\.\d{1,2})\s*(?:\/\s*10|cgpa|cpi|gpa)/i,
    /(?:cumulative|overall)\s*.*?(\d\.\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 10) return value;
    }
  }
  return null;
}

function extractPassingYear(text) {
  const patterns = [
    /(?:passing\s*year|graduation\s*year|expected\s*graduation|batch|year\s*of\s*(?:passing|graduation|completion))\s*[:\-–]?\s*(20\d{2})/i,
    /(?:20\d{2})\s*[-–]\s*(20\d{2})/g // e.g. 2020-2024
  ];

  // Try specific patterns first
  const match1 = text.match(patterns[0]);
  if (match1 && match1[1]) return parseInt(match1[1]);

  // Try year ranges — take the later year
  const rangeMatches = [...text.matchAll(patterns[1])];
  if (rangeMatches.length > 0) {
    const years = rangeMatches.map(m => parseInt(m[1])).filter(y => y >= 2020 && y <= 2035);
    if (years.length > 0) return Math.max(...years);
  }

  return null;
}

function extractSkills(text) {
  // Pure keyword matching is much safer than regexing text blocks,
  // which often accidentally capture section headers like "Languages" or "Hobbies"
  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart',
    'React', 'React Native', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'Oracle',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'Terraform',
    'Git', 'Linux', 'REST API', 'GraphQL', 'WebSockets',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS', 'Material UI',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy',
    'Data Structures', 'Algorithms', 'System Design'
  ];

  const found = knownSkills.filter(skill => {
    // Exact word boundary match, case insensitive
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  return found.length > 0 ? found : null;
}

function extractExperience(text) {
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|work)/i,
    /(?:experience|work)\s*[:\-–]?\s*(\d+)\+?\s*(?:years?|yrs?)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value >= 0 && value <= 50) return value;
    }
  }
  return null;
}
