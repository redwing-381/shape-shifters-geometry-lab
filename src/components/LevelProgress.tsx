
import React from 'react';
import { motion } from 'framer-motion';

interface LevelProgressProps {
  currentXP: number;
  xpToNextLevel: number;
  level: number;
}

const LevelProgress = ({ currentXP, xpToNextLevel, level }: LevelProgressProps) => {
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Level {level} Progress</span>
        <span className="text-sm text-gray-500">{currentXP}/{xpToNextLevel} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default LevelProgress;
