import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Get backend URL from environment variable
const API = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001') + '/api';

function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [executionResults, setExecutionResults] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') !== 'false');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('results');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSessionSelect = async (session) => {
    setCurrentSession(session);
    try {
      const response = await axios.get(`${API}/sessions/${session.id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API}/sessions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newSession = response.data;
      setSessions([...sessions, newSession]);
      setCurrentSession(newSession);
      setMessages([]);
      setUploading(false);
      fetchSessions();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    const userMessage = { role: 'user', content: newMessage };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/sessions/${currentSession.id}/chat`, {
        message: newMessage,
        api_key: apiKey
      });

      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.detail || 'Failed to send message'}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleExecuteCode = async (code) => {
    if (!currentSession) return;

    try {
      const response = await axios.post(`${API}/sessions/${currentSession.id}/execute`, {
        code: code
      });

      const result = {
        id: Date.now(),
        code: code,
        output: response.data.output,
        error: response.data.error,
        image: response.data.image,
        timestamp: new Date().toLocaleTimeString()
      };

      setExecutionResults(prev => [...prev, result]);
      setActiveTab('results');
    } catch (error) {
      console.error('Error executing code:', error);
      const errorResult = {
        id: Date.now(),
        code: code,
        output: '',
        error: error.response?.data?.detail || 'Execution failed',
        timestamp: new Date().toLocaleTimeString()
      };
      setExecutionResults(prev => [...prev, errorResult]);
      setActiveTab('results');
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiModal(false);
  };

  // Enhanced Message Parser and Renderer
  const parseAndRenderAIResponse = (content) => {
    const sections = [];
    let currentSection = { type: 'text', content: '' };
    
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```python')) {
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        inCodeBlock = true;
        codeContent = '';
        currentSection = { type: 'text', content: '' };
        continue;
      }
      
      if (line.startsWith('```') && inCodeBlock) {
        sections.push({ type: 'code', content: codeContent, title: 'Python Code' });
        inCodeBlock = false;
        codeContent = '';
        currentSection = { type: 'text', content: '' };
        continue;
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }
      
      // Detect analysis/suggestion patterns
      if (line.toLowerCase().includes('analysis') || 
          line.toLowerCase().includes('describe') ||
          line.toLowerCase().includes('summary') ||
          line.toLowerCase().includes('overview') ||
          line.toLowerCase().includes('statistics')) {
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = { type: 'analysis', content: line + '\n', title: 'Data Analysis' };
        continue;
      }
      
      if (line.toLowerCase().includes('suggest') || 
          line.toLowerCase().includes('recommend') ||
          line.toLowerCase().includes('you can') ||
          line.toLowerCase().includes('would you like') ||
          line.toLowerCase().includes('potential') ||
          line.toLowerCase().includes('visualization')) {
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = { type: 'suggestion', content: line + '\n', title: 'Suggestions' };
        continue;
      }
      
      currentSection.content += line + '\n';
    }
    
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections.map(section => ({
      ...section,
      content: section.type === 'code' ? section.content : convertMarkdownToHTML(section.content)
    }));
  };

  const convertMarkdownToHTML = (text) => {
    if (text.includes('import ') || 
        text.includes('def ') || 
        text.includes('print(') ||
        text.includes('plt.') ||
        text.includes('df.') ||
        text.includes('np.') ||
        text.includes('pd.') ||
        text.includes('>>>') ||
        text.includes('...') ||
        text.includes('Traceback') ||
        text.includes('Error:') ||
        text.includes('  File ') ||
        /^\s*\d+\.\d+\s+\d+\.\d+/.test(text) ||
        /^\s*[A-Za-z_]\w*\s*=/.test(text) ||
        text.includes('dtype:') ||
        text.includes('Index:') ||
        text.includes('[') && text.includes(']') && text.includes('dtype')) {
      return text;
    }
    
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/###\s*(.*?)(?=\n|$)/g, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/##\s*(.*?)(?=\n|$)/g, '<h2 class="text-xl font-semibold mb-2">$1</h2>')
      .replace(/#{1,6}\s*(.*?)(?=\n|$)/g, '<h1 class="text-2xl font-bold mb-3">$1</h1>')
      .replace(/^\*\s+(.*)$/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/(\d+\.\s*[A-Z][^.]*:)/g, '<strong>$1</strong>')
      .replace(/^([A-Z][^.]*:)$/gm, '<strong>$1</strong>')
      .trim();
  };

  // Modern Code Block Component
  const CodeBlock = ({ code, onExecute, title }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const codeLines = code.split('\n');
    const shouldTruncate = codeLines.length > 10;
    const displayedCode = shouldTruncate && !isExpanded ? codeLines.slice(0, 10).join('\n') : code;

    return (
      <div className="code-block mb-4">
        <div className="code-header">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-300 ml-2">{title}</span>
          </div>
          <button
            onClick={() => onExecute(code)}
            className="btn-primary text-sm px-3 py-1"
          >
            Run
          </button>
        </div>
        <div className="code-content relative">
          <pre className="text-sm leading-relaxed overflow-x-auto">
            {displayedCode}
          </pre>
          {shouldTruncate && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-3 text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-gray-800 border border-gray-600 px-4 py-2 rounded-full transition-all duration-200"
              >
                {isExpanded ? 'Show Less' : `Show ${codeLines.length - 10} More Lines`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Modern Analysis Block Component
  const AnalysisBlock = ({ title, children, icon = "📊" }) => {
    return (
      <div className="analysis-block">
        <div className="analysis-header">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{icon}</span>
            <h4 className="text-sm font-semibold">{title}</h4>
          </div>
        </div>
        <div className="analysis-content">
          {children}
        </div>
      </div>
    );
  };

  // Modern Suggestion Block Component
  const SuggestionBlock = ({ title, children, icon = "💡" }) => {
    return (
      <div className="analysis-block">
        <div className="analysis-header">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{icon}</span>
            <h4 className="text-sm font-semibold">{title}</h4>
          </div>
        </div>
        <div className="analysis-content">
          {children}
        </div>
      </div>
    );
  };

  // Message Renderer
  const MessageRenderer = ({ message }) => {
    if (message.role === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="user-message message-enter">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      );
    }
    
    const sections = parseAndRenderAIResponse(message.content);
    
    return (
      <div className="flex justify-start mb-6">
        <div className="assistant-message message-enter">
          <div className="space-y-3">
            {sections.map((section, index) => {
              switch (section.type) {
                case 'code':
                  return (
                    <CodeBlock 
                      key={index} 
                      code={section.content.trim()} 
                      onExecute={handleExecuteCode} 
                      title={section.title}
                    />
                  );
                
                case 'analysis':
                  return (
                    <AnalysisBlock key={index} title={section.title} icon="📊">
                      <div 
                        className="prose prose-sm max-w-none prose-invert"
                        dangerouslySetInnerHTML={{ __html: section.content.trim() }}
                      />
                    </AnalysisBlock>
                  );
                
                case 'suggestion':
                  return (
                    <SuggestionBlock key={index} title={section.title} icon="💡">
                      <div 
                        className="prose prose-sm max-w-none prose-invert"
                        dangerouslySetInnerHTML={{ __html: section.content.trim() }}
                      />
                    </SuggestionBlock>
                  );
                
                default:
                  return (
                    <div key={index} className="text-sm leading-relaxed">
                      <div 
                        className="prose prose-sm max-w-none prose-invert"
                        dangerouslySetInnerHTML={{ __html: section.content.trim() }}
                      />
                    </div>
                  );
              }
            })}
          </div>
        </div>
      </div>
    );
  };

  // Loading Component
  const LoadingMessage = () => (
    <div className="flex justify-start mb-4">
      <div className="assistant-message">
        <div className="flex items-center space-x-2">
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <span className="text-sm text-gray-400">AI is thinking...</span>
        </div>
      </div>
    </div>
  );

  // Upload Area Component
  const UploadArea = () => (
    <div className="upload-area" onDragOver={(e) => e.preventDefault()}>
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl text-gray-500">📊</div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Upload CSV Dataset</h3>
          <p className="text-sm text-gray-400 mb-4">
            Drag and drop your CSV file here or click to browse
          </p>
          <label className="btn-primary cursor-pointer">
            Choose File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        {uploading && (
          <div className="flex items-center space-x-2">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            <span className="text-sm text-gray-400">Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );

  // API Key Modal
  const ApiKeyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Enter Gemini API Key</h3>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          className="chat-input w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => setShowApiModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button onClick={saveApiKey} className="btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app min-h-screen flex">
      {/* Sidebar */}
      <div className={`sidebar flex-shrink-0 w-64 h-screen flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-lg font-semibold text-white">AI Statistical Analysis</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <UploadArea />
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Sessions</h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session)}
                className={`sidebar-item cursor-pointer p-3 rounded-lg text-sm ${
                  currentSession?.id === session.id ? 'active' : ''
                }`}
              >
                <div className="font-medium text-white truncate">
                  {session.filename || 'New Session'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                ☰
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">
              {currentSession ? currentSession.filename : 'Select a dataset to start'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiModal(true)}
              className={`btn-secondary text-sm ${apiKey ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {apiKey ? '🔑 API Key Set' : '🔑 Set API Key'}
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {currentSession ? (
                <>
                  {messages.map((message, index) => (
                    <MessageRenderer key={index} message={message} />
                  ))}
                  {isLoading && <LoadingMessage />}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl text-gray-600 mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Welcome to AI Statistical Analysis
                    </h3>
                    <p className="text-gray-500">
                      Upload a CSV dataset to start analyzing your data with AI
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {currentSession && (
              <div className="border-t border-gray-700 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your data..."
                    className="chat-input flex-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="btn-primary"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          {rightPanelOpen && currentSession && (
            <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
              <div className="border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Results</h3>
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`text-sm px-3 py-1 rounded ${
                      activeTab === 'results' ? 'bg-blue-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    Code Results
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`text-sm px-3 py-1 rounded ${
                      activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {activeTab === 'results' ? (
                  <div className="space-y-4">
                    {executionResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">⚡</div>
                        <p className="text-sm">No code executed yet</p>
                      </div>
                    ) : (
                      executionResults.slice().reverse().map((result) => (
                        <div key={result.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="text-xs text-gray-400 mb-2">{result.timestamp}</div>
                          {result.output && (
                            <div className="bg-green-900 text-green-100 p-2 rounded text-sm mb-2">
                              <pre className="whitespace-pre-wrap">{result.output}</pre>
                            </div>
                          )}
                          {result.error && (
                            <div className="bg-red-900 text-red-100 p-2 rounded text-sm mb-2">
                              <pre className="whitespace-pre-wrap">{result.error}</pre>
                            </div>
                          )}
                          {result.image && (
                            <div className="mt-2">
                              <img 
                                src={`data:image/png;base64,${result.image}`} 
                                alt="Plot" 
                                className="max-w-full h-auto rounded"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-sm">Analysis history coming soon</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiModal && <ApiKeyModal />}
    </div>
  );
}

export default App;