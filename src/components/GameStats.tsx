
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap } from 'lucide-react';

interface GameStatsProps {
  score: number;
  level: number;
  achievements: string[];
  streak: number;
}

const GameStats = ({ score, level, achievements, streak }: GameStatsProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white shadow-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="w-5 h-5 text-yellow-300 mr-1" />
            <span className="text-sm font-medium">Score</span>
          </div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5 text-yellow-300 mr-1" />
            <span className="text-sm font-medium">Level</span>
          </div>
          <div className="text-2xl font-bold">{level}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-5 h-5 text-orange-300 mr-1" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-xl font-bold">{streak}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-5 h-5 text-green-300 mr-1" />
            <span className="text-sm font-medium">Badges</span>
          </div>
          <div className="text-xl font-bold">{achievements.length}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameStats;
