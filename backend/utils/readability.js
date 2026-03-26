// Flesch-Kincaid Grade Level implementation
export function fleschKincaidGrade(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const syllables = text.split(/\b/).reduce((acc, word) => acc + countSyllables(word), 0);
  if (sentences === 0 || words === 0) return 0;
  return (
    0.39 * (words / sentences) +
    11.8 * (syllables / words) -
    15.59
  );
}

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
