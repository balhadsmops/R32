"""
Enhanced Structured Response Service for RAG-powered AI Statistical Analysis
Provides sophisticated response formatting with proper structure and context
"""

import json
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import pandas as pd
import numpy as np

from rag_service import QueryIntent, QueryType

logger = logging.getLogger(__name__)

class ResponseSection(Enum):
    """Response section types for structured output"""
    ANSWER = "answer"
    EXPLANATION = "explanation"
    CODE = "code"
    VISUALIZATIONS = "visualizations"
    RECOMMENDATIONS = "recommendations"
    STATISTICAL_CONTEXT = "statistical_context"
    DATA_INSIGHTS = "data_insights"
    METHODOLOGY = "methodology"
    LIMITATIONS = "limitations"
    NEXT_STEPS = "next_steps"

@dataclass
class StructuredResponse:
    """Structured response format"""
    query: str
    query_intent: QueryIntent
    sections: Dict[ResponseSection, str]
    context_chunks: List[str]
    confidence_score: float
    processing_time: float
    metadata: Dict[str, Any]

class ResponseGenerator:
    """Advanced response generator with RAG integration"""
    
    def __init__(self):
        self.response_templates = {
            QueryType.DESCRIPTIVE: self._create_descriptive_template,
            QueryType.INFERENTIAL: self._create_inferential_template,
            QueryType.CORRELATION: self._create_correlation_template,
            QueryType.VISUALIZATION: self._create_visualization_template,
            QueryType.COMPARISON: self._create_comparison_template,
            QueryType.PREDICTIVE: self._create_predictive_template,
            QueryType.TEMPORAL: self._create_temporal_template,
            QueryType.DISTRIBUTION: self._create_distribution_template,
            QueryType.OUTLIER: self._create_outlier_template,
            QueryType.SUMMARY: self._create_summary_template
        }
    
    def generate_structured_response(self, query: str, query_intent: QueryIntent,
                                   context_chunks: List[str], llm_response: str,
                                   processing_time: float) -> StructuredResponse:
        """Generate structured response from LLM output and context"""
        
        # Parse LLM response into sections
        sections = self._parse_llm_response(llm_response, query_intent)
        
        # Enhance sections with context
        enhanced_sections = self._enhance_sections_with_context(sections, context_chunks, query_intent)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(enhanced_sections, context_chunks, query_intent)
        
        # Generate metadata including raw response
        metadata = self._generate_response_metadata(query, query_intent, context_chunks, llm_response)
        metadata['raw_llm_response'] = llm_response  # Store the raw LLM response for direct use
        
        return StructuredResponse(
            query=query,
            query_intent=query_intent,
            sections=enhanced_sections,
            context_chunks=context_chunks,
            confidence_score=confidence_score,
            processing_time=processing_time,
            metadata=metadata
        )
    
    def _parse_llm_response(self, llm_response: str, query_intent: QueryIntent) -> Dict[ResponseSection, str]:
        """Parse LLM response into structured sections"""
        sections = {}
        
        # Try to extract structured sections if present
        structured_match = re.search(
            r'1\.\s*\*\*Answer:\*\*\s*(.*?)\n\n2\.\s*\*\*Explanation:\*\*\s*(.*?)\n\n3\.\s*\*\*Code.*?\*\*\s*(.*?)\n\n4\.\s*\*\*Visualizations.*?\*\*\s*(.*?)(?:\n\n|$)',
            llm_response,
            re.DOTALL
        )
        
        if structured_match:
            sections[ResponseSection.ANSWER] = structured_match.group(1).strip()
            sections[ResponseSection.EXPLANATION] = structured_match.group(2).strip()
            sections[ResponseSection.CODE] = structured_match.group(3).strip()
            sections[ResponseSection.VISUALIZATIONS] = structured_match.group(4).strip()
        else:
            # Fallback to parsing different patterns
            sections = self._parse_unstructured_response(llm_response, query_intent)
        
        return sections
    
    def _parse_unstructured_response(self, llm_response: str, query_intent: QueryIntent) -> Dict[ResponseSection, str]:
        """Parse unstructured response and create sections"""
        sections = {}
        
        # Extract code blocks
        code_blocks = re.findall(r'```python\n(.*?)\n```', llm_response, re.DOTALL)
        if code_blocks:
            sections[ResponseSection.CODE] = '\n\n'.join(code_blocks)
        
        # Extract main content as answer
        # Remove code blocks for main content
        main_content = re.sub(r'```python.*?```', '', llm_response, flags=re.DOTALL)
        
        # Split into potential sections
        paragraphs = [p.strip() for p in main_content.split('\n\n') if p.strip()]
        
        if paragraphs:
            # First paragraph as answer
            sections[ResponseSection.ANSWER] = paragraphs[0]
            
            # Remaining paragraphs as explanation
            if len(paragraphs) > 1:
                sections[ResponseSection.EXPLANATION] = '\n\n'.join(paragraphs[1:])
        
        # Add query-specific enhancements
        self._add_query_specific_sections(sections, llm_response, query_intent)
        
        return sections
    
    def _add_query_specific_sections(self, sections: Dict[ResponseSection, str], 
                                   llm_response: str, query_intent: QueryIntent):
        """Add query-specific sections based on intent"""
        
        if query_intent.type == QueryType.INFERENTIAL:
            # Look for statistical significance mentions
            if 'p-value' in llm_response.lower() or 'significance' in llm_response.lower():
                sections[ResponseSection.STATISTICAL_CONTEXT] = self._extract_statistical_context(llm_response)
        
        elif query_intent.type == QueryType.VISUALIZATION:
            # Look for visualization descriptions
            viz_desc = self._extract_visualization_description(llm_response)
            if viz_desc:
                sections[ResponseSection.VISUALIZATIONS] = viz_desc
        
        elif query_intent.type == QueryType.PREDICTIVE:
            # Look for methodology descriptions
            methodology = self._extract_methodology(llm_response)
            if methodology:
                sections[ResponseSection.METHODOLOGY] = methodology
        
        # Always try to extract recommendations
        recommendations = self._extract_recommendations(llm_response)
        if recommendations:
            sections[ResponseSection.RECOMMENDATIONS] = recommendations
    
    def _extract_statistical_context(self, response: str) -> str:
        """Extract statistical context from response"""
        patterns = [
            r'(p-value.*?(?:\.|$))',
            r'(confidence interval.*?(?:\.|$))',
            r'(statistical significance.*?(?:\.|$))',
            r'(hypothesis.*?(?:\.|$))'
        ]
        
        context_parts = []
        for pattern in patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            context_parts.extend(matches)
        
        return ' '.join(context_parts) if context_parts else ""
    
    def _extract_visualization_description(self, response: str) -> str:
        """Extract visualization descriptions from response"""
        patterns = [
            r'(plot.*?(?:\.|$))',
            r'(chart.*?(?:\.|$))',
            r'(graph.*?(?:\.|$))',
            r'(visualization.*?(?:\.|$))'
        ]
        
        viz_parts = []
        for pattern in patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            viz_parts.extend(matches)
        
        return ' '.join(viz_parts) if viz_parts else ""
    
    def _extract_methodology(self, response: str) -> str:
        """Extract methodology descriptions from response"""
        patterns = [
            r'(method.*?(?:\.|$))',
            r'(approach.*?(?:\.|$))',
            r'(technique.*?(?:\.|$))',
            r'(algorithm.*?(?:\.|$))'
        ]
        
        method_parts = []
        for pattern in patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            method_parts.extend(matches)
        
        return ' '.join(method_parts) if method_parts else ""
    
    def _extract_recommendations(self, response: str) -> str:
        """Extract recommendations from response"""
        patterns = [
            r'(recommend.*?(?:\.|$))',
            r'(suggest.*?(?:\.|$))',
            r'(should.*?(?:\.|$))',
            r'(consider.*?(?:\.|$))'
        ]
        
        rec_parts = []
        for pattern in patterns:
            matches = re.findall(pattern, response, re.IGNORECASE)
            rec_parts.extend(matches)
        
        return ' '.join(rec_parts) if rec_parts else ""
    
    def _enhance_sections_with_context(self, sections: Dict[ResponseSection, str],
                                     context_chunks: List[str],
                                     query_intent: QueryIntent) -> Dict[ResponseSection, str]:
        """Enhance sections with context from RAG chunks"""
        enhanced_sections = sections.copy()
        
        # Add data insights from context
        data_insights = self._extract_data_insights_from_context(context_chunks, query_intent)
        if data_insights:
            enhanced_sections[ResponseSection.DATA_INSIGHTS] = data_insights
        
        # Add statistical context if not present
        if ResponseSection.STATISTICAL_CONTEXT not in enhanced_sections:
            statistical_context = self._extract_statistical_context_from_chunks(context_chunks)
            if statistical_context:
                enhanced_sections[ResponseSection.STATISTICAL_CONTEXT] = statistical_context
        
        # Add methodology if appropriate
        if query_intent.type in [QueryType.INFERENTIAL, QueryType.PREDICTIVE, QueryType.COMPARISON]:
            if ResponseSection.METHODOLOGY not in enhanced_sections:
                methodology = self._generate_methodology_from_intent(query_intent)
                if methodology:
                    enhanced_sections[ResponseSection.METHODOLOGY] = methodology
        
        # Add limitations
        limitations = self._generate_limitations(query_intent, context_chunks)
        if limitations:
            enhanced_sections[ResponseSection.LIMITATIONS] = limitations
        
        # Add next steps
        next_steps = self._generate_next_steps(query_intent, enhanced_sections)
        if next_steps:
            enhanced_sections[ResponseSection.NEXT_STEPS] = next_steps
        
        return enhanced_sections
    
    def _extract_data_insights_from_context(self, context_chunks: List[str], 
                                          query_intent: QueryIntent) -> str:
        """Extract data insights from context chunks"""
        insights = []
        
        for chunk in context_chunks:
            # Extract key statistics
            stats_matches = re.findall(r'mean=(\d+\.?\d*)', chunk)
            if stats_matches:
                insights.append(f"Mean values identified: {', '.join(stats_matches)}")
            
            # Extract correlation information
            corr_matches = re.findall(r'correlation.*?(\d+\.?\d*)', chunk, re.IGNORECASE)
            if corr_matches:
                insights.append(f"Correlation values found: {', '.join(corr_matches)}")
            
            # Extract data shape information
            shape_matches = re.findall(r'(\d+) rows.* (\d+) columns', chunk)
            if shape_matches:
                rows, cols = shape_matches[0]
                insights.append(f"Dataset contains {rows} observations across {cols} variables")
        
        return '; '.join(insights) if insights else ""
    
    def _extract_statistical_context_from_chunks(self, context_chunks: List[str]) -> str:
        """Extract statistical context from context chunks"""
        context_parts = []
        
        for chunk in context_chunks:
            # Look for statistical summaries
            if 'statistical summary' in chunk.lower():
                lines = chunk.split('\n')
                for line in lines:
                    if any(term in line.lower() for term in ['mean', 'std', 'correlation', 'p-value']):
                        context_parts.append(line.strip())
        
        return '; '.join(context_parts[:3]) if context_parts else ""  # Limit to 3 most relevant
    
    def _generate_methodology_from_intent(self, query_intent: QueryIntent) -> str:
        """Generate methodology description based on query intent"""
        if query_intent.type == QueryType.INFERENTIAL:
            if 'ttest' in query_intent.statistical_tests:
                return "Statistical hypothesis testing using t-test to compare means between groups"
            elif 'anova' in query_intent.statistical_tests:
                return "Analysis of variance (ANOVA) to test differences across multiple groups"
            elif 'chi_square' in query_intent.statistical_tests:
                return "Chi-square test to examine association between categorical variables"
            else:
                return "Inferential statistical analysis to test hypotheses about population parameters"
        
        elif query_intent.type == QueryType.CORRELATION:
            return "Correlation analysis to examine linear relationships between variables"
        
        elif query_intent.type == QueryType.PREDICTIVE:
            return "Predictive modeling using regression techniques to forecast outcomes"
        
        elif query_intent.type == QueryType.COMPARISON:
            return "Comparative analysis using appropriate statistical tests for group differences"
        
        return ""
    
    def _generate_limitations(self, query_intent: QueryIntent, context_chunks: List[str]) -> str:
        """Generate limitations based on query type and data context"""
        limitations = []
        
        # Check for sample size limitations
        for chunk in context_chunks:
            if 'rows' in chunk:
                rows_match = re.search(r'(\d+) rows', chunk)
                if rows_match:
                    n_rows = int(rows_match.group(1))
                    if n_rows < 30:
                        limitations.append("Small sample size may limit statistical power")
                    elif n_rows > 10000:
                        limitations.append("Large dataset may require computational considerations")
        
        # Add query-specific limitations
        if query_intent.type == QueryType.INFERENTIAL:
            limitations.append("Statistical assumptions should be verified before interpretation")
        
        elif query_intent.type == QueryType.CORRELATION:
            limitations.append("Correlation does not imply causation")
        
        elif query_intent.type == QueryType.PREDICTIVE:
            limitations.append("Model predictions are based on historical data patterns")
        
        return '; '.join(limitations) if limitations else ""
    
    def _generate_next_steps(self, query_intent: QueryIntent, 
                           sections: Dict[ResponseSection, str]) -> str:
        """Generate next steps based on query intent and response"""
        next_steps = []
        
        if query_intent.type == QueryType.DESCRIPTIVE:
            next_steps.append("Consider exploratory data analysis and visualization")
            if query_intent.variables:
                next_steps.append(f"Examine relationships between {', '.join(query_intent.variables)} and other variables")
        
        elif query_intent.type == QueryType.INFERENTIAL:
            next_steps.append("Verify statistical assumptions and consider effect sizes")
            next_steps.append("Conduct post-hoc analysis if significant results found")
        
        elif query_intent.type == QueryType.CORRELATION:
            next_steps.append("Investigate potential confounding variables")
            next_steps.append("Consider partial correlation analysis")
        
        elif query_intent.type == QueryType.VISUALIZATION:
            next_steps.append("Create interactive visualizations for deeper exploration")
            next_steps.append("Consider multiple visualization types for comprehensive analysis")
        
        elif query_intent.type == QueryType.PREDICTIVE:
            next_steps.append("Validate model using cross-validation techniques")
            next_steps.append("Examine model assumptions and residuals")
        
        return '; '.join(next_steps) if next_steps else ""
    
    def _calculate_confidence_score(self, sections: Dict[ResponseSection, str],
                                  context_chunks: List[str], query_intent: QueryIntent) -> float:
        """Calculate confidence score for the response"""
        base_score = 0.5
        
        # Boost score based on available sections
        if ResponseSection.ANSWER in sections and sections[ResponseSection.ANSWER].strip():
            base_score += 0.2
        
        if ResponseSection.EXPLANATION in sections and sections[ResponseSection.EXPLANATION].strip():
            base_score += 0.1
        
        if ResponseSection.CODE in sections and sections[ResponseSection.CODE].strip():
            base_score += 0.1
        
        # Boost score based on query intent confidence
        base_score += query_intent.confidence * 0.1
        
        # Boost score based on context quality
        if len(context_chunks) > 2:
            base_score += 0.05
        
        if any('statistical' in chunk.lower() for chunk in context_chunks):
            base_score += 0.05
        
        return min(base_score, 1.0)
    
    def _generate_response_metadata(self, query: str, query_intent: QueryIntent,
                                  context_chunks: List[str], llm_response: str) -> Dict[str, Any]:
        """Generate response metadata"""
        return {
            'query_type': query_intent.type.value,
            'query_confidence': query_intent.confidence,
            'variables_mentioned': query_intent.variables,
            'statistical_tests': query_intent.statistical_tests,
            'context_chunks_count': len(context_chunks),
            'response_length': len(llm_response),
            'timestamp': datetime.utcnow().isoformat(),
            'has_code': ResponseSection.CODE in self._parse_llm_response(llm_response, query_intent),
            'has_visualization': query_intent.visualization_type is not None
        }
    
    def format_response_for_frontend(self, structured_response: StructuredResponse) -> str:
        """Format structured response for frontend display with improved structure"""
        # Since we're now using a more structured prompt, let's pass through the LLM response directly
        # but add some metadata at the end
        
        # Get the raw response from metadata if available
        raw_response = structured_response.metadata.get('raw_llm_response', '')
        
        if not raw_response:
            # Fallback to old format if no raw response
            formatted_response = ""
            
            # Add answer section
            if ResponseSection.ANSWER in structured_response.sections:
                formatted_response += f"## 🎯 **Analysis**\n\n{structured_response.sections[ResponseSection.ANSWER]}\n\n"
            
            # Add explanation section
            if ResponseSection.EXPLANATION in structured_response.sections:
                formatted_response += f"## 📊 **Data Insights**\n\n{structured_response.sections[ResponseSection.EXPLANATION]}\n\n"
            
            # Add code section
            if ResponseSection.CODE in structured_response.sections:
                formatted_response += f"## 💻 **Code**\n\n```python\n{structured_response.sections[ResponseSection.CODE]}\n```\n\n"
            
            # Add visualizations
            if ResponseSection.VISUALIZATIONS in structured_response.sections:
                formatted_response += f"## 📈 **Visualizations**\n\n{structured_response.sections[ResponseSection.VISUALIZATIONS]}\n\n"
            
            # Add recommendations
            if ResponseSection.RECOMMENDATIONS in structured_response.sections:
                formatted_response += f"## 💡 **Recommendations**\n\n{structured_response.sections[ResponseSection.RECOMMENDATIONS]}\n\n"
            
            # Add other sections
            if ResponseSection.DATA_INSIGHTS in structured_response.sections:
                formatted_response += f"## 📈 **Additional Data Insights**\n\n{structured_response.sections[ResponseSection.DATA_INSIGHTS]}\n\n"
            
            if ResponseSection.STATISTICAL_CONTEXT in structured_response.sections:
                formatted_response += f"## 📐 **Statistical Context**\n\n{structured_response.sections[ResponseSection.STATISTICAL_CONTEXT]}\n\n"
            
            if ResponseSection.METHODOLOGY in structured_response.sections:
                formatted_response += f"## 🔬 **Methodology**\n\n{structured_response.sections[ResponseSection.METHODOLOGY]}\n\n"
            
            if ResponseSection.LIMITATIONS in structured_response.sections:
                formatted_response += f"## ⚠️ **Limitations**\n\n{structured_response.sections[ResponseSection.LIMITATIONS]}\n\n"
            
            if ResponseSection.NEXT_STEPS in structured_response.sections:
                formatted_response += f"## 🚀 **Next Steps**\n\n{structured_response.sections[ResponseSection.NEXT_STEPS]}\n\n"
        else:
            # Use the raw response since we're now using structured prompts
            formatted_response = raw_response
        
        # Add confidence indicator and metadata
        confidence_emoji = "🟢" if structured_response.confidence_score > 0.8 else "🟡" if structured_response.confidence_score > 0.6 else "🔴"
        formatted_response += f"\n\n---\n*{confidence_emoji} Confidence: {structured_response.confidence_score:.1%} | Processing time: {structured_response.processing_time:.2f}s*"
        
        return formatted_response
    
    # Template methods for different query types
    def _create_descriptive_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for descriptive queries"""
        return {
            "system_prompt": "You are an expert biostatistician. Provide a comprehensive descriptive analysis.",
            "context_focus": "statistical_summary,column_group",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.DATA_INSIGHTS]
        }
    
    def _create_inferential_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for inferential queries"""
        return {
            "system_prompt": "You are an expert biostatistician. Perform rigorous hypothesis testing and statistical inference.",
            "context_focus": "statistical_summary,correlation_matrix",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.STATISTICAL_CONTEXT, ResponseSection.METHODOLOGY]
        }
    
    def _create_correlation_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for correlation queries"""
        return {
            "system_prompt": "You are an expert biostatistician. Analyze relationships and correlations between variables.",
            "context_focus": "correlation_matrix,column_group",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.VISUALIZATIONS]
        }
    
    def _create_visualization_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for visualization queries"""
        return {
            "system_prompt": "You are an expert data visualization specialist. Create meaningful and insightful visualizations.",
            "context_focus": "column_group,statistical_summary",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.CODE, ResponseSection.VISUALIZATIONS]
        }
    
    def _create_comparison_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for comparison queries"""
        return {
            "system_prompt": "You are an expert biostatistician. Perform rigorous statistical comparisons between groups.",
            "context_focus": "statistical_summary,row_group",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.METHODOLOGY]
        }
    
    def _create_predictive_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for predictive queries"""
        return {
            "system_prompt": "You are an expert in predictive modeling and machine learning for healthcare data.",
            "context_focus": "statistical_summary,correlation_matrix",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.METHODOLOGY, ResponseSection.LIMITATIONS]
        }
    
    def _create_temporal_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for temporal queries"""
        return {
            "system_prompt": "You are an expert in time series analysis and temporal data patterns.",
            "context_focus": "row_group,statistical_summary",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.VISUALIZATIONS]
        }
    
    def _create_distribution_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for distribution queries"""
        return {
            "system_prompt": "You are an expert in statistical distributions and probability theory.",
            "context_focus": "statistical_summary,column_group",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.VISUALIZATIONS]
        }
    
    def _create_outlier_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for outlier queries"""
        return {
            "system_prompt": "You are an expert in outlier detection and data quality assessment.",
            "context_focus": "statistical_summary,row_group",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.CODE, ResponseSection.METHODOLOGY]
        }
    
    def _create_summary_template(self, query_intent: QueryIntent) -> Dict[str, str]:
        """Create template for summary queries"""
        return {
            "system_prompt": "You are an expert biostatistician. Provide a comprehensive summary of the dataset.",
            "context_focus": "statistical_summary,column_group,correlation_matrix",
            "expected_sections": [ResponseSection.ANSWER, ResponseSection.EXPLANATION, ResponseSection.DATA_INSIGHTS, ResponseSection.RECOMMENDATIONS]
        }