import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, getProfile } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            getProfile()
                .then(res => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    logout();
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (username, password) => {
        const res = await apiLogin({ username, password });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // Fetch user immediately
        const userRes = await getProfile();
        setUser(userRes.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
