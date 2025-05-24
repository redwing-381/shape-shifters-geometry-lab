
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface GeometryTutorialsProps {
  isVisible: boolean;
  onClose: () => void;
}

const tutorials = [
  {
    id: 1,
    title: "Understanding Area",
    description: "Learn how to calculate the area of different shapes",
    content: [
      {
        step: "What is Area?",
        description: "Area is the amount of space inside a shape, measured in square units.",
        visual: "🔲",
        formula: "Area = length × width (for rectangles)"
      },
      {
        step: "Triangle Area",
        description: "For triangles, we use half the base times the height.",
        visual: "🔺",
        formula: "Area = ½ × base × height"
      },
      {
        step: "Circle Area",
        description: "Circles use pi (π) in their area calculation.",
        visual: "⭕",
        formula: "Area = π × radius²"
      },
      {
        step: "Practice Tip",
        description: "Try changing shapes in the canvas and watch how the area changes!",
        visual: "💡",
        formula: "Practice makes perfect!"
      }
    ]
  },
  {
    id: 2,
    title: "Perimeter and Circumference",
    description: "Discover how to measure the distance around shapes",
    content: [
      {
        step: "What is Perimeter?",
        description: "Perimeter is the distance around the outside of a shape.",
        visual: "📏",
        formula: "Add up all the side lengths"
      },
      {
        step: "Rectangle Perimeter",
        description: "For rectangles, add length + width + length + width.",
        visual: "⬜",
        formula: "Perimeter = 2 × (length + width)"
      },
      {
        step: "Triangle Perimeter",
        description: "For triangles, add all three side lengths together.",
        visual: "🔺",
        formula: "Perimeter = side₁ + side₂ + side₃"
      },
      {
        step: "Circle Circumference",
        description: "The perimeter of a circle is called circumference.",
        visual: "⭕",
        formula: "Circumference = 2 × π × radius"
      }
    ]
  },
  {
    id: 3,
    title: "Angles and Triangles",
    description: "Explore angles and special properties of triangles",
    content: [
      {
        step: "Triangle Angles",
        description: "The angles in any triangle always add up to 180 degrees.",
        visual: "📐",
        formula: "∠A + ∠B + ∠C = 180°"
      },
      {
        step: "Right Triangles",
        description: "A right triangle has one 90-degree angle.",
        visual: "📐",
        formula: "One angle = 90°"
      },
      {
        step: "Equilateral Triangles",
        description: "All sides and angles are equal in an equilateral triangle.",
        visual: "🔺",
        formula: "All angles = 60°"
      },
      {
        step: "Pythagorean Theorem",
        description: "For right triangles: a² + b² = c²",
        visual: "📏",
        formula: "a² + b² = c²"
      }
    ]
  },
  {
    id: 4,
    title: "Shape Transformations",
    description: "Learn about moving and changing shapes",
    content: [
      {
        step: "Translation",
        description: "Moving a shape without changing its size or orientation.",
        visual: "↔️",
        formula: "Slide the shape"
      },
      {
        step: "Rotation",
        description: "Turning a shape around a fixed point.",
        visual: "🔄",
        formula: "Rotate around center"
      },
      {
        step: "Reflection",
        description: "Flipping a shape over a line to create a mirror image.",
        visual: "🪞",
        formula: "Flip over axis"
      },
      {
        step: "Scale",
        description: "Making a shape bigger or smaller while keeping the same proportions.",
        visual: "🔍",
        formula: "Multiply all dimensions"
      }
    ]
  }
];

const GeometryTutorials = ({ isVisible, onClose }: GeometryTutorialsProps) => {
  const [currentTutorial, setCurrentTutorial] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorial = tutorials[currentTutorial];
  const step = tutorial.content[currentStep];

  const nextStep = () => {
    if (currentStep < tutorial.content.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentTutorial < tutorials.length - 1) {
      setCurrentTutorial(currentTutorial + 1);
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentTutorial > 0) {
      setCurrentTutorial(currentTutorial - 1);
      setCurrentStep(tutorials[currentTutorial - 1].content.length - 1);
    }
  };

  const selectTutorial = (index: number) => {
    setCurrentTutorial(index);
    setCurrentStep(0);
  };

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${!isVisible ? 'pointer-events-none' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: isVisible ? 1 : 0.8, y: isVisible ? 0 : 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Geometry Tutorials</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tutorial List */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Choose a Tutorial:</h4>
            <div className="space-y-3">
              {tutorials.map((tut, index) => (
                <motion.button
                  key={tut.id}
                  onClick={() => selectTutorial(index)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    currentTutorial === index
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-gray-800">{tut.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{tut.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tutorial Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{tutorial.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Step {currentStep + 1} of {tutorial.content.length}</span>
                <div className="flex space-x-1">
                  {tutorial.content.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentTutorial}-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{step.visual}</div>
                  <h5 className="text-2xl font-bold text-gray-800 mb-2">{step.step}</h5>
                  <p className="text-gray-700 text-lg leading-relaxed">{step.description}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-inner">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Formula:</div>
                    <div className="text-xl font-bold text-purple-700 font-mono">{step.formula}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevStep}
                disabled={currentTutorial === 0 && currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTutorial === 0 && currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <button
                onClick={nextStep}
                disabled={currentTutorial === tutorials.length - 1 && currentStep === tutorial.content.length - 1}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  currentTutorial === tutorials.length - 1 && currentStep === tutorial.content.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Practice Reminder */}
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-2">💡</div>
                <div className="text-sm text-yellow-800">
                  <strong>Practice Tip:</strong> Try applying what you've learned using the interactive canvas!
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GeometryTutorials;
