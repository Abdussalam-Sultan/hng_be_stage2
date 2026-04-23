import express from 'express';
const router = express.Router();
import { createProfile, getProfiles, searchProfiles, getProfileById,  deleteProfile } from './controller.js';

router.post('/profiles', createProfile);
router.get('/profiles', getProfiles);
router.get('/profiles/search', searchProfiles);
router.get('/profiles/:id', getProfileById);
router.delete('/profiles/:id', deleteProfile);


export default router;