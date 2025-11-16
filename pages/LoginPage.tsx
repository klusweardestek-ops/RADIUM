import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { session, isAdmin } = useAuth();

    useEffect(() => {
        if (session) {
            navigate(isAdmin ? '/admin' : '/dashboard');
        }
    }, [session, isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            }
            // The onAuthStateChange listener in useAuth will handle navigation
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 shadow-glow-blue">
                <h2 className="text-4xl font-orbitron font-bold text-center text-white">Login</h2>
                {error && <p className="text-red-500 text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <button type="submit" disabled={loading} className="w-full py-3 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Don't have an account? <Link to="/register" className="font-bold text-brand-blue-light hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
