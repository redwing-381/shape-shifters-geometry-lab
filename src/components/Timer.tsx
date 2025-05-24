
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer as TimerIcon, Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  isActive: boolean;
  onTimeUpdate: (time: number) => void;
}

const Timer = ({ isActive, onTimeUpdate }: TimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && isActive) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isActive, onTimeUpdate]);

  useEffect(() => {
    if (isActive) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
    onTimeUpdate(0);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <TimerIcon className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-semibold text-gray-700">Challenge Timer</span>
        </div>
      </div>
      
      <div className="text-center">
        <motion.div 
          className="text-3xl font-bold text-gray-800 mb-3"
          animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
        >
          {formatTime(time)}
        </motion.div>
        
        <div className="flex space-x-2 justify-center">
          <button
            onClick={toggleTimer}
            className={`p-2 rounded-lg transition-all ${
              isRunning 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Timer;
