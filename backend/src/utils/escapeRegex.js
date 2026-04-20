// Escapes special regex characters from user-provided strings to prevent regex injection.
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegex;
