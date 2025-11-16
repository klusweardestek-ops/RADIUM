
import { User, UserRole, Song, SongStatus } from '../types';

const USERS_KEY = 'radium_users';

// --- User Management (localStorage) ---

const getUsersFromStorage = (): User[] => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error("Error reading users from localStorage", error);
        localStorage.removeItem(USERS_KEY);
        return [];
    }
};

const saveUsersToStorage = (users: User[]) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to localStorage", error);
    }
};

const initializeData = () => {
    const users = getUsersFromStorage();
    if (!users.find(user => user.role === UserRole.ADMIN)) {
        const adminUser: User = {
            id: 'admin-user-01',
            username: 'admin',
            password: 'adminpassword',
            role: UserRole.ADMIN,
            isBanned: false,
        };
        users.push(adminUser);
        saveUsersToStorage(users);
    }
};

initializeData();

// --- IndexedDB Setup for Songs ---

let dbPromise: Promise<IDBDatabase>;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('RadiumLabelDB', 1);
            request.onerror = () => reject(new Error("Error opening IndexedDB."));
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('songs')) {
                    const songStore = db.createObjectStore('songs', { keyPath: 'id' });
                    songStore.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }
    return dbPromise;
};


// --- Main Service Object ---

export const storageService = {
    // --- User Methods (Sync) ---
    validateUser(username: string, password: string): User | null {
        const users = getUsersFromStorage();
        const user = users.find(u => u.username === username && u.password === password);
        return user || null;
    },

    addUser(username: string, password: string): User {
        const users = getUsersFromStorage();
        if (users.some(u => u.username === username)) {
            throw new Error('Username already exists.');
        }
        const newUser: User = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            username,
            password,
            role: UserRole.USER,
            isBanned: false,
        };
        users.push(newUser);
        saveUsersToStorage(users);
        return newUser;
    },

    updateUsername(userId: string, newUsername: string): User | null {
        const users = getUsersFromStorage();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) throw new Error("User not found.");
        if (users.some(u => u.username === newUsername && u.id !== userId)) {
            throw new Error('Username already taken.');
        }

        users[userIndex].username = newUsername;
        saveUsersToStorage(users);
        return users[userIndex];
    },

    getUsers(): User[] {
        return getUsersFromStorage();
    },

    updateUserBanStatus(userId: string, isBanned: boolean): void {
        const users = getUsersFromStorage();
        const userIndex = users.findIndex(u => u.id === userId);
        if(userIndex !== -1) {
            users[userIndex].isBanned = isBanned;
            saveUsersToStorage(users);
        }
    },

    // --- Song Methods (Async using IndexedDB) ---

    async addSong(songData: Omit<Song, 'id' | 'status'>): Promise<Song> {
        const db = await getDb();
        const newSong: Song = {
            ...songData,
            id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: SongStatus.PENDING,
        };
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.add(newSong);
            request.onsuccess = () => resolve(newSong);
            request.onerror = () => reject(new Error("Failed to add song to DB."));
        });
    },

    async getSongs(): Promise<Song[]> {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readonly');
            const store = transaction.objectStore('songs');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error("Failed to retrieve songs from DB."));
        });
    },

    async getSongById(songId: string): Promise<Song | undefined> {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readonly');
            const store = transaction.objectStore('songs');
            const request = store.get(songId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error("Failed to retrieve song from DB."));
        });
    },

    async getSongsByUserId(userId: string): Promise<Song[]> {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readonly');
            const store = transaction.objectStore('songs');
            const index = store.index('userId');
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error("Failed to retrieve user songs from DB."));
        });
    },

    async updateSongStatus(songId: string, status: SongStatus): Promise<void> {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readwrite');
            const store = transaction.objectStore('songs');
            const getRequest = store.get(songId);
            
            getRequest.onsuccess = () => {
                const song = getRequest.result;
                if (song) {
                    song.status = status;
                    const putRequest = store.put(song);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(new Error("Failed to update song status in DB."));
                } else {
                    reject(new Error("Song not found to update status."));
                }
            };
            getRequest.onerror = () => reject(new Error("Failed to find song for status update."));
        });
    },

    async deleteSong(songId: string): Promise<void> {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('songs', 'readwrite');
            const store = transaction.objectStore('songs');
            const request = store.delete(songId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error("Failed to delete song from DB."));
        });
    }
};