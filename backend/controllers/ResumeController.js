import Resume from '../models/ResumeModel.js';
import fs from 'fs';
import path from 'path';

export const createResume = async (req, res) => {
    try {
        const { title } = req.body;

        // DEFAULT TEMPLATE
        const defaultResumeData = {
            profileInfo: {
                profilePreviewUrl: '',
                fullname: '',
                designation: '',
                summary: ''
            },
            contactInfo: {
                email: '',
                phone: '',
                location: '',
                website: '',
                socialLinks: {
                    linkedin: '',
                    github: '',
                    twitter: '',
                    facebook: ''
                }
            },
            workExperience: [
                {
                    role: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                }
            ],
            education: [
                {
                    degree: '',
                    institution: '',
                    startDate: '',
                    endDate: ''
                }
            ],
            skills: [
                {
                    name: '',
                    progress: 0
                }
            ],
            projects: [
                {
                    title: '',
                    description: '',
                    github: '',
                    liveDemo: ''
                }
            ],
            certifications: [
                {
                    title: '',
                    issuer: '',
                    year: ''
                }
            ],
            languages: [
                {
                    name: '',
                    progress: 0
                }
            ],
            interests: ['']
        };

        const newResume = await Resume.create({
            userId: req.user._id,
            title: title || 'My Resume',
            ...defaultResumeData,
            ...req.body
        });

        res.status(201).json(newResume);

    } catch (error) {
        res.status(400).json({ message: 'Failed to create resume', error: error.message });
    }
}

// GET FUNCTION
export const getResume = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id }).sort({
            updatedAt: -1
        });

        if (!resumes) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve resume', error: error.message });
    }
}

// GET RESUME BY ID
export const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.status(200).json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve resume', error: error.message });
    }
}

// UPDATE RESUME
export const updateResume = async (req, res) => {
    try {
        const resume = await Resume.findOne(
            {
                _id: req.params.id,
                userId: req.user._id
            }
        );
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or not authorized' });
        }
        // MERGE THE UPDATED DATA
        Object.assign(resume, req.body);
        // SAVE THE UPDATED RESUME
        const saveResume = await resume.save();
        res.status(200).json(saveResume);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to update resume', error: error.message });
    }
}

// DELETE RESUME
export const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findOne(
            {
                _id: req.params.id,
                userId: req.user._id
            }
        );
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or not authorized' });
        }

        // CREATE A UPLOADS FOLDER AND STORE THE RESUME FILES
        const uploadsFolder = path.join(process.cwd(), 'uploads');

        // DELETE THUMBNAILS FUNCTION
        if (resume.thumbnailLink) {
            const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
            if (fs.existsSync(oldThumbnail)) {
                fs.unlinkSync(oldThumbnail);
            }
        }
        if (resume.profileInfo?.profilePreviewUrl) {
            const oldProfile = path.join(
                uploadsFolder,
                path.basename(resume.profileInfo.profilePreviewUrl)
            );
            if (fs.existsSync(oldProfile)) {
                fs.unlinkSync(oldProfile);
            }
        }

        // DELETE THE RESUME DOC
        const deleted = await Resume.deleteOne({ _id: req.params.id, userId: req.user._id });
        if (deleted.deletedCount === 0) {
            return res.status(404).json({ message: 'Resume not found or not authorized' });
        }
        res.status(200).json({ message: 'Resume deleted successfully' });

    } catch (error) {
        res.status(400).json({ message: 'Failed to delete resume', error: error.message });
    }
}