import express from 'express';
import { generateNotes } from '../controllers/generateController.js';

const router = express.Router();

router.post('/', generateNotes);

export default router;
