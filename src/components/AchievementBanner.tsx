
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target } from 'lucide-react';

interface AchievementBannerProps {
  achievement: string | null;
  onClose: () => void;
}

const achievementIcons: { [key: string]: any } = {
  'First Success': Trophy,
  'Speed Demon': Zap,
  'Perfectionist': Star,
  'Explorer': Target,
  'Master': Trophy,
  'Streak Master': Zap,
  'Triangle Expert': Target,
  'Rectangle Pro': Target,
  'Circle Specialist': Target,
};

const AchievementBanner = ({ achievement, onClose }: AchievementBannerProps) => {
  const IconComponent = achievement ? achievementIcons[achievement] || Trophy : Trophy;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-2xl border-4 border-yellow-300">
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="inline-block"
              >
                <IconComponent className="w-12 h-12 mx-auto mb-2" />
              </motion.div>
              <h3 className="text-xl font-bold mb-1">Achievement Unlocked!</h3>
              <p className="text-lg">{achievement}</p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-white text-orange-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Awesome! 🎉
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementBanner;
