export default function parseQuery(q) {
  q = q.toLowerCase().trim();
  if (!q) return null;

  const filters = {};

  // gender
  const hasMale = /\b(male|males|man|men)\b/.test(q);
  const hasFemale = /\b(female|females|woman|women)\b/.test(q);

  if (hasMale && !hasFemale) filters.gender = "male";
  if (hasFemale && !hasMale) filters.gender = "female";

  // age_group
  if (/\b(child|children)\b/.test(q)) filters.age_group = "child";
  if (/\b(teen|teenager|teenagers)\b/.test(q)) filters.age_group = "teenager";
  if (/\b(adult|adults)\b/.test(q)) filters.age_group = "adult";
  if (/\b(senior|seniors|old)\b/.test(q)) filters.age_group = "senior";

  // young special rule
  if (/\byoung\b/.test(q)) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // above/over age
  const aboveMatch = q.match(/\b(above|over)\s+(\d+)\b/);
  if (aboveMatch) filters.min_age = parseInt(aboveMatch[2]);

  // below/under age
  const belowMatch = q.match(/\b(below|under)\s+(\d+)\b/);
  if (belowMatch) filters.max_age = parseInt(belowMatch[2]);

  // between X and Y
  const betweenMatch = q.match(/\bbetween\s+(\d+)\s+and\s+(\d+)\b/);
  if (betweenMatch) {
    filters.min_age = parseInt(betweenMatch[1]);
    filters.max_age = parseInt(betweenMatch[2]);
  }

  // country dictionary
  const countries = {
    nigeria: "NG",
    kenya: "KE",
    angola: "AO",
    benin: "BJ",
    ghana: "GH",
    southafrica: "ZA",
    "south africa": "ZA"
  };

  for (let name in countries) {
    if (q.includes(name)) {
      filters.country_id = countries[name];
      break;
    }
  }

  if (Object.keys(filters).length === 0) return null;
  return filters;
}