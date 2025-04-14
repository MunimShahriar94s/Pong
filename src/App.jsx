import { useState, useEffect, useRef } from 'react';
import './App.css';
import Line from './Components/Line/Line';
import Paddle from './Components/Paddle/Paddle';
import Ball from './Components/Ball/Ball';

function App() {
  // Constants
  const GAME_WIDTH = window.innerWidth * 0.6;
  const GAME_HEIGHT = window.innerWidth * 0.45;

  // Score
  const [countLeft, setCountLeft] = useState(0);
  const [countRight, setCountRight] = useState(0);

  // Dimensions
  const paddleHeight = window.innerWidth * 0.1; // Paddle height relative to game height
  const paddleWidth = window.innerWidth * 0.75;   // Paddle width relative to game width (optional)
  const ballSize = GAME_WIDTH * 0.03;      // Ball size relative to game width

  // Paddle positions
  const [PositionLeft, setPositionLeft] = useState(GAME_HEIGHT * 0.4);
  const [PositionRight, setPositionRight] = useState(GAME_HEIGHT * 0.4);

  const [VelocityLeft] = useState(window.innerWidth * 0.01);
  const [VelocityRight] = useState(window.innerWidth * 0.01);

  const paddleLeftRef = useRef(PositionLeft);
  const paddleRightRef = useRef(PositionRight);

  // Ball
  const [BallLeft, setBallLeft] = useState(GAME_WIDTH * 0.4);
  const [BallTop, setBallTop] = useState(GAME_HEIGHT * 0.4);
  const ballLeftRef = useRef(BallLeft);
  const ballTopRef = useRef(BallTop);

  const [BallVelocityX, setBallVelocityX] = useState(GAME_WIDTH * 0.015);
  const [BallVelocityY, setBallVelocityY] = useState(0);

  // Input
  const keysPressed = useRef({});

  const TopLeftBtn = useRef()
  const TopRightBtn = useRef()
  const BottomLeftBtn = useRef()
  const BottomRightBtn = useRef()

  useEffect(() => {
    const handleKeyDown = (e) => (keysPressed.current[e.key] = true);
    const handleKeyUp = (e) => (keysPressed.current[e.key] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    paddleLeftRef.current = PositionLeft;
  }, [PositionLeft]);
  useEffect(() => {
    paddleRightRef.current = PositionRight;
  }, [PositionRight]);



  // Paddle Movement
  useEffect(() => {
    let animationFrameId;

    const loop = () => {
      if (keysPressed.current['w']) {
        setPositionLeft(prev => Math.max(0, prev - VelocityLeft));
      }
      if (keysPressed.current['s']) {
        setPositionLeft(prev => Math.min(GAME_HEIGHT - paddleHeight, prev + VelocityLeft));
      }
      if (keysPressed.current['ArrowUp']) {
        setPositionRight(prev => Math.max(0, prev - VelocityRight));
      }
      if (keysPressed.current['ArrowDown']) {
        setPositionRight(prev => Math.min(GAME_HEIGHT - paddleHeight, prev + VelocityRight));
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  

  // Helper to get velocity toward a paddle
  function getVelocityTowardsTarget(fromX, fromY, toX, toY, speed) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return {
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
    };
  }

  // Reset Ball
  const resetBall = () => {
    const randomY = (Math.random() * 0.4 + 0.3) * GAME_HEIGHT;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const paddleCenterY = direction === -1
      ? paddleLeftRef.current + paddleHeight / 2
      : paddleRightRef.current + paddleHeight / 2;

    const { vx, vy } = getVelocityTowardsTarget(
      GAME_WIDTH / 2,
      randomY,
      direction === -1 ? 0 : GAME_WIDTH,
      paddleCenterY,
      GAME_WIDTH * 0.015
    );

    ballLeftRef.current = GAME_WIDTH / 2;
    ballTopRef.current = randomY;
    setBallLeft(ballLeftRef.current);
    setBallTop(ballTopRef.current);
    setBallVelocityX(vx);
    setBallVelocityY(vy);
  };

  // Ball Movement (time-based)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const moveBall = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const nextBallLeft = ballLeftRef.current + BallVelocityX * delta * 60;
      const nextBallTop = ballTopRef.current + BallVelocityY * delta * 60;

      const paddleWidth = window.innerWidth * 0.007;
      const ballCenterY = nextBallTop + ballSize / 2;
      const ballRightEdge = nextBallLeft + ballSize;

      const paddleLeftTop = paddleLeftRef.current;
      const paddleLeftBottom = paddleLeftTop + paddleHeight;
      const paddleLeftCenter = (paddleLeftTop + paddleLeftBottom) / 2;

      const paddleRightTop = paddleRightRef.current;
      const paddleRightBottom = paddleRightTop + paddleHeight;
      const paddleRightCenter = (paddleRightTop + paddleRightBottom) / 2;

      // 🧱 Wall Bounce
      if (nextBallTop <= 0) {
        ballTopRef.current = 0;
        setBallTop(0);
        setBallVelocityY(prev => Math.abs(prev));
      }

      if (nextBallTop + ballSize >= GAME_HEIGHT) {
        const clamped = GAME_HEIGHT - ballSize;
        ballTopRef.current = clamped;
        setBallTop(clamped);
        setBallVelocityY(prev => -Math.abs(prev));
      }

      // 🥊 Left paddle collision
      if (
        nextBallLeft <= paddleWidth * 1.3 &&
        ballCenterY > paddleLeftTop &&
        ballCenterY < paddleLeftBottom
      ) {
        const offset = (ballCenterY - paddleLeftCenter) / (paddleHeight / 2);
        const newVy = Math.max(-5, Math.min(5, offset * 5));

        setBallVelocityX(prev => Math.abs(prev)); // force right
        setBallVelocityY(newVy);
        
        ballLeftRef.current = paddleWidth + 2; // push away from paddle
      }

      // 🥊 Right paddle collision
      if (
        ballRightEdge >= GAME_WIDTH - paddleWidth * 1.3 &&
        ballCenterY > paddleRightTop &&
        ballCenterY < paddleRightBottom
      ) {
        const offset = (ballCenterY - paddleRightCenter) / (paddleHeight / 2);
        const newVy = Math.max(-5, Math.min(5, offset * 5));
        setBallVelocityX(prev => -Math.abs(prev));
        setBallVelocityY(newVy);
        
        ballLeftRef.current = GAME_WIDTH - paddleWidth - ballSize - 1;
      }

      // ❌ Missed left
      if (nextBallLeft <= 0) {
        setCountRight(prev => prev + 1);
        resetBall();
        return;
      }

      // ❌ Missed right
      if (ballRightEdge >= GAME_WIDTH) {
        setCountLeft(prev => prev + 1);
        resetBall();
        return;
      }

      // ✅ Move Ball
      ballLeftRef.current = nextBallLeft;
      ballTopRef.current = nextBallTop;
      setBallLeft(nextBallLeft);
      setBallTop(nextBallTop);

      animationFrameId = requestAnimationFrame(moveBall);
    };

    animationFrameId = requestAnimationFrame(moveBall);
    return () => cancelAnimationFrame(animationFrameId);
  }, [BallVelocityX, BallVelocityY]);


  return (
    <div className='canvas' style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
      <Line />
      <div className='counter counter-left'>{countLeft}</div>
      <div className='counter counter-right'>{countRight}</div>
      <Paddle side="left" position={PositionLeft} height={paddleHeight} />
      <Paddle side="right" position={PositionRight} height={paddleHeight} />
      <Ball left={`${BallLeft}px`} top={`${BallTop}px`} size={ballSize} />
    </div>
  );
}

export default App;
