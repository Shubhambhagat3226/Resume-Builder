import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createResume, deleteResume, getResume, getResumeById, updateResume } from '../controllers/ResumeController.js';
import { uploadResumeImage } from '../controllers/UploadImages.js';

const ResumeRouter = express.Router();

ResumeRouter.post('/', protect, createResume);

ResumeRouter.get('/', protect, getResume);
ResumeRouter.get('/:id', protect, getResumeById);

ResumeRouter.put('/:id', protect, updateResume);
ResumeRouter.put('/:id/upload-images', protect, uploadResumeImage);

ResumeRouter.delete('/:id', protect, deleteResume);

export default ResumeRouter;