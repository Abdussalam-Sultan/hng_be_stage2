import axios from 'axios';
import { uuidv7 } from 'uuidv7';
import Profile from './model.js';
import {Op} from "sequelize";
import parseQuery from './parseQuery.js';


export async function createProfile(req, res) {
  const { name} = req.body;
  if (!name) {
    return res.status(400).json({status: 'error', message: 'Name is required'});
  }
const existingProfile = await Profile.findOne({ where: { name: req.body.name.toLowerCase() } });
  if (existingProfile) {
    return res.status(400).json({status: 'success', message: 'Profile already exists', data: existingProfile});
  }
  try {
    // Call genderize API
    const genderResponse = await axios.get(`https://api.genderize.io?name=${name}`);
    if (!genderResponse.data.gender) {
      return res.status(502).json({status: 'error', message: 'Genderize returned an invalid response'});
    }
    const gender = genderResponse.data.gender;
  
    // Call agify API
    const ageResponse = await axios.get(`https://api.agify.io?name=${name}`);
    if (!ageResponse.data.age) {
      return res.status(502).json({status: 'error', message: 'Agify returned an invalid response'});
    }

    const age = ageResponse.data.age;
    const ageGroup = age <= 12 ? 'child' : age <= 19 ? 'teenager': age <= 59 ? 'adult': 'senior';
  
    // Call nationalize API
    const nationalityResponse = await axios.get(`https://api.nationalize.io?name=${name}`);
    if (!nationalityResponse.data.country[0]?.country_id) {
      return res.status(502).json({status: 'error', message: 'Nationalize returned an invalid response'});
    }

    const nationality = nationalityResponse.data.country[0]?.country_id;

    // Create the profile
    const profile = {
      //id should use UUIDv7 to ensure uniqueness
      id: uuidv7(),
      name: name.toLowerCase(),
      gender,
      gender_probability: genderResponse.data.probability,
      sample_size: genderResponse.data.count,
      age,
      age_group: ageGroup,
      country_id: nationality,
      //
      country_probability: nationalityResponse.data.country[0]?.probability.toFixed(2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()

    };
    await Profile.create(profile);
    res.status(201).json({status: 'success', data: profile});
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({status: 'error', message: 'Error creating profile'});
  }
}

export async function getProfiles(req, res)  {
  try {
    let {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by,
      order,
      page = 1,
      limit = 10
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || isNaN(limit)) {
      return res.status(422).json({ status: "error", message: "Invalid query parameters" });
    }

    if (limit > 50) limit = 50;
    if (page < 1) page = 1;

    const where = {};

    if (gender) where.gender = gender;
    if (age_group) where.age_group = age_group;
    if (country_id) where.country_id = country_id;

    if (min_age || max_age) {
      where.age = {};
      if (min_age) where.age[Op.gte] = parseInt(min_age);
      if (max_age) where.age[Op.lte] = parseInt(max_age);
    }

    if (min_gender_probability) {
      where.gender_probability = { [Op.gte]: parseFloat(min_gender_probability) };
    }

    if (min_country_probability) {
      where.country_probability = { [Op.gte]: parseFloat(min_country_probability) };
    }

    const validSort = ["age", "created_at", "gender_probability"];
    const validOrder = ["asc", "desc"];

    let orderQuery = [["created_at", "desc"]];

    if (sort_by) {
      if (!validSort.includes(sort_by)) {
        return res.status(422).json({ status: "error", message: "Invalid query parameters" });
      }

      const direction = order ? order.toLowerCase() : "asc";

      if (!validOrder.includes(direction)) {
        return res.status(422).json({ status: "error", message: "Invalid query parameters" });
      }

      orderQuery = [[sort_by, direction]];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Profile.findAndCountAll({
      where,
      limit,
      offset,
      order: orderQuery
    });

    return res.status(200).json({
      status: "success",
      page,
      limit,
      total: count,
      data: rows
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", message: "Server failure" });
  }
};

export async function searchProfiles(req, res) {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ status: "error", message: "Missing or empty parameter" });
    }
    const parsed = parseQuery(q);

    if (!parsed) {
      return res.status(422).json({ status: "error", message: "Unable to interpret query" });
    }

    // convert parsed filters into Sequelize where object
    const where = {};
    if (parsed.gender) where.gender = parsed.gender;
    if (parsed.age_group) where.age_group = parsed.age_group;
    if (parsed.country_id) where.country_id = parsed.country_id;

    if (parsed.min_age || parsed.max_age) {
      where.age = {};
      if (parsed.min_age) where.age[Op.gte] = parsed.min_age;
      if (parsed.max_age) where.age[Op.lte] = parsed.max_age;
    }

    const safePage = Math.max(parseInt(page), 1);
    const safeLimit = Math.min(parseInt(limit), 50);

    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await Profile.findAndCountAll({
      where,
      limit: safeLimit,
      offset
    });

    return res.status(200).json({
      status: "success",
      page: safePage,
      limit: safeLimit,
      total: count,
      data: rows
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", message: "Server failure" });
  }
};
  


export async function getProfileById(req, res) {
  try {
    const profile = await Profile.findByPk(req.params.id);
    if (!profile) {
      throw new Error('Profile not found');
    }
    res.status(200).json({status: 'success', data: profile});
  } catch (error) {
    res.status(404).json({status: 'error', message: 'Profile not found'});
  }
}

export async function deleteProfile(req, res) {
  const profile = Profile.findByPk(req.params.id);
  if (!profile) {
    return res.status(404).json({status: 'error', message: 'Profile not found'});
  }
  try {
    await profile.destroy();
    
    res.status(204).json({status: 'success', message: 'Profile deleted'});
  } catch (error) {
    console.error('Error deleting profile:', error);
    return res.status(500).json({status: 'error', message: 'Error deleting profile'});
  }
}