
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Shape {
  type: 'triangle' | 'rectangle' | 'circle';
  vertices?: any;
  center?: any;
  radius?: number;
}

interface ShapeComparisonProps {
  currentShape: Shape;
  shapeHistory: Shape[];
}

const ShapeComparison = ({ currentShape, shapeHistory }: ShapeComparisonProps) => {
  const SCALE_FACTOR = 0.01;

  const calculateShapeProperties = (shape: Shape) => {
    if (shape.type === 'triangle' && shape.vertices) {
      const [a, b, c] = shape.vertices;
      const area = Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2) * SCALE_FACTOR;
      const ab = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
      const bc = Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2);
      const ca = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2);
      const perimeter = (ab + bc + ca) * SCALE_FACTOR;
      return { area, perimeter };
    } else if (shape.type === 'rectangle' && shape.vertices) {
      const width = Math.abs(shape.vertices[1].x - shape.vertices[0].x);
      const height = Math.abs(shape.vertices[2].y - shape.vertices[1].y);
      const area = width * height * SCALE_FACTOR;
      const perimeter = 2 * (width + height) * SCALE_FACTOR;
      return { area, perimeter };
    } else if (shape.type === 'circle' && shape.radius) {
      const area = Math.PI * shape.radius ** 2 * SCALE_FACTOR;
      const perimeter = 2 * Math.PI * shape.radius * SCALE_FACTOR;
      return { area, perimeter };
    }
    return { area: 0, perimeter: 0 };
  };

  const currentProps = calculateShapeProperties(currentShape);
  
  const comparisonData = [
    {
      name: 'Current Shape',
      area: Number(currentProps.area.toFixed(1)),
      perimeter: Number(currentProps.perimeter.toFixed(1)),
      type: currentShape.type
    }
  ];

  // Add last 3 shapes from history for comparison
  shapeHistory.slice(-3).forEach((shape, index) => {
    const props = calculateShapeProperties(shape);
    comparisonData.push({
      name: `Shape ${shapeHistory.length - index}`,
      area: Number(props.area.toFixed(1)),
      perimeter: Number(props.perimeter.toFixed(1)),
      type: shape.type
    });
  });

  const getShapeEmoji = (type: string) => {
    switch (type) {
      case 'triangle': return '🔺';
      case 'rectangle': return '⬜';
      case 'circle': return '⭕';
      default: return '📐';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        🔄 Shape Comparison
      </h3>
      
      {comparisonData.length > 1 ? (
        <>
          {/* Comparison Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
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
                <Legend />
                <Bar 
                  dataKey="area" 
                  fill="#3b82f6" 
                  name="Area (sq units)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="perimeter" 
                  fill="#10b981" 
                  name="Perimeter (units)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">Shape</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Area</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Perimeter</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((shape, index) => {
                  const efficiency = shape.perimeter > 0 ? (shape.area / shape.perimeter).toFixed(2) : '0';
                  return (
                    <tr 
                      key={index} 
                      className={`border-t ${index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-3 font-medium">
                        {index === 0 && <span className="text-blue-600">→ </span>}
                        {shape.name}
                      </td>
                      <td className="p-3">
                        {getShapeEmoji(shape.type)} {shape.type}
                      </td>
                      <td className="p-3">{shape.area} sq units</td>
                      <td className="p-3">{shape.perimeter} units</td>
                      <td className="p-3">{efficiency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Insights:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>• Current shape has an area of {currentProps.area.toFixed(1)} square units</div>
              <div>• Efficiency ratio (area/perimeter): {(currentProps.area / currentProps.perimeter).toFixed(2)}</div>
              <div>• Circles typically have the highest area-to-perimeter ratio</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>Create more shapes to see comparisons!</p>
          <p className="text-sm mt-2">Draw different shapes and save them to compare their properties.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ShapeComparison;
