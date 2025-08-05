import React from 'react';

const Documentation = ({ darkMode, onClose }) => {
  return (
    <div className="documentation-page h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📚</div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Documentation
          </h1>
        </div>
        <button
          onClick={onClose}
          className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Tech Stack Section */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🛠️ Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Frontend */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  <span className="mr-2">⚛️</span>
                  Frontend
                </h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    React 19.0.0
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    React Router DOM 7.7.1
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Tailwind CSS 3.4.17
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Axios 1.8.4
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    CRACO 7.1.0
                  </li>
                </ul>
              </div>

              {/* Backend */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <span className="mr-2">🐍</span>
                  Backend
                </h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    FastAPI 0.110.1
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Uvicorn 0.25.0
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Pydantic 2.6.4+
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Python-dotenv 1.0.1+
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Emergent Integrations
                  </li>
                </ul>
              </div>

              {/* Database & AI */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  <span className="mr-2">🗄️</span>
                  Database & AI
                </h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    MongoDB 4.5.0
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    ChromaDB 1.0.15+
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Google Gemini LLM
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Sentence Transformers 5.0.0+
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Analysis Libraries */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Data Analysis & Scientific Libraries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Core Libraries */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  <span className="mr-2">🔢</span>
                  Core Data Science
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Pandas 2.2.0+</div>
                    <div className="text-xs text-gray-500">Data manipulation</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">NumPy 1.26.0+</div>
                    <div className="text-xs text-gray-500">Numerical computing</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">SciPy 1.11.0+</div>
                    <div className="text-xs text-gray-500">Scientific computing</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Scikit-learn 1.3.0+</div>
                    <div className="text-xs text-gray-500">Machine learning</div>
                  </div>
                </div>
              </div>

              {/* Visualization Libraries */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  <span className="mr-2">📈</span>
                  Visualization
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Matplotlib 3.7.0+</div>
                    <div className="text-xs text-gray-500">Static plotting</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Plotly 5.17.0+</div>
                    <div className="text-xs text-gray-500">Interactive plots</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Seaborn 0.12.0+</div>
                    <div className="text-xs text-gray-500">Statistical plots</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Bokeh 3.3.0+</div>
                    <div className="text-xs text-gray-500">Web-based viz</div>
                  </div>
                </div>
              </div>

              {/* Medical & Statistical */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  <span className="mr-2">🏥</span>
                  Medical & Statistical
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Lifelines 0.27.0+</div>
                    <div className="text-xs text-gray-500">Survival analysis</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Statsmodels 0.14.0+</div>
                    <div className="text-xs text-gray-500">Statistical models</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Great Expectations</div>
                    <div className="text-xs text-gray-500">Data validation</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">YData Profiling</div>
                    <div className="text-xs text-gray-500">Data profiling</div>
                  </div>
                </div>
              </div>

              {/* Specialized Libraries */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                  <span className="mr-2">🎯</span>
                  Specialized Tools
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">NetworkX 3.0.0+</div>
                    <div className="text-xs text-gray-500">Network analysis</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">WordCloud 1.9.0+</div>
                    <div className="text-xs text-gray-500">Text visualization</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">ForestPlot 0.3.0+</div>
                    <div className="text-xs text-gray-500">Forest plots</div>
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="font-medium">Sweetviz 2.3.0+</div>
                    <div className="text-xs text-gray-500">EDA automation</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Architecture Overview */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🏗️ Architecture Overview
            </h2>
            <div className={`p-6 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              
              {/* Architecture Diagram (Text-based) */}
              <div className={`p-4 rounded-lg font-mono text-sm ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'} mb-4`}>
                <pre className="overflow-x-auto">
{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   FastAPI       │    │   MongoDB       │
│   (Port 3000)    │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (Port 8001)   │    │                 │
│ • 3-Panel UI    │    │ • API Endpoints │    │ • Sessions      │
│ • File Upload   │    │ • Code Execution│    │ • Messages      │
│ • Chat Interface│    │ • LLM Integration│    │ • Analysis Data │
│ • Data Preview  │    │ • RAG Service   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        
                       ┌─────────────────┐    ┌─────────────────┐
                       │   ChromaDB      │    │   Google Gemini │
                       │   Vector Store  │    │   LLM Service   │
                       │                 │    │                 │
                       │ • RAG Retrieval │    │ • Chat Response │
                       │ • Embeddings    │    │ • Analysis      │
                       │ • Semantic      │    │ • Suggestions   │
                       │   Search        │    │                 │
                       └─────────────────┘    └─────────────────┘`}
                </pre>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🎯 Key Features</h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• 3-Panel Notebook-style Interface</li>
                    <li>• RAG-Enhanced AI Chat with ChromaDB</li>
                    <li>• Julius AI-Style Sectioned Execution</li>
                    <li>• Medical Data Analysis Tools</li>
                    <li>• Python Code Execution Sandbox</li>
                    <li>• Advanced Statistical Libraries</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>🔧 Technical Details</h4>
                  <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li>• RESTful API with FastAPI</li>
                    <li>• WebSocket support for real-time updates</li>
                    <li>• Vector similarity search</li>
                    <li>• Containerized deployment ready</li>
                    <li>• Environment-based configuration</li>
                    <li>• Comprehensive error handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🔌 API Endpoints
            </h2>
            <div className="space-y-4">
              
              {/* Sessions */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Sessions Management</h4>
                <div className="space-y-2 text-sm">
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-blue-500">GET</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions</span> - List all sessions
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-green-500">POST</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions</span> - Create session (CSV upload)
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-blue-500">GET</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions/{'{id}'}</span> - Get session details
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Analysis & Chat</h4>
                <div className="space-y-2 text-sm">
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-green-500">POST</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions/{'{id}'}/chat</span> - Chat with AI
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-green-500">POST</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions/{'{id}'}/execute</span> - Execute Python code
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-900' : 'bg-white'} font-mono`}>
                    <span className="text-green-500">POST</span> <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>/api/sessions/{'{id}'}/suggest-analysis</span> - Get AI suggestions
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Environment Variables */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🔐 Environment Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Frontend (.env)</h4>
                <pre className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'}`}>
REACT_APP_BACKEND_URL=http://localhost:8001
                </pre>
              </div>
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Backend (.env)</h4>
                <pre className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'}`}>
MONGO_URL=mongodb://localhost:27017
DB_NAME=statistical_analysis_db
GEMINI_API_KEY=your_api_key_here
                </pre>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Documentation;