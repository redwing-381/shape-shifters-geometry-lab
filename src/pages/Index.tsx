import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameStats from '../components/GameStats';
import AchievementBanner from '../components/AchievementBanner';
import LevelProgress from '../components/LevelProgress';
import PowerUps from '../components/PowerUps';

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

  // Gamification state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState<{ [key: string]: number }>({
    hint: 2,
    precision: 1,
    timeFreeze: 1,
    doublePoints: 1,
  });
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [perfectSolutions, setPerfectSolutions] = useState(0);

  // Calculate XP required for next level
  const xpToNextLevel = level * 100;

  // Challenges array
  const challenges: Challenge[] = [
    { id: '1', description: 'Create a triangle with an area of 1500 square units', target: 1500, property: 'area', tolerance: 75 },
    { id: '2', description: 'Make a rectangle with a perimeter of 400 units', target: 400, property: 'perimeter', tolerance: 20 },
    { id: '3', description: 'Create a circle with an area of 3000 square units', target: 3000, property: 'area', tolerance: 150 },
    { id: '4', description: 'Make a triangle with a perimeter of 300 units', target: 300, property: 'perimeter', tolerance: 15 },
    { id: '5', description: 'Create a rectangle with an area of 8000 square units', target: 8000, property: 'area', tolerance: 400 },
    { id: '6', description: 'Make a circle with circumference of 250 units', target: 250, property: 'circumference', tolerance: 12 },
    { id: '7', description: 'Create a triangle with area of 2500 square units', target: 2500, property: 'area', tolerance: 125 },
    { id: '8', description: 'Make a rectangle with perimeter of 600 units', target: 600, property: 'perimeter', tolerance: 30 },
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

  // Gamification functions
  const addScore = (points: number) => {
    const multiplier = activePowerUp === 'doublePoints' ? 2 : 1;
    const finalPoints = points * multiplier;
    setScore(prev => prev + finalPoints);
    setCurrentXP(prev => {
      const newXP = prev + finalPoints;
      if (newXP >= xpToNextLevel) {
        setLevel(prevLevel => prevLevel + 1);
        checkLevelAchievements(level + 1);
        return newXP - xpToNextLevel;
      }
      return newXP;
    });
  };

  const checkAchievements = (isSuccess: boolean, timeTaken?: number) => {
    const newAchievements: string[] = [];

    if (isSuccess && achievements.length === 0) {
      newAchievements.push('First Success');
    }

    if (isSuccess && timeTaken && timeTaken < 10) {
      if (!achievements.includes('Speed Demon')) {
        newAchievements.push('Speed Demon');
      }
    }

    if (isSuccess && streak >= 5 && !achievements.includes('Streak Master')) {
      newAchievements.push('Streak Master');
    }

    if (challengesCompleted >= 10 && !achievements.includes('Explorer')) {
      newAchievements.push('Explorer');
    }

    if (perfectSolutions >= 5 && !achievements.includes('Perfectionist')) {
      newAchievements.push('Perfectionist');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setNewAchievement(newAchievements[0]);
      addScore(50 * newAchievements.length);
    }
  };

  const checkLevelAchievements = (newLevel: number) => {
    if (newLevel >= 5 && !achievements.includes('Rising Star')) {
      setAchievements(prev => [...prev, 'Rising Star']);
      setNewAchievement('Rising Star');
    }
    if (newLevel >= 10 && !achievements.includes('Master')) {
      setAchievements(prev => [...prev, 'Master']);
      setNewAchievement('Master');
    }
  };

  const usePowerUp = (type: string) => {
    if (powerUps[type] > 0) {
      setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setActivePowerUp(type);
      
      if (type === 'hint' && currentChallenge) {
        const properties = getShapeProperties();
        let currentValue = 0;
        if (currentChallenge.property === 'area') {
          currentValue = properties.area;
        } else if (currentChallenge.property === 'perimeter') {
          currentValue = properties.perimeter || 0;
        } else if (currentChallenge.property === 'circumference') {
          currentValue = (properties as any).circumference || 0;
        }
        
        const difference = currentChallenge.target - currentValue;
        const direction = difference > 0 ? 'bigger' : 'smaller';
        setFeedback(`💡 Hint: Make it ${direction}! You need ${Math.abs(difference).toFixed(0)} more units.`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 4000);
      }
      
      // Clear active power-up after use
      setTimeout(() => setActivePowerUp(null), type === 'doublePoints' ? 30000 : 10000);
    }
  };

  // Challenge mode functions
  const startChallenge = () => {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setChallengeMode(true);
    setFeedback('');
    setShowFeedback(false);
    
    // Award power-ups periodically
    if (challengesCompleted > 0 && challengesCompleted % 3 === 0) {
      const powerUpTypes = ['hint', 'precision', 'timeFreeze', 'doublePoints'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPowerUps(prev => ({ ...prev, [randomPowerUp]: prev[randomPowerUp] + 1 }));
    }
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
    const tolerance = activePowerUp === 'precision' ? currentChallenge.tolerance * 2 : currentChallenge.tolerance;
    const isWithinTolerance = difference <= tolerance;

    if (isWithinTolerance) {
      const basePoints = 100;
      const accuracyBonus = Math.max(0, (tolerance - difference) / tolerance * 50);
      const streakBonus = streak * 10;
      const totalPoints = Math.round(basePoints + accuracyBonus + streakBonus);
      
      addScore(totalPoints);
      setStreak(prev => prev + 1);
      setChallengesCompleted(prev => prev + 1);
      
      if (difference <= currentChallenge.tolerance * 0.1) {
        setPerfectSolutions(prev => prev + 1);
        setFeedback('🎯 PERFECT! Amazing precision!');
      } else {
        setFeedback('🎉 Excellent work! Challenge completed!');
      }
      
      checkAchievements(true);
    } else {
      setStreak(0);
      if (currentValue > currentChallenge.target) {
        setFeedback('📏 Too big! Make it smaller.');
      } else {
        setFeedback('📐 Too small! Make it bigger.');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Enhanced Header */}
      <motion.header 
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 shadow-xl relative overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-white opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center mb-2">
            🔺 Shape Explorer: Interactive Geometry Playground 🔵
          </h1>
          <p className="text-center text-lg text-indigo-100">
            Level up your geometry skills through hands-on exploration!
          </p>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Left Sidebar - Game Stats */}
        <motion.div 
          className="w-full lg:w-80 space-y-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GameStats 
            score={score} 
            level={level} 
            achievements={achievements} 
            streak={streak} 
          />
          
          <LevelProgress 
            currentXP={currentXP} 
            xpToNextLevel={xpToNextLevel} 
            level={level} 
          />
          
          <PowerUps 
            powerUps={powerUps} 
            onUsePowerUp={usePowerUp} 
          />

          {/* Shape Selection */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">🎯</span> Choose Your Shape
            </h3>
            <div className="space-y-2">
              <motion.button
                onClick={createTriangle}
                className={`w-full p-4 rounded-lg font-medium transition-all ${
                  currentShape.type === 'triangle'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
                whileHover={{ scale: currentShape.type !== 'triangle' ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                🔺 Triangle
              </motion.button>
              <motion.button
                onClick={createRectangle}
                className={`w-full p-4 rounded-lg font-medium transition-all ${
                  currentShape.type === 'rectangle'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
                whileHover={{ scale: currentShape.type !== 'rectangle' ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                ⬜ Rectangle
              </motion.button>
              <motion.button
                onClick={createCircle}
                className={`w-full p-4 rounded-lg font-medium transition-all ${
                  currentShape.type === 'circle'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
                whileHover={{ scale: currentShape.type !== 'circle' ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                ⭕ Circle
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Canvas Area */}
        <motion.div 
          className="flex-1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">🎨</span> Shape Canvas
              {activePowerUp && (
                <span className="ml-auto text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {activePowerUp} Active! ⚡
                </span>
              )}
            </h2>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border-4 border-gradient-to-r from-blue-200 to-purple-200 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 cursor-pointer shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute top-3 left-3 bg-white bg-opacity-95 rounded-lg p-3 text-sm text-gray-700 shadow-lg">
                <div className="flex items-center">
                  <span className="mr-2">💡</span>
                  <span className="font-medium">Drag the red dots to reshape your figure!</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar - Properties & Challenge */}
        <motion.div 
          className="w-full lg:w-80 space-y-4"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Properties Display */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-4"
            layout
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">📊</span> Shape Properties
            </h3>
            <div className="space-y-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`area-${properties.area}`}
              >
                <div className="text-sm font-medium text-blue-700 flex items-center">
                  <span className="mr-1">📐</span> Area
                </div>
                <div className="text-xl font-bold text-blue-900">
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
                className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`perimeter-${properties.perimeter || (properties as any).circumference}`}
              >
                <div className="text-sm font-medium text-green-700 flex items-center">
                  <span className="mr-1">📏</span> {currentShape.type === 'circle' ? 'Circumference' : 'Perimeter'}
                </div>
                <div className="text-xl font-bold text-green-900">
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
                  className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`angles-${(properties as any).angles.join('-')}`}
                >
                  <div className="text-sm font-medium text-yellow-700 flex items-center">
                    <span className="mr-1">📐</span> Angles
                  </div>
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
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span className="mr-2">🎯</span> Challenge Mode
            </h3>
            {!challengeMode ? (
              <motion.button
                onClick={startChallenge}
                className="w-full p-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:from-orange-500 hover:via-red-600 hover:to-pink-600 transition-all shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Start Challenge
              </motion.button>
            ) : (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                    <span className="mr-1">🎯</span> Current Challenge:
                  </div>
                  <div className="text-sm text-orange-900 font-medium">{currentChallenge?.description}</div>
                  <div className="text-xs text-orange-600 mt-2">
                    Streak: {streak} | Completed: {challengesCompleted}
                  </div>
                </div>
                <motion.button
                  onClick={() => setChallengeMode(false)}
                  className="w-full p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
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

      {/* Achievement Banner */}
      <AchievementBanner 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />

      {/* Enhanced Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed top-24 right-6 bg-white border-l-4 border-blue-500 rounded-lg shadow-2xl p-4 max-w-sm z-40"
            initial={{ x: 300, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-lg font-medium text-gray-800">{feedback}</div>
            {activePowerUp === 'doublePoints' && (
              <div className="text-sm text-yellow-600 mt-1">⚡ Double Points Active!</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
