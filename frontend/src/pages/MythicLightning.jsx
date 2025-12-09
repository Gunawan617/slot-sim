import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import { mythicSpin } from '../api';

// Symbol emoji mapping
const symbolEmojis = {
    'ZEUS': '⚡',
    'CROWN': '👑',
    'TRIDENT': '🔱',
    'EAGLE': '🦅',
    'VASE': '🏺',
    'FIRE': '🔥',
    'GEM': '💎',
    'SWORD': '⚔️',
    'A': 'A',
    'K': 'K',
    'Q': 'Q',
    'J': 'J',
    'SCATTER': '💠',
    'EMPTY': '❓'
};

const betOptions = [10, 25, 50, 100, 250, 500];

const MythicLightning = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Game state
    const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(6).fill('EMPTY')));
    const [spinning, setSpinning] = useState(false);
    const [tumbling, setTumbling] = useState(false);
    const [bet, setBet] = useState(10);
    const [localBalance, setLocalBalance] = useState(user?.balance || 0);
    const [message, setMessage] = useState('');
    const [totalWin, setTotalWin] = useState(0);
    const [currentTumble, setCurrentTumble] = useState(0);
    const [winningClusters, setWinningClusters] = useState([]);
    const [showLightning, setShowLightning] = useState(false);
    const [showFreeSpinsBanner, setShowFreeSpinsBanner] = useState(false);
    const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0);

    // Auto spin state
    const [autoSpinning, setAutoSpinning] = useState(false);

    // Auto spin driver
    useEffect(() => {
        if (autoSpinning && !spinning && localBalance >= bet) {
            const timer = setTimeout(() => {
                spin();
            }, 1000);
            return () => clearTimeout(timer);
        } else if (autoSpinning && localBalance < bet) {
            setAutoSpinning(false);
        }
    }, [autoSpinning, spinning, localBalance, bet]);

    useEffect(() => {
        if (user) setLocalBalance(user.balance);
        // Initialize grid with random symbols
        const initialGrid = Array(5).fill(null).map(() =>
            Array(6).fill(null).map(() => getRandomSymbol())
        );
        setGrid(initialGrid);
    }, [user]);

    const getRandomSymbol = () => {
        const symbols = ['ZEUS', 'CROWN', 'TRIDENT', 'EAGLE', 'VASE', 'FIRE', 'GEM', 'SWORD', 'A', 'K', 'Q', 'J'];
        return symbols[Math.floor(Math.random() * symbols.length)];
    };

    const spin = async () => {
        if (spinning || localBalance < bet) return;

        setSpinning(true);
        setTumbling(false);
        setMessage('');
        setTotalWin(0);
        setCurrentTumble(0);
        setWinningClusters([]);

        try {
            const res = await mythicSpin({ bet });
            const data = res.data;

            // Animate tumbles sequentially
            if (data.tumbles && data.tumbles.length > 0) {
                await animateTumbles(data.tumbles);
            } else {
                // No wins, just show final grid
                setGrid(data.grid);
            }

            // Show final results
            setLocalBalance(data.current_balance);
            setTotalWin(data.total_win);
            setMessage(data.message);

            // Check for free spins trigger
            if (data.free_spins_awarded > 0) {
                setFreeSpinsAwarded(data.free_spins_awarded);
                await delay(500);
                setShowFreeSpinsBanner(true);
                await delay(3000);
                setShowFreeSpinsBanner(false);
            }

            setSpinning(false);

            setSpinning(false);

        } catch (err) {
            setSpinning(false);
            console.error('Spin error:', err);
            console.error('Error response:', err.response);

            // Handle unauthorized error
            if (err.response?.status === 401) {
                setMessage('Session expired. Please login again.');
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(err.response?.data?.error || 'Error occurred');
            }
        }
    };

    const animateTumbles = async (tumbles) => {
        for (let i = 0; i < tumbles.length; i++) {
            const tumble = tumbles[i];
            setCurrentTumble(i + 1);
            setTumbling(true);

            // Highlight winning clusters
            if (tumble.clusters) {
                setWinningClusters(tumble.clusters);
                await delay(800);
            }

            // Show lightning effect if multiplier spawned
            if (tumble.multiplier > 1) {
                setShowLightning(true);
                await delay(1000);
                setShowLightning(false);
            }

            // Explode and drop
            await delay(500);
            setWinningClusters([]);

            // Update grid
            setGrid(tumble.grid);
            await delay(600);
        }

        setTumbling(false);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const toggleAutoSpin = () => {
        setAutoSpinning(!autoSpinning);
    };

    const isWinningCell = (row, col) => {
        return winningClusters.some(cluster =>
            cluster.positions.some(pos => pos.row === row && pos.col === col)
        );
    };

    const getSymbolColor = (symbol) => {
        const colors = {
            'ZEUS': 'from-purple-400 to-pink-500',
            'CROWN': 'from-yellow-400 to-orange-500',
            'TRIDENT': 'from-blue-400 to-cyan-500',
            'EAGLE': 'from-amber-400 to-yellow-600',
            'VASE': 'from-orange-400 to-red-500',
            'FIRE': 'from-red-500 to-orange-600',
            'GEM': 'from-pink-400 to-purple-500',
            'SWORD': 'from-gray-400 to-gray-600',
            'A': 'from-cyan-300 to-blue-400',
            'K': 'from-orange-300 to-red-400',
            'Q': 'from-pink-300 to-purple-400',
            'J': 'from-indigo-300 to-blue-400',
            'SCATTER': 'from-yellow-300 to-yellow-500',
        };
        return colors[symbol] || 'from-gray-400 to-gray-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#001a4d] to-[#0A1128] text-white flex flex-col">
            {/* Lightning Effect Overlay */}
            <AnimatePresence>
                {showLightning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 pointer-events-none"
                    >
                        <div className="absolute left-10 top-1/2 -translate-y-1/2">
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="text-9xl"
                            >
                                ⚡
                            </motion.div>
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 bg-gradient-to-b from-yellow-400 via-blue-400 to-transparent"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    top: '10%',
                                    height: '80%',
                                }}
                                initial={{ scaleY: 0, opacity: 0 }}
                                animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Free Spins Banner */}
            <AnimatePresence>
                {showFreeSpinsBanner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="text-9xl mb-6"
                            >
                                💠
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4"
                            >
                                FREE SPINS!
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl font-bold text-white"
                            >
                                {freeSpinsAwarded} Free Spins Awarded!
                            </motion.p>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8 text-2xl text-yellow-400"
                            >
                                ⚡ Persistent Multipliers Active! ⚡
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <nav className="w-full p-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-blue-600/30 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">⚡</span>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            MYTHIC LIGHTNING
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-black/40 px-4 py-1 rounded-full border border-blue-600/30 flex items-center gap-2">
                        <span className="text-blue-400 text-lg">💰</span>
                        <span className="text-blue-100 font-mono text-lg font-bold">${localBalance}</span>
                    </div>
                    <span className="text-gray-400 hidden sm:inline">@{user?.username}</span>
                    <button onClick={logout} className="px-4 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Game Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
                {/* Tumble Counter */}
                {tumbling && currentTumble > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-full font-bold text-xl"
                    >
                        🔄 Tumble #{currentTumble}
                    </motion.div>
                )}

                {/* 6x5 Grid */}
                <div className="relative p-6 bg-gradient-to-b from-blue-900/40 via-purple-900/40 to-black/60 rounded-3xl border-4 border-blue-500/50 shadow-[0_0_60px_rgba(59,130,246,0.4)]">
                    {/* Decorative corners */}
                    <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>

                    <div className="grid grid-cols-6 gap-2 bg-black/60 p-4 rounded-2xl">
                        {grid.map((row, rowIndex) => (
                            row.map((symbol, colIndex) => {
                                const isWinning = isWinningCell(rowIndex, colIndex);
                                return (
                                    <motion.div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${getSymbolColor(symbol)} rounded-xl flex items-center justify-center text-4xl md:text-5xl font-black relative overflow-hidden border-2 ${isWinning ? 'border-yellow-400' : 'border-white/20'}`}
                                        animate={isWinning ? {
                                            scale: [1, 1.1, 1],
                                            boxShadow: [
                                                '0 0 0px rgba(255,215,0,0)',
                                                '0 0 30px rgba(255,215,0,1)',
                                                '0 0 0px rgba(255,215,0,0)'
                                            ]
                                        } : {}}
                                        transition={{ duration: 0.5, repeat: isWinning ? Infinity : 0 }}
                                    >
                                        {symbolEmojis[symbol] || symbol}

                                        {/* Glow effect */}
                                        {!isWinning && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none"></div>
                                        )}
                                    </motion.div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Message & Win Display */}
                <div className="h-16 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                key={message}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`text-2xl md:text-3xl font-black px-8 py-3 rounded-full ${totalWin > 0
                                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                                    : 'bg-gray-800 text-gray-400'
                                    }`}
                            >
                                {message} {totalWin > 0 && `+$${totalWin.toFixed(2)}`}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="bg-black/60 p-6 rounded-2xl border border-blue-700/30 backdrop-blur-sm flex flex-col md:flex-row items-center gap-6 w-full max-w-3xl justify-between">
                    {/* Bet Controls */}
                    <div className="flex flex-col gap-2">
                        <label className="text-blue-400 text-xs uppercase tracking-wider font-bold">Bet Amount</label>
                        <div className="flex gap-2 flex-wrap">
                            {betOptions.map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => setBet(amount)}
                                    disabled={spinning}
                                    className={`w-14 h-10 rounded font-bold transition-all text-sm ${bet === amount
                                        ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.8)]'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        } ${localBalance < amount ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    {amount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Spin Buttons */}
                    <div className="flex flex-col gap-3">


                        <div className="flex gap-3">
                            {/* Regular Spin */}
                            <button
                                onClick={spin}
                                disabled={spinning || autoSpinning || localBalance < bet}
                                className={`px-12 py-4 text-2xl font-black italic uppercase rounded-xl shadow-lg transition-all transform ${spinning || autoSpinning || localBalance < bet
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-b from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]'
                                    }`}
                            >
                                {spinning ? 'SPINNING...' : 'SPIN'}
                            </button>

                            {/* Auto Spin Toggle */}
                            <button
                                onClick={toggleAutoSpin}
                                disabled={spinning && !autoSpinning}
                                className={`px-8 py-4 text-xl font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${autoSpinning
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                <span className="text-2xl">{autoSpinning ? '⏹️' : '🔄'}</span>
                                {autoSpinning ? 'STOP AUTO' : 'AUTO SPIN'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="text-center text-sm text-gray-500 max-w-2xl">
                    <p>⚡ Lightning multipliers spawn randomly • 💠 4+ Scatters trigger Free Spins • 🔄 Unlimited tumbles!</p>
                </div>
            </main>
        </div>
    );
};

export default MythicLightning;
