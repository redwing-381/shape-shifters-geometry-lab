
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, Function } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    { name: 'Linear', equation: '2*x + 1', description: 'y = 2x + 1' },
    { name: 'Quadratic', equation: 'x*x - 4', description: 'y = x² - 4' },
    { name: 'Cubic', equation: 'x*x*x - 3*x', description: 'y = x³ - 3x' },
    { name: 'Sine Wave', equation: 'sin(x)', description: 'y = sin(x)' },
    { name: 'Cosine Wave', equation: 'cos(x)', description: 'y = cos(x)' },
    { name: 'Exponential', equation: '2**x', description: 'y = 2^x' },
    { name: 'Square Root', equation: 'sqrt(x)', description: 'y = √x' },
    { name: 'Absolute Value', equation: 'abs(x)', description: 'y = |x|' }
  ];

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
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Function className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Equation Grapher</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter your equation (use 'x' as variable):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="e.g., x*x + 2*x + 1"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && generateGraph()}
                />
                <button
                  onClick={generateGraph}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Graph
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Preset Equations:</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetEquations.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEquation(preset.equation);
                      setError('');
                    }}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="font-medium text-gray-800">{preset.name}</div>
                    <div className="text-sm text-gray-600">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Supported Functions:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• Basic operations: +, -, *, /</div>
                <div>• Powers: x^2 or x**2</div>
                <div>• Trigonometric: sin(x), cos(x), tan(x)</div>
                <div>• Other: sqrt(x), abs(x), log(x)</div>
              </div>
            </div>
          </div>

          {/* Graph Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Graph Visualization:</h4>
            <div className="h-80 bg-gray-50 rounded-lg p-4">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="x" 
                      stroke="#666"
                      fontSize={12}
                      domain={['dataMin', 'dataMax']}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [Number(value).toFixed(2), 'y']}
                      labelFormatter={(label) => `x = ${Number(label).toFixed(2)}`}
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Function className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Enter an equation to see its graph</p>
                  </div>
                </div>
              )}
            </div>
            
            {equation && graphData.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>Current equation:</strong> y = {equation}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Graph shows {graphData.length} data points from x = -10 to x = 10
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EquationInput;
