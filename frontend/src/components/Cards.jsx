import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { cardStyles } from "../assets/dummystyle";
import { MdEdit } from "react-icons/md";
import { LuAward, LuCheck, LuClock, LuTrash2, LuTrendingUp, LuZap } from "react-icons/lu";

// PROFILE INFO CARD COMPONENT
export const ProfileInfoCard = () => {
    const { user, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate('/');
    }

    return (
        user && (
            <div className={cardStyles.profileCard}>
                <div className={cardStyles.profileInitialsContainer}>
                    <span className={cardStyles.profileInitialsText}>
                        {user.name ? user.name.charAt(0).toUpperCase() : ''}
                    </span>
                </div>
                <div className={cardStyles.profileName}>
                    {user.name || ''}
                </div>
                <button className={cardStyles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        )
    );
}

// RESUME SUMMARY CARD
export const ResumeSummaryCard = ({
    title = "Untitled Resume",
    createdAt = null,
    updatedAt = null,
    onSelect,
    onDelete,
    completion = 85,
    thumbnailLink = null, // 👈 added thumbnailLink prop
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Format dates
    const formattedCreatedDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        })
        : "—";

    const formattedUpdatedDate = updatedAt
        ? new Date(updatedAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        })
        : "—";

    const getCompletionColor = () => {
        if (completion >= 90) return cardStyles.completionHigh;
        if (completion >= 70) return cardStyles.completionMedium;
        return cardStyles.completionLow;
    };

    const getCompletionIcon = () => {
        if (completion >= 90) return <LuAward size={12} />;
        if (completion >= 70) return <LuTrendingUp size={12} />;
        return <LuZap size={12} />;
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete();
    };

    return (
        <div
            className={cardStyles.resumeCard}
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Completion indicator */}
            <div className={cardStyles.completionIndicator}>
                <div className={` ${cardStyles.completionDot} bg-gradient-to-r ${getCompletionColor()}`}>
                    <div className={cardStyles.completionDotInner} />
                </div>
                <span className={cardStyles.completionPercentageText}>{completion}%</span>
                {getCompletionIcon()}
            </div>

            {/* Preview area */}
            <div className={cardStyles.previewArea}>
                {thumbnailLink ? (
                    <img
                        src={thumbnailLink}
                        alt="Resume thumbnail"
                        className="w-full h-[220px] object-cover rounded-xl border border-gray-200"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-[220px] bg-gray-50 rounded-xl">
                        <div className={cardStyles.emptyPreviewIcon}>
                            <MdEdit size={28} className="text-indigo-600" />
                        </div>
                        <span className={cardStyles.emptyPreviewText}>{title}</span>
                        <span className={cardStyles.emptyPreviewSubtext}>
                            {completion === 0 ? "Start building" : `${completion}% completed`}
                        </span>
                    </div>
                )}

                {/* Hover overlay with action buttons */}
                {isHovered && (
                    <div className={cardStyles.actionOverlay}>
                        <div className={cardStyles.actionButtonsContainer}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
                                className={cardStyles.editButton}
                                title="Edit"
                            >
                                <MdEdit size={18} className={cardStyles.buttonIcon} />
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className={cardStyles.deleteButton}
                                title="Delete"
                            >
                                <LuTrash2 size={18} className={cardStyles.buttonIcon} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Info area */}
            <div className={cardStyles.infoArea}>
                <h5 className={cardStyles.title}>{title}</h5>
                <div className={cardStyles.dateInfo}>
                    <LuClock size={12} />
                    <span>Created At: {formattedCreatedDate}</span>
                    <span className="ml-2">Updated At: {formattedUpdatedDate}</span>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                    <div
                        className={`h-full bg-gradient-to-r ${getCompletionColor()} rounded-full transition-all duration-700`}
                        style={{ width: `${completion}%` }}
                    />
                </div>
            </div>
        </div>
    );
};



// TEMPLATES CARD
export const TemplateCard = ({ thumbnailImg, isSelected, onSelect }) => {

    return (
        <div className={`group h-auto md:h-[300px] lg:h-[320px] flex flex-col bg-white border-2 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-lg rounded-3xl ${isSelected ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
            onClick={onSelect}>
            {
                thumbnailImg ? (
                    <div className="relative w-full h-full overflow-hidden">
                        <img src={thumbnailImg || '/placeholder.svg'} alt="template Review" className="w-full h-full object-cover group-hover:scale-110 transition-transform dura700" />

                        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {
                            isSelected && (
                                <div className="absolute inset-0 bg-violet-500/10 flex item-center justify-center">
                                    <div className="w-16 h-16 bg-white backdrop-blur-sm rounded-full flex items-center justify-center shalg animate-plus">
                                        <LuCheck size={24} className="text-violet-600" />
                                    </div>
                                </div>
                            )
                        }

                        // HOVER EFFECT
                        <div className="absolute inset-0 bg-gradient-to-t from-violet-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-[200px] flex items-center flex-col justify-center bg-gradient-to-br from-violet-50 via-violet-600 to-fuchsia-50">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-3">
                            <MdEdit className="text-white" size={20} />
                        </div>
                        <span className="text-gray-700 font-bold">
                            No Preview
                        </span>
                    </div>
                )
            }
        </div>
    )
}
