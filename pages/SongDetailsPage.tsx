import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Song, SongStatus, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Calendar, Hash, Users, CheckCircle, XCircle, Clock, ListMusic, Music } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';
import { supabase } from '../services/supabaseClient';

const SongDetailsPage: React.FC = () => {
    const { songId } = useParams<{ songId: string }>();
    const { profile, isAdmin } = useAuth();
    const [songDetails, setSongDetails] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!songId || !profile) {
            setIsLoading(false);
            return;
        }

        const fetchSongDetails = async () => {
            try {
                const { data: song, error: songError } = await supabase
                    .from('songs')
                    .select('*, profiles(username)') // Fetches song and the related profile's username
                    .eq('id', songId)
                    .single();

                if (songError) throw songError;
                
                if (!song) {
                    setError('Song not found.');
                    return;
                }

                if (!isAdmin && song.user_id !== profile.id) {
                    setError('You are not authorized to view this song.');
                    return;
                }

                setSongDetails(song);
            } catch (err) {
                console.error(err);
                setError('Failed to load song details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSongDetails();
    }, [songId, profile, isAdmin]);

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
    const backLink = isAdmin ? '/admin' : '/dashboard';

    return (
        <div>
            <Link to={backLink} className="inline-flex items-center gap-2 text-brand-blue-light hover:underline mb-6">
                <ArrowLeft size={20} />
                Back to {isAdmin ? 'Admin Panel' : 'Dashboard'}
            </Link>

            <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <img src={songDetails.cover_art_url} alt={`Cover for ${songDetails.album_title}`} className="w-full h-auto object-cover rounded-lg shadow-lg shadow-brand-blue/20" />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <span className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}>
                                {statusInfo.icon} {statusInfo.text}
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-orbitron font-bold text-white mt-2" style={{ textShadow: '0 0 15px #00bfff' }}>{songDetails.album_title}</h1>
                            <p className="text-xl text-gray-300 mt-2 flex items-center gap-2"><Users size={20} /> {songDetails.artist_names}</p>
                        </div>

                        <audio controls src={songDetails.audio_file_url} className="w-full" title={`Audio player for ${songDetails.album_title} by ${songDetails.artist_names}`} aria-label={`Audio player for ${songDetails.album_title} by ${songDetails.artist_names}`}>
                            Your browser does not support the audio element.
                        </audio>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                           <DetailItem icon={<Calendar size={18} />} label="Release Date" value={songDetails.release_date} />
                           <DetailItem icon={<Music size={18} />} label="Genre" value={songDetails.genre} />
                           <DetailItem icon={<Hash size={18} />} label="UPC" value={songDetails.upc || 'N/A'} />
                           <DetailItem icon={<Hash size={18} />} label="ISRC" value={songDetails.isrc || 'N/A'} />
                           {isAdmin && (
                                <DetailItem icon={<Users size={18} />} label="Uploaded by" value={songDetails.profiles?.username || 'Unknown'} />
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
