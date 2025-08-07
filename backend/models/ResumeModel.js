import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    thumbnailLink: {
        type: String
    },
    template: {
        theme: String,
        colorPalette: [String],
    },
    profileInfo: {
        profilePreviewUrl: String,
        fullname: String,
        designation: String,
        summary: String
    },
    contactInfo: {
        email: String,
        phone: String,
        location: String,
        website: String,
        socialLinks: {
            linkedin: String,
            github: String,
            twitter: String,
            facebook: String
        }
    },

    // Work Experience
    workExperience: [{
        role: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String
    }],
    // Education
    education: [{
        degree: String,
        institution: String,
        startDate: Date,
        endDate: Date
    }],
    // Skills
    skills: [
        {
            name: String,
            progress: Number
        }
    ],
    // Projects
    projects: [
        {
            title: String,
            description: String,
            github: String,
            liveDemo: String
        }
    ],
    // Certifications
    certifications: [
        {
            title: String,
            issuer: String,
            year: String
        }
    ],
    // Languages
    languages: [
        {
            name: String,
            progress: Number
        }
    ],
    interests: [String],

},
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    }
);

export default mongoose.model('Resume', ResumeSchema);