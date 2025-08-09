import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { dashboardStyles as st } from '../assets/dummystyle'
import { useNavigate } from 'react-router-dom';
import { LuFilePlus, LuPlus, LuTrash2 } from 'react-icons/lu';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { ResumeSummaryCard } from '../components/Cards';

import toast from 'react-hot-toast'
import moment from 'moment'
import Modal from '../components/Modal';
import CreateResumeForm from '../components/CreateResumeForm';

function Dashboard() {

    const navigate = useNavigate();
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [allResumes, setAllResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // Calculate completion percentage for a resume
    const calculateCompletion = (resume) => {
        let completedFields = 0;
        let totalFields = 0;

        // Profile Info
        totalFields += 3;
        if (resume.profileInfo?.fullName) completedFields++;
        if (resume.profileInfo?.designation) completedFields++;
        if (resume.profileInfo?.summary) completedFields++;

        // Contact Info
        totalFields += 2;
        if (resume.contactInfo?.email) completedFields++;
        if (resume.contactInfo?.phone) completedFields++;

        // Work Experience
        resume.workExperience?.forEach(exp => {
            totalFields += 5;
            if (exp.company) completedFields++;
            if (exp.role) completedFields++;
            if (exp.startDate) completedFields++;
            if (exp.endDate) completedFields++;
            if (exp.description) completedFields++;
        });

        // Education
        resume.education?.forEach(edu => {
            totalFields += 4;
            if (edu.degree) completedFields++;
            if (edu.institution) completedFields++;
            if (edu.startDate) completedFields++;
            if (edu.endDate) completedFields++;
        });

        // Skills
        resume.skills?.forEach(skill => {
            totalFields += 2;
            if (skill.name) completedFields++;
            if (skill.progress > 0) completedFields++;
        });

        // Projects
        resume.projects?.forEach(project => {
            totalFields += 4;
            if (project.title) completedFields++;
            if (project.description) completedFields++;
            if (project.github) completedFields++;
            if (project.liveDemo) completedFields++;
        });

        // Certifications
        resume.certifications?.forEach(cert => {
            totalFields += 3;
            if (cert.title) completedFields++;
            if (cert.issuer) completedFields++;
            if (cert.year) completedFields++;
        });

        // Languages
        resume.languages?.forEach(lang => {
            totalFields += 2;
            if (lang.name) completedFields++;
            if (lang.progress > 0) completedFields++;
        });

        // Interests
        totalFields += (resume.interests?.length || 0);
        completedFields += (resume.interests?.filter(i => i?.trim() !== "")?.length || 0);

        return Math.round((completedFields / totalFields) * 100);
    };
    // IT WILL SHOW IF COMPLETED OR FILLED IT WILL DO ++.


    const fetchAllResume = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_PATHS.RESUME.GET_ALL);

            // ADD COMPLETION PERCENTAGE TO EACH RESUMES
            const resumeWithCompletion = response.data.map((resume) => ({
                ...resume,
                completion: calculateCompletion(resume)
            }));
            console.log(resumeWithCompletion)

            setAllResumes(resumeWithCompletion);
        }
        catch (err) {
            console.error('Error fetching resumes: ', err)
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchAllResume();
        }
    }, [])

    const handleDeleteResume = async () => {
        if (!resumeToDelete) return;

        try {
            await axiosInstance.delete(API_PATHS.RESUME.DELETE(resumeToDelete));
            toast.success('Resume deleted successfully');
            fetchAllResume();
        }
        catch (err) {
            console.error("Error deleting resume:", err)
            toast.error('failed to delete resume')
        }
        finally {
            setResumeToDelete(null)
            setShowDeleteConfirmation(false);
        }
    }

    const handleDeleteClick = (id) => {
        setResumeToDelete(id);
        setShowDeleteConfirmation(true);

    }


    return (
        <DashboardLayout>
            <div className={st.container}>
                <div className={st.headerWrapper}>
                    <div>
                        <h1 className={st.headerTitle}>My Resume</h1>
                        <p className={st.headerSubtitle}>
                            {allResumes.length > 0 ? `You have ${allResumes.length} resume${allResumes.length !== 1 ? 's' : ''}.` : 'Start creating your first resume now!'}
                        </p>
                    </div>

                    <div className='flex gap-4'>
                        <button className={st.createButton} onClick={() => setOpenCreateModal(true)}>
                            <div className={st.createButtonOverlay}></div>
                            <span className={st.createButtonContent}>
                                Create Now
                                <LuPlus className='group-hover:translate-x-1 transition-transform' size={18} />
                            </span>
                        </button>
                    </div>
                </div>

                {/* LOADING STATE  */}
                {loading && (
                    <div className={st.spinnerWrapper}>
                        <div className={st.spinner}></div>
                    </div>
                )}

                {/* EMPTY STATE  */}
                {!loading && allResumes.length === 0 && (
                    <div className={st.emptyStateWrapper}>
                        <div className={st.emptyIconWrapper}>
                            <LuFilePlus size={32} className='text-violet-600' />
                        </div>
                        <h3 className={st.emptyTitle}>No Resume Yet</h3>
                        <p className={st.emptyText}>
                            You haven,t create any resume yet, start building your professional resume to land your dream job.
                        </p>
                        <button className={st.createButton}
                            onClick={() => {
                                setOpenCreateModal(true);
                            }} >
                            <div className={st.createButtonOverlay}></div>
                            <span className={st.createButtonContent}>
                                Create Your First Resume
                                <LuFilePlus size={20} className='group-hover:translate-x-1 transition-transform' />
                            </span>
                        </button>
                    </div>
                )}

                {/* Grid View  */}
                {
                    !loading && allResumes.length > 0 && (
                        <div className={st.grid}>
                            <div className={st.newResumeCard} onClick={() => setOpenCreateModal(true)}>
                                <div className={st.newResumeIcon}>
                                    <LuFilePlus size={32} className='text-white' />
                                </div>
                                <h3 className={st.newResumeTitle}>Create New Resume</h3>
                                <p className={st.newResumeText}>Start building your career </p>
                            </div>

                            {
                                allResumes.map((resume) => (
                                    <ResumeSummaryCard key={resume._id}
                                        imageUrl={resume.thumbnailLink}
                                        title={resume.title}
                                        createdAt={resume.createdAt}
                                        updatedAt={resume.updatedAt}
                                        onSelect={() => navigate(`/resume/${resume._id}`)}
                                        onDelete={() => handleDeleteClick(resume._id)}
                                        completion={resume.completion || 0}
                                        isPremium={resume.isPremium}
                                        isNew={moment().diff(moment(resume.createdAt), 'days') < 7}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>

            {/* CREATE MODAL  */}
            <Modal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                hideHeader
                maxWidth='max-w-2xl' >

                <div className='p-6'>
                    <div className={st.modalHeader}>
                        <h3 className={st.modalTitle}>Create New Resume</h3>

                        <button
                            onClick={() => setOpenCreateModal(false)}
                            className={st.modalCloseButton}
                        >
                            X
                        </button>
                    </div>
                    <CreateResumeForm onSuccess={() => {
                        setOpenCreateModal(false);
                        fetchAllResume();
                    }}
                    />
                </div>
            </Modal>


            {/* DELETE MODAL  */}
            <Modal
                isOpen={showDeleteConfirmation}
                onClose={(() => setShowDeleteConfirmation(false))}
                title='Comfirm Deletion'
                showActionBtn
                actionBtnText='Delete'
                actionBtnClassName='bg-red-600 hover:bg-red-700'
                onActionClick={handleDeleteResume} >

                <div className='p-4'>
                    <div className='flex flex-col items-center text-center'>
                        <div className={st.deleteIconWrapper}>
                            <LuTrash2 className='text-orange-600' size={24} />
                        </div>

                        <h3 className={st.deleteTitle}>Delete Resume?</h3>
                        <p className={st.deleteText}>
                            Are you sure you want to delete this resume? This action cannot be undone.
                        </p>

                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    )
}

export default Dashboard
