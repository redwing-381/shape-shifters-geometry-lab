import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface GraphVisualizationProps {
  shapeType: 'triangle' | 'rectangle' | 'circle';
  currentProperties: any;
}

const GraphVisualization = ({ shapeType, currentProperties }: GraphVisualizationProps) => {
  // Generate data points for visualization
  const generateGraphData = () => {
    const data = [];
    
    if (shapeType === 'circle') {
      // Show how area changes with radius
      for (let r = 1; r <= 20; r++) {
        data.push({
          radius: r,
          area: Math.PI * r * r * 0.01, // scaled like in the app
          circumference: 2 * Math.PI * r * 0.01
        });
      }
    } else if (shapeType === 'rectangle') {
      // Show how area changes with width (keeping height constant at 10)
      for (let w = 1; w <= 20; w++) {
        const height = 10;
        data.push({
          width: w,
          area: w * height * 0.01,
          perimeter: 2 * (w + height) * 0.01
        });
      }
    } else {
      // Triangle: show relationship between base and area (keeping height at 10)
      for (let base = 1; base <= 20; base++) {
        const height = 10;
        data.push({
          base: base,
          area: 0.5 * base * height * 0.01,
          perimeter: base + 2 * Math.sqrt((base/2)**2 + height**2) * 0.01
        });
      }
    }
    
    return data;
  };

  const data = generateGraphData();

  const getEquations = () => {
    switch (shapeType) {
      case 'circle':
        return [
          'Area = π × r²',
          'Circumference = 2 × π × r',
          `Current: A = ${currentProperties.area?.toFixed(1)}, C = ${currentProperties.circumference?.toFixed(1)}`
        ];
      case 'rectangle':
        return [
          'Area = length × width',
          'Perimeter = 2 × (l + w)',
          `Current: A = ${currentProperties.area?.toFixed(1)}, P = ${currentProperties.perimeter?.toFixed(1)}`
        ];
      case 'triangle':
        return [
          'Area = ½ × base × height',
          'Perimeter = a + b + c',
          `Current: A = ${currentProperties.area?.toFixed(1)}, P = ${currentProperties.perimeter?.toFixed(1)}`
        ];
      default:
        return [];
    }
  };

  const equations = getEquations();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        📊 Mathematical Relationships
      </h3>
      
      {/* Equations */}
      <div className="mb-6 space-y-2">
        {equations.map((equation, index) => (
          <motion.div
            key={index}
            className={`p-3 rounded-lg font-mono text-sm ${
              index === equations.length - 1 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-gray-50 text-gray-700'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {equation}
          </motion.div>
        ))}
      </div>
      
      {/* Graph */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={shapeType === 'circle' ? 'radius' : shapeType === 'rectangle' ? 'width' : 'base'}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="area"
              stroke="#3b82f6"
              fill="url(#areaGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Graph shows how area changes with {shapeType === 'circle' ? 'radius' : shapeType === 'rectangle' ? 'width' : 'base'}
      </div>
    </motion.div>
  );
};

export default GraphVisualization;
