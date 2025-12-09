import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../AuthContext';
import { getHistory, playSlot } from '../api';

const symbols = ['WILD', '777', 'GEM_RED', 'GEM_GREEN', 'GEM_BLUE', 'A', 'K', 'Q', 'J'];
const betOptions = [10, 25, 50, 100, 250, 500, 1000];

// Wheel Component
const FortuneWheel = ({ onComplete, multiplier }) => {
    const [rotation, setRotation] = useState(0);
    const prizes = [1000, 50, 200, 100, 500, 20, 2000, 10];

    useEffect(() => {
        const randomSpins = 5 + Math.random() * 3;
        const prizeAngle = 360 * randomSpins;
        setRotation(prizeAngle);
        setTimeout(() => {
            onComplete();
        }, 5000);
    }, []);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50"
        >
            {/* Sparkle Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="relative">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 w-[550px] h-[550px] -translate-x-[25px] -translate-y-[25px] rounded-full bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 blur-2xl animate-pulse"></div>

                {/* Wheel Container */}
                <motion.div
                    className="relative w-[500px] h-[500px] rounded-full overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5, ease: "circOut" }}
                    style={{
                        transformOrigin: 'center center',
                        boxShadow: '0 0 60px rgba(255, 215, 0, 0.6), inset 0 0 40px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Wheel Border */}
                    <div className="absolute inset-0 rounded-full border-[12px] border-transparent bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-border"></div>

                    {/* Inner Border */}
                    <div className="absolute inset-[12px] rounded-full border-4 border-yellow-200/50"></div>

                    {/* Segments */}
                    {prizes.map((prize, i) => {
                        const angle = (360 / prizes.length) * i;
                        const nextAngle = (360 / prizes.length) * (i + 1);
                        const isEven = i % 2 === 0;

                        return (
                            <div
                                key={i}
                                className="absolute inset-0"
                                style={{
                                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((nextAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((nextAngle - 90) * Math.PI / 180)}%)`,
                                    background: isEven
                                        ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                                        : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                                }}
                            >
                                {/* Segment Shine */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>

                                {/* Prize Amount */}
                                <div
                                    className="absolute text-center"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: `translate(-50%, -50%) rotate(${angle + 22.5}deg) translateY(-120px)`,
                                        transformOrigin: 'center center',
                                    }}
                                >
                                    <div className="relative inline-block">
                                        <div className="text-5xl font-black text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-wider"
                                            style={{
                                                textShadow: '0 0 10px rgba(255,215,0,0.5), 2px 2px 4px rgba(0,0,0,0.8)',
                                                WebkitTextStroke: '1.5px rgba(0,0,0,0.4)'
                                            }}>
                                            {prize}
                                        </div>
                                        <div className="text-xl font-bold text-yellow-200 -mt-2"
                                            style={{
                                                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                            }}>
                                            x
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Center Hub */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 border-4 border-white shadow-2xl flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <span className="text-black font-black text-sm tracking-wider drop-shadow-lg">SPIN</span>
                        </div>
                    </div>
                </motion.div>

                {/* Pointer */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                        <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[48px] border-t-yellow-400"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                            }}></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-300"></div>
                    </div>
                </div>
            </div>

            {/* Win Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 5.2, type: "spring" }}
                className="absolute bottom-16 text-center"
            >
                <motion.div
                    className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    🎉 FORTUNE WHEEL 🎉
                </motion.div>
                <motion.div
                    className="text-7xl font-black"
                    animate={{
                        textShadow: [
                            '0 0 20px rgba(255,215,0,0.8)',
                            '0 0 40px rgba(255,215,0,1)',
                            '0 0 20px rgba(255,215,0,0.8)'
                        ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        color: '#ffd700',
                        WebkitTextStroke: '2px #ff8800'
                    }}
                >
                    ${multiplier}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

const Game = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [grid, setGrid] = useState([
        ['❓', '❓', '❓'],
        ['❓', '❓', '❓'],
        ['❓', '❓', '❓']
    ]);
    const [specialReel, setSpecialReel] = useState('❓');
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('');
    const [localBalance, setLocalBalance] = useState(user?.balance || 0);
    const [history, setHistory] = useState([]);
    const [bet, setBet] = useState(10);
    const [showWheel, setShowWheel] = useState(false);
    const [pendingWin, setPendingWin] = useState(null);

    useEffect(() => {
        if (user) setLocalBalance(user.balance);
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await getHistory();
            setHistory(res.data.reverse().slice(0, 5));
        } catch (err) {
            console.error("failed to fetch history");
        }
    }

    const spin = async () => {
        if (spinning) return;
        if (localBalance < bet) {
            setMessage('Insufficient balance!');
            return;
        }
        setSpinning(true);
        setMessage('');
        setShowWheel(false);
        setPendingWin(null);

        // Visual Spin Effect
        let interval = setInterval(() => {
            setGrid(prev => prev.map(row => row.map(() => symbols[Math.floor(Math.random() * symbols.length)])));
            setSpecialReel(['1x', '2x', '3x', '5x', 'WHEEL'][Math.floor(Math.random() * 5)]);
        }, 100);

        try {
            const res = await playSlot({ bet });

            // Artificial delay for suspense
            setTimeout(() => {
                clearInterval(interval);
                const data = res.data;
                setGrid(data.grid);
                setSpecialReel(data.special_symbol);

                // Handle Win/Loss Message immediately or after bonus
                const baseMsg = data.check_win ? `Line Win: $${data.base_win}` : 'No Line Win';

                if (data.is_fortune_spin) {
                    setMessage(`${baseMsg} -> FORTUNE SPIN TRIGGERED!`);
                    // Stop spinning animation first, then delay to show grid result
                    setTimeout(() => {
                        setSpinning(false);
                    }, 300);
                    // Then trigger wheel
                    setTimeout(() => {
                        setPendingWin(data);
                        setShowWheel(true);
                    }, 1000);
                } else {
                    // Add small delay to let animation finish cleanly
                    setTimeout(() => {
                        setSpinning(false);
                        displayResult(data);
                    }, 300);
                }
            }, 2000);

        } catch (err) {
            clearInterval(interval);
            setSpinning(false);
            if (err.response?.data?.error) {
                setMessage(err.response.data.error);
            } else {
                setMessage('Error occurred');
            }
        }
    };

    const displayResult = (data) => {
        const totalWin = data.final_win;
        if (totalWin > 0) {
            setMessage(`🎉 BIG WIN! +$${totalWin} (Mult: ${data.multiplier}x)`);
        } else {
            setMessage(`😢 Try Again!`);
        }
        setLocalBalance(data.current_balance);
        fetchHistory();
    };

    const handleWheelComplete = () => {
        setShowWheel(false);
        if (pendingWin) {
            displayResult(pendingWin);
        }
        setSpinning(false);
    };

    return (
        <div className="min-h-screen bg-[#1a0b2e] text-white flex flex-col items-center font-sans overflow-x-hidden">
            <AnimatePresence>
                {showWheel && <FortuneWheel onComplete={handleWheelComplete} multiplier={pendingWin?.bonus_win} />}
            </AnimatePresence>

            <nav className="w-full p-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-yellow-600/30 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎰</span>
                        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">FORTUNE GEMS SIM</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-black/40 px-4 py-1 rounded-full border border-yellow-600/30 flex items-center gap-2">
                        <span className="text-yellow-500 text-lg">💰</span>
                        <span className="text-yellow-100 font-mono text-lg font-bold">${localBalance}</span>
                    </div>
                    <span className="text-gray-400 hidden sm:inline">@{user?.username}</span>
                    <button onClick={logout} className="px-4 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">Logout</button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl p-4 gap-8">

                {/* Game Area Container */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center relative">

                    {/* Main Reel (3x3) */}
                    <div className="relative p-8 bg-gradient-to-b from-amber-900 via-amber-950 to-black rounded-2xl border-8 border-yellow-500 shadow-[0_0_50px_rgba(255,215,0,0.4),inset_0_0_30px_rgba(0,0,0,0.8)]">
                        {/* Decorative corners */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-300 rounded-tl-lg"></div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-300 rounded-tr-lg"></div>
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-300 rounded-bl-lg"></div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-300 rounded-br-lg"></div>

                        {/* Inner glow */}
                        <div className="absolute inset-4 border-2 border-yellow-400/30 rounded-xl pointer-events-none"></div>

                        <div className="grid grid-cols-3 gap-3 bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 rounded-xl border-2 border-yellow-600/50 shadow-inner">
                            {grid.map((row, rI) => (
                                row.map((symbol, cI) => {
                                    // Symbol styling configuration
                                    const getSymbolConfig = (sym) => {
                                        switch (sym) {
                                            case 'WILD':
                                                return {
                                                    image: '/assets/symbols/wild_symbol.png',
                                                    glow: 'rgba(168, 85, 247, 0.9)',
                                                    border: 'border-purple-500/70',
                                                    bg: 'from-purple-900/60 to-pink-900/60'
                                                };
                                            case '777':
                                                return {
                                                    image: '/assets/symbols/golden_777.png',
                                                    glow: 'rgba(255, 215, 0, 1)',
                                                    border: 'border-yellow-500/70',
                                                    bg: 'from-yellow-900/60 to-orange-900/60'
                                                };
                                            case 'GEM_RED':
                                                return {
                                                    image: '/assets/symbols/red_gem.png',
                                                    glow: 'rgba(239, 68, 68, 0.9)',
                                                    border: 'border-red-500/70',
                                                    bg: 'from-red-900/60 to-red-950/60'
                                                };
                                            case 'GEM_GREEN':
                                                return {
                                                    image: '/assets/symbols/green_gem.png',
                                                    glow: 'rgba(34, 197, 94, 0.9)',
                                                    border: 'border-green-500/70',
                                                    bg: 'from-green-900/60 to-green-950/60'
                                                };
                                            case 'GEM_BLUE':
                                                return {
                                                    image: '/assets/symbols/blue_gem.png',
                                                    glow: 'rgba(59, 130, 246, 0.9)',
                                                    border: 'border-blue-500/70',
                                                    bg: 'from-blue-900/60 to-blue-950/60'
                                                };
                                            case 'A':
                                                return {
                                                    text: 'A',
                                                    gradient: 'from-cyan-300 via-cyan-400 to-cyan-500',
                                                    glow: 'rgba(34, 211, 238, 0.8)',
                                                    border: 'border-cyan-500/50',
                                                    bg: 'from-cyan-900/30 to-cyan-950/30'
                                                };
                                            case 'K':
                                                return {
                                                    text: 'K',
                                                    gradient: 'from-orange-300 via-orange-400 to-orange-500',
                                                    glow: 'rgba(251, 146, 60, 0.8)',
                                                    border: 'border-orange-500/50',
                                                    bg: 'from-orange-900/30 to-orange-950/30'
                                                };
                                            case 'Q':
                                                return {
                                                    text: 'Q',
                                                    gradient: 'from-pink-300 via-pink-400 to-pink-500',
                                                    glow: 'rgba(236, 72, 153, 0.8)',
                                                    border: 'border-pink-500/50',
                                                    bg: 'from-pink-900/30 to-pink-950/30'
                                                };
                                            case 'J':
                                                return {
                                                    text: 'J',
                                                    gradient: 'from-indigo-300 via-indigo-400 to-indigo-500',
                                                    glow: 'rgba(99, 102, 241, 0.8)',
                                                    border: 'border-indigo-500/50',
                                                    bg: 'from-indigo-900/30 to-indigo-950/30'
                                                };
                                            default:
                                                return {
                                                    text: sym,
                                                    gradient: 'from-gray-300 to-gray-400',
                                                    glow: 'rgba(156, 163, 175, 0.5)',
                                                    border: 'border-gray-500/50',
                                                    bg: 'from-gray-800/30 to-gray-900/30'
                                                };
                                        }
                                    };

                                    const config = getSymbolConfig(symbol);

                                    return (
                                        <motion.div
                                            key={`${rI}-${cI}`}
                                            className={`w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br ${config.bg} border-2 ${config.border} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group`}
                                            animate={spinning ? {
                                                y: [0, -20, 0],
                                                filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
                                                scale: [1, 0.95, 1]
                                            } : {
                                                y: 0,
                                                filter: "blur(0px)",
                                                scale: 1
                                            }}
                                            transition={{ repeat: spinning ? Infinity : 0, duration: 0.15, delay: cI * 0.05 + rI * 0.05 }}
                                            style={{
                                                boxShadow: spinning ? 'none' : `0 0 30px ${config.glow}, inset 0 0 30px rgba(0,0,0,0.6)`
                                            }}
                                        >
                                            {/* Gem Image or Text Symbol */}
                                            {config.image ? (
                                                <img
                                                    src={config.image}
                                                    alt={symbol}
                                                    className="w-full h-full object-contain z-10 relative p-2"
                                                    style={{
                                                        filter: `drop-shadow(0 0 15px ${config.glow})`,
                                                        imageRendering: '-webkit-optimize-contrast',
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    className={`text-6xl font-black bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent drop-shadow-2xl z-10 relative select-none`}
                                                    style={{
                                                        textShadow: `0 0 20px ${config.glow}, 0 4px 8px rgba(0,0,0,0.9)`,
                                                        WebkitTextStroke: '2px rgba(0,0,0,0.4)',
                                                        filter: 'drop-shadow(0 0 15px currentColor)'
                                                    }}
                                                >
                                                    {config.text}
                                                </span>
                                            )}

                                            {/* Animated Sparkle Effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full"
                                                animate={{
                                                    x: ['-100%', '200%']
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    repeatDelay: 2,
                                                    ease: "easeInOut"
                                                }}
                                            />

                                            {/* Inner glow */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/20 pointer-events-none rounded-xl"></div>
                                        </motion.div>
                                    );
                                })
                            ))}
                        </div>

                        {/* Frame Decorations */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-900 via-yellow-600 to-amber-900 px-6 py-2 rounded-lg border-2 border-yellow-400 text-yellow-100 text-sm font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                            WIN LINES: 5
                        </div>
                    </div>

                    {/* Special Multiplier Reel */}
                    <div className="relative flex flex-col items-center gap-3">
                        <div className="text-yellow-400 font-black mb-1 tracking-widest text-base uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">
                            MULTIPLIER
                        </div>
                        <div className="relative p-2 bg-gradient-to-b from-red-900 via-red-950 to-black rounded-2xl border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                            {/* Decorative LED lights */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                ))}
                            </div>

                            <motion.div
                                className="w-28 h-80 md:h-[380px] bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-xl flex items-center justify-center text-6xl font-black overflow-hidden relative border-2 border-red-600/50"
                            >
                                <motion.div
                                    key={specialReel}
                                    animate={spinning ? { y: [-60, 60] } : { y: 0 }}
                                    transition={{ repeat: spinning ? Infinity : 0, duration: 0.08, ease: "linear" }}
                                    className="flex items-center justify-center w-full h-full"
                                >
                                    {specialReel === 'WHEEL' ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 animate-pulse"
                                                style={{
                                                    textShadow: '0 0 20px rgba(255,215,0,0.8)',
                                                    WebkitTextStroke: '2px rgba(255,140,0,0.5)'
                                                }}>
                                                ⭐
                                            </div>
                                            <div className="text-sm font-bold text-yellow-300 tracking-wider">BONUS</div>
                                        </div>
                                    ) : (
                                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500"
                                            style={{
                                                textShadow: '0 0 30px rgba(255,215,0,0.9)',
                                                WebkitTextStroke: '2px rgba(0,0,0,0.5)',
                                                filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))'
                                            }}>
                                            {specialReel}
                                        </span>
                                    )}
                                </motion.div>

                                {/* Highlight Center Window */}
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-28 border-y-4 border-yellow-400 bg-yellow-400/5 pointer-events-none shadow-[inset_0_0_30px_rgba(255,215,0,0.3)]"></div>

                                {/* Side glow strips */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Message & Controls */}
                <div className="flex flex-col items-center w-full gap-4 z-20">
                    <div className="h-10 flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                            {message && (
                                <motion.div
                                    key={message}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`text-xl md:text-2xl font-bold px-6 py-2 rounded-full border ${message.includes('WIN') ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-black/60 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col md:flex-row items-center gap-6 w-full max-w-3xl justify-between shadow-2xl">
                        {/* Bet Controls */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-xs uppercase tracking-wider font-bold">Bet Amount</label>
                            <div className="flex gap-2 flex-wrap">
                                {betOptions.map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setBet(amount)}
                                        disabled={spinning}
                                        className={`w-12 h-10 rounded font-bold transition-all text-sm ${bet === amount
                                            ? 'bg-yellow-500 text-black shadow-[0_0_10px_#ffd700]'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            } ${localBalance < amount ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Spin Button */}
                        <button
                            onClick={spin}
                            disabled={spinning || localBalance < bet}
                            className={`w-full md:w-auto px-10 py-4 text-2xl font-black italic uppercase rounded-xl shadow-lg transition-all transform ${spinning || localBalance < bet
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed grayscale'
                                : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_#ffd700]'
                                }`}
                        >
                            {spinning ? 'Running...' : 'SPIN'}
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="w-full max-w-md mt-4">
                    <details className="bg-black/40 rounded-lg border border-gray-800 open:bg-black/80 transition-all">
                        <summary className="p-3 text-gray-400 text-sm font-bold cursor-pointer hover:text-white select-none">Show History</summary>
                        <ul className="p-3 space-y-2 text-sm border-t border-gray-800">
                            {history.map(log => (
                                <li key={log.ID} className="flex justify-between items-center py-1 border-b border-gray-800/50 last:border-0">
                                    <span className={log.balance_change > 0 ? 'text-green-400 font-bold' : 'text-red-400'}>
                                        {log.balance_change > 0 ? 'WIN' : 'BET'}
                                    </span>
                                    <span className={`font-mono ${log.balance_change > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                                        {log.balance_change > 0 ? '+' : ''}{log.balance_change}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>
            </main>
        </div>
    );
};

export default Game;
