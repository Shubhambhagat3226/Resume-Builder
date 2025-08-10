import React, { useState, useRef, useEffect } from 'react';
import { photoSelectorStyles, inputStyles as st, titleInputStyles } from '../assets/dummystyle';
import { LuCamera, LuCheck, LuEyeOff, LuTrash2 } from "react-icons/lu";
import { LuEye } from "react-icons/lu";
import { MdEdit } from 'react-icons/md';

function Input({ value, label, onChange, type = 'text', placeholder = '' }) {

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={st.wrapper}>
            {label && <label className={st.label}>{label}</label>}
            <div className={st.inputContainer(isFocused)}>
                <input type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    className={st.inputField}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {type === 'password' && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className={st.toggleButton}>
                        {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                    </button>
                )}
            </div>
        </div>
    )
}


export const ProfilePhotoSelector = ({ image, setImage, preview, setPreview }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(preview || null);
    const [hovered, setHovered] = useState(false);
    const styles = photoSelectorStyles;

    useEffect(() => {
        if (preview) setPreviewUrl(preview);
    }, [preview]);

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreview?.(url);
        }
    };

    const handleRemove = () => {
        setImage(null);
        setPreviewUrl(null);
        setPreview?.(null);
    };

    const chooseFile = () => inputRef.current.click();

    return (
        <div className={styles.container}>
            <input type="file" accept="image/*" ref={inputRef} onChange={handleImageChange} className={styles.hiddenInput} />
            {!previewUrl ? (
                <div
                    className={styles.placeholder(hovered)}
                    onClick={chooseFile}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <button type="button" className={styles.cameraButton}>
                        <LuCamera size={20} />
                    </button>
                </div>
            ) : (
                <div
                    className={styles.previewWrapper}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className={styles.previewImageContainer(hovered)} onClick={chooseFile}>
                        <img src={previewUrl} alt="profile" className={styles.previewImage} />
                    </div>
                    <div className={styles.overlay}>
                        <button type="button" className={styles.actionButton('white/80', 'white', 'gray-800')} onClick={chooseFile}>
                            <MdEdit size={16} />
                        </button>
                        <button type="button" className={styles.actionButton('red-500', 'red-600', 'white')} onClick={handleRemove}>
                            <LuTrash2 size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const TitleInput = ({ title, setTitle }) => {
    const [editing, setEditing] = useState(false);
    const [focused, setFocused] = useState(false);
    const styles = titleInputStyles;

    return (
        <div className={styles.container}>
            {editing ? (
                <>
                    <input
                        type="text"
                        placeholder="Resume title"
                        className={styles.inputField(focused)}
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoFocus
                    />
                    <button className={styles.confirmButton} onClick={() => setEditing(false)}>
                        <LuCheck className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <>
                    <h2 className={styles.titleText}>{title}</h2>
                    <button className={styles.editButton} onClick={() => setEditing(true)}>
                        <MdEdit className={styles.editIcon} />
                    </button>
                </>
            )}
        </div>
    );
};

export default Input
