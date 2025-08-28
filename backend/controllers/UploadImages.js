import Resume from "../models/ResumeModel.js";
import upload from "../middleware/UploadMiddleware.js";

export const uploadResumeImage = (req, res) => {
    try {
        upload.fields([{ name: "thumbnail" }, { name: "profileImage" }])(
            req,
            res,
            async (err) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ message: "File upload failed", error: err.message });
                }

                const resumeId = req.params.id;
                const resume = await Resume.findOne({
                    _id: resumeId,
                    userId: req.user._id,
                });

                if (!resume) {
                    return res
                        .status(404)
                        .json({ message: "Resume not found or not authorized" });
                }

                const newThumbnail = req.files.thumbnail?.[0];
                const newProfileImage = req.files.profileImage?.[0];

                if (newThumbnail) {
                    resume.thumbnailLink = newThumbnail.path; // Cloudinary URL
                }

                if (newProfileImage) {
                    resume.profileInfo.profilePreviewUrl = newProfileImage.path; // Cloudinary URL
                }

                await resume.save();

                res.status(200).json({
                    message: "Images uploaded successfully",
                    thumbnail: resume.thumbnailLink,
                    profilePreview: resume.profileInfo.profilePreviewUrl,
                });
            }
        );
    } catch (error) {
        console.error("Error uploading resume image:", error);
        res.status(500).json({
            message: "Failed to upload images",
            error: error.message,
        });
    }
};
