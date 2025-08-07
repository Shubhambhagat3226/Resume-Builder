import React, { useContext, useState } from 'react'
import { authStyles as st } from '../assets/dummystyle'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { validateEmail } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import Input from './Input';

function Login({ setCurrentPage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 8) {
            setError('Please enter a password');
            return;
        }
        setError(null);

        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
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
            console.error('Error during login:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
        }

    }

    return (
        <div className={st.container}>
            <div className={st.headerWrapper}>
                <h3 className={st.title}>
                    Welcome Back!
                </h3>
                <p className={st.subtitle}>Sign in to continue building your amazing resume.</p>
            </div>

            {/* FORM  */}
            <form onSubmit={handleLogin}>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <div className={st.errorMessage}>{error}</div>}

                <button type="submit" className={st.submitButton}>Sign In</button>

                {/* Footer  */}
                <p className={st.switchText}>
                    Don't have an account? <button onClick={() => setCurrentPage('signup')}
                        className={st.switchButton}>Sign Up</button>
                </p>
            </form>
        </div>
    )
}

export default Login
