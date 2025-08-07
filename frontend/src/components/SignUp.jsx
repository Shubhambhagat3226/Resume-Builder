import React, { useContext, useState } from 'react'
import { authStyles as st } from '../assets/dummystyle'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { validateEmail } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import Input from './Input';

function SignUp({ setCurrentPage }) {

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!fullName) {
            setError('Please enter Fullname');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        setError(null);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
                name: fullName,
                email,
                password
            });

            const { token } = response.data;
            if (token) {
                localStorage.setItem('token', token);
                updateUser(response.data.user);
                navigate('/dashboard');
            }

        } catch (err) {
            console.error('Error during sign up:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
        }
    }

    return (
        <div className={st.signupContainer}>
            <div className={st.headerWrapper}>
                <h3 className={st.signupTitle}>
                    Create an Account
                </h3>
                <p className={st.signupSubtitle}>Please fill in the details below to create an account.</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSignUp} className={st.signupForm}>
                <Input value={fullName}
                    onChange={({ target }) => setFullName(target.value)}
                    label="Full Name"
                    type="text"
                    placeholder="John Doe" />
                <Input value={email}
                    onChange={({ target }) => setEmail(target.value)}
                    label="Email"
                    type='email' placeholder="email@example.com" />
                <Input value={password}
                    onChange={({ target }) => setPassword(target.value)}
                    label="Password"
                    type="password"
                    placeholder="Min 8 characters" />

                {error && <div className={st.errorMessage}>{error}</div>}

                <button type="submit" className={st.signupSubmit}>Create Account</button>


                {/* FOOTER  */}
                <p className={st.switchText}>
                    Already have an account? <button onClick={() => setCurrentPage('login')} className={st.signupSwitchButton}>Sign In</button>
                </p>
            </form>
        </div>
    )
}

export default SignUp
