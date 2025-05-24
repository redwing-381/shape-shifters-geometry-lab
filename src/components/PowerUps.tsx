
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, Target, RefreshCw } from 'lucide-react';

interface PowerUpsProps {
  powerUps: { [key: string]: number };
  onUsePowerUp: (type: string) => void;
}

const PowerUps = ({ powerUps, onUsePowerUp }: PowerUpsProps) => {
  const powerUpTypes = [
    { type: 'hint', icon: Eye, name: 'Hint', color: 'from-blue-400 to-blue-600' },
    { type: 'precision', icon: Target, name: 'Precision', color: 'from-green-400 to-green-600' },
    { type: 'timeFreeze', icon: RefreshCw, name: 'Time Freeze', color: 'from-purple-400 to-purple-600' },
    { type: 'doublePoints', icon: Zap, name: '2x Points', color: 'from-yellow-400 to-yellow-600' },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Power-ups</h3>
      <div className="grid grid-cols-2 gap-2">
        {powerUpTypes.map((powerUp) => {
          const IconComponent = powerUp.icon;
          const count = powerUps[powerUp.type] || 0;
          
          return (
            <motion.button
              key={powerUp.type}
              onClick={() => count > 0 && onUsePowerUp(powerUp.type)}
              disabled={count === 0}
              className={`p-3 rounded-lg text-white font-medium text-sm relative overflow-hidden ${
                count > 0 ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                background: count > 0 ? `linear-gradient(135deg, var(--tw-gradient-stops))` : '#9CA3AF'
              }}
              whileHover={count > 0 ? { scale: 1.05 } : {}}
              whileTap={count > 0 ? { scale: 0.95 } : {}}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${powerUp.color}`} />
              <div className="relative flex flex-col items-center">
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs">{powerUp.name}</span>
                <span className="text-xs bg-white text-gray-800 rounded-full px-2 py-0.5 mt-1">
                  {count}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PowerUps;
