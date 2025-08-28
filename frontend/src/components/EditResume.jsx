import React, { useCallback, useEffect, useRef, useState } from 'react'
import { buttonStyles, iconStyles, containerStyles as st, statusStyles } from '../assets/dummystyle'
import DashboardLayout from './DashboardLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { TitleInput } from './Input';
import { LuDownload, LuPalette, LuTrash2 } from 'react-icons/lu';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { fixTailwindColors } from '../utils/colors';
import html2canvas from "html2canvas";

import html2pdf from 'html2pdf.js'
import StepProgress from './StepProgress';
import { AlertCircle, ArrowLeft, Check, Download, Loader, Save } from 'react-feather';
import RenderResume from './RenderResume';
import Modal from './Modal';
import ThemeSelector from './ThemeSelector';

import {
    AdditionalInfoForm,
    CertificationInfoForm,
    ContactInfoForm,
    EducationDetailsForm,
    ProfileInfoForm,
    ProjectDetailForm,
    SkillsInfoForm,
    WorkExperienceForm
} from './Forms';
import { dataURLtoFile, captureElementAsImage, logOklchUsage } from '../utils/helper';


// Resize observer hook
const useResizeObserver = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    const ref = useCallback((node) => {
        if (node) {
            const resizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0].contentRect;
                setSize({ width, height });
            });

            resizeObserver.observe(node);
        }
    }, []);

    return { ...size, ref };
};

const EditResume = () => {

    const { resumeId } = useParams()
    const navigate = useNavigate()
    const resumeDownloadRef = useRef(null)
    const thumbnailRef = useRef(null)

    const [openThemeSelector, setOpenThemeSelector] = useState(false)
    const [openPreviewModal, setOpenPreviewModal] = useState(false)
    const [currentPage, setCurrentPage] = useState("profile-info")
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadSuccess, setDownloadSuccess] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [completionPercentage, setCompletionPercentage] = useState(0)

    const { width: previewWidth, ref: previewContainerRef } = useResizeObserver();

    const [resumeData, setResumeData] = useState({
        title: "Professional Resume",
        thumbnailLink: "",
        profileInfo: {
            fullname: "",
            designation: "",
            summary: "",
        },
        template: {
            theme: "modern",
            colorPalette: []
        },
        contactInfo: {
            email: "",
            phone: "",
            location: "",
            website: "",
            socialLinks: {
                linkedin: "",
                github: "",
                twitter: "",
                facebook: ""
            }
        },
        workExperience: [
            {
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: "",
            },
        ],
        education: [
            {
                degree: "",
                institution: "",
                startDate: "",
                endDate: "",
            },
        ],
        skills: [
            {
                name: "",
                progress: 0,
            },
        ],
        projects: [
            {
                title: "",
                description: "",
                github: "",
                liveDemo: "",
            },
        ],
        certifications: [
            {
                title: "",
                issuer: "",
                year: "",
            },
        ],
        languages: [
            {
                name: "",
                progress: 0,
            },
        ],
        interests: [""],
    })

    // Calculate completion percentage
    const calculateCompletion = () => {
        let completedFields = 0;
        let totalFields = 0;

        // Profile Info
        totalFields += 3;
        if (resumeData.profileInfo.fullname) completedFields++;
        if (resumeData.profileInfo.designation) completedFields++;
        if (resumeData.profileInfo.summary) completedFields++;

        // Contact Info
        totalFields += 2;
        if (resumeData.contactInfo.email) completedFields++;
        if (resumeData.contactInfo.phone) completedFields++;

        // Work Experience
        resumeData.workExperience.forEach(exp => {
            totalFields += 5;
            if (exp.company) completedFields++;
            if (exp.role) completedFields++;
            if (exp.startDate) completedFields++;
            if (exp.endDate) completedFields++;
            if (exp.description) completedFields++;
        });

        // Education
        resumeData.education.forEach(edu => {
            totalFields += 4;
            if (edu.degree) completedFields++;
            if (edu.institution) completedFields++;
            if (edu.startDate) completedFields++;
            if (edu.endDate) completedFields++;
        });

        // Skills
        resumeData.skills.forEach(skill => {
            totalFields += 2;
            if (skill.name) completedFields++;
            if (skill.progress > 0) completedFields++;
        });

        // Projects
        resumeData.projects.forEach(project => {
            totalFields += 4;
            if (project.title) completedFields++;
            if (project.description) completedFields++;
            if (project.github) completedFields++;
            if (project.liveDemo) completedFields++;
        });

        // Certifications
        resumeData.certifications.forEach(cert => {
            totalFields += 3;
            if (cert.title) completedFields++;
            if (cert.issuer) completedFields++;
            if (cert.year) completedFields++;
        });

        // Languages
        resumeData.languages.forEach(lang => {
            totalFields += 2;
            if (lang.name) completedFields++;
            if (lang.progress > 0) completedFields++;
        });

        // Interests
        totalFields += resumeData.interests.length;
        completedFields += resumeData.interests.filter(i => i.trim() !== "").length;

        const percentage = Math.round((completedFields / totalFields) * 100);
        setCompletionPercentage(percentage);
        return percentage;
    };

    useEffect(() => {
        calculateCompletion();
    }, [resumeData]);


    // Validate Inputs
    const validateAndNext = (e) => {
        const errors = []

        switch (currentPage) {
            case "profile-info":
                const { fullname, designation, summary } = resumeData.profileInfo
                if (!fullname.trim()) errors.push("Full Name is required")
                if (!designation.trim()) errors.push("Designation is required")
                if (!summary.trim()) errors.push("Summary is required")
                break

            case "contact-info":
                const { email, phone } = resumeData.contactInfo
                if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required.")
                if (!phone.trim() || !/^\d{10}$/.test(phone)) errors.push("Valid 10-digit phone number is required")
                break

            case "work-experience":
                resumeData.workExperience.forEach(({ company, role, startDate, endDate }, index) => {
                    if (!company || !company.trim()) errors.push(`Company is required in experience ${index + 1}`)
                    if (!role || !role.trim()) errors.push(`Role is required in experience ${index + 1}`)
                    if (!startDate || !endDate) errors.push(`Start and End dates are required in experience ${index + 1}`)
                })
                break

            case "education-info":
                resumeData.education.forEach(({ degree, institution, startDate, endDate }, index) => {
                    if (!degree.trim()) errors.push(`Degree is required in education ${index + 1}`)
                    if (!institution.trim()) errors.push(`Institution is required in education ${index + 1}`)
                    if (!startDate || !endDate) errors.push(`Start and End dates are required in education ${index + 1}`)
                })
                break

            case "skills":
                resumeData.skills.forEach(({ name, progress }, index) => {
                    if (!name.trim()) errors.push(`Skill name is required in skill ${index + 1}`)
                    if (progress < 1 || progress > 100)
                        errors.push(`Skill progress must be between 1 and 100 in skill ${index + 1}`)
                })
                break

            case "projects":
                resumeData.projects.forEach(({ title, description }, index) => {
                    if (!title.trim()) errors.push(`Project Title is required in project ${index + 1}`)
                    if (!description.trim()) errors.push(`Project description is required in project ${index + 1}`)
                })
                break

            case "certifications":
                resumeData.certifications.forEach(({ title, issuer }, index) => {
                    if (!title.trim()) errors.push(`Certification Title is required in certification ${index + 1}`)
                    if (!issuer.trim()) errors.push(`Issuer is required in certification ${index + 1}`)
                })
                break

            case "additionalInfo":
                if (resumeData.languages.length === 0 || !resumeData.languages[0].name?.trim()) {
                    errors.push("At least one language is required")
                }
                if (resumeData.interests.length === 0 || !resumeData.interests[0]?.trim()) {
                    errors.push("At least one interest is required")
                }
                break

            default:
                break
        }

        if (errors.length > 0) {
            setErrorMsg(errors.join(", "))
            return
        }

        setErrorMsg("")
        goToNextStep()
    }


    const goToNextStep = () => {
        const pages = [
            "profile-info",
            "contact-info",
            "work-experience",
            "education-info",
            "skills",
            "projects",
            "certifications",
            "additionalInfo",
        ]

        if (currentPage === "additionalInfo") setOpenPreviewModal(true)

        const currentIndex = pages.indexOf(currentPage)
        if (currentIndex !== -1 && currentIndex < pages.length - 1) {
            const nextIndex = currentIndex + 1
            setCurrentPage(pages[nextIndex])

            const percent = Math.round((nextIndex / (pages.length - 1)) * 100)
            setProgress(percent)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    // TAKE BACK TO PREVIOUS FORM STATE or take back to first page OR TO /DASHBOARD
    const goBack = () => {
        const pages = [
            "profile-info",
            "contact-info",
            "work-experience",
            "education-info",
            "skills",
            "projects",
            "certifications",
            "additionalInfo",
        ]

        if (currentPage === "profile-info") navigate("/dashboard")

        const currentIndex = pages.indexOf(currentPage)
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            setCurrentPage(pages[prevIndex])

            const percent = Math.round((prevIndex / (pages.length - 1)) * 100)
            setProgress(percent)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const renderForm = () => {
        switch (currentPage) {
            case "profile-info":
                return (
                    <ProfileInfoForm
                        profileData={resumeData?.profileInfo}
                        updateSection={(key, value) => updateSection("profileInfo", key, value)}
                        onNext={validateAndNext}
                    />
                )

            case "contact-info":
                return (
                    <ContactInfoForm
                        contactInfo={resumeData?.contactInfo}
                        updateSection={(key, value) => updateSection("contactInfo", key, value)}
                    />
                )

            case "work-experience":
                return (
                    <WorkExperienceForm
                        workExperience={resumeData?.workExperience}
                        updateArrayItem={(index, key, value) => {
                            updateArrayItem("workExperience", index, key, value)
                        }}
                        addArrayItem={(newItem) => addArrayItem("workExperience", newItem)}
                        removeArrayItem={(index) => removeArrayItem("workExperience", index)}
                    />
                )

            case "education-info":
                return (
                    <EducationDetailsForm
                        educationInfo={resumeData?.education}
                        updateArrayItem={(index, key, value) => {
                            updateArrayItem("education", index, key, value)
                        }}
                        addArrayItem={(newItem) => addArrayItem("education", newItem)}
                        removeArrayItem={(index) => removeArrayItem("education", index)}
                    />
                )

            case "skills":
                return (
                    <SkillsInfoForm
                        skillsInfo={resumeData?.skills}
                        updateArrayItem={(index, key, value) => {
                            updateArrayItem("skills", index, key, value)
                        }}
                        addArrayItem={(newItem) => addArrayItem("skills", newItem)}
                        removeArrayItem={(index) => removeArrayItem("skills", index)}
                    />
                )

            case "projects":
                return (
                    <ProjectDetailForm
                        projectInfo={resumeData?.projects}
                        updateArrayItem={(index, key, value) => {
                            updateArrayItem("projects", index, key, value)
                        }}
                        addArrayItem={(newItem) => addArrayItem("projects", newItem)}
                        removeArrayItem={(index) => removeArrayItem("projects", index)}
                    />
                )

            case "certifications":
                return (
                    <CertificationInfoForm
                        certifications={resumeData?.certifications}
                        updateArrayItem={(index, key, value) => {
                            updateArrayItem("certifications", index, key, value)
                        }}
                        addArrayItem={(newItem) => addArrayItem("certifications", newItem)}
                        removeArrayItem={(index) => removeArrayItem("certifications", index)}
                    />
                )

            case "additionalInfo":
                return (
                    <AdditionalInfoForm
                        languages={resumeData.languages}
                        interests={resumeData.interests}
                        updateArrayItem={(section, index, key, value) => updateArrayItem(section, index, key, value)}
                        addArrayItem={(section, newItem) => addArrayItem(section, newItem)}
                        removeArrayItem={(section, index) => removeArrayItem(section, index)}
                    />
                )

            default:
                return null
        }
    }

    // UPDATE THE SECTION STATE
    const updateSection = (section, key, value) => {
        setResumeData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }))
    }

    // UPDATE ARRAY ITEMS STATE USING INDEX
    const updateArrayItem = (section, index, key, value) => {
        setResumeData((prev) => {
            const updatedArray = [...prev[section]]

            if (key === null) {
                updatedArray[index] = value
            } else {
                updatedArray[index] = {
                    ...updatedArray[index],
                    [key]: value,
                }
            }

            return {
                ...prev,
                [section]: updatedArray,
            }
        })
    }

    // ADDING NEW ITEM INFORMATION
    const addArrayItem = (section, newItem) => {
        setResumeData((prev) => ({
            ...prev,
            [section]: [...prev[section], newItem],
        }))
    }

    // REMOVING THE INFO USING INDEX
    const removeArrayItem = (section, index) => {
        setResumeData((prev) => {
            const updatedArray = [...prev[section]]
            updatedArray.splice(index, 1)
            return {
                ...prev,
                [section]: updatedArray,
            }
        })
    }

    // FETCHING THE RESUME DETAILS USING BACKEND URL
    const fetchResumeDetailsById = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.RESUME.GET_BY_ID(resumeId))

            if (response.data && response.data.profileInfo) {
                const resumeInfo = response.data

                setResumeData((prevState) => ({
                    ...prevState,
                    title: resumeInfo?.title || "Untitled",
                    template: resumeInfo?.template || prevState?.template,
                    profileInfo: resumeInfo?.profileInfo || prevState?.profileInfo,
                    contactInfo: resumeInfo?.contactInfo || prevState?.contactInfo,
                    workExperience: resumeInfo?.workExperience || prevState?.workExperience,
                    education: resumeInfo?.education || prevState?.education,
                    skills: resumeInfo?.skills || prevState?.skills,
                    projects: resumeInfo?.projects || prevState?.projects,
                    certifications: resumeInfo?.certifications || prevState?.certifications,
                    languages: resumeInfo?.languages || prevState?.languages,
                    interests: resumeInfo?.interests || prevState?.interests,
                }))
            }
        } catch (error) {
            console.error("Error fetching resume:", error)
            toast.error("Failed to load resume data")
        }
    }

    // IT WILL HELP IN CHOOSING THE PREVIEW AS WELL AS HELPS IN DOWNLOADING THE RESUME ALSO SAVES THE RESUME AS A IMAGE.
    // inside EditResume.jsx
    // deep clone with inlined computed styles
    function deepCloneWithStyles(node) {
        const clone = node.cloneNode(true);

        const applyStyles = (src, dest) => {
            const computed = window.getComputedStyle(src);
            for (let prop of computed) {
                dest.style[prop] = computed.getPropertyValue(prop);
            }

            // replace oklch colors with rgb
            fixTailwindColors(dest);

            Array.from(src.children).forEach((child, i) =>
                applyStyles(child, dest.children[i])
            );
        };

        applyStyles(node, clone);
        return clone;
    }

    // --- Convert OKLCH → RGB (approximate)
    function oklchToRgb(oklch) {
        try {
            // Extract numbers: oklch(0.7 0.2 120)
            const regex = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i;
            const match = oklch.match(regex);
            if (!match) return "rgb(0,0,0)";

            let [, l, c, h, alpha] = match;
            l = parseFloat(l); // lightness
            c = parseFloat(c); // chroma
            h = parseFloat(h); // hue in deg
            alpha = alpha ? parseFloat(alpha) : 1;

            // crude conversion: map OKLCH → HSL
            const lightness = Math.round(l * 100);
            const saturation = Math.min(100, Math.round(c * 150)); // scale chroma
            const hue = Math.round(h);

            return alpha < 1
                ? `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
                : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        } catch {
            return "rgb(0,0,0)";
        }
    }

    function sanitizeOklchColors(element) {
        let html = element.outerHTML;

        const oklchRegex = /oklch\([^)]+\)/gi;
        html = html.replace(oklchRegex, (match) => {
            const converted = oklchToRgb(match);
            // console.log("🎨 Converted", match, "→", converted);
            return converted;
        });

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return wrapper.firstChild;
    }

    const uploadResumeImages = async () => {
        try {
            setIsLoading(true);

            const element = thumbnailRef.current;
            if (!element) throw new Error("Thumbnail element not found");

            await document.fonts.ready;

            // deep clone
            const clone = deepCloneWithStyles(element);
            const safeClone = sanitizeOklchColors(clone);

            Object.assign(safeClone.style, {
                display: "block",
                position: "absolute",
                top: "-9999px",
                left: "-9999px",
                width: "794px",
                height: "1123px",
                background: "#fff",
                opacity: 1, // ✅ visible for rendering
                pointerEvents: "none",
            });

            document.body.appendChild(safeClone);

            const canvas = await html2canvas(safeClone, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#fff",
            });

            document.body.removeChild(safeClone);

            const dataUrl = canvas.toDataURL("image/png", 1.0);
            if (!dataUrl || dataUrl.length < 100) {
                throw new Error("Failed to capture resume thumbnail (empty image)");
            }

            const file = dataURLtoFile(dataUrl, `thumbnail-${resumeId}.png`);
            const formData = new FormData();
            formData.append("thumbnail", file);

            const uploadResponse = await axiosInstance.put(
                API_PATHS.RESUME.UPLOAD_IMAGES(resumeId),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            const { thumbnailLink } = uploadResponse.data;
            await updateResumeDetails(thumbnailLink);

            toast.success("Resume Updated Successfully");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error Uploading Images:", err);
            toast.error("Failed to upload images");
        } finally {
            setIsLoading(false);
        }
    };


    // THIS FUNCTION WILL HELP IN UPLOADING THE RESUMES.
    // AND PUT WILL HELP IN UPDATION ON BACKEND...
    const updateResumeDetails = async (thumbnailLink) => {
        try {
            setIsLoading(true)

            await axiosInstance.put(API_PATHS.RESUME.UPDATE(resumeId), {
                ...resumeData,
                thumbnailLink: thumbnailLink || "",
                completion: completionPercentage,
            })
        } catch (err) {
            console.error("Error updating resume:", err)
            toast.error("Failed to update resume details")
        } finally {
            setIsLoading(false)
        }
    }



    // DELETE FUNCTION TO DELETE ANY RESUME
    const handleDeleteResume = async () => {
        try {
            setIsLoading(true)
            await axiosInstance.delete(API_PATHS.RESUME.DELETE(resumeId))
            toast.success("Resume deleted successfully")
            navigate("/dashboard")
        } catch (error) {
            console.error("Error deleting resume:", error)
            toast.error("Failed to delete resume")
        } finally {
            setIsLoading(false)
        }
    }


    // DOWNLOAD FUNCTION.
    const downloadPDF = async () => {
        const element = resumeDownloadRef.current;
        if (!element) {
            toast.error("Failed to generate PDF. Please try again.");
            return;
        }

        setIsDownloading(true);
        setDownloadSuccess(false);
        const toastId = toast.loading("Generating PDFâ€¦");

        const override = document.createElement("style");
        override.id = "__pdf_color_override__";
        override.textContent = `
      * {
        color: #000 !important;
        background-color: #fff !important;
        border-color: #000 !important;
      }
    `;
        document.head.appendChild(override);

        // TYPE OF HOW IT WILL LOOK WHEN DOWNLOADED.
        try {
            await html2pdf()
                .set({
                    margin: 0,
                    filename: `${resumeData.title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
                    image: { type: "png", quality: 1.0 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: "#FFFFFF",
                        logging: false,
                        windowWidth: element.scrollWidth,
                    },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait",
                    },
                    pagebreak: {
                        mode: ['avoid-all', 'css', 'legacy']
                    }
                })
                .from(element)
                .save(); // WE SAVE THE RESUME HERE AND THEN WE DOWNLOAD IT.

            toast.success("PDF downloaded successfully!", { id: toastId });
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);

        } catch (err) {
            console.error("PDF error:", err);
            toast.error(`Failed to generate PDF: ${err.message}`, { id: toastId });

        } finally {
            document.getElementById("__pdf_color_override__")?.remove();
            setIsDownloading(false);
        }
    };

    // THEME SELECTION FUNCTION
    const updateTheme = (theme) => {
        setResumeData(prev => ({
            ...prev,
            template: {
                theme: theme,
                colorPalette: []
            }
        }));
    }

    useEffect(() => {
        if (resumeId) {
            fetchResumeDetailsById()
        }
    }, [resumeId])


    return (
        <DashboardLayout>
            <div className={st.main}>
                <div className={st.header}>
                    <TitleInput title={resumeData.title}
                        setTitle={(value) => setResumeData((prev) => ({
                            ...prev,
                            title: value,
                        }))
                        }
                    />

                    <div className='flex flex-wrap items-center'>
                        <button onClick={() => setOpenThemeSelector(true)}
                            className={buttonStyles.theme}>
                            <LuPalette size={18} />
                            <span className='text-sm'>Them</span>
                        </button>

                        <button onClick={handleDeleteResume}
                            className={buttonStyles.delete}
                            disabled={isLoading}>
                            <LuTrash2 size={16} />
                            <span className='text-sm'>Delete</span>
                        </button>

                        <button
                            onClick={() => setOpenPreviewModal(true)}
                            className={buttonStyles.download}
                        >
                            <LuDownload size={16} />
                            <span className='text-sm'> Preview</span>
                        </button>
                    </div>
                </div>


                {/* STEP PROGRESS  */}
                <div className={st.grid}>
                    <div className={st.formContainer}>
                        <StepProgress progress={progress} />
                        {renderForm()}
                        <div className='p-4 sm:p-6'>
                            {errorMsg && (
                                <div className={statusStyles.error}>
                                    <AlertCircle size={16} />
                                    {errorMsg}
                                </div>
                            )}

                            <div className='flex flex-wrap items-center justify-end gap-3'>
                                <button className={buttonStyles.back}
                                    onClick={goBack}
                                    disabled={isLoading}>
                                    <ArrowLeft size={16} />
                                    Back
                                </button>

                                <button
                                    className={buttonStyles.save}
                                    onClick={uploadResumeImages}
                                    disabled={isLoading}>
                                    {
                                        isLoading ? <Loader size={16} className='animate-spin' />
                                            : <Save size={16} />
                                    }
                                    {
                                        isLoading ? 'Saving...' : 'Save & Exit'
                                    }
                                </button>

                                <button className={buttonStyles.next}
                                    onClick={validateAndNext}
                                    disabled={isLoading}>
                                    {currentPage === 'additionalInfo' && <Download size={16} />}
                                    {currentPage === 'additionalInfo' ? "Preview & Download" : "Next"}
                                    {currentPage === 'additionalInfo' && <ArrowLeft size={16} className='rotate-180' />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='hidden lg:block'>
                        <div className={st.previewContainer}>
                            <div className='text-center mb-4'>
                                <div className={statusStyles.completionBadge}>
                                    <div className={iconStyles.pulseDot}> </div>
                                    <span>Preview - {completionPercentage}% completed</span>
                                </div>

                            </div>

                            <div className='preview-container relative' ref={previewContainerRef}>
                                <div className={st.previewInner}>
                                    <RenderResume
                                        key={`preview-${resumeData?.template?.theme}`}
                                        templateId={resumeData?.template?.theme || ''}
                                        resumeData={resumeData}
                                        containerWidth={previewWidth}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {/* MODAL DATA HERE  */}
            <Modal isOpen={openThemeSelector} onClose={() => setOpenThemeSelector(false)} title={"Change Title"} >
                <div className={st.modalContent}>
                    <ThemeSelector selectedTheme={resumeData?.template.theme}
                        setSelectedTheme={updateTheme}
                        onClose={() => setOpenThemeSelector(false)} />
                </div>
            </Modal>

            <Modal isOpen={openPreviewModal}
                onClose={() => setOpenPreviewModal(false)}
                title={resumeData.title}
                showActionBtn
                actionBtnText={isDownloading ? 'Generating...'
                    : downloadSuccess ? 'Downloaded' : 'Download PDF'
                }

                actionBtnIcon={
                    isDownloading ? (
                        <Loader size={16} className='animate-spin' />
                    ) : (
                        downloadSuccess ? (
                            <Check size={16} className='text-white' />
                        ) : (
                            <Download size={16} />
                        )
                    )
                }
                onActionClick={downloadPDF}
            >
                <div className='relative'>
                    <div className='text-center mb-4'>
                        <div className={statusStyles.modalBadge}>
                            <div className={iconStyles.pulseDot}></div>
                            <span>Completion: {completionPercentage}%</span>
                        </div>

                    </div>

                    <div className={st.pdfPreview}>
                        <div ref={resumeDownloadRef} className='a4-wrapper'>
                            <div className='w-full h-full'>
                                <RenderResume key={`pdf-${resumeData?.template?.theme}`}
                                    templateId={resumeData?.template?.theme || ""}
                                    resumeData={resumeData}
                                    containerWidth={null}
                                />

                            </div>

                        </div>
                    </div>
                </div>
            </Modal>

            {/* now thumnail error fix  */}
            {/* Thumbnail offscreen but still renderable */}
            <div
                ref={thumbnailRef}
                style={{
                    position: "absolute",
                    top: "-9999px",
                    left: "-9999px",
                    opacity: 0,
                    pointerEvents: "none",
                    width: "794px",
                    height: "1123px",
                    background: "#fff",
                    overflow: "hidden",
                }}
            >
                <RenderResume
                    key={`thumb-${resumeData?.template?.theme}`}
                    templateId={resumeData?.template?.theme || ""}
                    resumeData={resumeData}
                />
            </div>

        </DashboardLayout>
    )
}

export default EditResume
