import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const [birdY, setBirdY] = useState(200);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gravity = 0.6;
  const jump = -10;
  const pipeGap = 150;

  // Jump
  useEffect(() => {
    const handleKey = () => {
      if (!gameOver) setVelocity(jump);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  // Game Loop
  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bird
      ctx.fillStyle = "yellow";
      ctx.fillRect(80, birdY, 30, 30);

      setVelocity(v => v + gravity);
      setBirdY(y => y + velocity);

      // Pipes
      let newPipes = pipes.map(p => ({ ...p, x: p.x - 2 }));

      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 200) {
        newPipes.push({
          x: 400,
          top: Math.random() * 250 + 50
        });
      }

      ctx.fillStyle = "green";
      newPipes.forEach(p => {
        ctx.fillRect(p.x, 0, 50, p.top);
        ctx.fillRect(p.x, p.top + pipeGap, 50, 600);
      });

      // Collision
      newPipes.forEach(p => {
        if (
          80 < p.x + 50 &&
          80 + 30 > p.x &&
          (birdY < p.top || birdY + 30 > p.top + pipeGap)
        ) {
          setGameOver(true);
        }
      });

      // Ground hit
      if (birdY > 570 || birdY < 0) setGameOver(true);

      setPipes(newPipes);
      setScore(s => s + 1);
    }, 20);

    return () => clearInterval(interval);
  }, [birdY, velocity, pipes, gameOver]);

  return (
    <div className="app">
      <canvas ref={canvasRef} width="400" height="600" />
      <h2>Score: {score}</h2>
      {gameOver && <h1>Game Over</h1>}
    </div>
  );
}

export default App;
