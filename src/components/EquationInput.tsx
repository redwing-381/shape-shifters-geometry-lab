
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, ChartLine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EquationInputProps {
  isVisible: boolean;
  onClose: () => void;
}

const EquationInput = ({ isVisible, onClose }: EquationInputProps) => {
  const [equation, setEquation] = useState('');
  const [graphData, setGraphData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const parseEquation = (eq: string, x: number): number => {
    try {
      // Simple equation parser for basic functions
      let expression = eq.toLowerCase().replace(/x/g, x.toString());
      
      // Handle common math functions
      expression = expression.replace(/sin\(/g, 'Math.sin(');
      expression = expression.replace(/cos\(/g, 'Math.cos(');
      expression = expression.replace(/tan\(/g, 'Math.tan(');
      expression = expression.replace(/log\(/g, 'Math.log(');
      expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
      expression = expression.replace(/abs\(/g, 'Math.abs(');
      expression = expression.replace(/\^/g, '**');
      
      // Use Function constructor for evaluation (safer than eval)
      const func = new Function('return ' + expression);
      const result = func();
      
      return isFinite(result) ? result : 0;
    } catch (e) {
      return 0;
    }
  };

  const generateGraph = () => {
    if (!equation.trim()) {
      setError('Please enter an equation');
      return;
    }

    try {
      const data = [];
      for (let x = -10; x <= 10; x += 0.5) {
        const y = parseEquation(equation, x);
        if (isFinite(y) && Math.abs(y) < 100) {
          data.push({ x: x, y: y });
        }
      }
      
      if (data.length === 0) {
        setError('Invalid equation or no valid points generated');
        return;
      }
      
      setGraphData(data);
      setError('');
    } catch (e) {
      setError('Error parsing equation. Please check syntax.');
    }
  };

  const presetEquations = [
    { name: 'Linear', equation: '2*x + 1', description: 'y = 2x + 1', formula: 'y = mx + b (Slope-intercept form)' },
    { name: 'Quadratic', equation: 'x*x - 4', description: 'y = x² - 4', formula: 'y = ax² + bx + c (Standard form)' },
    { name: 'Cubic', equation: 'x*x*x - 3*x', description: 'y = x³ - 3x', formula: 'y = ax³ + bx² + cx + d' },
    { name: 'Sine Wave', equation: 'sin(x)', description: 'y = sin(x)', formula: 'y = A·sin(Bx + C) + D' },
    { name: 'Cosine Wave', equation: 'cos(x)', description: 'y = cos(x)', formula: 'y = A·cos(Bx + C) + D' },
    { name: 'Exponential', equation: '2**x', description: 'y = 2^x', formula: 'y = a·b^x (exponential growth)' },
    { name: 'Square Root', equation: 'sqrt(x)', description: 'y = √x', formula: 'y = √(ax + b)' },
    { name: 'Absolute Value', equation: 'abs(x)', description: 'y = |x|', formula: 'y = |ax + b|' }
  ];

  return (
    <motion.div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${!isVisible ? 'pointer-events-none' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: isVisible ? 1 : 0.8, y: isVisible ? 0 : 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4 backdrop-blur-sm">
                <ChartLine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">Interactive Equation Grapher</h3>
                <p className="text-blue-100 mt-1">Visualize mathematical functions with real-time graphing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  ✏️ Enter your equation (use 'x' as variable):
                </label>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={equation}
                    onChange={(e) => setEquation(e.target.value)}
                    placeholder="e.g., x*x + 2*x + 1"
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && generateGraph()}
                  />
                  <motion.button
                    onClick={generateGraph}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Graph It!
                  </motion.button>
                </div>
                {error && (
                  <motion.p 
                    className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
              </div>

              {/* Preset Equations */}
              <div>
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📚</span>Preset Equations & Formulas:
                </h4>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {presetEquations.map((preset, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setEquation(preset.equation);
                        setError('');
                      }}
                      className="p-4 bg-gray-50 hover:bg-blue-50 rounded-xl text-left transition-all border-2 border-gray-200 hover:border-blue-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800">{preset.name}</div>
                        <div className="text-sm text-blue-600 font-mono bg-blue-100 px-2 py-1 rounded">
                          {preset.description}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 italic">
                        📐 General form: {preset.formula}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mathematical Functions Help */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>Supported Mathematical Functions:
                </h4>
                <div className="text-sm text-yellow-700 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold">Basic Operations:</div>
                      <div>• Addition: +</div>
                      <div>• Subtraction: -</div>
                      <div>• Multiplication: *</div>
                      <div>• Division: /</div>
                      <div>• Powers: x^2 or x**2</div>
                    </div>
                    <div>
                      <div className="font-semibold">Advanced Functions:</div>
                      <div>• Trigonometric: sin(x), cos(x), tan(x)</div>
                      <div>• Square root: sqrt(x)</div>
                      <div>• Absolute value: abs(x)</div>
                      <div>• Natural log: log(x)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Section - Fixed Container */}
            <div className="flex flex-col">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📊</span>Graph Visualization:
              </h4>
              <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200 min-h-[400px] max-h-[500px]">
                {graphData.length > 0 ? (
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={graphData} margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                        <CartesianGrid stroke="#bbb" strokeDasharray="1 3" vertical={true} horizontal={true} />
                        <XAxis 
                          dataKey="x" 
                          stroke="#111"
                          fontSize={12}
                          domain={[-10, 10]}
                          tickCount={11}
                          axisLine={{ stroke: '#111', strokeWidth: 2 }}
                          tickLine={{ stroke: '#111', strokeWidth: 1 }}
                          label={{ value: 'x', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          stroke="#111" 
                          fontSize={12}
                          domain={[-10, 10]}
                          tickCount={11}
                          axisLine={{ stroke: '#111', strokeWidth: 2 }}
                          tickLine={{ stroke: '#111', strokeWidth: 1 }}
                          label={{ value: 'y', angle: -90, position: 'insideLeft' }}
                        />
                        <ReferenceLine x={0} stroke="#000" strokeWidth={3} />
                        <ReferenceLine y={0} stroke="#000" strokeWidth={3} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#f8fafc', 
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                          formatter={(value, name) => [Number(value).toFixed(3), 'y-value']}
                          labelFormatter={(label) => `x = ${Number(label).toFixed(3)}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={false}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <ChartLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Enter an equation above to see its graph</p>
                      <p className="text-sm mt-2">Try one of the preset equations to get started!</p>
                    </div>
                  </div>
                )}
              </div>
              
              {equation && graphData.length > 0 && (
                <motion.div 
                  className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-lg text-green-800 font-bold mb-2">
                    ✅ Current equation: y = {equation}
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>📈 Graph shows {graphData.length} data points from x = -10 to x = 10</div>
                    <div>🎯 Domain: [-10, 10] | Range: [{Math.min(...graphData.map(d => d.y)).toFixed(2)}, {Math.max(...graphData.map(d => d.y)).toFixed(2)}]</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Tip */}
          <div className="mt-6 text-center">
            <motion.div 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-purple-700 font-semibold">
                🚀 Pro Tip: Experiment with different equations to discover mathematical patterns!
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EquationInput;
