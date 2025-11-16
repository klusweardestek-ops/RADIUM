import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate('/dashboard');
        }
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
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
                setLoading(false);
                return;
            }

            if (authData.user) {
                // Create a profile entry for the new user
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({ 
                        id: authData.user.id, 
                        username: username,
                        role: UserRole.USER,
                        is_banned: false
                    });

                if (profileError) {
                    setError(`Account created, but failed to set up profile: ${profileError.message}`);
                }
                // The onAuthStateChange listener will handle navigation
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
            </div>
        </div>
    );
};

export default RegisterPage;
