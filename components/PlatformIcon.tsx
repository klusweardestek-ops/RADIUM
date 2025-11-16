import React from 'react';
import { Platform } from '../types';

const PlatformIcon: React.FC<{ platform: Platform; className?: string }> = ({ platform, className = 'w-4 h-4' }) => {
    switch (platform) {
        case Platform.SPOTIFY:
            return (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#1DB954">
                    <title>Spotify</title>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.22 16.2c-.33.15-.71.06-.94-.23-.23-.29-.14-.67.15-.94 2.14-1.18 4.81-1.54 7.23-.88.33.09.51.44.42.77-.09.33-.44.51-.77.42-2.07-.57-4.38-.26-6.19.74zm1.14-2.43c-.29.18-.67.06-.88-.23s-.06-.67.23-.88c1.86-1.03 4.1-1.33 6.09-.71.33.1.56.41.47.74-.1.33-.41.56-.74.47-1.68-.51-3.55-.26-5.17.61zm.12-2.43c-.23.18-.58.09-.76-.14s-.09-.58.14-.76c1.62-.97 3.63-1.16 5.4-.55.29.1.48.4.39.69s-.4.48-.69.39c-1.5-.5-3.23-.33-4.58.52z"/>
                </svg>
            );
        case Platform.APPLE_MUSIC:
            return (
                 <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#FA233E">
                     <title>Apple Music</title>
                     <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.075 16.321c-.441.264-.93.396-1.467.396-1.083 0-2.1-.476-2.829-1.282-1.442-1.589-2.229-3.619-2.229-5.648 0-1.956.786-3.957 2.229-5.543.743-.82 1.746-1.296 2.829-1.296.652 0 1.29.182 1.83.543.527.352.93.858 1.159 1.467.228.609.314 1.296.228 1.956-.396 3.129-1.652 4.96-3.76 5.894z"/>
                 </svg>
            );
        case Platform.INSTAGRAM:
             return (
                 <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="url(#insta-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <defs>
                        <radialGradient id="insta-gradient" cx="0.35" cy="1" r="1.2">
                            <stop offset="0%" stopColor="#fdc125"/>
                            <stop offset="25%" stopColor="#f57d21"/>
                            <stop offset="50%" stopColor="#d62976"/>
                            <stop offset="75%" stopColor="#962fbf"/>
                            <stop offset="100%" stopColor="#4f5bd5"/>
                        </radialGradient>
                     </defs>
                     <title>Instagram</title>
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                     <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                 </svg>
             );
        case Platform.TIKTOK:
            return (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <title>TikTok</title>
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.63-1.1-6-3.02-1.3-1.82-1.5-4.14-1.5-6.32 0-2.18.01-4.36.01-6.54.01-1.39.49-2.76 1.32-3.88 1.07-1.4 2.64-2.3 4.27-2.51.02-.01.01-.01 0 0z" fill="#000000"/>
                </svg>
            );
        case Platform.AMAZON:
            return (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#00A8E1">
                    <title>Amazon Music</title>
                    <path d="M15.85 18.3c-2.32 1.45-5.38 1.45-7.7 0-1.47-.92-2.37-2.68-2.37-4.5 0-2.12 1.15-3.97 2.8-4.95.48-.28.85-.7 1.02-1.22s.1-1.07-.2-1.55c-.3-.48-.82-.78-1.37-.78-1.35 0-2.65.6-3.6 1.62C2.7 8.8.45 11.55.45 14.7c0 4.12 2.5 7.65 6.15 9.15 4.13 1.65 8.88 1.65 13.05 0C21.48 23.1 24 20.4 24 17.25c0-3.15-2.25-5.85-5.4-7.2-1.95-.82-4.2-1.05-6.3-.6-.52.1-.98.43-1.28.85-.3.43-.4.98-.28 1.5.12.52.48.97.98 1.2.6.28 1.25.28 1.85 0 1.2-.52 2.55-.45 3.75.22.82.45 1.42 1.12 1.72 1.95.3.6.45 1.35.45 2.1 0 .9-.38 1.72-1.05 2.25z"/>
                </svg>
            );
        case Platform.YOUTUBE:
            return (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#FF0000">
                    <title>YouTube</title>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            );
        case Platform.ITUNES:
            return (
                 <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="#EA4CC0">
                     <title>iTunes</title>
                     <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.628 0 12-5.373 12-12S18.628 0 12 0zm0 3.75c4.558 0 8.25 3.692 8.25 8.25S16.558 20.25 12 20.25 3.75 16.558 3.75 12 7.442 3.75 12 3.75zm-1.875 3.938v5.531c-.625-.331-1.344-.531-2.125-.531-1.781 0-3.219 1.438-3.219 3.219s1.438 3.219 3.219 3.219 3.219-1.438 3.219-3.219V9.563l4.5-1.5v3.813c-.625-.331-1.344-.531-2.125-.531-1.781 0-3.219 1.438-3.219 3.219s1.438 3.219 3.219 3.219 3.219-1.438 3.219-3.219V6.188z"/>
                 </svg>
            );
        case Platform.CONTENT_ID:
            return (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" color="white">
                    <title>Content ID</title>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 15.29L6.7 12.7a.996.996 0 1 1 1.41-1.41L9.41 12.5l3.88-3.88a.996.996 0 1 1 1.41 1.41L10.7 15.29c-.39.39-1.02.39-1.41 0z"/>
                </svg>
            );
        default:
            return <div className="w-4 h-4 bg-gray-500 rounded-full inline-block"></div>; // Fallback
    }
};

export default PlatformIcon;
