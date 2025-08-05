import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Documentation from './components/Documentation';
import FAQ from './components/FAQ';

// Get backend URL from environment variable
const API = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001') + '/api';

// Gemini models available
const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)', description: 'Fast and efficient for most tasks' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model for complex tasks' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Balanced performance and speed' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'High capability for complex reasoning' }
];

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
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('gemini_model') || 'gemini-2.5-flash');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') !== 'false');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'data'
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    scrollToBottom();
    // Apply dark mode class to body
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.className = newMode ? 'dark' : 'light';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestAnalysis = async () => {
    if (!currentSession || !apiKey) {
      setShowApiModal(true);
      return;
    }

    setIsLoading(true);
    setNewMessage('');

    try {
      const response = await axios.post(
        `${API}/sessions/${currentSession.id}/suggest-analysis`,
        {},
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );

      const assistantMessage = { role: 'assistant', content: response.data.suggestions };
      setMessages([...messages, assistantMessage]);
    } catch (error) {
      console.error('Error getting analysis suggestions:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while generating analysis suggestions. Please try again.' 
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Create a test session with dummy data for connection testing
      const testData = {
        message: 'Test connection',
        gemini_api_key: apiKey.trim(),
        model: selectedModel
      };

      // Use a simple endpoint that doesn't require a session
      const response = await axios.post(`${API}/test-connection`, testData, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setConnectionStatus({ 
          success: true, 
          message: `✅ Connection successful! Using ${selectedModel}`,
          model: selectedModel
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      
      let errorMessage = '❌ Connection failed. ';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage += 'Invalid API key or request format.';
        } else if (error.response.status === 429) {
          errorMessage += 'Rate limit exceeded. Try again later.';
        } else if (error.response.status === 401) {
          errorMessage += 'Invalid or expired API key.';
        } else {
          errorMessage += `Server error (${error.response.status}).`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. Please check your internet connection.';
      } else {
        errorMessage += 'Network error. Please check your connection.';
      }

      setConnectionStatus({ 
        success: false, 
        message: errorMessage
      });
    } finally {
      setIsTestingConnection(false);
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
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('gemini_api_key', apiKey);

      const response = await axios.post(`${API}/sessions/${currentSession.id}/chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiModal(false);
  };

  const saveSettings = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('gemini_model', selectedModel);
    setShowSettingsModal(false);
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
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-96 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-2xl`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Enter Gemini API Key</h3>
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

  // Settings Modal
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-[500px] border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h3>
          <button
            onClick={() => setShowSettingsModal(false)}
            className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} text-xl`}
          >
            ×
          </button>
        </div>
        
        {/* Theme Toggle */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Theme
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-900'
              }`}
            >
              <span>{darkMode ? '🌙' : '☀️'}</span>
              <span className="text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* Gemini Model Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Gemini Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {GEMINI_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {GEMINI_MODELS.find(m => m.id === selectedModel)?.description}
          </p>
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Gemini API Key
          </label>
          <div className="flex space-x-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className={`flex-1 px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
          </p>
        </div>

        {/* Connection Test */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Test Connection
          </label>
          <button
            onClick={testConnection}
            disabled={!apiKey || isTestingConnection}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !apiKey || isTestingConnection
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTestingConnection ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Testing Connection...</span>
              </div>
            ) : (
              `Test Connection with ${GEMINI_MODELS.find(m => m.id === selectedModel)?.name || 'Selected Model'}`
            )}
          </button>
          
          {connectionStatus && (
            <div className={`mt-2 p-3 rounded-lg text-sm ${
              connectionStatus.success 
                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus.message}
              {connectionStatus.response_preview && (
                <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Response preview:</strong> {connectionStatus.response_preview}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  // SPSS-Like Data Preview and Variable Management Component
  const DataPreviewTable = ({ sessionId, apiKey }) => {
    // View state
    const [viewMode, setViewMode] = useState('data'); // 'data' or 'variable'
    
    // Data view states
    const [data, setData] = useState([]);
    const [qualityInfo, setQualityInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [filters, setFilters] = useState({});
    const [showCleaning, setShowCleaning] = useState(false);
    const [dataStats, setDataStats] = useState(null);
    
    // Variable view states
    const [variables, setVariables] = useState([]);
    const [editingVariable, setEditingVariable] = useState(null);
    const [editingCell, setEditingCell] = useState(null);
    
    // Missing data suggestions states
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState({});
    const [applyingSuggestions, setApplyingSuggestions] = useState(false);

    // Load data preview (existing functionality)
    const loadDataPreview = async (page = 1, sort = null, direction = 'asc', appliedFilters = {}) => {
      if (!sessionId) return;
      
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('page', page);
        formData.append('page_size', '50');
        if (sort) formData.append('sort_column', sort);
        formData.append('sort_direction', direction);
        if (Object.keys(appliedFilters).length > 0) {
          formData.append('filters', JSON.stringify(appliedFilters));
        }

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/data-preview`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          setData(result.data);
          setCurrentPage(result.current_page);
          setTotalPages(result.total_pages);
          setQualityInfo(result.quality_info);
        } else {
          console.error('Failed to load data preview');
        }
      } catch (error) {
        console.error('Error loading data preview:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load variable metadata
    const loadVariableMetadata = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/variable-metadata`);
        if (response.ok) {
          const result = await response.json();
          setVariables(result.variables);
        }
      } catch (error) {
        console.error('Error loading variable metadata:', error);
      }
    };

    // Save variable metadata
    const saveVariableMetadata = async (updatedVariables) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/variable-metadata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            variables: updatedVariables
          })
        });

        if (response.ok) {
          setVariables(updatedVariables);
        } else {
          console.error('Failed to save variable metadata');
        }
      } catch (error) {
        console.error('Error saving variable metadata:', error);
      }
    };

    // Load missing data suggestions
    const loadMissingSuggestions = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/missing-suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            threshold_percentage: 5.0 // Suggest for columns with >5% missing
          })
        });

        if (response.ok) {
          const result = await response.json();
          setSuggestions(result.suggestions);
          setShowSuggestions(result.suggestions.length > 0);
        }
      } catch (error) {
        console.error('Error loading missing suggestions:', error);
      }
    };

    // Apply selected suggestions
    const applySuggestions = async () => {
      if (Object.keys(selectedSuggestions).length === 0) return;
      
      setApplyingSuggestions(true);
      try {
        const accepted_suggestions = Object.entries(selectedSuggestions)
          .filter(([_, label]) => label)
          .map(([column_name, label_to_apply]) => ({ column_name, label_to_apply }));

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/apply-suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            accepted_suggestions
          })
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Applied ${result.total_filled} missing data labels successfully!`);
          setShowSuggestions(false);
          setSelectedSuggestions({});
          loadDataPreview(); // Refresh data
        }
      } catch (error) {
        console.error('Error applying suggestions:', error);
        alert('Error applying suggestions');
      } finally {
        setApplyingSuggestions(false);
      }
    };

    // Edit cell data
    const editCell = async (rowIndex, columnName, newValue) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/edit-cell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            row_index: rowIndex,
            column_name: columnName,
            new_value: newValue
          })
        });

        if (response.ok) {
          loadDataPreview(); // Refresh data
          setEditingCell(null);
        } else {
          console.error('Failed to edit cell');
        }
      } catch (error) {
        console.error('Error editing cell:', error);
      }
    };

    const loadDataQuality = async () => {
      if (!sessionId) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/data-quality`, {
          method: 'POST'
        });

        if (response.ok) {
          const result = await response.json();
          setDataStats(result.dataset_stats);
        }
      } catch (error) {
        console.error('Error loading data quality:', error);
      }
    };

    useEffect(() => {
      if (sessionId) {
        loadDataPreview();
        loadDataQuality();
        loadVariableMetadata();
        loadMissingSuggestions();
      }
    }, [sessionId]);

    const handleSort = (column) => {
      const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortColumn(column);
      setSortDirection(newDirection);
      loadDataPreview(1, column, newDirection, filters);
    };

    const handleFilter = (column, value) => {
      const newFilters = { ...filters, [column]: value };
      setFilters(newFilters);
      loadDataPreview(1, sortColumn, sortDirection, newFilters);
    };

    const clearFilters = () => {
      setFilters({});
      loadDataPreview(1, sortColumn, sortDirection, {});
    };

    if (!sessionId) {
      return (
        <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Select a session to view data preview</p>
        </div>
      );
    }

    return (
      <div className="spss-data-container h-full flex flex-col">
        {/* Header with View Toggle */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              SPSS-Style Data Manager
            </h3>
            
            {/* View Toggle Buttons */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => setViewMode('data')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'data'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Data View
              </button>
              <button
                onClick={() => setViewMode('variable')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'variable'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Variable View
              </button>
            </div>
            
            {dataStats && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dataStats.total_rows.toLocaleString()} rows × {dataStats.total_columns} columns
                {dataStats.missing_percentage > 0 && (
                  <span className="ml-2 text-yellow-600">
                    • {dataStats.missing_percentage.toFixed(1)}% missing
                  </span>
                )}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            {suggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
              >
                💡 Missing Data Suggestions ({suggestions.length})
              </button>
            )}
            
            <button
              onClick={() => setShowCleaning(!showCleaning)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCleaning
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showCleaning ? 'Hide Cleaning' : 'Show Cleaning'}
            </button>
            
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Missing Data Suggestions Modal */}
        {showSuggestions && (
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🤖 AI Missing Data Suggestions
              </h4>
              <button
                onClick={() => setShowSuggestions(false)}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ✕ Close
              </button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div key={index} className={`p-3 rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {suggestion.column_name}
                        </span>
                        <span className="text-sm text-red-500">
                          ({suggestion.missing_count} missing • {suggestion.missing_percentage}%)
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.rationale}
                      </p>
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder={suggestion.suggested_label}
                          value={selectedSuggestions[suggestion.column_name] || suggestion.suggested_label}
                          onChange={(e) => setSelectedSuggestions(prev => ({
                            ...prev,
                            [suggestion.column_name]: e.target.value
                          }))}
                          className={`w-full px-3 py-1 text-sm rounded border ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSuggestions[suggestion.column_name] !== undefined}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSuggestions(prev => ({
                            ...prev,
                            [suggestion.column_name]: suggestion.suggested_label
                          }));
                        } else {
                          const newSelected = { ...selectedSuggestions };
                          delete newSelected[suggestion.column_name];
                          setSelectedSuggestions(newSelected);
                        }
                      }}
                      className="ml-3"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => {
                  const allSelected = {};
                  suggestions.forEach(s => {
                    allSelected[s.column_name] = s.suggested_label;
                  });
                  setSelectedSuggestions(allSelected);
                }}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Select All
              </button>
              <button
                onClick={applySuggestions}
                disabled={Object.keys(selectedSuggestions).length === 0 || applyingSuggestions}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {applyingSuggestions ? 'Applying...' : `Apply Selected (${Object.keys(selectedSuggestions).length})`}
              </button>
            </div>
          </div>
        )}

        {/* Data Quality Summary */}
        {dataStats && (
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dataStats.total_rows.toLocaleString()}
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Rows</div>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${dataStats.missing_percentage > 10 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dataStats.missing_percentage.toFixed(1)}%
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Missing Data</div>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${dataStats.duplicate_rows > 0 ? 'text-yellow-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dataStats.duplicate_rows}
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duplicates</div>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dataStats.memory_usage.toFixed(2)} MB
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Memory Usage</div>
              </div>
            </div>
          </div>
        )}

        {/* Cleaning Interface */}
        {showCleaning && (
          <DataCleaningInterface 
            sessionId={sessionId} 
            apiKey={apiKey} 
            onDataCleaned={() => {
              loadDataPreview();
              loadMissingSuggestions(); // Refresh suggestions after cleaning
            }} 
            qualityInfo={qualityInfo}
            darkMode={darkMode}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'data' ? (
            // DATA VIEW - Excel-like table
            <div className="data-view">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              ) : data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={`w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-xs bg-gray-200 text-gray-600">ROW</th>
                        {data[0] && Object.keys(data[0]).map((column, index) => {
                          const colQuality = qualityInfo.find(q => q.column_name === column);
                          return (
                            <th key={index} className="px-4 py-3 text-left min-w-32">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSort(column)}
                                  className={`flex items-center space-x-1 hover:${darkMode ? 'text-white' : 'text-gray-900'} transition-colors`}
                                >
                                  <span className="font-medium truncate max-w-24" title={column}>{column}</span>
                                  {sortColumn === column && (
                                    <span className="text-blue-500">
                                      {sortDirection === 'asc' ? '↑' : '↓'}
                                    </span>
                                  )}
                                </button>
                                {colQuality && (
                                  <div className="flex space-x-1">
                                    {colQuality.missing_percentage > 10 && (
                                      <span className="w-2 h-2 bg-red-500 rounded-full" title="High missing data"></span>
                                    )}
                                    {colQuality.outliers_count > 0 && (
                                      <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Contains outliers"></span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                {colQuality?.data_type}
                                {colQuality && colQuality.missing_count > 0 && (
                                  <span className="ml-1 text-red-400">
                                    ({colQuality.missing_percentage.toFixed(1)}% missing)
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr 
                          key={rowIndex} 
                          className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <td className="px-4 py-2 text-xs bg-gray-100 text-gray-600 font-mono">
                            {(currentPage - 1) * 50 + rowIndex + 1}
                          </td>
                          {Object.entries(row).map(([column, value], cellIndex) => {
                            const isEditing = editingCell?.row === rowIndex && editingCell?.column === column;
                            
                            return (
                              <td key={cellIndex} className="px-4 py-2 relative">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingCell.value}
                                    onChange={(e) => setEditingCell({...editingCell, value: e.target.value})}
                                    onBlur={() => {
                                      editCell(rowIndex, column, editingCell.value);
                                    }}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        editCell(rowIndex, column, editingCell.value);
                                      } else if (e.key === 'Escape') {
                                        setEditingCell(null);
                                      }
                                    }}
                                    className={`w-full px-2 py-1 text-sm border rounded ${
                                      darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    autoFocus
                                  />
                                ) : (
                                  <div 
                                    className="max-w-xs truncate cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                                    onClick={() => setEditingCell({
                                      row: rowIndex,
                                      column: column,
                                      value: value === null || value === undefined ? '' : String(value)
                                    })}
                                    title="Click to edit"
                                  >
                                    {value === null || value === undefined || value === '' ? (
                                      <span className={`italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        null
                                      </span>
                                    ) : (
                                      <span>{String(value)}</span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No data available</p>
                </div>
              )}
            </div>
          ) : (
            // VARIABLE VIEW - SPSS-style metadata table
            <div className="variable-view">
              {variables.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={`w-full text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
                      <tr>
                        <th className="px-3 py-3 text-left font-medium">Name</th>
                        <th className="px-3 py-3 text-left font-medium">Type</th>
                        <th className="px-3 py-3 text-left font-medium">Width</th>
                        <th className="px-3 py-3 text-left font-medium">Decimals</th>
                        <th className="px-3 py-3 text-left font-medium">Label</th>
                        <th className="px-3 py-3 text-left font-medium">Values</th>
                        <th className="px-3 py-3 text-left font-medium">Missing</th>
                        <th className="px-3 py-3 text-left font-medium">Columns</th>
                        <th className="px-3 py-3 text-left font-medium">Align</th>
                        <th className="px-3 py-3 text-left font-medium">Measure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variables.map((variable, index) => {
                        const isEditing = editingVariable === index;
                        
                        return (
                          <tr 
                            key={index} 
                            className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setEditingVariable(isEditing ? null : index)}
                          >
                            {/* Variable Name */}
                            <td className="px-3 py-3 font-medium">
                              <span className="font-mono text-blue-600">{variable.name}</span>
                            </td>
                            
                            {/* Type */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <select
                                  value={variable.type}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].type = e.target.value;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  <option value="Numeric">Numeric</option>
                                  <option value="String">String</option>
                                </select>
                              ) : (
                                <span className={variable.type === 'Numeric' ? 'text-green-600' : 'text-orange-600'}>
                                  {variable.type}
                                </span>
                              )}
                            </td>
                            
                            {/* Width */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={variable.width}
                                  min="1"
                                  max="255"
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].width = parseInt(e.target.value) || 8;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-16 px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span>{variable.width}</span>
                              )}
                            </td>
                            
                            {/* Decimals */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={variable.decimals}
                                  min="0"
                                  max="16"
                                  disabled={variable.type !== 'Numeric'}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].decimals = parseInt(e.target.value) || 0;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-16 px-2 py-1 text-sm border rounded ${
                                    variable.type !== 'Numeric' ? 'opacity-50 cursor-not-allowed' : ''
                                  } ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span className={variable.type !== 'Numeric' ? 'text-gray-400' : ''}>
                                  {variable.type === 'Numeric' ? variable.decimals : '-'}
                                </span>
                              )}
                            </td>
                            
                            {/* Label */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={variable.label}
                                  placeholder="Variable description"
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].label = e.target.value;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span className="text-gray-600 italic">{variable.label || 'No label'}</span>
                              )}
                            </td>
                            
                            {/* Values (Value Labels) */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  placeholder="1=Yes, 2=No"
                                  value={Object.entries(variable.values).map(([k,v]) => `${k}=${v}`).join(', ')}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    const valueMap = {};
                                    if (e.target.value.trim()) {
                                      e.target.value.split(',').forEach(pair => {
                                        const [key, value] = pair.split('=').map(s => s.trim());
                                        if (key && value) valueMap[key] = value;
                                      });
                                    }
                                    updatedVariables[index].values = valueMap;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span className="text-sm text-purple-600">
                                  {Object.keys(variable.values).length > 0 
                                    ? Object.entries(variable.values).map(([k,v]) => `${k}=${v}`).join(', ')
                                    : 'None'
                                  }
                                </span>
                              )}
                            </td>
                            
                            {/* Missing Values */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  placeholder="99, -999"
                                  value={variable.missing.join(', ')}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].missing = e.target.value 
                                      ? e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                      : [];
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-full px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span className="text-sm text-red-600">
                                  {variable.missing.length > 0 ? variable.missing.join(', ') : 'None'}
                                </span>
                              )}
                            </td>
                            
                            {/* Columns */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={variable.columns}
                                  min="1"
                                  max="255"
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].columns = parseInt(e.target.value) || 8;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`w-16 px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                />
                              ) : (
                                <span>{variable.columns}</span>
                              )}
                            </td>
                            
                            {/* Align */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <select
                                  value={variable.align}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].align = e.target.value;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  <option value="Left">Left</option>
                                  <option value="Right">Right</option>
                                  <option value="Center">Center</option>
                                </select>
                              ) : (
                                <span>{variable.align}</span>
                              )}
                            </td>
                            
                            {/* Measure */}
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <select
                                  value={variable.measure}
                                  onChange={(e) => {
                                    const updatedVariables = [...variables];
                                    updatedVariables[index].measure = e.target.value;
                                    setVariables(updatedVariables);
                                    saveVariableMetadata(updatedVariables);
                                  }}
                                  className={`px-2 py-1 text-sm border rounded ${
                                    darkMode 
                                      ? 'bg-gray-700 border-gray-600 text-white' 
                                      : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  <option value="Scale">Scale</option>
                                  <option value="Ordinal">Ordinal</option>
                                  <option value="Nominal">Nominal</option>
                                </select>
                              ) : (
                                <span className={
                                  variable.measure === 'Scale' ? 'text-blue-600' :
                                  variable.measure === 'Ordinal' ? 'text-orange-600' : 'text-green-600'
                                }>
                                  {variable.measure}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading variable metadata...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination (only for Data View) */}
        {viewMode === 'data' && totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => loadDataPreview(currentPage - 1, sortColumn, sortDirection, filters)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => loadDataPreview(currentPage + 1, sortColumn, sortDirection, filters)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === totalPages
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Data Cleaning Interface Component  
  const DataCleaningInterface = ({ sessionId, apiKey, onDataCleaned, qualityInfo, darkMode }) => {
    const [activeTab, setActiveTab] = useState('missing');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);

    const handleMissingData = async (strategy, columns = null, fillValue = null) => {
      setProcessing(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/handle-missing-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            strategy,
            columns,
            fill_value: fillValue
          })
        });

        if (response.ok) {
          const result = await response.json();
          setResults(result);
          onDataCleaned();
        }
      } catch (error) {
        console.error('Error handling missing data:', error);
      } finally {
        setProcessing(false);
      }
    };

    const handleOutlierDetection = async (method, columns = null) => {
      setProcessing(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/detect-outliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            method,
            columns
          })
        });

        if (response.ok) {
          const result = await response.json();
          setResults(result);
        }
      } catch (error) {
        console.error('Error detecting outliers:', error);
      } finally {
        setProcessing(false);
      }
    };

    const handleDataTransformation = async (transformationType, columns = null) => {
      setProcessing(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/transform-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            transformation_type: transformationType,
            columns
          })
        });

        if (response.ok) {
          const result = await response.json();
          setResults(result);
          onDataCleaned();
        }
      } catch (error) {
        console.error('Error transforming data:', error);
      } finally {
        setProcessing(false);
      }
    };

    const saveCleanedData = async (cleanedDataB64, filename) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/save-cleaned-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cleaned_data_b64: cleanedDataB64,
            filename
          })
        });

        if (response.ok) {
          const result = await response.json();
          alert('Cleaned data saved successfully!');
          setResults(null);
        }
      } catch (error) {
        console.error('Error saving cleaned data:', error);
      }
    };

    const columnsWithMissing = qualityInfo?.filter(q => q.missing_count > 0) || [];
    const numericColumns = qualityInfo?.filter(q => q.data_type.includes('int') || q.data_type.includes('float')) || [];

    return (
      <div className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-4 mb-4">
            {['missing', 'outliers', 'transform', 'duplicates'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Missing Data Tab */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Handle Missing Data ({columnsWithMissing.length} columns affected)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleMissingData('drop')}
                  disabled={processing}
                  className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Drop Rows
                </button>
                <button
                  onClick={() => handleMissingData('fill_mean')}
                  disabled={processing}
                  className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  Fill Mean
                </button>
                <button
                  onClick={() => handleMissingData('fill_median')}
                  disabled={processing}
                  className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  Fill Median
                </button>
                <button
                  onClick={() => handleMissingData('fill_mode')}
                  disabled={processing}
                  className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  Fill Mode
                </button>
              </div>
            </div>
          )}

          {/* Outliers Tab */}
          {activeTab === 'outliers' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detect Outliers ({numericColumns.length} numeric columns)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleOutlierDetection('iqr')}
                  disabled={processing}
                  className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  IQR Method
                </button>
                <button
                  onClick={() => handleOutlierDetection('zscore')}
                  disabled={processing}
                  className="px-3 py-2 bg-teal-500 text-white rounded text-sm hover:bg-teal-600 disabled:opacity-50"
                >
                  Z-Score
                </button>
                <button
                  onClick={() => handleOutlierDetection('isolation_forest')}
                  disabled={processing}
                  className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 disabled:opacity-50"
                >
                  Isolation Forest
                </button>
              </div>
            </div>
          )}

          {/* Transform Tab */}
          {activeTab === 'transform' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Data Transformations
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleDataTransformation('normalize')}
                  disabled={processing}
                  className="px-3 py-2 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 disabled:opacity-50"
                >
                  Normalize
                </button>
                <button
                  onClick={() => handleDataTransformation('standardize')}
                  disabled={processing}
                  className="px-3 py-2 bg-lime-500 text-white rounded text-sm hover:bg-lime-600 disabled:opacity-50"
                >
                  Standardize
                </button>
                <button
                  onClick={() => handleDataTransformation('log_transform')}
                  disabled={processing}
                  className="px-3 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  Log Transform
                </button>
                <button
                  onClick={() => handleDataTransformation('encode_categorical')}
                  disabled={processing}
                  className="px-3 py-2 bg-rose-500 text-white rounded text-sm hover:bg-rose-600 disabled:opacity-50"
                >
                  Encode Categorical
                </button>
              </div>
            </div>
          )}

          {/* Duplicates Tab */}
          {activeTab === 'duplicates' && (
            <div className="space-y-4">
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Remove Duplicates
              </h4>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    setProcessing(true);
                    try {
                      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sessions/${sessionId}/remove-duplicates`, {
                        method: 'POST'
                      });
                      if (response.ok) {
                        const result = await response.json();
                        setResults(result);
                        onDataCleaned();
                      }
                    } catch (error) {
                      console.error('Error removing duplicates:', error);
                    } finally {
                      setProcessing(false);
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Remove All Duplicates
                </button>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {processing && (
            <div className="flex items-center justify-center py-4">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Processing...
              </span>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cleaning Results
                </h5>
                <button
                  onClick={() => setResults(null)}
                  className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  ×
                </button>
              </div>
              
              {results.changes_summary && (
                <div className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {Object.entries(results.changes_summary).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.outliers_by_column && (
                <div className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <h6 className="font-medium">Outliers Detected:</h6>
                  {Object.entries(results.outliers_by_column).map(([column, info]) => (
                    <div key={column} className="flex justify-between">
                      <span>{column}:</span>
                      <span className="font-medium">
                        {info.count} outliers ({info.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(results.cleaned_data || results.transformed_data || results.deduplicated_data) && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      const cleanedData = results.cleaned_data || results.transformed_data || results.deduplicated_data;
                      const filename = prompt('Enter filename for cleaned data:', 'cleaned_data.csv');
                      if (filename) {
                        saveCleanedData(cleanedData, filename);
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Save as New Dataset
                  </button>
                  <button
                    onClick={() => {
                      const cleanedData = results.cleaned_data || results.transformed_data || results.deduplicated_data;
                      saveCleanedData(cleanedData, null);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Update Current Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex h-[calc(100vh-2rem)] gap-4">
        {/* Modern Sidebar - Left Panel */}
        <div className={`flex-shrink-0 w-72 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${darkMode ? 'bg-gray-800/90 border-gray-600/50' : 'bg-white/90 border-gray-300/50'} border-2 rounded-2xl shadow-xl backdrop-blur-sm -ml-2`}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Nemo
            </h1>
          </div>
          
          {/* Theme and Settings Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="px-6 py-6">
          {/* File Upload Input with Custom Styling */}
          <div className="relative">
            <label
              htmlFor="file-upload-input"
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all border-2 border-dashed cursor-pointer ${
                uploading 
                  ? 'border-gray-400 bg-gray-100 text-gray-500 cursor-not-allowed'
                  : darkMode 
                    ? 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700' 
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              {uploading ? (
                <>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload CSV</span>
                </>
              )}
            </label>
            
            {/* Visible file input with transparent overlay */}
            <input
              id="file-upload-input"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Recent Sessions
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {sessions.length}
            </span>
          </div>
          
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No sessions yet</p>
                <p className="text-xs mt-1">Upload a CSV file to get started</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`group cursor-pointer p-3 rounded-xl transition-all ${
                    currentSession?.id === session.id
                      ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-lg`
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      currentSession?.id === session.id
                        ? 'bg-white/20'
                        : `${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.title || session.filename || 'Untitled Session'}
                      </p>
                      <p className={`text-xs mt-1 ${
                        currentSession?.id === session.id
                          ? 'text-white/70'
                          : `${darkMode ? 'text-gray-500' : 'text-gray-500'}`
                      }`}>
                        {new Date(session.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* API Key Status & Help */}
        <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 text-xs ${
              apiKey 
                ? `${darkMode ? 'text-green-400' : 'text-green-600'}` 
                : `${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`
            }`}>
              <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>{apiKey ? 'API Key Configured' : 'API Key Required'}</span>
            </div>
            
            {/* Help Menu */}
            <div className="relative group">
              <button
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Help & Documentation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
              </button>
              
              {/* Help Dropdown */}
              <div className={`absolute bottom-full right-0 mb-2 w-48 py-2 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => setShowDocumentation(true)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>📚</span>
                    <span>Documentation</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowFAQ(true)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>❓</span>
                    <span>FAQ</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Right Panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        darkMode ? 'bg-gray-800/90 border-gray-600/50' : 'bg-white/90 border-gray-300/50'
      } border-2 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden -mr-2`} style={{ marginLeft: '8px' }}>
        {/* Top Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentSession ? currentSession.filename : 'AI Analysis'}
              </h2>
              {currentSession && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Session created {new Date(currentSession.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          {currentSession && (
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Data Preview
              </button>
            </div>
          )}
        </div>

        {/* Content Area - Tabbed Layout */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Show different content based on active tab */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Area - Properly contained with scroll */}
              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`} style={{ maxHeight: '100%' }}>
                {currentSession ? (
                  <>
                    {/* Show data preview if session has CSV data but no messages */}
                    {messages.length === 0 && currentSession.csv_preview && (
                      <div className="flex items-center justify-center min-h-full">
                        <div className={`max-w-2xl mx-auto p-8 rounded-2xl border-2 ${
                          darkMode 
                            ? 'bg-gray-800/50 border-gray-600/50 shadow-2xl shadow-gray-900/20' 
                            : 'bg-white/80 border-gray-200/80 shadow-2xl shadow-gray-500/10'
                        } backdrop-blur-sm`}>
                          <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                              darkMode 
                                ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30' 
                                : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50'
                            }`}>
                              <svg className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                              Dataset Loaded: {currentSession.title || currentSession.filename}
                            </h3>
                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
                              <p><span className="font-medium">Dimensions:</span> {currentSession.csv_preview.shape[0]} rows × {currentSession.csv_preview.shape[1]} columns</p>
                              <p><span className="font-medium">Columns:</span> {currentSession.csv_preview.columns.slice(0, 3).join(', ')}{currentSession.csv_preview.columns.length > 3 ? `... (+${currentSession.csv_preview.columns.length - 3} more)` : ''}</p>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'}`}>
                            <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Quick Stats</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data Quality</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {Math.round((1 - Object.values(currentSession.csv_preview.null_counts || {}).reduce((a, b) => a + b, 0) / (currentSession.csv_preview.shape[0] * currentSession.csv_preview.shape[1])) * 100)}% Complete
                                </span>
                              </div>
                              <div>
                                <span className={`block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>File Size</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                  {currentSession.csv_preview.shape[0] * currentSession.csv_preview.shape[1]} cells
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                            Start chatting below to analyze your data with AI assistance
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show messages if any exist */}
                    {messages.map((message, index) => (
                      <MessageRenderer key={index} message={message} />
                    ))}
                    {isLoading && <LoadingMessage />}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className={`max-w-md mx-auto p-8 rounded-2xl border-2 ${
                      darkMode 
                        ? 'bg-gray-800/50 border-gray-600/50 shadow-2xl shadow-gray-900/20' 
                        : 'bg-white/80 border-gray-200/80 shadow-2xl shadow-gray-500/10'
                    } backdrop-blur-sm`}>
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                          darkMode 
                            ? 'bg-gradient-to-br from-green-500/20 to-blue-600/20 border border-green-500/30' 
                            : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-200/50'
                        }`}>
                          <svg className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          Start New Conversation
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed mb-6`}>
                          Begin a new chat session with the AI assistant. 
                          Ask questions, get insights, and explore your ideas.
                        </p>
                        <button
                          onClick={() => {
                            // Create new chat functionality
                            setCurrentSession({ id: Date.now(), title: 'New Chat', created_at: new Date().toISOString() });
                            setMessages([]);
                            setNewMessage('');
                          }}
                          className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                            darkMode
                              ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                          } hover:scale-[1.02] active:scale-[0.98]`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          New Chat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Input Area - Always Visible for Chat */}
              <div className={`flex-shrink-0 border-t p-4 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {currentSession ? (
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask anything about your data..."
                      className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleSuggestAnalysis}
                      disabled={isLoading}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Get Analysis Suggestions"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className={`text-center py-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-sm">Start a new chat to begin your conversation</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Data Preview Tab */}
          {activeTab === 'data' && (
            <DataPreviewTable 
              sessionId={currentSession?.id} 
              apiKey={apiKey} 
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showApiModal && <ApiKeyModal />}
      {showSettingsModal && <SettingsModal />}
      
      {/* Documentation and FAQ Modals */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-[95vw] h-[95vh] rounded-xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} overflow-hidden`}>
            <Documentation darkMode={darkMode} onClose={() => setShowDocumentation(false)} />
          </div>
        </div>
      )}
      
      {showFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-[95vw] h-[95vh] rounded-xl shadow-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} overflow-hidden`}>
            <FAQ darkMode={darkMode} onClose={() => setShowFAQ(false)} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;