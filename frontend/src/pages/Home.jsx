import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../AuthContext';

const Home = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const games = [
        {
            id: 'fortune-gems',
            name: 'Fortune Gems',
            description: '3×3 Classic Slot with Fortune Wheel Bonus',
            icon: '💎',
            color: 'from-yellow-600 to-orange-600',
            path: '/fortune-gems'
        },
        {
            id: 'mythic-lightning',
            name: 'Mythic Lightning',
            description: '6×5 Tumble Slot with Lightning Multipliers',
            icon: '⚡',
            color: 'from-blue-600 to-purple-600',
            path: '/mythic-lightning'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1a0b2e] to-[#0A1128] text-white">
            {/* Header */}
            <nav className="w-full p-6 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🎰</span>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        SLOT SIMULATOR
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-black/40 px-6 py-2 rounded-full border border-yellow-600/30 flex items-center gap-3">
                        <span className="text-yellow-500 text-2xl">💰</span>
                        <span className="text-yellow-100 font-mono text-xl font-bold">Rp {user?.balance?.toLocaleString() || 0}</span>
                    </div>
                    <button
                        onClick={() => navigate('/wallet')}
                        className="px-5 py-2 bg-green-600/80 hover:bg-green-700 text-white rounded-lg text-sm transition-colors font-semibold"
                    >
                        💳 Wallet
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-5 py-2 bg-purple-600/80 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors font-semibold"
                        >
                            👑 Admin
                        </button>
                    )}
                    <span className="text-gray-400">@{user?.username}</span>
                    <button
                        onClick={logout}
                        className="px-5 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm transition-colors font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 mt-8"
                >
                    <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Welcome Back, {user?.username}!
                    </h2>
                    <p className="text-xl text-gray-400">
                        Choose your game and start winning big! 🎉
                    </p>
                </motion.div>

                {/* Game Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group cursor-pointer"
                            onClick={() => navigate(game.path)}
                        >
                            <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${game.color} shadow-2xl overflow-hidden border-2 border-white/20`}>
                                {/* Animated Background */}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>

                                {/* Glow Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-8xl drop-shadow-2xl">{game.icon}</span>
                                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                            <span className="text-sm font-bold">NEW</span>
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black mb-3 text-white drop-shadow-lg">
                                        {game.name}
                                    </h3>

                                    <p className="text-white/90 text-lg mb-6">
                                        {game.description}
                                    </p>

                                    <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-black text-xl transition-all duration-300 border-2 border-white/40 group-hover:border-white/60 group-hover:scale-105">
                                        ▶ PLAY NOW
                                    </button>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🎯</span>
                            <h4 className="text-gray-400 text-sm uppercase tracking-wider">Total Spins</h4>
                        </div>
                        <p className="text-4xl font-black text-white">1,234</p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">🏆</span>
                            <h4 className="text-gray-400 text-sm uppercase tracking-wider">Total Wins</h4>
                        </div>
                        <p className="text-4xl font-black text-green-400">$12,345</p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">⚡</span>
                            <h4 className="text-gray-400 text-sm uppercase tracking-wider">Biggest Win</h4>
                        </div>
                        <p className="text-4xl font-black text-yellow-400">$2,500</p>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-500 text-sm">
                    <p>Play responsibly. For entertainment purposes only.</p>
                </div>
            </main>
        </div>
    );
};

export default Home;
