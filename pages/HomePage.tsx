
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-100px)]">
            <h1 className="text-6xl md:text-8xl font-orbitron font-extrabold text-white mb-4 animate-fade-in-down" style={{ textShadow: '0 0 20px #00bfff, 0 0 30px #00bfff' }}>
                RADIUM LABEL
            </h1>
            <p className="text-xl md:text-2xl text-brand-blue-light max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                Your Music. Your Future. Amplified. Distribute your tracks to the world's biggest platforms with unparalleled ease and speed.
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
                {currentUser ? (
                    <Link
                        to="/dashboard"
                        className="bg-brand-blue text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300 transform hover:scale-105"
                    >
                        Go to Dashboard
                    </Link>
                ) : (
                    <Link
                        to="/register"
                        className="bg-brand-blue text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300 transform hover:scale-105"
                    >
                        Get Started
                    </Link>
                )}
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default HomePage;
