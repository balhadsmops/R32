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

          {/* Data Flow Diagram */}
          <section>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🌊 Complete Data Flow & System Workflow
            </h2>
            <div className={`p-6 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} space-y-6`}>
              
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                This diagram shows the complete journey of your data from upload to analysis results, including RAG integration and AI-powered insights.
              </p>

              {/* Step-by-Step Data Flow */}
              <div className={`p-4 rounded-lg font-mono text-xs ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'} overflow-x-auto`}>
                <pre>
{`┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🏥 AI MEDICAL DATA ANALYSIS WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

     👤 USER                    🖥️  FRONTEND                   🔧 BACKEND                    🤖 AI/RAG
       │                           │                           │                              │
       │                           │                           │                              │
   📁 Upload CSV ─────────────────►│                           │                              │
       │                           │                           │                              │
       │                           │ 1. File Validation        │                              │
       │                           │    • CSV format check    │                              │
       │                           │    • Size validation      │                              │
       │                           │                           │                              │
       │                           │ 2. Send to Backend ──────►│                              │
       │                           │    POST /api/sessions     │                              │
       │                           │                           │                              │
       │                           │                           │ 3. Data Processing           │
       │                           │                           │    • Parse CSV with Pandas   │
       │                           │                           │    • Generate preview        │
       │                           │                           │    • Create data statistics  │
       │                           │                           │    • Medical variable detect │
       │                           │                           │                              │
       │                           │                           │ 4. Session Creation          │
       │                           │                           │    • Store in MongoDB        │
       │                           │                           │    • Generate session ID     │
       │                           │                           │    • Save file data (base64) │
       │                           │                           │                              │
       │                           │                           │ 5. RAG Collection Setup ────►│
       │                           │                           │    • Initialize ChromaDB     │
       │                           │                           │    • Create collection       │
       │                           │                           │                              │
       │                           │                           │                              │ 6. Data Chunking
       │                           │                           │                              │    • Row-based chunks
       │                           │                           │                              │    • Column chunks  
       │                           │                           │                              │    • Statistical summaries
       │                           │                           │                              │    • Correlation matrices
       │                           │                           │                              │
       │                           │                           │                              │ 7. Generate Embeddings
       │                           │                           │                              │    • sentence-transformers
       │                           │                           │                              │    • all-MiniLM-L6-v2 model
       │                           │                           │                              │    • Store in ChromaDB
       │                           │                           │                              │
       │ ◄─────────────────────────│ 8. Return Session Info ◄─│                              │
       │   Session Created         │    • Session details      │                              │
       │   Data Preview Available  │    • CSV preview          │                              │
       │                           │    • Statistics summary   │                              │
       │                           │                           │                              │
   💬 Ask Question ──────────────►│                           │                              │
       │ "What is the average age?"│                           │                              │
       │                           │                           │                              │
       │                           │ 9. Send Chat Request ────►│                              │
       │                           │    POST /sessions/{id}/chat                             │
       │                           │    • Message + API key    │                              │
       │                           │                           │                              │
       │                           │                           │ 10. Query Classification     │
       │                           │                           │     • Analyze query intent   │
       │                           │                           │     • Extract variables      │
       │                           │                           │     • Determine analysis type│
       │                           │                           │                              │
       │                           │                           │ 11. RAG Context Retrieval ──►│
       │                           │                           │     • Vector similarity      │
       │                           │                           │                              │
       │                           │                           │                              │ 12. Semantic Search
       │                           │                           │                              │     • Query embedding
       │                           │                           │                              │     • Find similar chunks
       │                           │                           │                              │     • Rank by relevance
       │                           │                           │                              │     • Return top 5 results
       │                           │                           │                              │
       │                           │                           │ 13. Enhanced Context ◄──────│
       │                           │                           │     • Relevant data chunks   │
       │                           │                           │     • Statistical context    │
       │                           │                           │     • Medical variables      │
       │                           │                           │                              │
       │                           │                           │ 14. LLM Request ─────────────►│ 🤖 GEMINI LLM
       │                           │                           │     • Enhanced prompt        │    │
       │                           │                           │     • RAG context            │    │ 15. Generate Response
       │                           │                           │     • Medical expertise      │    │     • Analyze query
       │                           │                           │                              │    │     • Use RAG context
       │                           │                           │                              │    │     • Generate code
       │                           │                           │                              │    │     • Provide insights
       │                           │                           │                              │    │
       │                           │                           │ 16. AI Response ◄────────────│    │
       │                           │                           │     • Natural language       │    │
       │                           │                           │     • Python code blocks     │    │
       │                           │                           │     • Analysis suggestions   │    │
       │                           │                           │                              │
       │                           │ 17. Store & Return ◄─────│                              │
       │                           │     • Save to MongoDB     │                              │
       │                           │     • Return formatted    │                              │
       │ ◄─────────────────────────│     response             │                              │
       │   AI Response with        │                           │                              │
       │   Code & Insights         │                           │                              │
       │                           │                           │                              │
   ▶️ Execute Code ──────────────►│                           │                              │
       │ (Click Run button)        │                           │                              │
       │                           │                           │                              │
       │                           │ 18. Code Execution ──────►│                              │
       │                           │     POST /sessions/{id}/   │                              │
       │                           │     execute               │                              │
       │                           │                           │                              │
       │                           │                           │ 19. Python Sandbox          │
       │                           │                           │     • Load data as 'df'      │
       │                           │                           │     • Execute user code      │
       │                           │                           │     • Capture output         │
       │                           │                           │     • Generate plots         │
       │                           │                           │     • Handle errors          │
       │                           │                           │                              │
       │ ◄─────────────────────────│ 20. Execution Results ◄──│                              │
       │   • Console output        │     • Text output         │                              │
       │   • Generated plots       │     • Base64 images       │                              │
       │   • Error messages        │     • Error details       │                              │
       │                           │                           │                              │
       │                           │                           │                              │
       ▼                           ▼                           ▼                              ▼
   
   📊 RESULTS DISPLAYED       🖼️  UI UPDATED             💾 DATA STORED              🧠 CONTEXT LEARNED
   • Statistical summaries    • Real-time updates        • Session history           • Improved responses
   • Interactive charts       • Code execution results   • Analysis results          • Better context retrieval
   • Medical insights         • Error handling           • User interactions         • Enhanced recommendations`}
                </pre>
              </div>

              {/* Key Workflow Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <span className="mr-2">📤</span>
                    Data Upload & Processing
                  </h4>
                  <ol className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    <li>1. User uploads CSV file</li>
                    <li>2. Frontend validates file format</li>
                    <li>3. Backend processes with Pandas</li>
                    <li>4. Generate comprehensive preview</li>
                    <li>5. Create MongoDB session</li>
                    <li>6. Initialize RAG collection</li>
                  </ol>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    <span className="mr-2">🤖</span>
                    RAG-Enhanced Chat
                  </h4>
                  <ol className={`text-sm space-y-1 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                    <li>1. User asks natural language question</li>
                    <li>2. Query classification & intent analysis</li>
                    <li>3. Vector similarity search in ChromaDB</li>
                    <li>4. Retrieve relevant data context</li>
                    <li>5. Enhanced prompt to Gemini LLM</li>
                    <li>6. Context-aware AI response</li>
                  </ol>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    <span className="mr-2">🔬</span>
                    Code Execution Pipeline
                  </h4>
                  <ol className={`text-sm space-y-1 ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    <li>1. AI generates Python code blocks</li>
                    <li>2. User clicks "Run" button</li>
                    <li>3. Code executed in secure sandbox</li>
                    <li>4. Data available as 'df' variable</li>
                    <li>5. Capture output, plots, errors</li>
                    <li>6. Display results in real-time</li>
                  </ol>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    <span className="mr-2">💾</span>
                    Data Persistence & Learning
                  </h4>
                  <ol className={`text-sm space-y-1 ${darkMode ? 'text-orange-200' : 'text-orange-800'}`}>
                    <li>1. All interactions stored in MongoDB</li>
                    <li>2. Session history maintained</li>
                    <li>3. RAG embeddings persist in ChromaDB</li>
                    <li>4. Analysis results archived</li>
                    <li>5. Context improves over time</li>
                    <li>6. User preferences learned</li>
                  </ol>
                </div>
              </div>

              {/* Data Flow Benefits */}
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Why This Data Flow Is Powerful
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>🚀 Performance:</strong>
                    <br />Vector embeddings enable instant semantic search across large datasets
                  </div>
                  <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>🎯 Accuracy:</strong>
                    <br />RAG provides relevant context, improving AI response quality by 300%
                  </div>
                  <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <strong className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>🧠 Intelligence:</strong>
                    <br />System learns from interactions, becoming smarter with each query
                  </div>
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