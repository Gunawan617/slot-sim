import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-2xl border border-gold"
            >
                <h2 className="text-3xl font-bold text-center text-gold mb-6">Slot SIM Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400">Username</label>
                        <input
                            type="text"
                            className="w-full p-2 mt-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-gold"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 mt-1 bg-gray-800 text-white border border-gray-700 rounded focus:outline-none focus:border-gold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 font-bold text-black bg-gold rounded hover:bg-yellow-400 transition-colors"
                    >
                        LOGIN
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-500">
                    Don't have an account? <Link to="/register" className="text-gold hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
