/**
 * Validates text inputs to prevent gibberish, keyboard smashing, or spam.
 * @param {string} text - The input text to validate.
 * @param {string} fieldName - The human-readable name of the field.
 * @returns {string|null} - Error message string, or null if valid.
 */
const validateText = (text, fieldName) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;

  // 1. Repeated letters check: Reject any non-digit character repeated 4 or more times consecutively.
  const repeatedCharMatch = trimmed.match(/([^0-9\s.,])\1{3,}/i);
  if (repeatedCharMatch) {
    return `${fieldName} contains too many repeated letters ("${repeatedCharMatch[0]}"). Please enter valid text.`;
  }

  // 2. Vowel ratio / keyboard smash check:
  // If a word is longer than 4 letters, it must contain at least one vowel (a, e, i, o, u, y).
  const words = trimmed.toLowerCase().split(/[\s,./()\-+]+/);
  for (let word of words) {
    const lettersOnly = word.replace(/[^a-z]/g, '');
    if (lettersOnly.length > 4) {
      const hasVowel = /[aeiouy]/.test(lettersOnly);
      if (!hasVowel) {
        return `${fieldName} contains invalid words (like "${word}"). Please enter real words.`;
      }
    }
  }

  return null;
};

/**
 * Validates the Salary field.
 * @param {string} salary - The input salary.
 * @returns {string|null} - Error message string, or null if valid.
 */
const validateSalary = (salary) => {
  if (!salary || typeof salary !== 'string') return "Salary is required";
  const trimmed = salary.trim();

  // Salary must contain at least one number digit
  if (!/\d/.test(trimmed)) {
    return "Salary must contain numbers (e.g., 30000, 4.5 LPA, 20k - 30k).";
  }

  // Reject gibberish sequences of letters in salary
  const letterGibberish = validateText(trimmed, "Salary");
  if (letterGibberish) return letterGibberish;

  return null;
};

/**
 * Validates a Phone number.
 * @param {string} phone - The input phone number.
 * @returns {string|null} - Error message string, or null if valid.
 */
const validatePhone = (phone) => {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (trimmed.length === 0) return null;

  // Phone should be digits, spaces, plus signs, dashes, or parentheses
  if (!/^\+?[0-9\s\-()]{10,15}$/.test(trimmed)) {
    return "Phone number must be a valid format with 10 to 15 digits.";
  }

  return null;
};

/**
 * Validates URLs (LinkedIn, Github, Portfolio).
 * @param {string} url - The input URL.
 * @param {string} fieldName - The human-readable name of the field.
 * @returns {string|null} - Error message string, or null if valid.
 */
const validateUrl = (url, fieldName) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  try {
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const urlToTest = hasProtocol ? trimmed : `https://${trimmed}`;
    new URL(urlToTest);
    return null;
  } catch (_) {
    return `${fieldName} must be a valid URL (e.g., https://linkedin.com/in/username).`;
  }
};

module.exports = { validateText, validateSalary, validatePhone, validateUrl };
