
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storageService } from '../services/storageService';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
        const updatedUser = storageService.updateUsername(currentUser.id, username);
        if (updatedUser) {
            updateUser(updatedUser);
            setMessage('Username updated successfully!');
            setIsEditing(false);
        }
    } catch (err) {
        if(err instanceof Error) {
            setMessage(err.message);
        } else {
            setMessage('An unknown error occurred.');
        }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-8" style={{ textShadow: '0 0 10px #00bfff' }}>My Profile</h1>
      <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-brand-blue/30 p-8">
        {message && <p className="text-center mb-4 p-2 rounded-md bg-green-500/20 text-green-300">{message}</p>}
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
                value={currentUser.role}
                readOnly
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-md text-gray-400"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button type="button" onClick={() => { setIsEditing(false); setUsername(currentUser.username); }} className="py-2 px-4 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="py-2 px-4 font-bold text-black bg-brand-blue rounded-md hover:bg-brand-blue-light hover:shadow-glow-blue transition-all">
                  Save Changes
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
