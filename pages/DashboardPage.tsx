import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Song, Platform, SongStatus, Genre } from '../types';
import { Plus, UploadCloud, Music, Calendar, Type, Hash, Users, Trash2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const platforms = Object.values(Platform);
const genres = Object.values(Genre);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [songs, setSongs] = useState<Song[]>([]);
    const [showForm, setShowForm] = useState(false);
    
    const loadSongs = useCallback(async () => {
        if (user) {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching songs:", error);
            } else {
                setSongs(data);
            }
        }
    }, [user]);

    useEffect(() => {
        loadSongs();
    }, [loadSongs]);

    const handleDeleteSong = async (songId: string) => {
        if(window.confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
            const songToDelete = songs.find(s => s.id === songId);
            if (!songToDelete) return;

            // Delete files from storage first
            const coverArtPath = songToDelete.cover_art_url.split('/').pop();
            const audioFilePath = songToDelete.audio_file_url.split('/').pop();

            if (coverArtPath) await supabase.storage.from('cover-art').remove([coverArtPath]);
            if (audioFilePath) await supabase.storage.from('audio-files').remove([audioFilePath]);

            // Then delete the record from the database
            const { error } = await supabase.from('songs').delete().eq('id', songId);
            if (error) {
                alert(`Failed to delete song: ${error.message}`);
            } else {
                setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-orbitron font-bold text-white" style={{ textShadow: '0 0 10px #00bfff' }}>My Releases</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-brand-blue text-black font-bold py-2 px-4 rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300"
                >
                    <Plus size={20} /> {showForm ? 'Cancel' : 'New Release'}
                </button>
            </div>

            {showForm && <SongUploadForm onSongAdded={loadSongs} />}

            <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-lg border border-brand-blue/20 p-6">
                <h2 className="text-2xl font-orbitron mb-4">Uploaded Songs</h2>
                {songs.length > 0 ? (
                    <div className="space-y-4">
                        {songs.map(song => (
                            <SongListItem key={song.id} song={song} onDelete={handleDeleteSong} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">You haven't uploaded any songs yet.</p>
                )}
            </div>
        </div>
    );
};

interface SongUploadFormProps {
    onSongAdded: () => void;
}

const SongUploadForm: React.FC<SongUploadFormProps> = ({ onSongAdded }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        release_date: '',
        album_title: '',
        artist_names: '',
        genre: '',
        upc: '',
        isrc: '',
    });
    const [coverArt, setCoverArt] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePlatformChange = (platform: Platform) => {
        setSelectedPlatforms(prev => 
            prev.includes(platform) 
            ? prev.filter(p => p !== platform) 
            : [...prev, platform]
        );
    };
    
    const uploadFile = async (file: File, bucket: 'cover-art' | 'audio-files'): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) {
            throw new Error(`Failed to upload to ${bucket}: ${error.message}`);
        }
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !coverArt || !audioFile || selectedPlatforms.length === 0 || !formData.album_title || !formData.artist_names || !formData.release_date || !formData.genre) {
            setError('Please fill all required fields, upload files, select a genre, and select at least one platform.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const coverArtUrl = await uploadFile(coverArt, 'cover-art');
            const audioFileUrl = await uploadFile(audioFile, 'audio-files');
            
            const newSongData = {
                ...formData,
                user_id: user.id,
                genre: formData.genre as Genre,
                platforms: selectedPlatforms,
                cover_art_url: coverArtUrl,
                audio_file_url: audioFileUrl,
                status: SongStatus.PENDING,
            };

            const { error: insertError } = await supabase.from('songs').insert(newSongData);

            if (insertError) {
                throw new Error(insertError.message);
            }

            setSuccessMessage('Release submitted successfully! It will now be reviewed.');
            setFormData({ release_date: '', album_title: '', artist_names: '', genre: '', upc: '', isrc: '' });
            setCoverArt(null);
            setAudioFile(null);
            setSelectedPlatforms([]);
            
            onSongAdded();

            setTimeout(() => setSuccessMessage(''), 5000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload song. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 p-8">
            <h2 className="text-3xl font-orbitron font-bold mb-6 text-center">Upload New Release</h2>
             {successMessage && <p className="text-green-400 text-center bg-green-500/10 p-2 rounded-md mb-4">{successMessage}</p>}
             {error && <p className="text-red-500 text-center bg-red-500/10 p-2 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <FormInput icon={<Type size={18} />} label="Album Title" name="album_title" value={formData.album_title} onChange={(e) => setFormData({...formData, album_title: e.target.value})} required />
                    <FormInput icon={<Users size={18} />} label="Artist Name(s)" name="artist_names" value={formData.artist_names} onChange={(e) => setFormData({...formData, artist_names: e.target.value})} required />
                    <FormSelect icon={<Music size={18} />} label="Genre" name="genre" value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})} required>
                        <option value="" disabled>Select a genre</option>
                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </FormSelect>
                    <FormInput icon={<Calendar size={18} />} label="Release Date" name="release_date" type="date" value={formData.release_date} onChange={(e) => setFormData({...formData, release_date: e.target.value})} required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormInput icon={<Hash size={18} />} label="UPC (Optional)" name="upc" value={formData.upc} onChange={(e) => setFormData({...formData, upc: e.target.value})} />
                         <FormInput icon={<Hash size={18} />} label="ISRC (Optional)" name="isrc" value={formData.isrc} onChange={(e) => setFormData({...formData, isrc: e.target.value})} />
                    </div>
                    <FileInput label="Cover Art" file={coverArt} setFile={setCoverArt} accept="image/*" required />
                    <FileInput label="Audio File" file={audioFile} setFile={setAudioFile} accept="audio/*" required />
                </div>
                <div className="md:col-span-1 space-y-4 bg-gray-900/50 p-4 rounded-md border border-gray-700">
                    <h3 className="font-bold text-lg text-brand-blue-light">Distribution Platforms</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {platforms.map(platform => (
                            <div key={platform} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={platform}
                                    checked={selectedPlatforms.includes(platform)}
                                    onChange={() => handlePlatformChange(platform)}
                                    className="w-4 h-4 text-brand-blue bg-gray-700 border-gray-600 rounded focus:ring-brand-blue"
                                />
                                <label htmlFor={platform} className="ml-2 text-sm text-gray-300">{platform}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-3 text-center">
                    <button type="submit" disabled={isLoading} className="w-full md:w-1/2 py-3 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Uploading...' : 'Submit Release'}
                    </button>
                </div>
            </form>
        </div>
    );
};


interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ReactNode;
}
const FormInput: React.FC<FormInputProps> = ({ label, icon, ...props }) => (
    <div>
        <label htmlFor={props.name} className="text-sm font-bold text-gray-300 block mb-2">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</span>
            <input
                {...props}
                className="w-full p-3 pl-10 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
            />
        </div>
    </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}
const FormSelect: React.FC<FormSelectProps> = ({ label, icon, children, ...props }) => (
    <div>
        <label htmlFor={props.name} className="text-sm font-bold text-gray-300 block mb-2">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</span>
            <select
                {...props}
                className="w-full p-3 pl-10 bg-gray-900/50 border border-gray-700 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all appearance-none"
            >
                {children}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
            </span>
        </div>
    </div>
);

interface FileInputProps {
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    accept: string;
    required?: boolean;
}
const FileInput: React.FC<FileInputProps> = ({ label, file, setFile, accept, required }) => (
    <div>
        <label className="text-sm font-bold text-gray-300 block mb-2">{label}</label>
        <label htmlFor={label} className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-900/80 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            </div>
            <input id={label} type="file" className="hidden" accept={accept} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required={required} />
        </label>
        {file && <p className="text-xs text-brand-blue-light mt-1">{file.name}</p>}
    </div>
);


interface SongListItemProps {
    song: Song;
    onDelete: (songId: string) => void;
}
const SongListItem: React.FC<SongListItemProps> = ({ song, onDelete }) => {
    const statusColor = {
        [SongStatus.PENDING]: 'text-yellow-400 border-yellow-400',
        [SongStatus.APPROVED]: 'text-green-400 border-green-400',
        [SongStatus.REJECTED]: 'text-red-400 border-red-400',
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(song.id);
    };
    
    return (
        <Link to={`/song/${song.id}`} className="block p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-brand-blue/50 transition-all cursor-pointer">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={song.cover_art_url} alt={song.album_title} className="w-16 h-16 object-cover rounded-md"/>
                    <div>
                        <h3 className="text-lg font-bold text-white">{song.album_title}</h3>
                        <p className="text-sm text-gray-400">{song.artist_names}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <span className={`text-sm font-semibold px-3 py-1 border rounded-full ${statusColor[song.status]}`}>
                        {song.status}
                    </span>
                    <button onClick={handleDeleteClick} className="text-gray-400 hover:text-red-500 transition-colors relative z-10">
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>
        </Link>
    );
};


export default DashboardPage;
