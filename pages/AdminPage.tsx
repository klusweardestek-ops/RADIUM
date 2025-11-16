
import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Song, SongStatus, UserRole } from '../types';
import { ShieldCheck, Users, Music, CheckCircle, XCircle, Trash2, Eye, Calendar, CreditCard, Mail, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../components/PlatformIcon';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';

type AdminView = 'songs' | 'users';
type SongFilter = 'all' | 'pending' | 'reviewed';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<AdminView>('songs');
    const [users, setUsers] = useState<Profile[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [songFilter, setSongFilter] = useState<SongFilter>('pending');
    const [loading, setLoading] = useState(true);
    const [songToReject, setSongToReject] = useState<Song | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [payoutDetails, setPayoutDetails] = useState({
        paypal_email: '',
        bank_account_iban: '',
        bank_account_swift: '',
    });

    const loadData = useCallback(async () => {
        setLoading(true);

        const [profilesResponse, songsResponse] = await Promise.all([
            supabase.from('profiles').select('*'),
            supabase.from('songs').select('*').order('created_at', { ascending: false })
        ]);

        const { data: profilesData, error: profilesError } = profilesResponse;
        if (profilesError) console.error("Error fetching profiles:", profilesError);
        else setUsers(profilesData || []);

        const { data: songsData, error: songsError } = songsResponse;
        if (songsError) {
            console.error("Error fetching songs:", songsError);
            setSongs([]);
        } else if (songsData && profilesData) {
            const profilesMap = new Map(profilesData.map(p => [p.id, p.username]));
            const songsWithUsernames = songsData.map(song => ({
                ...song,
                profiles: {
                    username: profilesMap.get(song.user_id) || 'Unknown User'
                }
            }));
            setSongs(songsWithUsernames as Song[]);
        } else {
            setSongs([]);
        }
        
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApproveSong = async (songId: string) => {
        if (!user) return;
        const { error: updateError } = await supabase.from('songs').update({ status: SongStatus.APPROVED }).eq('id', songId);
        if (updateError) {
            alert(`Failed to approve song: ${updateError.message}`);
            return;
        }

        await supabase.from('song_status_history').insert({
            song_id: songId,
            user_id: user.id,
            status: SongStatus.APPROVED,
        });
        
        loadData();
    };

    const handleRejectClick = (song: Song) => {
        setSongToReject(song);
        setRejectionReason('');
    };

    const handleConfirmRejection = async () => {
        if (!songToReject || !user) return;
        const { error: updateError } = await supabase
            .from('songs')
            .update({ status: SongStatus.REJECTED, rejection_reason: rejectionReason })
            .eq('id', songToReject.id);
        
        if (updateError) {
            alert(`Failed to reject song: ${updateError.message}`);
            return;
        }

        await supabase.from('song_status_history').insert({
            song_id: songToReject.id,
            user_id: user.id,
            status: SongStatus.REJECTED,
            reason: rejectionReason,
        });
        
        loadData();
        setSongToReject(null);
    };
    
    const handleUserBanToggle = async (userId: string, isBanned: boolean) => {
        const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
        if (error) alert(`Failed to update ban status: ${error.message}`);
        else loadData();
    };

    const handleDeleteSong = async (songId: string) => {
        if(window.confirm('Are you sure you want to permanently delete this song? This action cannot be undone.')) {
            const songToDelete = songs.find(s => s.id === songId);
            if (!songToDelete) return;
            
            const coverArtPath = songToDelete.cover_art_url.split('/cover-art/').pop();
            const audioFilePath = songToDelete.audio_file_url.split('/audio-files/').pop();

            if (coverArtPath) await supabase.storage.from('cover-art').remove([coverArtPath]);
            if (audioFilePath) await supabase.storage.from('audio-files').remove([audioFilePath]);
            
            const { error } = await supabase.from('songs').delete().eq('id', songId);
            if (error) alert(`Failed to delete song: ${error.message}`);
            else loadData();
        }
    };

    const handleEditPayoutsClick = (user: Profile) => {
        setEditingUser(user);
        setPayoutDetails({
            paypal_email: user.paypal_email || '',
            bank_account_iban: user.bank_account_iban || '',
            bank_account_swift: user.bank_account_swift || '',
        });
    };

    const handleSavePayouts = async () => {
        if (!editingUser) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                paypal_email: payoutDetails.paypal_email || null,
                bank_account_iban: payoutDetails.bank_account_iban || null,
                bank_account_swift: payoutDetails.bank_account_swift || null,
            })
            .eq('id', editingUser.id);
        
        if (error) {
            alert(`Failed to update payout details: ${error.message}`);
        } else {
            alert('Payout details updated successfully!');
            setEditingUser(null);
            loadData();
        }
    };

    const filteredSongs = songs.filter(song => {
        if (songFilter === 'pending') return song.status === SongStatus.PENDING;
        if (songFilter === 'reviewed') return song.status !== SongStatus.PENDING;
        return true;
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

            {loading ? <div className="text-center p-10">Loading...</div> : (
            <>
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
                                    onApprove={handleApproveSong}
                                    onReject={handleRejectClick}
                                    onDelete={handleDeleteSong}
                                />
                            )) : <p className="text-gray-400">No songs found for this filter.</p>}
                        </div>
                    </div>
                )}
                {view === 'users' && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-brand-blue/20 p-4">
                        <UserList users={users} onBanToggle={handleUserBanToggle} onEditPayouts={handleEditPayoutsClick} />
                    </div>
                )}
            </>
            )}
            {songToReject && (
                <RejectionModal
                    song={songToReject}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                    onConfirm={handleConfirmRejection}
                    onCancel={() => setSongToReject(null)}
                />
            )}
            {editingUser && (
                <PayoutDetailsModal
                    user={editingUser}
                    details={payoutDetails}
                    setDetails={setPayoutDetails}
                    onSave={handleSavePayouts}
                    onCancel={() => setEditingUser(null)}
                />
            )}
        </div>
    );
};

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 font-bold text-lg -mb-px transition-colors ${isActive ? 'border-b-2 border-brand-blue text-brand-blue-light' : 'text-gray-400 hover:text-white'}`}>
        {icon} {label}
    </button>
);

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${isActive ? 'bg-brand-blue text-black shadow-glow-blue' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
        {label}
    </button>
);

interface AdminSongCardProps {
    song: Song;
    onApprove: (songId: string) => void;
    onReject: (song: Song) => void;
    onDelete: (songId: string) => void;
}

const AdminSongCard: React.FC<AdminSongCardProps> = ({ song, onApprove, onReject, onDelete }) => {
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    };
    
    const statusStyles: { [key in SongStatus]: { text: string; bg: string; border: string } } = {
        [SongStatus.PENDING]: { text: 'text-yellow-300', bg: 'bg-yellow-900/50', border: 'border-yellow-500/50' },
        [SongStatus.APPROVED]: { text: 'text-green-300', bg: 'bg-green-900/50', border: 'border-green-500/50' },
        [SongStatus.REJECTED]: { text: 'text-red-300', bg: 'bg-red-900/50', border: 'border-red-500/50' },
    };
    const currentStatusStyle = statusStyles[song.status];

    return (
        <Link to={`/song/${song.id}`} className="block bg-gray-900/50 p-4 rounded-lg border border-gray-800 transition-all hover:border-brand-blue/50 cursor-pointer">
            <div className="flex flex-col md:flex-row gap-4">
                <img src={song.cover_art_url} alt={song.album_title} className="w-full md:w-24 h-auto md:h-24 object-cover rounded-md"/>
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{song.album_title}</h3>
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentStatusStyle.text} ${currentStatusStyle.bg} ${currentStatusStyle.border}`}>
                            {song.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">by {song.artist_names}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1.5"><Music size={14} />{song.genre}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} />{song.release_date}</span>
                    </div>
                     <p className="text-xs text-gray-500 mt-1">User: {song.profiles?.username || 'Unknown'}</p>
                    <div className="mt-2">
                        <h4 className="text-sm font-semibold text-brand-blue-light mb-1 flex items-center gap-2">
                            <span>Platforms:</span>
                            <span className="bg-brand-blue text-black text-xs font-bold px-2 py-0.5 rounded-full">{song.platforms.length}</span>
                        </h4>
                        <div className="flex flex-wrap gap-2 items-center">
                            {song.platforms.map(p => (
                                <span key={p} className="flex items-center gap-1.5 text-xs bg-gray-700 px-2 py-1 rounded">
                                    <PlatformIcon platform={p} />{p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-stretch md:items-end gap-2 w-full md:w-auto">
                    <div className="min-h-[40px] flex items-center">
                        {song.status === SongStatus.PENDING && (
                            <div className="flex gap-2 w-full">
                                <button onClick={(e) => handleActionClick(e, () => onApprove(song.id))} className="flex-1 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors"><CheckCircle size={18} /> Approve</button>
                                <button onClick={(e) => handleActionClick(e, () => onReject(song))} className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"><XCircle size={18} /> Reject</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-auto">
                        <span className="flex justify-center items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors" role="button" aria-label="View song details"><Eye size={18} /> Details</span>
                        <button onClick={(e) => handleActionClick(e, () => onDelete(song.id))} className="flex justify-center items-center gap-2 bg-gray-700 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"><Trash2 size={18} /> Delete</button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

interface RejectionModalProps {
    song: Song;
    reason: string;
    setReason: (reason: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}
const RejectionModal: React.FC<RejectionModalProps> = ({ song, reason, setReason, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-gray-900/80 border border-brand-blue/30 rounded-lg p-6 shadow-glow-blue">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Reason for Rejection</h2>
            <p className="text-gray-400 mb-4">Provide feedback for "{song.album_title}". (Optional)</p>
            <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Audio quality issue, copyright concern, etc."
                className="w-full h-32 p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            />
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="py-2 px-4 font-bold text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors">Confirm Rejection</button>
            </div>
        </div>
    </div>
);

interface PayoutDetailsModalProps {
    user: Profile;
    details: {
        paypal_email: string;
        bank_account_iban: string;
        bank_account_swift: string;
    };
    setDetails: (details: PayoutDetailsModalProps['details']) => void;
    onSave: () => void;
    onCancel: () => void;
}

const PayoutDetailsModal: React.FC<PayoutDetailsModalProps> = ({ user, details, setDetails, onSave, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-gray-900/80 border border-brand-blue/30 rounded-lg p-6 shadow-glow-blue">
            <h2 className="flex items-center gap-3 text-2xl font-orbitron font-bold text-white mb-2"><CreditCard size={24}/> Edit Payout Details</h2>
            <p className="text-gray-400 mb-4">For user: <span className="font-bold">{user.username}</span></p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="paypal" className="flex items-center gap-2 text-sm font-bold text-gray-300 block mb-2"><Mail size={16}/> PayPal Email</label>
                    <input
                        id="paypal"
                        type="email"
                        value={details.paypal_email}
                        onChange={(e) => setDetails({ ...details, paypal_email: e.target.value })}
                        className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        placeholder="artist@example.com"
                    />
                </div>
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-orbitron text-gray-300 mt-4 mb-2"><Landmark size={20}/> Bank Account</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="IBAN"
                            value={details.bank_account_iban}
                            onChange={(e) => setDetails({ ...details, bank_account_iban: e.target.value })}
                            className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        />
                        <input
                            type="text"
                            placeholder="SWIFT / BIC"
                            value={details.bank_account_swift}
                            onChange={(e) => setDetails({ ...details, bank_account_swift: e.target.value })}
                            className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                <button onClick={onSave} className="py-2 px-4 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light transition-colors">Save Details</button>
            </div>
        </div>
    </div>
);


interface UserListProps {
    users: Profile[];
    onBanToggle: (userId: string, isBanned: boolean) => void;
    onEditPayouts: (user: Profile) => void;
}
const UserList: React.FC<UserListProps> = ({ users, onBanToggle, onEditPayouts }) => (
    <>
        <div className="grid grid-cols-3 gap-4 font-bold text-brand-blue-light p-4">
            <span>Username</span>
            <span>Status</span>
            <span className="text-right">Action</span>
        </div>
        <div className="space-y-2">
            {users.filter(u => u.role !== UserRole.ADMIN).map(user => (
                <UserListItem key={user.id} user={user} onBanToggle={onBanToggle} onEditPayouts={onEditPayouts} />
            ))}
        </div>
    </>
);

interface UserListItemProps {
    user: Profile;
    onBanToggle: (userId: string, isBanned: boolean) => void;
    onEditPayouts: (user: Profile) => void;
}
const UserListItem: React.FC<UserListItemProps> = ({ user, onBanToggle, onEditPayouts }) => (
    <div className="grid grid-cols-3 gap-4 items-center p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/80 transition-colors">
        <span className="font-semibold">{user.username}</span>
        <span>{user.is_banned ? <span className="text-red-400 font-bold">Banned</span> : <span className="text-green-400 font-bold">Active</span>}</span>
        <div className="text-right flex justify-end gap-2">
            <button onClick={() => onEditPayouts(user)} className="font-bold py-1 px-3 rounded bg-brand-blue hover:bg-brand-blue-light text-black transition-colors">
                Payouts
            </button>
            <button onClick={() => onBanToggle(user.id, !user.is_banned)} className={`font-bold py-1 px-3 rounded text-white transition-colors ${user.is_banned ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
                {user.is_banned ? 'Unban' : 'Ban'}
            </button>
        </div>
    </div>
);

export default AdminPage;
