import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    }
                }
            });

            if (authError) {
                setError(authError.message);
            } else {
                // The database trigger now handles profile creation.
                // We just show a success message to the user.
                setIsRegistered(true);
            }
        } catch (err) {
            setError('An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 shadow-glow-blue">
                {isRegistered ? (
                    <div className="text-center">
                        <h2 className="text-3xl font-orbitron font-bold text-green-400">Registration Successful!</h2>
                        <p className="mt-4 text-gray-300">Your account has been created and you are now logged in.</p>
                        <Link to="/dashboard" className="mt-6 inline-block bg-brand-blue text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300">
                            Continue to Dashboard
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="text-4xl font-orbitron font-bold text-center text-white">Create Account</h2>
                        {error && <p className="text-red-500 text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="text-sm font-bold text-gray-300 block mb-2">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-bold text-gray-300 block mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="text-sm font-bold text-gray-300 block mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-300 block mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {loading ? 'Creating Account...' : 'Register'}
                            </button>
                        </form>
                        <p className="text-center text-gray-400">
                            Already have an account? <Link to="/login" className="font-bold text-brand-blue-light hover:underline">Login here</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegisterPage;