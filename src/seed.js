import path, { dirname } from 'path';
import fs from 'fs';
import Profile from './model.js';
import { uuidv7 } from 'uuidv7';

import { fileURLToPath } from 'node:url';

// Get the absolute path to the current file
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current file
const __dirname = dirname(__filename);

async function seedProfiles() {
  const filePath = path.join(__dirname, "profiles.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  for (let p of data.profiles) {
    await Profile.upsert({
      id: uuidv7(),
      name: p.name.toLowerCase(),
      gender: p.gender,
      gender_probability: p.gender_probability,
      age: p.age,
      age_group: p.age_group,
      country_id: p.country_id,
      country_name: p.country_name,
      country_probability: p.country_probability,
      created_at: new Date().toISOString()
    }, {
      conflictFields: ["name"]
    });
  }

  console.log("Seed complete");
}


export {seedProfiles};