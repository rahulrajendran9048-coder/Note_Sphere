import { generateNotesFromGroq } from '../services/groqService.js';

export const generateNotes = async (req, res, next) => {
  try {
    const { stream, semester, subject, moduleNum, topics, depth } = req.body;

    if (!stream || !semester || !subject || !moduleNum || !topics) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const generatedText = await generateNotesFromGroq(req.body);

    return res.status(200).json({
      success: true,
      data: generatedText
    });
  } catch (error) {
    next(error);
  }
};
