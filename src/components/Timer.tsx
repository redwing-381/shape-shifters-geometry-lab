
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Clock } from 'lucide-react';

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

  const getTimeColor = () => {
    if (time < 30) return 'text-green-600';
    if (time < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeMessage = () => {
    if (time < 10) return '⚡ Lightning fast!';
    if (time < 30) return '🏃 Great speed!';
    if (time < 60) return '🚶 Steady pace';
    return '🐌 Take your time';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          <span className="font-semibold text-gray-700">Challenge Timer</span>
        </div>
        {isActive && (
          <motion.div
            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Active
          </motion.div>
        )}
      </div>
      
      <div className="text-center">
        <motion.div 
          className={`text-4xl font-bold mb-2 ${getTimeColor()}`}
          animate={{ 
            scale: isRunning ? [1, 1.05, 1] : 1,
            textShadow: isRunning ? ["0 0 0px rgba(59,130,246,0)", "0 0 10px rgba(59,130,246,0.5)", "0 0 0px rgba(59,130,246,0)"] : "none"
          }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
        >
          {formatTime(time)}
        </motion.div>
        
        {time > 0 && (
          <motion.div 
            className="text-sm text-gray-600 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {getTimeMessage()}
          </motion.div>
        )}
        
        <div className="flex space-x-2 justify-center">
          <motion.button
            onClick={toggleTimer}
            className={`p-3 rounded-lg transition-all flex items-center ${
              isRunning 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            onClick={resetTimer}
            className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Time milestones */}
        {time > 0 && (
          <div className="mt-4 flex justify-between text-xs text-gray-400">
            <span className={time >= 10 ? 'text-yellow-500' : ''}>10s</span>
            <span className={time >= 30 ? 'text-orange-500' : ''}>30s</span>
            <span className={time >= 60 ? 'text-red-500' : ''}>60s</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Timer;
