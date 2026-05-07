/** Categories that belong to "Tips & Education" section */
const TIPS_EDUCATION_CATS = ["tips", "education", "tips and education"];

/** Categories that belong to "Best Casinos" section */
const BEST_CASINOS_CATS = ["best casinos", "best casino", "casino", "casinos"];

export function isTipsEducation(category) {
  return TIPS_EDUCATION_CATS.includes((category || "").toLowerCase().trim());
}

export function isBestCasinos(category) {
  return BEST_CASINOS_CATS.includes((category || "").toLowerCase().trim());
}

export function isOtherCategory(category) {
  return !isTipsEducation(category) && !isBestCasinos(category);
}
