import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.register({ username, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-2xl border border-purple-500"
            >
                <h2 className="text-3xl font-bold text-center text-purple-400 mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400">Username</label>
                        <input
                            type="text"
                            className="w-full p-2 mt-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 mt-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 font-bold text-black bg-purple-500 rounded hover:bg-purple-400 transition-colors"
                    >
                        REGISTER
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-500">
                    Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
