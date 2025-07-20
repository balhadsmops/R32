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
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-96 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-2xl`}>
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
            <button
              onClick={saveApiKey}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Modern Sidebar */}
      <div className={`flex-shrink-0 w-80 h-screen flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-lg`}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Statistical Analysis
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
        
        {/* Upload Section - Replaced with New Chat Button */}
        <div className="px-6 py-6">
          <button
            onClick={() => {
              // Create new session/chat functionality
              setCurrentSession(null);
              setMessages([]);
              setNewMessage('');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
          
          {/* Hidden file input for upload functionality */}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="hidden-file-input"
          />
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
                        {session.filename || 'Untitled Session'}
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
        
        {/* API Key Status */}
        <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center space-x-2 text-xs ${
            apiKey 
              ? `${darkMode ? 'text-green-400' : 'text-green-600'}` 
              : `${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`
          }`}>
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{apiKey ? 'API Key Configured' : 'API Key Required'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
                {currentSession ? currentSession.filename : 'AI Statistical Analysis'}
              </h2>
              {currentSession && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Session created {new Date(currentSession.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Fixed Layout */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Messages Area - Fixed Height */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${
            darkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`} style={{ height: 'calc(100vh - 140px)' }}>
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
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Start New Conversation
                  </h3>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-8`}>
                    Begin a new chat session with the AI assistant. 
                    Ask questions, get insights, and explore your ideas.
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={() => {
                        // Create new chat functionality
                        setCurrentSession({ id: Date.now(), title: 'New Chat', created_at: new Date().toISOString() });
                        setMessages([]);
                        setNewMessage('');
                      }}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-700 transition-all shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Chat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Input Area - Always Visible */}
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
                <p className="text-sm">Upload a dataset to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showApiModal && <ApiKeyModal />}
      {showSettingsModal && <SettingsModal />}
    </div>
  );
}

export default App;