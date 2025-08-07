import React, { useState } from 'react'
import { inputStyles as st } from '../assets/dummystyle';
import { LuEyeOff } from "react-icons/lu";
import { LuEye } from "react-icons/lu";

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

export default Input
