
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our shapes
interface Point {
  x: number;
  y: number;
}

interface Triangle {
  type: 'triangle';
  vertices: [Point, Point, Point];
}

interface Rectangle {
  type: 'rectangle';
  vertices: [Point, Point, Point, Point];
}

interface Circle {
  type: 'circle';
  center: Point;
  radius: number;
}

type Shape = Triangle | Rectangle | Circle;

interface Challenge {
  id: string;
  description: string;
  target: number;
  property: 'area' | 'perimeter' | 'circumference';
  tolerance: number;
}

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShape, setCurrentShape] = useState<Shape>({
    type: 'triangle',
    vertices: [
      { x: 150, y: 100 },
      { x: 250, y: 200 },
      { x: 50, y: 200 }
    ]
  });
  
  const [isDragging, setIsDragging] = useState<{ type: string; index?: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [challengeMode, setChallengeMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const challenges: Challenge[] = [
    { id: '1', description: 'Create a triangle with an area of 1500 square units', target: 1500, property: 'area', tolerance: 75 },
    { id: '2', description: 'Make a rectangle with a perimeter of 400 units', target: 400, property: 'perimeter', tolerance: 20 },
    { id: '3', description: 'Create a circle with an area of 3000 square units', target: 3000, property: 'area', tolerance: 150 },
    { id: '4', description: 'Make a triangle with a perimeter of 300 units', target: 300, property: 'perimeter', tolerance: 15 },
    { id: '5', description: 'Create a rectangle with an area of 8000 square units', target: 8000, property: 'area', tolerance: 400 }
  ];

  // Shape calculations
  const calculateTriangleArea = (vertices: [Point, Point, Point]): number => {
    const [a, b, c] = vertices;
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
  };

  const calculateTrianglePerimeter = (vertices: [Point, Point, Point]): number => {
    const [a, b, c] = vertices;
    const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);
    const ca = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2);
    return ab + bc + ca;
  };

  const calculateTriangleAngles = (vertices: [Point, Point, Point]): number[] => {
    const [a, b, c] = vertices;
    const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);
    const ca = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2);
    
    const angleA = Math.acos((ab ** 2 + ca ** 2 - bc ** 2) / (2 * ab * ca)) * (180 / Math.PI);
    const angleB = Math.acos((ab ** 2 + bc ** 2 - ca ** 2) / (2 * ab * bc)) * (180 / Math.PI);
    const angleC = 180 - angleA - angleB;
    
    return [angleA, angleB, angleC];
  };

  const calculateRectangleArea = (vertices: [Point, Point, Point, Point]): number => {
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[2].y - vertices[1].y);
    return width * height;
  };

  const calculateRectanglePerimeter = (vertices: [Point, Point, Point, Point]): number => {
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[2].y - vertices[1].y);
    return 2 * (width + height);
  };

  const calculateCircleArea = (radius: number): number => {
    return Math.PI * radius ** 2;
  };

  const calculateCircleCircumference = (radius: number): number => {
    return 2 * Math.PI * radius;
  };

  // Get current shape properties
  const getShapeProperties = () => {
    if (currentShape.type === 'triangle') {
      const area = calculateTriangleArea(currentShape.vertices);
      const perimeter = calculateTrianglePerimeter(currentShape.vertices);
      const angles = calculateTriangleAngles(currentShape.vertices);
      return { area, perimeter, angles };
    } else if (currentShape.type === 'rectangle') {
      const area = calculateRectangleArea(currentShape.vertices);
      const perimeter = calculateRectanglePerimeter(currentShape.vertices);
      return { area, perimeter };
    } else {
      const area = calculateCircleArea(currentShape.radius);
      const circumference = calculateCircleCircumference(currentShape.radius);
      return { area, circumference };
    }
  };

  // Canvas drawing functions
  const drawShape = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 600, 400);
    ctx.strokeStyle = '#3B82F6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 3;

    if (currentShape.type === 'triangle') {
      const [a, b, c] = currentShape.vertices;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw vertices
      currentShape.vertices.forEach((vertex, index) => {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#DC2626';
        ctx.stroke();
      });
    } else if (currentShape.type === 'rectangle') {
      const [topLeft, topRight, bottomRight, bottomLeft] = currentShape.vertices;
      ctx.beginPath();
      ctx.rect(topLeft.x, topLeft.y, topRight.x - topLeft.x, bottomRight.y - topRight.y);
      ctx.fill();
      ctx.stroke();

      // Draw vertices
      currentShape.vertices.forEach((vertex) => {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.strokeStyle = '#DC2626';
        ctx.stroke();
      });
    } else {
      ctx.beginPath();
      ctx.arc(currentShape.center.x, currentShape.center.y, currentShape.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw center point
      ctx.beginPath();
      ctx.arc(currentShape.center.x, currentShape.center.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#DC2626';
      ctx.stroke();

      // Draw radius control point
      ctx.beginPath();
      ctx.arc(currentShape.center.x + currentShape.radius, currentShape.center.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.stroke();
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (currentShape.type === 'triangle' || currentShape.type === 'rectangle') {
      currentShape.vertices.forEach((vertex, index) => {
        const distance = Math.sqrt((mouseX - vertex.x) ** 2 + (mouseY - vertex.y) ** 2);
        if (distance < 15) {
          setIsDragging({ type: 'vertex', index });
          setDragOffset({ x: mouseX - vertex.x, y: mouseY - vertex.y });
        }
      });
    } else {
      const centerDistance = Math.sqrt((mouseX - currentShape.center.x) ** 2 + (mouseY - currentShape.center.y) ** 2);
      const radiusControlX = currentShape.center.x + currentShape.radius;
      const radiusControlDistance = Math.sqrt((mouseX - radiusControlX) ** 2 + (mouseY - currentShape.center.y) ** 2);

      if (centerDistance < 15) {
        setIsDragging({ type: 'center' });
        setDragOffset({ x: mouseX - currentShape.center.x, y: mouseY - currentShape.center.y });
      } else if (radiusControlDistance < 15) {
        setIsDragging({ type: 'radius' });
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging.type === 'vertex' && isDragging.index !== undefined) {
      const newX = Math.max(10, Math.min(590, mouseX - dragOffset.x));
      const newY = Math.max(10, Math.min(390, mouseY - dragOffset.y));

      if (currentShape.type === 'triangle') {
        const newVertices = [...currentShape.vertices] as [Point, Point, Point];
        newVertices[isDragging.index] = { x: newX, y: newY };
        setCurrentShape({ ...currentShape, vertices: newVertices });
      } else if (currentShape.type === 'rectangle') {
        const newVertices = [...currentShape.vertices] as [Point, Point, Point, Point];
        const [topLeft, topRight, bottomRight, bottomLeft] = newVertices;
        
        if (isDragging.index === 0) { // Top-left
          newVertices[0] = { x: newX, y: newY };
          newVertices[1] = { x: topRight.x, y: newY };
          newVertices[3] = { x: newX, y: bottomLeft.y };
        } else if (isDragging.index === 1) { // Top-right
          newVertices[1] = { x: newX, y: newY };
          newVertices[0] = { x: topLeft.x, y: newY };
          newVertices[2] = { x: newX, y: bottomRight.y };
        } else if (isDragging.index === 2) { // Bottom-right
          newVertices[2] = { x: newX, y: newY };
          newVertices[1] = { x: newX, y: topRight.y };
          newVertices[3] = { x: bottomLeft.x, y: newY };
        } else { // Bottom-left
          newVertices[3] = { x: newX, y: newY };
          newVertices[0] = { x: newX, y: topLeft.y };
          newVertices[2] = { x: bottomRight.x, y: newY };
        }
        
        setCurrentShape({ ...currentShape, vertices: newVertices });
      }
    } else if (isDragging.type === 'center' && currentShape.type === 'circle') {
      const newX = Math.max(currentShape.radius + 10, Math.min(590 - currentShape.radius, mouseX - dragOffset.x));
      const newY = Math.max(currentShape.radius + 10, Math.min(390 - currentShape.radius, mouseY - dragOffset.y));
      setCurrentShape({ ...currentShape, center: { x: newX, y: newY } });
    } else if (isDragging.type === 'radius' && currentShape.type === 'circle') {
      const newRadius = Math.max(20, Math.min(150, Math.abs(mouseX - currentShape.center.x)));
      setCurrentShape({ ...currentShape, radius: newRadius });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Challenge mode functions
  const startChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setChallengeMode(true);
    setFeedback('');
    setShowFeedback(false);
  };

  const checkChallenge = () => {
    if (!currentChallenge) return;

    const properties = getShapeProperties();
    let currentValue = 0;

    if (currentChallenge.property === 'area') {
      currentValue = properties.area;
    } else if (currentChallenge.property === 'perimeter') {
      currentValue = properties.perimeter || 0;
    } else if (currentChallenge.property === 'circumference') {
      currentValue = (properties as any).circumference || 0;
    }

    const difference = Math.abs(currentValue - currentChallenge.target);
    const isWithinTolerance = difference <= currentChallenge.tolerance;

    if (isWithinTolerance) {
      setFeedback('🎉 Correct! Well done!');
    } else if (currentValue > currentChallenge.target) {
      setFeedback('📏 Too big! Make it smaller.');
    } else {
      setFeedback('📐 Too small! Make it bigger.');
    }

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  // Shape creation functions
  const createTriangle = () => {
    setCurrentShape({
      type: 'triangle',
      vertices: [
        { x: 150, y: 100 },
        { x: 250, y: 200 },
        { x: 50, y: 200 }
      ]
    });
    setChallengeMode(false);
  };

  const createRectangle = () => {
    setCurrentShape({
      type: 'rectangle',
      vertices: [
        { x: 100, y: 100 },
        { x: 250, y: 100 },
        { x: 250, y: 200 },
        { x: 100, y: 200 }
      ]
    });
    setChallengeMode(false);
  };

  const createCircle = () => {
    setCurrentShape({
      type: 'circle',
      center: { x: 200, y: 150 },
      radius: 80
    });
    setChallengeMode(false);
  };

  // Draw on canvas whenever shape changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawShape(ctx);
  }, [currentShape]);

  // Check challenge progress whenever shape changes
  useEffect(() => {
    if (challengeMode && currentChallenge) {
      checkChallenge();
    }
  }, [currentShape, challengeMode, currentChallenge]);

  const properties = getShapeProperties();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-center">
          🔺 Shape Explorer: Interactive Geometry Playground 🔵
        </h1>
        <p className="text-center mt-2 text-blue-100">
          Discover geometry through hands-on exploration!
        </p>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Main Canvas Area */}
        <motion.div 
          className="flex-1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Shape Canvas</h2>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border-2 border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-2 text-sm text-gray-600">
                💡 Drag the red dots to reshape your figure!
              </div>
            </div>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div 
          className="w-full lg:w-80 space-y-6"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Shape Selection */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose Your Shape</h3>
            <div className="space-y-2">
              <motion.button
                onClick={createTriangle}
                className={`w-full p-3 rounded-lg font-medium transition-all ${
                  currentShape.type === 'triangle'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔺 Triangle
              </motion.button>
              <motion.button
                onClick={createRectangle}
                className={`w-full p-3 rounded-lg font-medium transition-all ${
                  currentShape.type === 'rectangle'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⬜ Rectangle
              </motion.button>
              <motion.button
                onClick={createCircle}
                className={`w-full p-3 rounded-lg font-medium transition-all ${
                  currentShape.type === 'circle'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⭕ Circle
              </motion.button>
            </div>
          </div>

          {/* Properties Display */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-4"
            layout
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Shape Properties</h3>
            <div className="space-y-3">
              <motion.div 
                className="bg-blue-50 p-3 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`area-${properties.area}`}
              >
                <div className="text-sm font-medium text-blue-700">Area</div>
                <div className="text-lg font-bold text-blue-900">
                  {properties.area.toFixed(1)} sq units
                </div>
                {currentShape.type === 'triangle' && (
                  <div className="text-xs text-blue-600 mt-1">
                    Formula: ½ × base × height
                  </div>
                )}
                {currentShape.type === 'rectangle' && (
                  <div className="text-xs text-blue-600 mt-1">
                    Formula: length × width
                  </div>
                )}
                {currentShape.type === 'circle' && (
                  <div className="text-xs text-blue-600 mt-1">
                    Formula: π × radius²
                  </div>
                )}
              </motion.div>

              <motion.div 
                className="bg-green-50 p-3 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`perimeter-${properties.perimeter || (properties as any).circumference}`}
              >
                <div className="text-sm font-medium text-green-700">
                  {currentShape.type === 'circle' ? 'Circumference' : 'Perimeter'}
                </div>
                <div className="text-lg font-bold text-green-900">
                  {((properties.perimeter || (properties as any).circumference) || 0).toFixed(1)} units
                </div>
                {currentShape.type === 'triangle' && (
                  <div className="text-xs text-green-600 mt-1">
                    Sum of all three sides
                  </div>
                )}
                {currentShape.type === 'rectangle' && (
                  <div className="text-xs text-green-600 mt-1">
                    Formula: 2 × (length + width)
                  </div>
                )}
                {currentShape.type === 'circle' && (
                  <div className="text-xs text-green-600 mt-1">
                    Formula: 2 × π × radius
                  </div>
                )}
              </motion.div>

              {currentShape.type === 'triangle' && (properties as any).angles && (
                <motion.div 
                  className="bg-yellow-50 p-3 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`angles-${(properties as any).angles.join('-')}`}
                >
                  <div className="text-sm font-medium text-yellow-700">Angles</div>
                  <div className="text-sm font-bold text-yellow-900">
                    {(properties as any).angles.map((angle: number, index: number) => (
                      <div key={index}>Angle {index + 1}: {angle.toFixed(1)}°</div>
                    ))}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    Sum: {(properties as any).angles.reduce((sum: number, angle: number) => sum + angle, 0).toFixed(1)}°
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Challenge Mode */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Challenge Mode</h3>
            {!challengeMode ? (
              <motion.button
                onClick={startChallenge}
                className="w-full p-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-red-600 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🎯 Start Challenge
              </motion.button>
            ) : (
              <div className="space-y-3">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-700 mb-2">Current Challenge:</div>
                  <div className="text-sm text-orange-900">{currentChallenge?.description}</div>
                </div>
                <motion.button
                  onClick={() => setChallengeMode(false)}
                  className="w-full p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Exit Challenge
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed top-20 right-6 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-lg font-medium text-gray-800">{feedback}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
