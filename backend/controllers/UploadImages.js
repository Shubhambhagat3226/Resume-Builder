import fs from 'fs';
import path from 'path';

import Resume from '../models/ResumeModel.js';
import upload from '../middleware/UploadMiddleware.js';

export const uploadResumeImage = (req, res) => {
    try {
        upload.fields([{ name: 'thumbnail' }, { name: 'profileImage' }])(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: "File upload failed", error: err.message });
            }

            const resumeId = req.params.id;
            const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });

            if (!resume) {
                return res.status(404).json({ message: 'Resume not found or not authorized' });
            }

            // USE PROCESS CWD TO LOCATE THE UPLOADS FOLDER
            const uploadsFolder = path.join(process.cwd(), 'uploads');
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            const newThumbnail = req.files.thumbnail?.[0];
            const newProfileImage = req.files.profileImage?.[0];

            if (newThumbnail) {
                if (resume.thumbnailLink) {
                    const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
                    if (fs.existsSync(oldThumbnail)) {
                        fs.unlinkSync(oldThumbnail);
                    }
                }
                resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
            }

            // SAME FOR PROFILE-PREVIEW IMAGE
            if (newProfileImage) {
                if (resume.profileInfo?.profilePreviewUrl) {
                    const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilePreviewUrl));
                    if (fs.existsSync(oldProfile)) {
                        fs.unlinkSync(oldProfile);
                    }
                }
                resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
            }

            // SAVE THE UPDATED RESUME
            await resume.save();
            res.status(200).json({
                message: 'Images uploaded successfully',
                thumbnail: resume.thumbnailLink,
                profilePreview: resume.profileInfo.profilePreviewUrl
            });

        });

    } catch (error) {
        console.error('Error uploading resume image:', error);
        res.status(500).json({
            message: 'Failed to upload images',
            error: error.message
        });
    }
}