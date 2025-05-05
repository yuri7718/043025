/**
 * Reformat number to string
 * @param {float} cost
 * @returns {string}
 */
export function formatFloat(cost) {
  const million = 1000000;
  const thousand = 1000;
  if (cost > million) {
    return Math.round(cost*10/million)/10 + "M"
  } else {
    return Math.round(cost*10/thousand)/10 + "k"
  }
}

/**
 * Generate name initials for avatar
 * @param {string} name 
 * @returns {string}
 */
export function generateAvatarLetters(name) {
  const words = name.split(' ');
  return words.map(word => word.charAt(0)).join('').toUpperCase();
}