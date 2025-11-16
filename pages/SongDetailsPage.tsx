
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Song, SongStatus, SongStatusHistory } from '../types';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Calendar, Hash, Users, CheckCircle, XCircle, Clock, ListMusic, Music, Info, MessageSquare, UserCheck } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';
import { supabase } from '../services/supabaseClient';

const historyIconMap = {
    [SongStatus.APPROVED]: <CheckCircle className="w-5 h-5 text-green-400" />,
    [SongStatus.REJECTED]: <XCircle className="w-5 h-5 text-red-400" />,
    [SongStatus.PENDING]: <Clock className="w-5 h-5 text-yellow-400" />,
};

interface HistoryEntryProps {
    entry: SongStatusHistory;
    isLast: boolean;
}

const HistoryEntry: React.FC<HistoryEntryProps> = ({ entry, isLast }) => {
    const formattedDate = new Date(entry.created_at).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    
    return (
        <div className="relative">
            <div className="absolute -left-[31px] top-1 w-5 h-5 bg-gray-700 rounded-full border-4 border-black"></div>
            {!isLast && <div className="absolute -left-[22px] top-8 h-full w-0.5 bg-brand-blue/20"></div>}
            
            <div className="flex items-center gap-3">
                {historyIconMap[entry.status]}
                <h3 className="font-bold text-lg text-white">
                    Status changed to <span className={`font-extrabold ${entry.status === SongStatus.APPROVED ? 'text-green-400' : 'text-red-400'}`}>{entry.status}</span>
                </h3>
            </div>
            <div className="pl-8 text-sm text-gray-400 mt-1 space-y-2">
                <p className="flex items-center gap-2">
                    <UserCheck size={16} />
                    <span>By: <span className="font-semibold text-gray-300">{entry.profiles.username}</span></span>
                </p>
                <p className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formattedDate}</span>
                </p>
                {entry.status === SongStatus.REJECTED && entry.reason && (
                    <div className="pt-2">
                         <p className="flex items-start gap-2 font-semibold text-red-400">
                             <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                             <span>Admin Feedback:</span>
                         </p>
                         <p className="pl-1 text-gray-300 italic">"{entry.reason}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

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
                // 1. Fetch the core song data
                const { data: song, error: songError } = await supabase
                    .from('songs')
                    .select('*')
                    .eq('id', songId)
                    .single();

                if (songError) throw songError;
                
                if (!song) {
                    setError('Song not found.');
                    return;
                }

                // 2. Check authorization
                if (!isAdmin && song.user_id !== profile.id) {
                    setError('You are not authorized to view this song.');
                    return;
                }
                
                // 3. Fetch related data in parallel
                const [uploaderProfileResponse, historyResponse] = await Promise.all([
                    supabase.from('profiles').select('username').eq('id', song.user_id).single(),
                    supabase.from('song_status_history').select('*').eq('song_id', songId).order('created_at', { ascending: false })
                ]);

                const { data: uploaderProfile, error: uploaderError } = uploaderProfileResponse;
                if (uploaderError) console.error('Error fetching uploader profile:', uploaderError);

                const { data: history, error: historyError } = historyResponse;
                if (historyError) console.error('Error fetching song history:', historyError);
                
                let finalHistory: SongStatusHistory[] = [];

                if (history && history.length > 0) {
                    // 4. Fetch admin profiles for history entries
                    const adminIds = [...new Set(history.map(h => h.user_id))];
                    const { data: adminProfiles, error: adminsError } = await supabase
                        .from('profiles')
                        .select('id, username')
                        .in('id', adminIds);
                    
                    if (adminsError) console.error('Error fetching admin profiles for history:', adminsError);

                    const adminMap = new Map(adminProfiles?.map(p => [p.id, p.username]));
                    
                    finalHistory = history.map(h => ({
                        ...h,
                        profiles: {
                            username: adminMap.get(h.user_id) || 'Unknown Admin'
                        }
                    }));
                }

                const fullSongDetails = {
                    ...song,
                    profiles: {
                        username: uploaderProfile?.username || 'Unknown User'
                    },
                    song_status_history: finalHistory
                };

                setSongDetails(fullSongDetails as Song);

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

                        {songDetails.status === SongStatus.REJECTED && songDetails.rejection_reason && (
                            <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-lg">
                                <h3 className="font-bold text-red-400 flex items-center gap-2 mb-2"><Info size={18}/> Rejection Feedback</h3>
                                <p className="text-gray-300">{songDetails.rejection_reason}</p>
                            </div>
                        )}

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
                {songDetails.song_status_history && songDetails.song_status_history.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-brand-blue/20">
                        <h2 className="text-2xl font-orbitron font-bold text-white mb-6" style={{ textShadow: '0 0 10px #00bfff' }}>
                            Status History
                        </h2>
                        <div className="space-y-6 border-l-2 border-brand-blue/20 pl-6 relative">
                            <div className="absolute -left-[11px] top-1 w-5 h-5 bg-brand-blue rounded-full border-4 border-black"></div>
                            {songDetails.song_status_history.map((entry, index) => (
                                <HistoryEntry key={entry.id} entry={entry} isLast={index === songDetails.song_status_history!.length - 1} />
                            ))}
                        </div>
                    </div>
                )}
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