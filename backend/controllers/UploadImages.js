// import fs from 'fs';
// import path from 'path';

// import Resume from '../models/ResumeModel.js';
// import upload from '../middleware/UploadMiddleware.js';

// export const uploadResumeImage = (req, res) => {
//     try {
//         upload.fields([{ name: 'thumbnail' }, { name: 'profileImage' }])(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: "File upload failed", error: err.message });
//             }

//             const resumeId = req.params.id;
//             const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });

//             if (!resume) {
//                 return res.status(404).json({ message: 'Resume not found or not authorized' });
//             }

//             // USE PROCESS CWD TO LOCATE THE UPLOADS FOLDER
//             const uploadsFolder = path.join(process.cwd(), 'uploads');
//             const baseUrl = `${req.protocol}://${req.get('host')}`;

//             const newThumbnail = req.files.thumbnail?.[0];
//             const newProfileImage = req.files.profileImage?.[0];

//             if (newThumbnail) {
//                 if (resume.thumbnailLink) {
//                     const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
//                     if (fs.existsSync(oldThumbnail)) {
//                         fs.unlinkSync(oldThumbnail);
//                     }
//                 }
//                 resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
//             }

//             // SAME FOR PROFILE-PREVIEW IMAGE
//             if (newProfileImage) {
//                 if (resume.profileInfo?.profilePreviewUrl) {
//                     const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilePreviewUrl));
//                     if (fs.existsSync(oldProfile)) {
//                         fs.unlinkSync(oldProfile);
//                     }
//                 }
//                 resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
//             }

//             // SAVE THE UPDATED RESUME
//             await resume.save();
//             res.status(200).json({
//                 message: 'Images uploaded successfully',
//                 thumbnail: resume.thumbnailLink,
//                 profilePreview: resume.profileInfo.profilePreviewUrl
//             });

//         });

//     } catch (error) {
//         console.error('Error uploading resume image:', error);
//         res.status(500).json({
//             message: 'Failed to upload images',
//             error: error.message
//         });
//     }
// }

import Resume from '../models/ResumeModel.js';
import upload from '../middleware/UploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadResumeImage = (req, res) => {
    try {
        upload.fields([{ name: 'thumbnail' }, { name: 'profileImage' }])(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ 
                    message: "File upload failed", 
                    error: err.message 
                });
            }

            try {
                const resumeId = req.params.id;
                const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });

                if (!resume) {
                    return res.status(404).json({ message: 'Resume not found or not authorized' });
                }

                const newThumbnail = req.files?.thumbnail?.[0];
                const newProfileImage = req.files?.profileImage?.[0];
                const filesToCleanup = [];

                // Validate and upload thumbnail to Cloudinary
                if (newThumbnail) {
                    // Validate file exists and has content
                    if (!fs.existsSync(newThumbnail.path)) {
                        throw new Error(`File not found at path: ${newThumbnail.path}`);
                    }
                    
                    const fileStats = fs.statSync(newThumbnail.path);
                    if (fileStats.size === 0) {
                        throw new Error(`File is empty: ${newThumbnail.path}`);
                    }
                    
                    filesToCleanup.push(newThumbnail.path);
                    
                    const result = await cloudinary.uploader.upload(newThumbnail.path, {
                        folder: "resume_uploads/thumbnails",
                        resource_type: "image",
                        quality: "auto",
                        fetch_format: "auto"
                    });
                    
                    resume.thumbnailLink = result.secure_url;
                }

                // Validate and upload profile preview to Cloudinary
                if (newProfileImage) {
                    // Validate file exists and has content
                    if (!fs.existsSync(newProfileImage.path)) {
                        throw new Error(`File not found at path: ${newProfileImage.path}`);
                    }
                    
                    const fileStats = fs.statSync(newProfileImage.path);
                    if (fileStats.size === 0) {
                        throw new Error(`File is empty: ${newProfileImage.path}`);
                    }
                    
                    filesToCleanup.push(newProfileImage.path);
                    
                    const result = await cloudinary.uploader.upload(newProfileImage.path, {
                        folder: "resume_uploads/profile_previews",
                        resource_type: "image",
                        quality: "auto",
                        fetch_format: "auto"
                    });
                    
                    if (!resume.profileInfo) {
                        resume.profileInfo = {};
                    }
                    resume.profileInfo.profilePreviewUrl = result.secure_url;
                }

                // Save updated resume
                await resume.save();

                // Clean up temporary files
                filesToCleanup.forEach(filePath => {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                res.status(200).json({
                    message: "Images uploaded successfully",
                    thumbnailLink: resume.thumbnailLink,
                    profilePreview: resume.profileInfo?.profilePreviewUrl,
                });
                
            } catch (uploadError) {
                console.error('Upload processing error:', uploadError);
                
                // Clean up any uploaded files on error
                if (req.files) {
                    Object.values(req.files).flat().forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                }
                
                res.status(500).json({
                    message: "Failed to process uploaded images",
                    error: uploadError.message,
                });
            }
        });
    } catch (error) {
        console.error("Error in uploadResumeImage:", error);
        res.status(500).json({
            message: "Failed to upload images",
            error: error.message,
        });
    }
};
