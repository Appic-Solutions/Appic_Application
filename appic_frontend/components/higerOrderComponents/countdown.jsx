import React, { useState, useEffect } from 'react';

const Countdown = ({ onCountdownComplete }) => {
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (timeLeft === 0) {
      onCountdownComplete();
      setTimeLeft(20);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onCountdownComplete]);

  const circumference = 2 * Math.PI * 13.5;
  const circleStyle = {
    strokeDasharray: circumference,
    strokeDashoffset: `${(circumference * (20 - timeLeft)) / 20}`,
  };

  return (
    <div className="countdown-container">
      <svg className="countdown-svg" width="30" height="30">
        <circle className="countdown-circle2" cx="15" cy="15" r="13.5" />
        <circle className="countdown-circle" cx="15" cy="15" r="13.5" style={circleStyle} />

        <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="countdown-text">
          {timeLeft}
        </text>
      </svg>
    </div>
  );
};
export default Countdown;

