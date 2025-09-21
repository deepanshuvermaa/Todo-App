import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlipClock = ({ currentTime }) => {
  const [time, setTime] = useState(currentTime);
  const [prevTime, setPrevTime] = useState(currentTime);

  useEffect(() => {
    setPrevTime(time);
    setTime(currentTime);
  }, [currentTime]);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(time);
  const prevFormatted = formatTime(prevTime);

  const FlipCard = ({ current, previous, unit }) => {
    return (
      <div className="flip-card-container">
        <div className="flip-card">
          {/* Current number */}
          <div className="flip-card-front">
            <div className="flip-card-number">{current}</div>
          </div>

          {/* Animation when number changes */}
          <AnimatePresence>
            {current !== previous && (
              <motion.div
                key={current}
                initial={{ rotateX: 90 }}
                animate={{ rotateX: 0 }}
                exit={{ rotateX: -90 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flip-card-back"
              >
                <div className="flip-card-number">{current}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flip-card-label">{unit}</div>
      </div>
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flip-clock-container">
      <style jsx>{`
        .flip-clock-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          background: #1a1a1a;
          border-radius: 1rem;
          margin: 1rem 0;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .flip-clock-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          z-index: 0;
        }

        .flip-clock-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .flip-clock-date {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .flip-clock-time {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .flip-card-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .flip-card {
          position: relative;
          width: 80px;
          height: 100px;
          perspective: 1000px;
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .flip-card-back {
          transform-origin: bottom;
        }

        .flip-card-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
          font-family: 'Courier New', monospace;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .flip-card-label {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }

        .time-separator {
          font-size: 3rem;
          font-weight: bold;
          margin: 0 0.5rem;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .flip-clock-ampm {
          font-size: 1.5rem;
          margin-left: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .timezone {
          font-size: 0.875rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .flip-clock-time {
            gap: 0.5rem;
          }

          .flip-card {
            width: 60px;
            height: 80px;
          }

          .flip-card-number {
            font-size: 2rem;
          }

          .time-separator {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="flip-clock-content">
        <div className="flip-clock-date">
          {formatDate(time)}
        </div>

        <div className="flip-clock-time">
          <FlipCard
            current={hours}
            previous={prevFormatted.hours}
            unit="HOURS"
          />

          <div className="time-separator">:</div>

          <FlipCard
            current={minutes}
            previous={prevFormatted.minutes}
            unit="MINUTES"
          />

          <div className="time-separator">:</div>

          <FlipCard
            current={seconds}
            previous={prevFormatted.seconds}
            unit="SECONDS"
          />

          <div className="flip-clock-ampm">
            <span>{time.getHours() >= 12 ? 'PM' : 'AM'}</span>
          </div>
        </div>

        <div className="timezone">
          {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </div>
      </div>
    </div>
  );
};

export default FlipClock;