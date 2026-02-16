import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
}

export function CountdownTimer({ initialMinutes = 25 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const totalTime = initialMinutes * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const reset = () => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-adhd-primary/10 to-adhd-secondary/10 rounded-3xl p-6 border border-adhd-primary/20"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-adhd-primary animate-pulse" />
        Focus Timer
      </h3>

      {/* Timer display */}
      <div className="text-center mb-6">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`text-5xl font-bold font-mono ${
            timeLeft <= 60 ? 'text-destructive' : 'text-adhd-primary'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="absolute h-full bg-gradient-adhd rounded-full progress-glow"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
            isRunning
              ? 'bg-muted text-foreground'
              : 'bg-gradient-adhd text-white shadow-glow-adhd'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
