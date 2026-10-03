/**
 * Validates password to ensure it complies with Amazon DPP Credential Management 1.4:
 * Strictly forbids using username, email, full name, business name, or recognizable parts of them.
 *
 * @param {string} password
 * @param {Object} options
 * @param {string} [options.email]
 * @param {string} [options.name]
 * @param {string} [options.username]
 * @param {string} [options.businessName]
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordPolicy = (
  password,
  { email = '', name = '', username = '', businessName = '' } = {},
) => {
  if (!password) return null;

  const valLower = password.toLowerCase();
  const identifiers = new Set();

  // 1. Process email
  if (email) {
    const emailClean = email.trim().toLowerCase();
    identifiers.add(emailClean);
    const prefix = emailClean.includes('@') ? emailClean.split('@')[0] : emailClean;
    identifiers.add(prefix);

    // Extract word chunks from email prefix (e.g. 'maqbool' from 'maqbool.p' or 'maqbool_4357')
    const chunks = prefix.match(/[a-z]+|\d+/g) || [];
    chunks.forEach((chunk) => {
      const cleaned = chunk.replace(/[^a-z0-9]/g, '');
      if (cleaned.length >= 3 && !/^\d+$/.test(cleaned)) {
        identifiers.add(cleaned);
      }
    });

    // Also check if any word from the password (length >= 4) appears inside the email prefix
    const pwdWords = password.match(/[a-zA-Z]+/g) || [];
    for (const w of pwdWords) {
      if (w.length >= 4 && prefix.includes(w.toLowerCase())) {
        return 'Password cannot contain your username, name, email, or business name.';
      }
    }
  }

  // 2. Process username
  if (username) {
    const uClean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (uClean.length >= 3) identifiers.add(uClean);
  }

  // 3. Process name
  if (name) {
    const nameClean = name.trim().toLowerCase();
    const fullClean = nameClean.replace(/[^a-z0-9]/g, '');
    if (fullClean.length >= 3) identifiers.add(fullClean);

    nameClean.split(/\s+/).forEach((part) => {
      const cleaned = part.replace(/[^a-z0-9]/g, '');
      if (cleaned.length >= 3) {
        identifiers.add(cleaned);
      }
    });
  }

  // 4. Process business name
  if (businessName) {
    const bizClean = businessName.trim().toLowerCase();
    const fullBizClean = bizClean.replace(/[^a-z0-9]/g, '');
    if (fullBizClean.length >= 3) identifiers.add(fullBizClean);

    bizClean.split(/\s+/).forEach((part) => {
      const cleaned = part.replace(/[^a-z0-9]/g, '');
      if (cleaned.length >= 3) {
        identifiers.add(cleaned);
      }
    });
  }

  // Check if any forbidden identifier appears in the password
  for (const id of identifiers) {
    if (id.length >= 3 && valLower.includes(id)) {
      return 'Password cannot contain your username, name, email, or business name.';
    }
  }

  return null;
};
