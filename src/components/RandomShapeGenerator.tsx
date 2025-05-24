
import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Triangle, Square, Circle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface RandomShapeGeneratorProps {
  onGenerateShape: (shape: any) => void;
}

const RandomShapeGenerator = ({ onGenerateShape }: RandomShapeGeneratorProps) => {
  const generateRandomTriangle = () => {
    const centerX = 300;
    const centerY = 200;
    const size = 50 + Math.random() * 100;
    
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = angle1 + (Math.PI * 2 / 3) + (Math.random() - 0.5) * 0.5;
    const angle3 = angle2 + (Math.PI * 2 / 3) + (Math.random() - 0.5) * 0.5;
    
    return {
      type: 'triangle',
      vertices: [
        { x: centerX + Math.cos(angle1) * size, y: centerY + Math.sin(angle1) * size },
        { x: centerX + Math.cos(angle2) * size, y: centerY + Math.sin(angle2) * size },
        { x: centerX + Math.cos(angle3) * size, y: centerY + Math.sin(angle3) * size }
      ] as [Point, Point, Point]
    };
  };

  const generateRandomRectangle = () => {
    const width = 80 + Math.random() * 120;
    const height = 60 + Math.random() * 100;
    const x = 200 + Math.random() * 200;
    const y = 150 + Math.random() * 100;
    
    return {
      type: 'rectangle',
      vertices: [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
      ] as [Point, Point, Point, Point]
    };
  };

  const generateRandomCircle = () => {
    const radius = 40 + Math.random() * 80;
    const x = 150 + Math.random() * 300;
    const y = 150 + Math.random() * 100;
    
    return {
      type: 'circle',
      center: { x, y },
      radius
    };
  };

  const generateRandomShape = () => {
    const shapes = ['triangle', 'rectangle', 'circle'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let shape;
    switch (randomShape) {
      case 'triangle':
        shape = generateRandomTriangle();
        break;
      case 'rectangle':
        shape = generateRandomRectangle();
        break;
      case 'circle':
        shape = generateRandomCircle();
        break;
      default:
        shape = generateRandomTriangle();
    }
    
    onGenerateShape(shape);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        <Shuffle className="w-5 h-5 mr-2 text-purple-600" />
        Random Shapes
      </h3>
      
      <div className="space-y-3">
        <motion.button
          onClick={() => onGenerateShape(generateRandomTriangle())}
          className="w-full p-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all font-medium flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Triangle className="w-4 h-4 mr-2" />
          Random Triangle
        </motion.button>
        
        <motion.button
          onClick={() => onGenerateShape(generateRandomRectangle())}
          className="w-full p-3 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-lg hover:from-green-200 hover:to-green-300 transition-all font-medium flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Square className="w-4 h-4 mr-2" />
          Random Rectangle
        </motion.button>
        
        <motion.button
          onClick={() => onGenerateShape(generateRandomCircle())}
          className="w-full p-3 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all font-medium flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Circle className="w-4 h-4 mr-2" />
          Random Circle
        </motion.button>
        
        <motion.button
          onClick={generateRandomShape}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-bold text-lg flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shuffle className="w-5 h-5 mr-2" />
          Surprise Me!
        </motion.button>
      </div>
    </div>
  );
};

export default RandomShapeGenerator;
