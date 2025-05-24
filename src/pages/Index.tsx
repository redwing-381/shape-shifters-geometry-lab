import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameStats from '../components/GameStats';
import AchievementBanner from '../components/AchievementBanner';
import LevelProgress from '../components/LevelProgress';
import PowerUps from '../components/PowerUps';
import MathFacts from '../components/MathFacts';
import Timer from '../components/Timer';
import RandomShapeGenerator from '../components/RandomShapeGenerator';
import GraphVisualization from '../components/GraphVisualization';

// Scaling factor to make values more reasonable
const SCALE_FACTOR = 0.01;

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
  property: 'area' | 'perimeter' | 'circumference' | 'angle' | 'ratio';
  tolerance: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'basic' | 'advanced' | 'creative';
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
  const [shapeHistory, setShapeHistory] = useState<Shape[]>([]);
  const [compareMode, setCompareMode] = useState(false);

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

  // New states for enhanced features
  const [showMathFacts, setShowMathFacts] = useState(false);
  const [currentMathFactsShape, setCurrentMathFactsShape] = useState<'triangle' | 'rectangle' | 'circle'>('triangle');
  const [challengeTime, setChallengeTime] = useState(0);
  const [resizeHandles, setResizeHandles] = useState<{ [key: string]: Point }>({});

  // Calculate XP required for next level
  const xpToNextLevel = level * 100;

  // Enhanced challenges with more variety
  const challenges: Challenge[] = [
    // Basic challenges
    { id: '1', description: 'Create a triangle with an area of 15 square units', target: 15, property: 'area', tolerance: 2, difficulty: 'easy', category: 'basic' },
    { id: '2', description: 'Make a rectangle with a perimeter of 20 units', target: 20, property: 'perimeter', tolerance: 2, difficulty: 'easy', category: 'basic' },
    { id: '3', description: 'Create a circle with an area of 25 square units', target: 25, property: 'area', tolerance: 3, difficulty: 'easy', category: 'basic' },
    
    // Medium challenges
    { id: '4', description: 'Make a triangle with a perimeter of 30 units', target: 30, property: 'perimeter', tolerance: 3, difficulty: 'medium', category: 'basic' },
    { id: '5', description: 'Create a rectangle with an area of 50 square units', target: 50, property: 'area', tolerance: 5, difficulty: 'medium', category: 'basic' },
    { id: '6', description: 'Make a circle with circumference of 35 units', target: 35, property: 'circumference', tolerance: 3, difficulty: 'medium', category: 'basic' },
    
    // Advanced geometry challenges
    { id: '7', description: 'Create a right triangle (90° angle)', target: 90, property: 'angle', tolerance: 5, difficulty: 'hard', category: 'advanced' },
    { id: '8', description: 'Make an equilateral triangle (all sides equal)', target: 1, property: 'ratio', tolerance: 0.1, difficulty: 'hard', category: 'advanced' },
    { id: '9', description: 'Create a square (rectangle with equal sides)', target: 1, property: 'ratio', tolerance: 0.05, difficulty: 'medium', category: 'advanced' },
    
    // Creative challenges
    { id: '10', description: 'Make the largest possible triangle that fits in the canvas', target: 80, property: 'area', tolerance: 5, difficulty: 'hard', category: 'creative' },
    { id: '11', description: 'Create a triangle with one very acute angle (< 30°)', target: 25, property: 'angle', tolerance: 5, difficulty: 'hard', category: 'creative' },
    { id: '12', description: 'Make a rectangle with a 2:1 width to height ratio', target: 2, property: 'ratio', tolerance: 0.2, difficulty: 'medium', category: 'creative' },
  ];

  // Shape calculations with scaling
  const calculateTriangleArea = (vertices: [Point, Point, Point]): number => {
    const [a, b, c] = vertices;
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2) * SCALE_FACTOR;
  };

  const calculateTrianglePerimeter = (vertices: [Point, Point, Point]): number => {
    const [a, b, c] = vertices;
    const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);
    const ca = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2);
    return (ab + bc + ca) * SCALE_FACTOR;
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
    return width * height * SCALE_FACTOR;
  };

  const calculateRectanglePerimeter = (vertices: [Point, Point, Point, Point]): number => {
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[2].y - vertices[1].y);
    return 2 * (width + height) * SCALE_FACTOR;
  };

  const calculateCircleArea = (radius: number): number => {
    return Math.PI * radius ** 2 * SCALE_FACTOR;
  };

  const calculateCircleCircumference = (radius: number): number => {
    return 2 * Math.PI * radius * SCALE_FACTOR;
  };

  // Enhanced property calculations
  const getShapeProperties = () => {
    if (currentShape.type === 'triangle') {
      const area = calculateTriangleArea(currentShape.vertices);
      const perimeter = calculateTrianglePerimeter(currentShape.vertices);
      const angles = calculateTriangleAngles(currentShape.vertices);
      
      // Additional properties
      const sides = [
        Math.sqrt((currentShape.vertices[1].x - currentShape.vertices[0].x) ** 2 + (currentShape.vertices[1].y - currentShape.vertices[0].y) ** 2) * SCALE_FACTOR,
        Math.sqrt((currentShape.vertices[2].x - currentShape.vertices[1].x) ** 2 + (currentShape.vertices[2].y - currentShape.vertices[1].y) ** 2) * SCALE_FACTOR,
        Math.sqrt((currentShape.vertices[0].x - currentShape.vertices[2].x) ** 2 + (currentShape.vertices[0].y - currentShape.vertices[2].y) ** 2) * SCALE_FACTOR
      ];
      const isRightTriangle = angles.some(angle => Math.abs(angle - 90) < 5);
      const isEquilateral = Math.abs(sides[0] - sides[1]) < 0.5 && Math.abs(sides[1] - sides[2]) < 0.5;
      
      return { area, perimeter, angles, sides, isRightTriangle, isEquilateral };
    } else if (currentShape.type === 'rectangle') {
      const area = calculateRectangleArea(currentShape.vertices);
      const perimeter = calculateRectanglePerimeter(currentShape.vertices);
      const width = Math.abs(currentShape.vertices[1].x - currentShape.vertices[0].x) * SCALE_FACTOR;
      const height = Math.abs(currentShape.vertices[2].y - currentShape.vertices[1].y) * SCALE_FACTOR;
      const ratio = width / height;
      const isSquare = Math.abs(ratio - 1) < 0.1;
      
      return { area, perimeter, width, height, ratio, isSquare };
    } else {
      const area = calculateCircleArea(currentShape.radius);
      const circumference = calculateCircleCircumference(currentShape.radius);
      const diameter = currentShape.radius * 2 * SCALE_FACTOR;
      
      return { area, circumference, diameter, radius: currentShape.radius * SCALE_FACTOR };
    }
  };

  // Canvas drawing functions
  const drawShape = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 600, 400);
    
    // Enhanced canvas background with animated grid
    ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
    ctx.fillRect(0, 0, 600, 400);
    
    // Animated grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 600; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 400);
      ctx.stroke();
    }
    for (let i = 0; i < 400; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(600, i);
      ctx.stroke();
    }

    // Enhanced shape drawing with better gradients
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.7)');
    gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.7)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#4F46E5';
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

      // Enhanced vertices with larger resize handles
      currentShape.vertices.forEach((vertex, index) => {
        // Glow effect
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Border
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner highlight
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FECACA';
        ctx.fill();
      });

      // Add resize handles on edges
      const midpoints = [
        { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 },
        { x: (c.x + a.x) / 2, y: (c.y + a.y) / 2 }
      ];

      midpoints.forEach((midpoint, index) => {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(midpoint.x, midpoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

    } else if (currentShape.type === 'rectangle') {
      const [topLeft, topRight, bottomRight, bottomLeft] = currentShape.vertices;
      ctx.beginPath();
      ctx.rect(topLeft.x, topLeft.y, topRight.x - topLeft.x, bottomRight.y - topRight.y);
      ctx.fill();
      ctx.stroke();

      // Corner handles
      currentShape.vertices.forEach((vertex) => {
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FECACA';
        ctx.fill();
      });

      // Edge handles for easier resizing
      const edgeHandles = [
        { x: (topLeft.x + topRight.x) / 2, y: topLeft.y }, // top
        { x: topRight.x, y: (topRight.y + bottomRight.y) / 2 }, // right
        { x: (bottomLeft.x + bottomRight.x) / 2, y: bottomRight.y }, // bottom
        { x: topLeft.x, y: (topLeft.y + bottomLeft.y) / 2 } // left
      ];

      edgeHandles.forEach((handle) => {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

    } else {
      ctx.beginPath();
      ctx.arc(currentShape.center.x, currentShape.center.y, currentShape.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Center handle
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(currentShape.center.x, currentShape.center.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Multiple radius controls for easier resizing
      const radiusControls = [
        { x: currentShape.center.x + currentShape.radius, y: currentShape.center.y },
        { x: currentShape.center.x - currentShape.radius, y: currentShape.center.y },
        { x: currentShape.center.x, y: currentShape.center.y + currentShape.radius },
        { x: currentShape.center.x, y: currentShape.center.y - currentShape.radius }
      ];

      radiusControls.forEach((control) => {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(control.x, control.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
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
        
        if (isDragging.index === 0) {
          newVertices[0] = { x: newX, y: newY };
          newVertices[1] = { x: topRight.x, y: newY };
          newVertices[3] = { x: newX, y: bottomLeft.y };
        } else if (isDragging.index === 1) {
          newVertices[1] = { x: newX, y: newY };
          newVertices[0] = { x: topLeft.x, y: newY };
          newVertices[2] = { x: newX, y: bottomRight.y };
        } else if (isDragging.index === 2) {
          newVertices[2] = { x: newX, y: newY };
          newVertices[1] = { x: newX, y: topRight.y };
          newVertices[3] = { x: bottomLeft.x, y: newY };
        } else {
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
        setFeedback(`💡 Hint: Make it ${direction}! You need ${Math.abs(difference).toFixed(1)} more units.`);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 4000);
      }
      
      setTimeout(() => setActivePowerUp(null), type === 'doublePoints' ? 30000 : 10000);
    }
  };

  // Enhanced challenge mode
  const startChallenge = (difficulty?: string) => {
    let filteredChallenges = challenges;
    if (difficulty) {
      filteredChallenges = challenges.filter(c => c.difficulty === difficulty);
    }
    
    const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
    setCurrentChallenge(randomChallenge);
    setChallengeMode(true);
    setFeedback('');
    setShowFeedback(false);
    
    if (challengesCompleted > 0 && challengesCompleted % 3 === 0) {
      const powerUpTypes = ['hint', 'precision', 'timeFreeze', 'doublePoints'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPowerUps(prev => ({ ...prev, [randomPowerUp]: prev[randomPowerUp] + 1 }));
    }
  };

  // Enhanced challenge checking with math facts
  const checkChallenge = () => {
    if (!currentChallenge) return;

    const properties = getShapeProperties();
    let currentValue = 0;
    let isSuccess = false;

    switch (currentChallenge.property) {
      case 'area':
        currentValue = properties.area;
        break;
      case 'perimeter':
        currentValue = properties.perimeter || 0;
        break;
      case 'circumference':
        currentValue = (properties as any).circumference || 0;
        break;
      case 'angle':
        if (currentShape.type === 'triangle') {
          const angles = (properties as any).angles;
          if (currentChallenge.target === 90) {
            isSuccess = (properties as any).isRightTriangle;
          } else {
            currentValue = Math.min(...angles);
            isSuccess = Math.abs(currentValue - currentChallenge.target) <= currentChallenge.tolerance;
          }
        }
        break;
      case 'ratio':
        if (currentShape.type === 'rectangle') {
          currentValue = (properties as any).ratio;
          if (currentChallenge.target === 1) {
            isSuccess = (properties as any).isSquare;
          } else {
            isSuccess = Math.abs(currentValue - currentChallenge.target) <= currentChallenge.tolerance;
          }
        } else if (currentShape.type === 'triangle' && currentChallenge.target === 1) {
          isSuccess = (properties as any).isEquilateral;
        }
        break;
    }

    if (currentChallenge.property !== 'angle' && currentChallenge.property !== 'ratio') {
      const difference = Math.abs(currentValue - currentChallenge.target);
      const tolerance = activePowerUp === 'precision' ? currentChallenge.tolerance * 2 : currentChallenge.tolerance;
      isSuccess = difference <= tolerance;
    }

    if (isSuccess) {
      const basePoints = currentChallenge.difficulty === 'hard' ? 150 : currentChallenge.difficulty === 'medium' ? 100 : 75;
      const streakBonus = streak * 10;
      const timeBonus = challengeTime < 30 ? 50 : challengeTime < 60 ? 25 : 0;
      const totalPoints = Math.round(basePoints + streakBonus + timeBonus);
      
      addScore(totalPoints);
      setStreak(prev => prev + 1);
      setChallengesCompleted(prev => prev + 1);
      
      // Show math facts after successful completion
      setCurrentMathFactsShape(currentShape.type);
      setShowMathFacts(true);
      
      if (currentChallenge.difficulty === 'hard') {
        setPerfectSolutions(prev => prev + 1);
        setFeedback('🎯 PERFECT! Master-level achievement!');
      } else {
        setFeedback('🎉 Excellent work! Challenge completed!');
      }
      
      checkAchievements(true, challengeTime);
    } else {
      setStreak(0);
      if (currentChallenge.property === 'area' || currentChallenge.property === 'perimeter' || currentChallenge.property === 'circumference') {
        if (currentValue > currentChallenge.target) {
          setFeedback('📏 Too big! Make it smaller.');
        } else {
          setFeedback('📐 Too small! Make it bigger.');
        }
      } else {
        setFeedback('🎯 Keep trying! You\'re getting closer!');
      }
    }

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  // New features
  const saveToHistory = () => {
    setShapeHistory(prev => [...prev, { ...currentShape }].slice(-5)); // Keep last 5 shapes
  };

  const loadFromHistory = (shape: Shape) => {
    setCurrentShape(shape);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header with floating animations */}
      <motion.header 
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 shadow-2xl relative overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black opacity-10" />
        
        {/* Floating geometric shapes animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white opacity-20"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                clipPath: i % 3 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 
                         i % 3 === 1 ? 'circle(50%)' : 
                         'rect(0px, 0px, 16px, 16px)'
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                🔺 Shape Explorer: Interactive Geometry Playground 🔵
              </h1>
              <p className="text-xl text-indigo-100">
                Level up your geometry skills through hands-on exploration!
              </p>
            </motion.div>
            <motion.div 
              className="text-right"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="text-sm text-indigo-200">Next-Gen Learning</div>
              <div className="text-2xl font-bold">Level {level}</div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Enhanced Game Stats */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
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

            <Timer 
              isActive={challengeMode} 
              onTimeUpdate={setChallengeTime} 
            />

            <RandomShapeGenerator 
              onGenerateShape={setCurrentShape} 
            />

            {/* Enhanced Shape Selection */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="mr-2">🎯</span> Shape Toolkit
              </h3>
              <div className="space-y-3">
                <motion.button
                  onClick={createTriangle}
                  className={`w-full p-4 rounded-xl font-semibold transition-all transform ${
                    currentShape.type === 'triangle'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-102 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: currentShape.type !== 'triangle' ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🔺 Triangle Explorer
                </motion.button>
                <motion.button
                  onClick={createRectangle}
                  className={`w-full p-4 rounded-xl font-semibold transition-all transform ${
                    currentShape.type === 'rectangle'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:scale-102 border-2 border-gray-200 hover:border-green-300'
                  }`}
                  whileHover={{ scale: currentShape.type !== 'rectangle' ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⬜ Rectangle Builder
                </motion.button>
                <motion.button
                  onClick={createCircle}
                  className={`w-full p-4 rounded-xl font-semibold transition-all transform ${
                    currentShape.type === 'circle'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:scale-102 border-2 border-gray-200 hover:border-purple-300'
                  }`}
                  whileHover={{ scale: currentShape.type !== 'circle' ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ⭕ Circle Crafter
                </motion.button>
              </div>
            </div>

            {/* Shape History */}
            {shapeHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">📚</span> Shape History
                </h3>
                <div className="space-y-2">
                  {shapeHistory.slice(-3).map((shape, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(shape)}
                      className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left text-sm transition-colors"
                    >
                      {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} #{shapeHistory.length - index}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Main Canvas Area */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <span className="mr-3">🎨</span> Interactive Canvas
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={saveToHistory}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                  >
                    📝 Save Shape
                  </button>
                  {activePowerUp && (
                    <motion.span 
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {activePowerUp} Active! ⚡
                    </motion.span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="border-4 border-gradient-to-r from-blue-200 to-purple-200 rounded-2xl bg-gradient-to-br from-blue-25 to-purple-25 cursor-pointer shadow-inner w-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                <motion.div 
                  className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-xl p-4 text-sm text-gray-700 shadow-lg backdrop-blur-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center">
                    <span className="mr-2">💡</span>
                    <span className="font-semibold">Drag the larger glowing dots to resize easily!</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Graph Visualization */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GraphVisualization 
                shapeType={currentShape.type} 
                currentProperties={properties} 
              />
            </motion.div>
          </motion.div>

          {/* Right Sidebar - Enhanced Properties & Challenges */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Enhanced Properties Display */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 border border-gray-100"
              layout
            >
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">📊</span> Shape Analytics
              </h3>
              <div className="space-y-4">
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border-l-4 border-blue-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`area-${properties.area}`}
                >
                  <div className="text-sm font-semibold text-blue-700 flex items-center">
                    <span className="mr-2">📐</span> Area
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {properties.area.toFixed(1)} sq units
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {currentShape.type === 'triangle' && 'Formula: ½ × base × height'}
                    {currentShape.type === 'rectangle' && 'Formula: length × width'}
                    {currentShape.type === 'circle' && 'Formula: π × radius²'}
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border-l-4 border-green-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`perimeter-${properties.perimeter || (properties as any).circumference}`}
                >
                  <div className="text-sm font-semibold text-green-700 flex items-center">
                    <span className="mr-2">📏</span> {currentShape.type === 'circle' ? 'Circumference' : 'Perimeter'}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {((properties.perimeter || (properties as any).circumference) || 0).toFixed(1)} units
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {currentShape.type === 'triangle' && 'Sum of all three sides'}
                    {currentShape.type === 'rectangle' && 'Formula: 2 × (length + width)'}
                    {currentShape.type === 'circle' && 'Formula: 2 × π × radius'}
                  </div>
                </motion.div>

                {/* Enhanced shape-specific properties */}
                {currentShape.type === 'triangle' && (properties as any).angles && (
                  <motion.div 
                    className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-5 rounded-xl border-l-4 border-yellow-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-sm font-semibold text-yellow-700 flex items-center">
                      <span className="mr-2">📐</span> Angles & Properties
                    </div>
                    <div className="text-sm font-bold text-yellow-900 space-y-1">
                      {(properties as any).angles.map((angle: number, index: number) => (
                        <div key={index}>∠{index + 1}: {angle.toFixed(1)}°</div>
                      ))}
                    </div>
                    <div className="text-xs text-yellow-600 mt-2 space-y-1">
                      <div>Sum: {(properties as any).angles.reduce((sum: number, angle: number) => sum + angle, 0).toFixed(1)}°</div>
                      {(properties as any).isRightTriangle && <div className="text-orange-600 font-medium">✓ Right Triangle!</div>}
                      {(properties as any).isEquilateral && <div className="text-purple-600 font-medium">✓ Equilateral!</div>}
                    </div>
                  </motion.div>
                )}

                {currentShape.type === 'rectangle' && (
                  <motion.div 
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border-l-4 border-purple-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-sm font-semibold text-purple-700 flex items-center">
                      <span className="mr-2">📏</span> Dimensions
                    </div>
                    <div className="text-sm font-bold text-purple-900 space-y-1">
                      <div>Width: {(properties as any).width.toFixed(1)} units</div>
                      <div>Height: {(properties as any).height.toFixed(1)} units</div>
                      <div>Ratio: {(properties as any).ratio.toFixed(2)}:1</div>
                    </div>
                    {(properties as any).isSquare && (
                      <div className="text-xs text-purple-600 mt-2 font-medium">✓ Perfect Square!</div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Enhanced Challenge Mode */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">🎯</span> Challenge Hub
              </h3>
              {!challengeMode ? (
                <div className="space-y-4">
                  <motion.button
                    onClick={() => startChallenge('easy')}
                    className="w-full p-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-bold text-lg hover:from-green-500 hover:to-green-600 transition-all shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🟢 Easy Challenge
                  </motion.button>
                  <motion.button
                    onClick={() => startChallenge('medium')}
                    className="w-full p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🟡 Medium Challenge
                  </motion.button>
                  <motion.button
                    onClick={() => startChallenge('hard')}
                    className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🔴 Hard Challenge
                  </motion.button>
                  <motion.button
                    onClick={() => startChallenge()}
                    className="w-full p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🎲 Random Challenge
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-xl border-l-4 border-orange-500">
                    <div className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
                      <span className="mr-2">🎯</span> {currentChallenge?.difficulty.toUpperCase()} Challenge:
                    </div>
                    <div className="text-sm text-orange-900 font-semibold mb-3">{currentChallenge?.description}</div>
                    <div className="text-xs text-orange-600 flex justify-between items-center">
                      <span>Streak: {streak} | Completed: {challengesCompleted}</span>
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">
                        {currentChallenge?.category}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setChallengeMode(false)}
                    className="w-full p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
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
      </div>

      {/* Math Facts Modal */}
      <MathFacts 
        shapeType={currentMathFactsShape}
        isVisible={showMathFacts}
        onClose={() => setShowMathFacts(false)}
      />

      {/* Achievement Banner */}
      <AchievementBanner 
        achievement={newAchievement} 
        onClose={() => setNewAchievement(null)} 
      />

      {/* Enhanced Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed top-24 right-6 bg-white border-l-4 border-blue-500 rounded-xl shadow-2xl p-6 max-w-sm z-40 backdrop-blur-sm"
            initial={{ x: 400, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-lg font-semibold text-gray-800">{feedback}</div>
            {activePowerUp === 'doublePoints' && (
              <div className="text-sm text-yellow-600 mt-2 font-medium">⚡ Double Points Active!</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
