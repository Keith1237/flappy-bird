import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [birdY, setBirdY] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.6;
  const jump = -10;
  const pipeGap = 150;

  // Load assets
  const birdImg = new Image();
  birdImg.src = "/assets/bird.png";

  const bgImg = new Image();
  bgImg.src = "/assets/background.png";

  // Load pipe images
  const pipeTopImg = new Image();
  pipeTopImg.src = "/assets/pipe-green.png";

  const pipeBottomImg = new Image();
  pipeBottomImg.src = "/assets/pipe-red.png";

  const jumpSound = useRef(new Audio("/assets/jump.wav"));
  const hitSound = useRef(new Audio("/assets/hit.wav"));

  // Handle jump (keyboard & mobile)
  const handleJump = () => {
    if (!gameStarted) setGameStarted(true);
    if (!gameOver) {
      setVelocity(jump);
      jumpSound.current.play();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleJump);
    window.addEventListener("touchstart", handleJump);
    return () => {
      window.removeEventListener("keydown", handleJump);
      window.removeEventListener("touchstart", handleJump);
    };
  }, [gameOver, gameStarted]);

  // Restart game
  const handleRestart = () => {
    setBirdY(200);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  // Game Loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw bird
      ctx.drawImage(birdImg, 80, birdY, 40, 40);

      // Update bird
      setVelocity(v => v + gravity);
      setBirdY(y => y + velocity);

      // Pipes
      let newPipes = pipes.map(p => ({ ...p, x: p.x - 2 }));

      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 200) {
        newPipes.push({ x: 400, top: Math.random() * 250 + 50 });
      }

      // Draw pipes
      // ctx.fillStyle = "green";
      // newPipes.forEach(p => {
      //   ctx.fillRect(p.x, 0, 50, p.top);
      //   ctx.fillRect(p.x, p.top + pipeGap, 50, canvas.height);
      // });

      // Draw pipes with images
      newPipes.forEach(p => {
        // Top pipe (rotated)
        ctx.save();
        ctx.translate(p.x + 25, p.top / 2); // move pivot to center
        ctx.rotate(Math.PI); // flip 180 degrees
        ctx.drawImage(pipeTopImg, -25, -p.top / 2, 50, p.top);
        ctx.restore();

        // Bottom pipe
        ctx.drawImage(pipeBottomImg, p.x, p.top + pipeGap, 50, canvas.height - (p.top + pipeGap));
      });



      // Collision detection
      let collided = false;
      newPipes.forEach(p => {
        if (
          80 < p.x + 50 &&
          80 + 40 > p.x &&
          (birdY < p.top || birdY + 40 > p.top + pipeGap)
        ) {
          collided = true;
        }
      });

      if (birdY > 560 || birdY < 0) collided = true;

      if (collided) {
        setGameOver(true);
        hitSound.current.play();
        clearInterval(interval); // stop game loop immediately
      } else {
        setScore(s => s + 1);
        setPipes(newPipes);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [birdY, velocity, pipes, gameStarted, gameOver]);

  return (
    <div className="app">
      <canvas ref={canvasRef} width="400" height="600" />
      {!gameStarted && !gameOver && (
        <button className="start-btn" onClick={handleJump}>
          Start Game
        </button>
      )}
      {gameOver && (
        <>
          <h1>Game Over</h1>
          <h2>Your Score: {score}</h2>
          <button className="start-btn" onClick={handleRestart}>
            Restart Game
          </button>
        </>
      )}
      {gameStarted && !gameOver && <h2>Score: {score}</h2>}
    </div>
  );
}

export default App;
