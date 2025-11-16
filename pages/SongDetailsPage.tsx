import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Song, User, SongStatus, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Calendar, Hash, Users, CheckCircle, XCircle, Clock, ListMusic, Music } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';

type SongDetailsState = Song & {
  coverArtUrl: string;
  audioFileUrl: string;
  uploader?: User;
};

const SongDetailsPage: React.FC = () => {
    const { songId } = useParams<{ songId: string }>();
    const { currentUser } = useAuth();
    const [songDetails, setSongDetails] = useState<SongDetailsState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!songId || !currentUser) {
            setError('Song ID or user is missing.');
            setIsLoading(false);
            return;
        }

        let coverUrl: string;
        let audioUrl: string;

        const fetchSongDetails = async () => {
            try {
                const song = await storageService.getSongById(songId);
                if (!song) {
                    setError('Song not found.');
                    return;
                }

                if (currentUser.role === UserRole.USER && song.userId !== currentUser.id) {
                    setError('You are not authorized to view this song.');
                    return;
                }

                const users = storageService.getUsers();
                const uploader = users.find(u => u.id === song.userId);

                coverUrl = URL.createObjectURL(song.coverArt);
                audioUrl = URL.createObjectURL(song.audioFile);

                setSongDetails({ ...song, coverArtUrl: coverUrl, audioFileUrl: audioUrl, uploader });
            } catch (err) {
                console.error(err);
                setError('Failed to load song details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSongDetails();

        return () => {
            if (coverUrl) URL.revokeObjectURL(coverUrl);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [songId, currentUser]);

    const getStatusInfo = (status: SongStatus) => {
        switch (status) {
            case SongStatus.APPROVED:
                return { icon: <CheckCircle className="text-green-400" />, text: 'Approved', color: 'text-green-400' };
            case SongStatus.REJECTED:
                return { icon: <XCircle className="text-red-400" />, text: 'Rejected', color: 'text-red-400' };
            case SongStatus.PENDING:
            default:
                return { icon: <Clock className="text-yellow-400" />, text: 'Pending', color: 'text-yellow-400' };
        }
    };
    
    if (isLoading) {
        return <div className="text-center p-10">Loading song details...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    if (!songDetails) {
        return <div className="text-center p-10">No song details available.</div>;
    }
    
    const statusInfo = getStatusInfo(songDetails.status);
    const backLink = currentUser?.role === UserRole.ADMIN ? '/admin' : '/dashboard';

    return (
        <div>
            <Link to={backLink} className="inline-flex items-center gap-2 text-brand-blue-light hover:underline mb-6">
                <ArrowLeft size={20} />
                Back to {currentUser?.role === UserRole.ADMIN ? 'Admin Panel' : 'Dashboard'}
            </Link>

            <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <img src={songDetails.coverArtUrl} alt={`Cover for ${songDetails.albumTitle}`} className="w-full h-auto object-cover rounded-lg shadow-lg shadow-brand-blue/20" />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <span className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}>
                                {statusInfo.icon} {statusInfo.text}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-orbitron font-bold text-white mt-2" style={{ textShadow: '0 0 15px #00bfff' }}>{songDetails.albumTitle}</h1>
                            <p className="text-xl text-gray-300 mt-2 flex items-center gap-2"><Users size={20} /> {songDetails.artistNames}</p>
                        </div>

                        <audio controls src={songDetails.audioFileUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                           <DetailItem icon={<Calendar size={18} />} label="Release Date" value={songDetails.releaseDate} />
                           <DetailItem icon={<Music size={18} />} label="Genre" value={songDetails.genre} />
                           <DetailItem icon={<Hash size={18} />} label="UPC" value={songDetails.upc || 'N/A'} />
                           <DetailItem icon={<Hash size={18} />} label="ISRC" value={songDetails.isrc || 'N/A'} />
                           {currentUser?.role === UserRole.ADMIN && (
                                <DetailItem icon={<Users size={18} />} label="Uploaded by" value={songDetails.uploader?.username || 'Unknown'} />
                           )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-brand-blue-light flex items-center gap-2 mb-3"><ListMusic size={20} /> Platforms</h3>
                            <div className="flex flex-wrap gap-2 items-center">
                                {songDetails.platforms.map(p => (
                                    <span key={p} className="flex items-center gap-2 text-sm bg-gray-800/70 text-gray-200 px-3 py-1 rounded-full">
                                        <PlatformIcon platform={p} className="w-5 h-5" />
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DetailItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
    <div className="bg-gray-900/50 p-3 rounded-md">
        <div className="flex items-center gap-2 text-sm text-gray-400">
            {icon}
            <span>{label}</span>
        </div>
        <p className="font-semibold text-white mt-1">{value}</p>
    </div>
);

export default SongDetailsPage;