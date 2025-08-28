
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- GAME CONSTANTS ---
const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 600;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X_POSITION = 80;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const TERMINAL_VELOCITY = 10;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const PIPE_SPAWN_DISTANCE = 250; // Pixels between pipe pairs

type GameState = 'start' | 'playing' | 'over';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [birdY, setBirdY] = useState(SCREEN_HEIGHT / 2 - BIRD_HEIGHT / 2);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState<{ x: number; topHeight: number; passed: boolean }[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    
    // Fix: Initialize useRef with null. `useRef` should be initialized with a value.
    const gameLoopRef = useRef<number | null>(null);

    // Load high score from localStorage on component mount
    useEffect(() => {
        const storedHighScore = localStorage.getItem('flappyBirdHighScore');
        if (storedHighScore) {
            setHighScore(parseInt(storedHighScore, 10));
        }
    }, []);

    const resetGame = useCallback(() => {
        setGameState('playing');
        setBirdY(SCREEN_HEIGHT / 2 - BIRD_HEIGHT / 2);
        setBirdVelocity(0);
        setPipes([]);
        setScore(0);
        // Initial flap to start the game
        setBirdVelocity(FLAP_STRENGTH);
    }, []);

    const flap = useCallback(() => {
        if (gameState === 'playing') {
            setBirdVelocity(FLAP_STRENGTH);
        } else if (gameState === 'start' || gameState === 'over') {
            resetGame();
        }
    }, [gameState, resetGame]);
    
    // Set up input handlers
    useEffect(() => {
        const handleInput = (e: Event) => {
            e.preventDefault();
            flap();
        };
        
        window.addEventListener('keydown', (e) => e.code === 'Space' && handleInput(e));
        window.addEventListener('mousedown', handleInput);
        window.addEventListener('touchstart', handleInput);

        return () => {
            window.removeEventListener('keydown', (e) => e.code === 'Space' && handleInput(e));
            window.removeEventListener('mousedown', handleInput);
            window.removeEventListener('touchstart', handleInput);
        };
    }, [flap]);

    // The main game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const loop = () => {
            // Bird Physics
            const newVelocity = Math.min(birdVelocity + GRAVITY, TERMINAL_VELOCITY);
            const newBirdY = Math.max(0, birdY + newVelocity);
            setBirdVelocity(newVelocity);
            setBirdY(newBirdY);

            // Pipe Logic
            let newPipes = pipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));

            const lastPipe = newPipes[newPipes.length - 1];
            if (!lastPipe || SCREEN_WIDTH - lastPipe.x >= PIPE_SPAWN_DISTANCE) {
                const topHeight = Math.random() * (SCREEN_HEIGHT - PIPE_GAP - 150) + 75;
                newPipes.push({ x: SCREEN_WIDTH, topHeight, passed: false });
            }

            newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);
            
            // Scoring
            let scoreUpdated = false;
            newPipes.forEach(pipe => {
                if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
                    pipe.passed = true;
                    scoreUpdated = true;
                }
            });
            if (scoreUpdated) setScore(s => s + 1);

            setPipes(newPipes);

            // Collision Detection
            const birdRect = { top: newBirdY, bottom: newBirdY + BIRD_HEIGHT, left: BIRD_X_POSITION, right: BIRD_X_POSITION + BIRD_WIDTH };
            
            if (birdRect.bottom >= SCREEN_HEIGHT) { // Ground collision
                setGameState('over');
                return;
            }

            for (const pipe of newPipes) { // Pipe collision
                const collides = (rect1: typeof birdRect, topPipeHeight: number) => {
                    const pipeTopRect = { top: 0, bottom: topPipeHeight, left: pipe.x, right: pipe.x + PIPE_WIDTH };
                    const pipeBottomRect = { top: topPipeHeight + PIPE_GAP, bottom: SCREEN_HEIGHT, left: pipe.x, right: pipe.x + PIPE_WIDTH };
                    return (rect1.right > pipeTopRect.left && rect1.left < pipeTopRect.right && rect1.bottom > pipeTopRect.top && rect1.top < pipeTopRect.bottom) ||
                           (rect1.right > pipeBottomRect.left && rect1.left < pipeBottomRect.right && rect1.bottom > pipeBottomRect.top && rect1.top < pipeBottomRect.bottom);
                };

                if (collides(birdRect, pipe.topHeight)) {
                    setGameState('over');
                    return;
                }
            }

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, birdY, birdVelocity, pipes]);

    // Handle game over state to update high score
    useEffect(() => {
        if (gameState === 'over' && score > highScore) {
            setHighScore(score);
            localStorage.setItem('flappyBirdHighScore', score.toString());
        }
    }, [gameState, score, highScore]);

    return (
        <div 
            className="relative overflow-hidden bg-cyan-400"
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, touchAction: 'none' }}
            aria-label="Flappy Bird Game Canvas"
        >
            {/* Game elements */}
            <Bird y={birdY} />
            {pipes.map((pipe, index) => (
                <Pipe key={index} x={pipe.x} topHeight={pipe.topHeight} />
            ))}
            <ScoreDisplay score={score} gameState={gameState} />

            {/* UI Overlays */}
            {gameState === 'start' && <StartScreen />}
            {gameState === 'over' && <GameOverScreen score={score} highScore={highScore} />}

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-10 bg-lime-600 border-t-4 border-lime-800" />
        </div>
    );
};

// --- Sub-components ---

const Bird: React.FC<{ y: number }> = React.memo(({ y }) => (
    <div
        className="absolute bg-yellow-400 rounded-full border-2 border-gray-800"
        style={{ top: y, left: BIRD_X_POSITION, width: BIRD_WIDTH, height: BIRD_HEIGHT }}
        aria-label="Player Bird"
    />
));

const Pipe: React.FC<{ x: number; topHeight: number }> = React.memo(({ x, topHeight }) => (
    <>
        <div aria-hidden="true" className="absolute bg-green-600 border-2 border-gray-800" style={{ left: x, top: 0, width: PIPE_WIDTH, height: topHeight }} />
        <div aria-hidden="true" className="absolute bg-green-600 border-2 border-gray-800" style={{ left: x, top: topHeight + PIPE_GAP, width: PIPE_WIDTH, height: SCREEN_HEIGHT - topHeight - PIPE_GAP }} />
    </>
));

const ScoreDisplay: React.FC<{ score: number; gameState: GameState }> = ({ score, gameState }) => (
    <div className={`absolute top-12 left-1/2 -translate-x-1/2 text-6xl font-bold text-white transition-opacity duration-300 ${gameState === 'playing' ? 'opacity-100' : 'opacity-0'}`} style={{ textShadow: '3px 3px 6px #000000' }}>
        {score}
    </div>
);

const StartScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center w-full h-full text-white text-center z-10" aria-label="Start Screen">
        <h1 className="text-6xl font-extrabold mb-4" style={{ textShadow: '3px 3px 6px #000' }}>Flappy Bird</h1>
        <p className="text-xl font-semibold animate-pulse">Press SPACE or Tap to Start</p>
    </div>
);

const GameOverScreen: React.FC<{ score: number; highScore: number }> = ({ score, highScore }) => {
    const getMedal = () => {
        if (score >= 40) return '🥇 Platinum';
        if (score >= 30) return '🏆 Gold';
        if (score >= 20) return '🥈 Silver';
        if (score >= 10) return '🥉 Bronze';
        return null;
    };
    const medal = getMedal();

    return (
        <div className="flex items-center justify-center w-full h-full z-10" aria-label="Game Over Screen">
            <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg text-white text-center shadow-2xl w-4/5">
                <h2 className="text-4xl font-bold mb-4">Game Over</h2>
                <div className="text-2xl mb-2">Score: <span className="font-bold">{score}</span></div>
                <div className="text-xl mb-4">High Score: <span className="font-bold">{highScore}</span></div>
                {medal && <div className="text-2xl mb-6">Medal: <span className="font-bold">{medal}</span></div>}
                <p className="text-md mt-4 animate-pulse">Tap or Press SPACE to Restart</p>
            </div>
        </div>
    );
};

export default App;
