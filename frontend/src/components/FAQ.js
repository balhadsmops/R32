import React, { useState } from 'react';

const FAQ = ({ darkMode, onClose }) => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const faqData = [
    {
      category: "🚀 Getting Started",
      questions: [
        {
          question: "How do I upload a CSV file for analysis?",
          answer: "Click the 'Upload CSV' button in the left sidebar. Select your CSV file from your computer. The system will automatically validate the file, create a new session, and generate a data preview. Only CSV files are accepted."
        },
        {
          question: "Where do I get a Gemini API key?",
          answer: "Visit Google AI Studio at https://aistudio.google.com/app/apikey. Sign in with your Google account, create a new API key, and copy it. Then paste it in the API key modal or settings panel in the app."
        },
        {
          question: "What file formats are supported?",
          answer: "Currently, only CSV (Comma-Separated Values) files are supported. Make sure your data is properly formatted with column headers in the first row."
        }
      ]
    },
    {
      category: "💬 Using the Chat Interface",
      questions: [
        {
          question: "How do I ask questions about my data?",
          answer: "After uploading a CSV file, use the chat interface in the center panel. Ask natural language questions like 'What is the average age?' or 'Show me a correlation between variables.' The AI will provide detailed analysis and code examples."
        },
        {
          question: "Can I execute Python code directly?",
          answer: "Yes! The AI will often provide Python code in code blocks with a 'Run' button. Click the button to execute the code in our secure sandbox environment. You can also ask for specific code to perform analysis."
        },
        {
          question: "What variables can I use in Python code?",
          answer: "Your uploaded CSV data is automatically available as 'df' (a pandas DataFrame). You can use all standard Python data science libraries: pandas, numpy, matplotlib, seaborn, plotly, scipy, sklearn, and more."
        }
      ]
    },
    {
      category: "📊 Data Analysis Features",
      questions: [
        {
          question: "What types of statistical analysis can I perform?",
          answer: "The app supports comprehensive statistical analysis including: descriptive statistics, hypothesis testing, correlation analysis, regression modeling, survival analysis (Kaplan-Meier), clinical trial analysis, epidemiological studies, and more."
        },
        {
          question: "How does the RAG (Retrieval Augmented Generation) feature work?",
          answer: "RAG enhances AI responses by retrieving relevant context from your data. When you ask questions, the system searches through your dataset using vector embeddings and provides more accurate, data-specific answers."
        },
        {
          question: "What is Julius AI-style sectioned execution?",
          answer: "This feature automatically organizes your analysis code into logical sections (data summary, statistical tests, visualizations) and provides structured results with metadata, making your analysis more organized and easier to follow."
        }
      ]
    },
    {
      category: "🛠️ Advanced Features",
      questions: [
        {
          question: "How do I use the Data Preview with SPSS-style interface?",
          answer: "Click the '📊 Data Preview' tab in the right panel. You can switch between Data View (spreadsheet-like) and Variable View (metadata). The interface allows sorting, filtering, editing cells, and managing variable metadata like SPSS."
        },
        {
          question: "What are the data cleaning features?",
          answer: "Click 'Show Cleaning' in the data preview to access tools for handling missing data, detecting outliers, transforming variables, and removing duplicates. The AI can also suggest appropriate missing data labels based on context."
        },
        {
          question: "Can I save my analysis sessions?",
          answer: "Yes, all your sessions are automatically saved and appear in the 'Recent Sessions' panel. Each session preserves your uploaded data, chat history, code execution results, and analysis results."
        }
      ]
    },
    {
      category: "🏥 Medical Data Analysis",
      questions: [
        {
          question: "What medical research features are available?",
          answer: "The app includes specialized tools for clinical research: survival analysis with Kaplan-Meier curves, Cox proportional hazards models, clinical trial analysis, epidemiological calculations (incidence, prevalence), diagnostic test evaluation, and medical data validation rules."
        },
        {
          question: "How does the medical variable detection work?",
          answer: "The system automatically identifies medical variables (age, gender, blood pressure, diagnosis, treatment, etc.) and provides appropriate analysis suggestions and validation rules specific to healthcare data."
        },
        {
          question: "Can I perform survival analysis?",
          answer: "Yes! Use the lifelines library which is pre-installed. Ask the AI for survival analysis and it will generate Kaplan-Meier curves, log-rank tests, and Cox regression models as appropriate for your data."
        }
      ]
    },
    {
      category: "📈 Visualization & Charts",
      questions: [
        {
          question: "What types of visualizations can I create?",
          answer: "The app supports static plots (matplotlib, seaborn), interactive visualizations (plotly), statistical plots, medical charts (forest plots, ROC curves), network graphs, word clouds, and specialized research visualizations."
        },
        {
          question: "How do I create interactive plots?",
          answer: "Ask the AI to create plots using Plotly. For example: 'Create an interactive scatter plot of age vs outcome' or 'Make an interactive histogram with dropdown filters.' Plotly charts will display with zoom, pan, and hover features."
        },
        {
          question: "Can I export visualizations?",
          answer: "Charts generated in the execution results panel can be right-clicked and saved as images. Interactive Plotly charts also have built-in export options for PNG, SVG, and other formats."
        }
      ]
    },
    {
      category: "⚙️ Technical & Troubleshooting",
      questions: [
        {
          question: "Why is my API key not working?",
          answer: "Ensure your Gemini API key is valid and has proper permissions. Test the connection using the 'Test Connection' button in settings. Check that you're using the correct model (gemini-2.5-flash is recommended for better rate limits)."
        },
        {
          question: "What should I do if code execution fails?",
          answer: "Check the error message in the execution results. Common issues include: variable name errors (use 'df' for your data), missing imports (most libraries are pre-installed), or data type issues. The AI can help debug errors if you share the error message."
        },
        {
          question: "How much data can I upload?",
          answer: "The system can handle datasets with thousands of rows and dozens of columns. For very large files, consider sampling your data first. The preview shows data quality metrics including memory usage."
        },
        {
          question: "Is my data secure?",
          answer: "Your data is processed locally in the application. CSV files are stored temporarily for the session. API calls to Gemini only include your questions and relevant data context, not entire datasets. Always follow your organization's data privacy policies."
        }
      ]
    }
  ];

  return (
    <div className="faq-page h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">❓</div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
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
        <div className="max-w-4xl mx-auto">
          
          {/* Introduction */}
          <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Welcome to the AI Medical Data Analysis Platform! Here are answers to common questions about using the app effectively.
              If you can't find what you're looking for, try asking the AI assistant in the chat interface.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-4">
            {faqData.map((section, sectionIndex) => (
              <div 
                key={sectionIndex}
                className={`border rounded-lg ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
              >
                {/* Section Header */}
                <div 
                  className={`p-4 cursor-pointer border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {section.category}
                    </h3>
                    <div className={`transform transition-transform ${openSection === sectionIndex ? 'rotate-180' : ''}`}>
                      <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>▼</span>
                    </div>
                  </div>
                </div>

                {/* Section Questions */}
                {openSection === sectionIndex && (
                  <div className="p-4 space-y-4">
                    {section.questions.map((qa, qaIndex) => (
                      <div key={qaIndex} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Q: {qa.question}
                        </h4>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong className={darkMode ? 'text-green-400' : 'text-green-600'}>A:</strong> {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🔗 Quick Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  🔑 Get Gemini API Key
                </a>
                <a 
                  href="http://localhost:8001/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  📚 API Documentation
                </a>
              </div>
              <div className="space-y-2">
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  💡 Pro tip: Start by uploading sample medical data and asking "What analysis would you recommend?"
                </div>
                <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  🎯 Try: "Create a summary dashboard for this dataset"
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={`mt-6 p-4 rounded-lg text-center ${darkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
              <strong>Still need help?</strong> Use the chat interface to ask the AI assistant any specific questions about your data or analysis needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;