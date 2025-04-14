import React, { forwardRef } from 'react';
import styles from './Paddle.module.css'; // adjust if you're not using CSS modules

const Paddle = forwardRef(({ side, position }, ref) => {
  return (
    <div
      ref={ref}
      style={{ top: `${position}px` }}
      className={`${styles.paddle} ${side === 'left' ? styles.left : styles.right}`}
    ></div>
  );
});

export default Paddle;
