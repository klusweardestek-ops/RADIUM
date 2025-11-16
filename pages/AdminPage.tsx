import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { User, Song, SongStatus } from '../types';
import { ShieldCheck, Users, Music, CheckCircle, XCircle, Clock, Trash2, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../components/PlatformIcon';

type AdminView = 'songs' | 'users';
type SongFilter = 'all' | 'pending' | 'reviewed';
type SongForState = Song & { coverArtUrl: string };

const AdminPage: React.FC = () => {
    const [view, setView] = useState<AdminView>('songs');
    const [users, setUsers] = useState<User[]>([]);
    const [songs, setSongs] = useState<SongForState[]>([]);
    const [songFilter, setSongFilter] = useState<SongFilter>('pending');

    const loadSongs = async () => {
        // Clean up any existing object URLs to prevent memory leaks
        songs.forEach(s => URL.revokeObjectURL(s.coverArtUrl));

        const allSongs = await storageService.getSongs();
        const songsWithUrls = allSongs.map(song => ({
            ...song,
            coverArtUrl: URL.createObjectURL(song.coverArt)
        }));
        setSongs(songsWithUrls);
    };

    useEffect(() => {
        setUsers(storageService.getUsers());
        loadSongs();

        return () => {
            // Final cleanup when component unmounts
            songs.forEach(s => URL.revokeObjectURL(s.coverArtUrl));
        };
    }, []);

    const handleSongStatusChange = async (songId: string, status: SongStatus) => {
        await storageService.updateSongStatus(songId, status);
        await loadSongs();
    };

    const handleUserBanToggle = (userId: string, isBanned: boolean) => {
        storageService.updateUserBanStatus(userId, isBanned);
        setUsers(storageService.getUsers());
    };

    const handleDeleteSong = async (songId: string) => {
        if(window.confirm('Are you sure you want to permanently delete this song? This action cannot be undone.')) {
            await storageService.deleteSong(songId);
            setSongs(prevSongs => {
                const songToDelete = prevSongs.find(s => s.id === songId);
                if (songToDelete) {
                    URL.revokeObjectURL(songToDelete.coverArtUrl);
                }
                return prevSongs.filter(s => s.id !== songId);
            });
        }
    };

    const filteredSongs = songs.filter(song => {
        if (songFilter === 'pending') return song.status === SongStatus.PENDING;
        if (songFilter === 'reviewed') return song.status !== SongStatus.PENDING;
        return true; // 'all'
    });

    return (
        <div>
            <h1 className="text-4xl font-orbitron font-bold text-white mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px #00bfff' }}>
                <ShieldCheck size={36} />
                Admin Panel
            </h1>
            <div className="flex border-b border-brand-blue/30 mb-6">
                <TabButton label="Song Management" icon={<Music />} isActive={view === 'songs'} onClick={() => setView('songs')} />
                <TabButton label="User Management" icon={<Users />} isActive={view === 'users'} onClick={() => setView('users')} />
            </div>

            {view === 'songs' && (
                <div>
                    <div className="flex gap-2 mb-4">
                        <FilterButton label="Pending" isActive={songFilter === 'pending'} onClick={() => setSongFilter('pending')} />
                        <FilterButton label="Reviewed" isActive={songFilter === 'reviewed'} onClick={() => setSongFilter('reviewed')} />
                        <FilterButton label="All Songs" isActive={songFilter === 'all'} onClick={() => setSongFilter('all')} />
                    </div>
                    <div className="space-y-4">
                        {filteredSongs.length > 0 ? filteredSongs.map(song => (
                            <AdminSongCard 
                                key={song.id} 
                                song={song} 
                                onStatusChange={handleSongStatusChange}
                                onDelete={handleDeleteSong}
                                allUsers={users}
                            />
                        )) : <p className="text-gray-400">No songs found for this filter.</p>}
                    </div>
                </div>
            )}

            {view === 'users' && (
                 <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-brand-blue/20 p-4">
                    <div className="grid grid-cols-3 gap-4 font-bold text-brand-blue-light p-4">
                        <span>Username</span>
                        <span>Status</span>
                        <span className="text-right">Action</span>
                    </div>
                    <div className="space-y-2">
                        {users.filter(u => u.role !== 'ADMIN').map(user => (
                            <UserListItem key={user.id} user={user} onBanToggle={handleUserBanToggle} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 font-bold text-lg -mb-px transition-colors ${
            isActive ? 'border-b-2 border-brand-blue text-brand-blue-light' : 'text-gray-400 hover:text-white'
        }`}
    >
        {icon} {label}
    </button>
);

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            isActive ? 'bg-brand-blue text-black shadow-glow-blue' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);


interface AdminSongCardProps {
    song: SongForState;
    onStatusChange: (songId: string, status: SongStatus) => void;
    onDelete: (songId: string) => void;
    allUsers: User[];
}

const AdminSongCard: React.FC<AdminSongCardProps> = ({ song, onStatusChange, onDelete, allUsers }) => {
    const user = allUsers.find(u => u.id === song.userId);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };
    
    return (
        <Link to={`/song/${song.id}`} className="block bg-gray-900/50 p-4 rounded-lg border border-gray-800 transition-all hover:border-brand-blue/50 cursor-pointer">
            <div className="flex flex-col md:flex-row gap-4">
                <img src={song.coverArtUrl} alt={song.albumTitle} className="w-full md:w-24 h-auto md:h-24 object-cover rounded-md"/>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold">{song.albumTitle}</h3>
                    <p className="text-sm text-gray-400">by {song.artistNames}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1.5">
                            <Music size={14} />
                            {song.genre}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {song.releaseDate}
                        </span>
                    </div>
                     <p className="text-xs text-gray-500 mt-1">User: {user?.username || 'Unknown'}</p>
                    <div className="mt-2">
                        <h4 className="text-sm font-semibold text-brand-blue-light mb-1">Platforms:</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                            {song.platforms.map(p => (
                                <span key={p} className="flex items-center gap-1.5 text-xs bg-gray-700 px-2 py-1 rounded">
                                    <PlatformIcon platform={p} />
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-stretch md:items-end gap-2 w-full md:w-auto">
                    {song.status === SongStatus.PENDING && (
                        <div className="flex gap-2 w-full">
                            <button onClick={(e) => handleActionClick(e, () => onStatusChange(song.id, SongStatus.APPROVED))} className="flex-1 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors">
                                <CheckCircle size={18} /> Approve
                            </button>
                            <button onClick={(e) => handleActionClick(e, () => onStatusChange(song.id, SongStatus.REJECTED))} className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors">
                                <XCircle size={18} /> Reject
                            </button>
                        </div>
                    )}
                    {song.status === SongStatus.APPROVED && <div className="text-green-400 font-bold flex items-center gap-2"><CheckCircle /> Approved</div>}
                    {song.status === SongStatus.REJECTED && <div className="text-red-400 font-bold flex items-center gap-2"><XCircle /> Rejected</div>}
                    
                    <div className="flex items-center gap-2 mt-auto">
                        <span className="flex justify-center items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors" role="button" aria-label="View song details">
                            <Eye size={18} /> Details
                        </span>
                        <button onClick={(e) => handleActionClick(e, () => onDelete(song.id))} className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};


interface UserListItemProps {
    user: User;
    onBanToggle: (userId: string, isBanned: boolean) => void;
}
const UserListItem: React.FC<UserListItemProps> = ({ user, onBanToggle }) => (
    <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/80 transition-colors">
        <span className="font-semibold">{user.username}</span>
        <span>
            {user.isBanned ? (
                <span className="text-red-400 font-bold">Banned</span>
            ) : (
                <span className="text-green-400 font-bold">Active</span>
            )}
        </span>
        <div className="text-right">
            <button
                onClick={() => onBanToggle(user.id, !user.isBanned)}
                className={`font-bold py-1 px-3 rounded ${
                    user.isBanned
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-red-600 hover:bg-red-500'
                }`}
            >
                {user.isBanned ? 'Unban' : 'Ban'}
            </button>
        </div>
    </div>
);


export default AdminPage;