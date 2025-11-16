import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const { profile, user } = useAuth();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  if (!profile || !user) {
    return <div>Loading...</div>;
  }
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
        const { error } = await supabase
          .from('profiles')
          .update({ username: username })
          .eq('id', user.id);
        
        if (error) {
            throw error;
        }

        setMessage('Username updated successfully!');
        setIsEditing(false);
        // Auth context will auto-update profile on next state change or refresh,
        // or you can implement a manual refresh function in useAuth.
    } catch (err) {
        if(err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-8" style={{ textShadow: '0 0 10px #00bfff' }}>My Profile</h1>
      <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 p-8">
        {message && <p className="text-center mb-4 p-2 rounded-md bg-green-500/20 text-green-300">{message}</p>}
        {error && <p className="text-center mb-4 p-2 rounded-md bg-red-500/20 text-red-400">{error}</p>}
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-bold text-gray-300 block mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly={!isEditing}
                className={`w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md transition-all ${isEditing ? 'focus:ring-2 focus:ring-brand-blue focus:border-brand-blue' : 'text-gray-400'}`}
              />
            </div>
             <div>
              <label htmlFor="role" className="text-sm font-bold text-gray-300 block mb-2">Role</label>
              <input
                type="text"
                id="role"
                value={profile.role}
                readOnly
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md text-gray-400"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button type="button" onClick={() => { setIsEditing(false); setUsername(profile.username); }} className="py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="py-2 px-4 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all disabled:bg-gray-500 disabled:cursor-not-allowed">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="py-2 px-4 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all">
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
