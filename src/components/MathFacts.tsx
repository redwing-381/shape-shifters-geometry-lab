
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Target } from 'lucide-react';

interface MathFactsProps {
  shapeType: 'triangle' | 'rectangle' | 'circle';
  isVisible: boolean;
  onClose: () => void;
}

const mathFacts = {
  triangle: {
    title: "Triangle Mathematics",
    facts: [
      "Area = ½ × base × height",
      "Perimeter = sum of all three sides",
      "Sum of all angles = 180°",
      "In a right triangle: a² + b² = c² (Pythagorean theorem)",
      "Area can also be calculated using Heron's formula: √[s(s-a)(s-b)(s-c)]"
    ],
    icon: Target
  },
  rectangle: {
    title: "Rectangle Mathematics", 
    facts: [
      "Area = length × width",
      "Perimeter = 2 × (length + width)",
      "All angles = 90°",
      "Diagonal = √(length² + width²)",
      "A square is a special rectangle where length = width"
    ],
    icon: Calculator
  },
  circle: {
    title: "Circle Mathematics",
    facts: [
      "Area = π × radius²",
      "Circumference = 2 × π × radius",
      "Diameter = 2 × radius",
      "π (pi) ≈ 3.14159...",
      "A circle has 360° and infinite lines of symmetry"
    ],
    icon: BookOpen
  }
};

const MathFacts = ({ shapeType, isVisible, onClose }: MathFactsProps) => {
  const facts = mathFacts[shapeType];
  const IconComponent = facts.icon;

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isVisible ? 'pointer-events-none' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-lg mx-4 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: isVisible ? 1 : 0.8, y: isVisible ? 0 : 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <IconComponent className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{facts.title}</h3>
        </div>
        
        <div className="space-y-3 mb-6">
          {facts.facts.map((fact, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-gray-700 font-medium">{fact}</div>
            </motion.div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          Got it! 🎓
        </button>
      </motion.div>
    </motion.div>
  );
};

export default MathFacts;
