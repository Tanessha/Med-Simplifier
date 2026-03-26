/**
 * Counts syllables in a word
 */
const countSyllables = (word) => {
  word = word.toLowerCase();
  
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  let syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

/**
 * Calculates the Flesch-Kincaid Grade Level of a text.
 */
export const calculateFleschKincaid = (text) => {
  if (!text || text.trim() === '') return 0;
  
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;
  
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += countSyllables(word.replace(/[^a-zA-Z]/g, ''));
  }

  const fkGrade = 0.39 * (wordCount / sentences) + 11.8 * (syllableCount / wordCount) - 15.59;
  
  return Math.max(0, parseFloat(fkGrade.toFixed(1)));
};

/**
 * Maps a Flesch-Kincaid grade to one of the 3 system categories
 * 'basic' (Grade 0-6), 'intermediate' (Grade 6-10), 'advanced' (Grade 10+)
 */
export const mapGradeToLiteracyLevel = (grade) => {
  if (grade <= 6) return 'basic';
  if (grade <= 10) return 'intermediate';
  return 'advanced';
};
