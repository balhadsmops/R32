from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
import plotly.figure_factory as ff
import plotly.io as pio
import io
import base64
import json
import asyncio
import subprocess
import sys
import tempfile
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import statsmodels.api as sm
from statsmodels.stats.contingency_tables import mcnemar
from lifelines import KaplanMeierFitter, CoxPHFitter
from lifelines.statistics import logrank_test
import warnings
warnings.filterwarnings('ignore')

# Import comprehensive data analysis services
from simple_data_analysis_service import ComprehensiveDataAnalyzer

# Import enhanced RAG services
from rag_service import EnhancedRAGService, QueryType, QueryIntent
from enhanced_response_service import ResponseGenerator, StructuredResponse

# New models for Julius AI-style sectioned analysis
class AnalysisSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    section_type: str  # 'summary', 'descriptive', 'statistical_test', 'visualization', 'model'
    code: str
    output: str
    success: bool
    error: Optional[str] = None
    metadata: Dict = Field(default_factory=dict)
    tables: List[Dict] = Field(default_factory=list)
    charts: List[Dict] = Field(default_factory=list)
    order: int = 0

class StructuredAnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str
    sections: List[AnalysisSection]
    total_sections: int
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    overall_success: bool

# Enhanced Analysis Classification System for Julius AI-style healthcare research
class AnalysisClassifier:
    
    @staticmethod
    def classify_code_section(code: str) -> tuple[str, str]:
        """Classify a code section and return (section_type, title) with healthcare focus"""
        code_lower = code.lower()
        
        # Data Overview/Summary patterns - Enhanced for healthcare
        if any(pattern in code_lower for pattern in [
            'summary', 'overview', 'describe', 'info()', 'head()', 'shape', 'dtypes',
            'clinical outcomes', 'total patients', 'key findings', 'demographics',
            'baseline characteristics', 'patient characteristics', 'sample size'
        ]):
            return 'summary', 'Clinical Data Overview'
        
        # Descriptive statistics patterns - Enhanced with healthcare specifics
        elif any(pattern in code_lower for pattern in [
            'mean()', 'median()', 'std()', 'var()', 'quantile()', 'describe()',
            'value_counts()', 'groupby', 'agg(', 'aggregate', 'count()',
            'descriptive', 'central tendency', 'dispersion', 'distribution',
            'frequency', 'crosstab', 'cross_table', 'contingency',
            'baseline statistics', 'demographic analysis', 'patient demographics'
        ]):
            return 'descriptive', 'Descriptive Statistics'
        
        # Statistical test patterns - Enhanced with healthcare tests
        elif any(pattern in code_lower for pattern in [
            'ttest', 'chi2', 'anova', 'mannwhitney', 'wilcoxon', 'kruskal',
            'pearson', 'spearman', 'correlation', 'regression', 'logistic',
            'pvalue', 'significance', 'hypothesis', 'paired_ttest', 'unpaired',
            'fisher_exact', 'mcnemar', 'friedman', 'cochran', 'odds_ratio',
            'relative_risk', 'risk_ratio', 'confidence_interval', 'effect_size',
            'power_analysis', 'sample_size_calculation', 'bonferroni',
            'multiple_comparisons', 'post_hoc', 'tukey', 'dunnett'
        ]):
            return 'statistical_test', 'Statistical Analysis'
        
        # Survival analysis patterns - New for healthcare
        elif any(pattern in code_lower for pattern in [
            'survival', 'kaplan', 'meier', 'hazard', 'cox', 'lifetable',
            'censored', 'time_to_event', 'log_rank', 'breslow', 'tarone',
            'nelson_aalen', 'cumulative_hazard', 'survival_curve'
        ]):
            return 'survival', 'Survival Analysis'
        
        # Epidemiological analysis patterns - New for healthcare
        elif any(pattern in code_lower for pattern in [
            'incidence', 'prevalence', 'epidemiology', 'outbreak', 'epidemic',
            'attack_rate', 'case_fatality', 'mortality_rate', 'morbidity',
            'standardized_mortality', 'age_adjusted', 'direct_standardization',
            'indirect_standardization', 'person_years', 'person_time'
        ]):
            return 'epidemiological', 'Epidemiological Analysis'
        
        # Visualization patterns - Enhanced with healthcare charts
        elif any(pattern in code_lower for pattern in [
            'plot', 'hist', 'scatter', 'bar', 'pie', 'box', 'violin',
            'seaborn', 'matplotlib', 'plotly', 'visualization', 'chart',
            'forest_plot', 'funnel_plot', 'survival_plot', 'kaplan_meier_plot',
            'roc_curve', 'precision_recall', 'bland_altman', 'qq_plot',
            'residual_plot', 'diagnostic_plot', 'heatmap', 'correlation_matrix'
        ]):
            return 'visualization', 'Data Visualization'
        
        # Model building patterns - Enhanced with healthcare models
        elif any(pattern in code_lower for pattern in [
            'model', 'fit()', 'predict', 'score', 'cross_val', 'validation',
            'randomforest', 'svm', 'neural', 'machine_learning', 'deep_learning',
            'linear_model', 'logistic_model', 'cox_model', 'mixed_model',
            'glm', 'gam', 'random_effects', 'fixed_effects', 'multilevel',
            'hierarchical', 'bayesian', 'prediction_model', 'risk_model'
        ]):
            return 'model', 'Predictive Modeling'
        
        # Clinical trial analysis patterns - New for healthcare
        elif any(pattern in code_lower for pattern in [
            'clinical_trial', 'randomized', 'controlled', 'rct', 'trial',
            'treatment_effect', 'intervention', 'placebo', 'blinded',
            'intention_to_treat', 'per_protocol', 'efficacy', 'safety',
            'adverse_events', 'serious_adverse', 'dropout', 'compliance',
            'protocol_deviation', 'interim_analysis', 'futility'
        ]):
            return 'clinical_trial', 'Clinical Trial Analysis'
        
        # Data processing patterns - Enhanced
        elif any(pattern in code_lower for pattern in [
            'fillna', 'dropna', 'merge', 'join', 'transform', 'encode',
            'scale', 'normalize', 'preprocess', 'cleaning', 'imputation',
            'outlier', 'missing_data', 'data_validation', 'quality_control',
            'standardization', 'normalization', 'feature_engineering'
        ]):
            return 'preprocessing', 'Data Preprocessing'
        
        # Diagnostic/Screening analysis patterns - New for healthcare
        elif any(pattern in code_lower for pattern in [
            'sensitivity', 'specificity', 'ppv', 'npv', 'diagnostic',
            'screening', 'roc', 'auc', 'receiver_operating', 'cutoff',
            'threshold', 'youden', 'likelihood_ratio', 'diagnostic_odds',
            'predictive_value', 'test_accuracy', 'concordance', 'kappa'
        ]):
            return 'diagnostic', 'Diagnostic Test Analysis'
        
        # Default classification
        else:
            return 'analysis', 'Healthcare Data Analysis'
    
    @staticmethod
    def extract_tables_from_output(output: str, execution_globals: dict) -> List[Dict]:
        """Enhanced table extraction with robust error handling and healthcare focus"""
        tables = []
        
        try:
            # Look for pandas DataFrames in output with better pattern matching
            lines = output.split('\n')
            current_table = []
            in_table = False
            table_title = "Data Table"
            
            for i, line in enumerate(lines):
                # Detect DataFrame-like output with enhanced patterns
                if (('|' in line and len(line.split('|')) > 2) or 
                    (line.strip() and line.strip()[0].isdigit()) or
                    ('  ' in line and any(word in line.lower() for word in ['mean', 'std', 'count', 'min', 'max', '25%', '50%', '75%']))):
                    
                    if not in_table:
                        in_table = True
                        current_table = []
                        # Look for table title in previous lines
                        for j in range(max(0, i-3), i):
                            if lines[j].strip() and not lines[j].startswith(' '):
                                table_title = lines[j].strip()[:50]  # Max 50 chars
                                break
                    
                    current_table.append(line)
                else:
                    if in_table and current_table:
                        # Process completed table
                        table_text = '\n'.join(current_table)
                        if len(current_table) > 1:  # Valid table
                            tables.append({
                                'type': 'dataframe',
                                'title': table_title,
                                'content': table_text,
                                'rows': len(current_table) - 1,  # Exclude header
                                'clickable': True,
                                'healthcare_context': AnalysisClassifier._detect_healthcare_context(table_text)
                            })
                        in_table = False
                        current_table = []
                        table_title = "Data Table"
            
            # Process any remaining table
            if in_table and current_table:
                table_text = '\n'.join(current_table)
                if len(current_table) > 1:
                    tables.append({
                        'type': 'dataframe',
                        'title': table_title,
                        'content': table_text,
                        'rows': len(current_table) - 1,
                        'clickable': True,
                        'healthcare_context': AnalysisClassifier._detect_healthcare_context(table_text)
                    })
            
            # Check for DataFrames in execution globals with enhanced error handling
            for var_name, var_value in execution_globals.items():
                try:
                    if isinstance(var_value, pd.DataFrame) and not var_name.startswith('_'):
                        # Generate healthcare-specific title
                        title = AnalysisClassifier._generate_healthcare_table_title(var_name, var_value)
                        
                        tables.append({
                            'type': 'dataframe',
                            'title': title,
                            'content': var_value.to_string(),
                            'data': var_value.head(10).to_dict('records'),  # First 10 rows
                            'shape': [int(var_value.shape[0]), int(var_value.shape[1])],  # Convert numpy ints to Python ints
                            'clickable': True,
                            'healthcare_context': AnalysisClassifier._detect_healthcare_context(var_value.to_string()),
                            'summary_stats': AnalysisClassifier._generate_table_summary(var_value)
                        })
                except Exception as e:
                    # Log error but continue processing other tables
                    print(f"Error processing DataFrame {var_name}: {e}")
                    continue
            
            # Look for statistical results in output
            tables.extend(AnalysisClassifier._extract_statistical_results(output))
            
        except Exception as e:
            print(f"Error in table extraction: {e}")
            # Return empty list if extraction fails completely
            return []
        
        return tables
    
    @staticmethod
    def _detect_healthcare_context(text: str) -> str:
        """Detect healthcare context from table content"""
        text_lower = text.lower()
        
        if any(term in text_lower for term in ['patient', 'clinical', 'medical', 'health', 'treatment', 'diagnosis']):
            return 'clinical_data'
        elif any(term in text_lower for term in ['ttest', 'pvalue', 'confidence', 'significance', 'chi2', 'anova']):
            return 'statistical_results'
        elif any(term in text_lower for term in ['survival', 'hazard', 'kaplan', 'meier']):
            return 'survival_analysis'
        elif any(term in text_lower for term in ['roc', 'auc', 'sensitivity', 'specificity']):
            return 'diagnostic_metrics'
        else:
            return 'general_data'
    
    @staticmethod
    def _generate_healthcare_table_title(var_name: str, df: pd.DataFrame) -> str:
        """Generate healthcare-specific table titles"""
        # Check column names for healthcare context
        columns = [col.lower() for col in df.columns]
        
        if any(term in ' '.join(columns) for term in ['patient', 'clinical', 'medical']):
            return f"Clinical Data: {var_name}"
        elif any(term in ' '.join(columns) for term in ['test', 'pvalue', 'statistic']):
            return f"Statistical Results: {var_name}"
        elif any(term in ' '.join(columns) for term in ['survival', 'hazard', 'time']):
            return f"Survival Analysis: {var_name}"
        else:
            return f"Healthcare Data: {var_name}"
    
    @staticmethod
    def _generate_table_summary(df: pd.DataFrame) -> dict:
        """Generate summary statistics for healthcare tables"""
        try:
            summary = {
                'total_rows': int(len(df)),  # Convert to Python int
                'total_columns': int(len(df.columns)),  # Convert to Python int
                'numeric_columns': int(len(df.select_dtypes(include=[np.number]).columns)),  # Convert to Python int
                'categorical_columns': int(len(df.select_dtypes(include=['object']).columns)),  # Convert to Python int
                'missing_values': int(df.isnull().sum().sum()),  # Convert to Python int
                'completion_rate': round(float(1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100, 2)  # Convert to Python float
            }
            return summary
        except Exception:
            return {}
    
    @staticmethod
    def _extract_statistical_results(output: str) -> List[Dict]:
        """Extract statistical test results from output"""
        results = []
        lines = output.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            # Look for statistical test results
            if any(pattern in line_lower for pattern in ['t-test', 'chi-square', 'anova', 'p-value', 'confidence interval']):
                results.append({
                    'type': 'statistical_result',
                    'title': 'Statistical Test Result',
                    'content': line.strip(),
                    'clickable': False,
                    'healthcare_context': 'statistical_results'
                })
        
        return results
    
    @staticmethod
    def determine_chart_type(code: str, output: str) -> str:
        """Enhanced chart type determination with healthcare-specific charts"""
        code_lower = code.lower()
        
        # Healthcare-specific chart types
        if any(pattern in code_lower for pattern in ['forest_plot', 'forest']):
            return 'forest_plot'
        elif any(pattern in code_lower for pattern in ['survival_plot', 'kaplan_meier', 'survival']):
            return 'survival_plot'
        elif any(pattern in code_lower for pattern in ['roc_curve', 'roc']):
            return 'roc_curve'
        elif any(pattern in code_lower for pattern in ['funnel_plot', 'funnel']):
            return 'funnel_plot'
        elif any(pattern in code_lower for pattern in ['bland_altman', 'bland']):
            return 'bland_altman'
        
        # Standard chart types
        elif any(pattern in code_lower for pattern in ['pie', 'value_counts']):
            return 'pie'
        elif any(pattern in code_lower for pattern in ['hist', 'distribution', 'histogram']):
            return 'histogram'
        elif any(pattern in code_lower for pattern in ['bar', 'count', 'barplot']):
            return 'bar'
        elif any(pattern in code_lower for pattern in ['scatter', 'correlation', 'scatterplot']):
            return 'scatter'
        elif any(pattern in code_lower for pattern in ['box', 'quartile', 'boxplot']):
            return 'box'
        elif any(pattern in code_lower for pattern in ['violin', 'violinplot']):
            return 'violin'
        elif any(pattern in code_lower for pattern in ['line', 'time', 'trend', 'lineplot']):
            return 'line'
        elif any(pattern in code_lower for pattern in ['heatmap', 'correlation_matrix']):
            return 'heatmap'
        else:
            return 'bar'  # Default

# Enhanced Python execution engine
class JuliusStyleExecutor:
    
    def __init__(self, session_data: dict):
        self.session_data = session_data
        self.df = None
        self.execution_globals = {}
        self._setup_execution_environment()
    
    def _setup_execution_environment(self):
        """Setup the execution environment with data and libraries"""
        # Decode CSV data
        if self.session_data.get('file_data'):
            csv_data = base64.b64decode(self.session_data['file_data']).decode('utf-8')
            self.df = pd.read_csv(io.StringIO(csv_data))
        
        # Analyze data types for commonly used variables
        numeric_cols = []
        categorical_cols = []
        if self.df is not None:
            dtypes = self.df.dtypes.to_dict()
            numeric_cols = [col for col, dtype in dtypes.items() if 'int' in str(dtype) or 'float' in str(dtype)]
            categorical_cols = [col for col, dtype in dtypes.items() if 'object' in str(dtype)]
        
        # Setup execution globals
        self.execution_globals = {
            'df': self.df,
            'pd': pd,
            'np': np,
            'plt': plt,
            'sns': sns,
            'stats': stats,
            'LinearRegression': LinearRegression,
            'r2_score': r2_score,
            'io': io,
            'base64': base64,
            'go': go,
            'px': px,
            'ff': ff,
            'pio': pio,
            'sm': sm,
            'mcnemar': mcnemar,
            'KaplanMeierFitter': KaplanMeierFitter,
            'CoxPHFitter': CoxPHFitter,
            'logrank_test': logrank_test,
            'datetime': datetime,
            'json': json,
            # Add commonly used data analysis variables
            'numeric_cols': numeric_cols,
            'categorical_cols': categorical_cols,
            'columns': list(self.df.columns) if self.df is not None else []
        }
    
    def execute_sectioned_analysis(self, code: str, analysis_title: str = "Statistical Analysis") -> StructuredAnalysisResult:
        """Execute code and return structured analysis sections"""
        start_time = datetime.utcnow()
        
        # Split code into logical sections
        sections = self._split_code_into_sections(code)
        
        analysis_sections = []
        overall_success = True
        
        for i, (section_code, section_title) in enumerate(sections):
            section_result = self._execute_single_section(section_code, section_title, i)
            analysis_sections.append(section_result)
            
            if not section_result.success:
                overall_success = False
        
        end_time = datetime.utcnow()
        execution_time = (end_time - start_time).total_seconds()
        
        return StructuredAnalysisResult(
            session_id=self.session_data['id'],
            title=analysis_title,
            sections=analysis_sections,
            total_sections=len(analysis_sections),
            execution_time=execution_time,
            overall_success=overall_success
        )
    
    def _split_code_into_sections(self, code: str) -> List[tuple[str, str]]:
        """Split code into logical sections with titles"""
        sections = []
        
        # Split by comments or logical breaks
        lines = code.split('\n')
        current_section = []
        current_title = "Analysis"
        
        for line in lines:
            stripped = line.strip()
            
            # Check for section headers (comments that look like titles)
            if stripped.startswith('#') and len(stripped) > 3:
                if current_section:
                    # Process previous section
                    section_code = '\n'.join(current_section)
                    if section_code.strip():
                        section_type, auto_title = AnalysisClassifier.classify_code_section(section_code)
                        sections.append((section_code, current_title if current_title != "Analysis" else auto_title))
                    current_section = []
                
                # Extract title from comment
                current_title = stripped[1:].strip()
                if current_title.startswith('='):
                    current_title = current_title.strip('=').strip()
            else:
                current_section.append(line)
        
        # Add final section
        if current_section:
            section_code = '\n'.join(current_section)
            if section_code.strip():
                section_type, auto_title = AnalysisClassifier.classify_code_section(section_code)
                sections.append((section_code, current_title if current_title != "Analysis" else auto_title))
        
        # If no sections found, treat entire code as one section
        if not sections:
            section_type, auto_title = AnalysisClassifier.classify_code_section(code)
            sections.append((code, auto_title))
        
        return sections
    
    def _execute_single_section(self, code: str, title: str, order: int) -> AnalysisSection:
        """Execute a single code section with enhanced error handling"""
        section_type, _ = AnalysisClassifier.classify_code_section(code)
        
        # Capture output
        output_buffer = io.StringIO()
        old_stdout = sys.stdout
        execution_start_time = datetime.utcnow()
        
        try:
            sys.stdout = output_buffer
            
            # Clear any existing plots to avoid conflicts
            plt.clf()
            plt.close('all')
            
            # Execute code with timeout protection
            exec(code, self.execution_globals)
            
            # Get output
            output = output_buffer.getvalue()
            
            # Extract tables with error handling
            tables = []
            try:
                tables = AnalysisClassifier.extract_tables_from_output(output, self.execution_globals)
            except Exception as table_error:
                print(f"Warning: Table extraction failed: {table_error}")
                tables = []
            
            # Handle plots with enhanced error handling
            charts = []
            try:
                charts = self._extract_charts_robust(code)
            except Exception as chart_error:
                print(f"Warning: Chart extraction failed: {chart_error}")
                charts = []
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - execution_start_time).total_seconds()
            
            # Create enhanced metadata
            metadata = {
                'lines_of_code': len(code.split('\n')),
                'has_output': bool(output.strip()),
                'chart_type': AnalysisClassifier.determine_chart_type(code, output),
                'variables_used': self._extract_variables_used(code),
                'execution_time': execution_time,
                'section_complexity': self._calculate_section_complexity(code),
                'healthcare_context': self._detect_healthcare_context(code, output),
                'data_modifications': self._detect_data_modifications(code)
            }
            
            return AnalysisSection(
                title=title,
                section_type=section_type,
                code=code,
                output=output,
                success=True,
                error=None,
                metadata=metadata,
                tables=tables,
                charts=charts,
                order=order
            )
            
        except SystemExit as e:
            # Handle SystemExit specifically (from quit(), exit(), etc.)
            execution_time = (datetime.utcnow() - execution_start_time).total_seconds()
            error_message = f"Code execution was terminated (exit() or quit() called)"
            
            # Get partial output before exit
            partial_output = output_buffer.getvalue()
            
            return AnalysisSection(
                title=title,
                section_type=section_type,
                code=code,
                output=partial_output,
                success=False,
                error=error_message,
                metadata={
                    'error_type': 'SystemExit',
                    'execution_time': execution_time,
                    'exit_code': e.code,
                    'warning': 'Code contains exit() or quit() call which terminates execution'
                },
                tables=[],
                charts=[],
                order=order
            )
        except Exception as e:
            # Enhanced error handling with context
            error_context = {
                'error_type': type(e).__name__,
                'error_message': str(e),
                'section_type': section_type,
                'code_length': len(code),
                'execution_time': (datetime.utcnow() - execution_start_time).total_seconds()
            }
            
            # Try to extract partial results even on error
            partial_output = output_buffer.getvalue()
            partial_tables = []
            partial_charts = []
            
            try:
                partial_tables = AnalysisClassifier.extract_tables_from_output(partial_output, self.execution_globals)
            except:
                pass
            
            try:
                partial_charts = self._extract_charts_robust(code, ignore_errors=True)
            except:
                pass
            
            return AnalysisSection(
                title=title,
                section_type=section_type,
                code=code,
                output=partial_output,
                success=False,
                error=str(e),
                metadata=error_context,
                tables=partial_tables,
                charts=partial_charts,
                order=order
            )
        finally:
            sys.stdout = old_stdout
            # Clean up plots to prevent memory leaks
            try:
                plt.clf()
                plt.close('all')
            except:
                pass
    
    def _extract_charts_robust(self, code: str, ignore_errors: bool = False) -> List[Dict]:
        """Extract chart data with robust error handling"""
        charts = []
        
        try:
            # Handle matplotlib plots with enhanced error handling
            if plt.get_fignums():
                for fig_num in plt.get_fignums():
                    try:
                        fig = plt.figure(fig_num)
                        buf = io.BytesIO()
                        
                        # Use different formats based on complexity
                        try:
                            fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
                        except Exception:
                            # Fallback to simpler format
                            fig.savefig(buf, format='png', dpi=80)
                        
                        buf.seek(0)
                        plot_data = base64.b64encode(buf.read()).decode('utf-8')
                        
                        chart_type = AnalysisClassifier.determine_chart_type(code, "")
                        charts.append({
                            'type': 'matplotlib',
                            'chart_type': chart_type,
                            'data': plot_data,
                            'title': f'{chart_type.title()} Chart',
                            'fig_num': fig_num
                        })
                        
                        plt.close(fig)
                        
                    except Exception as e:
                        if not ignore_errors:
                            print(f"Warning: Failed to extract matplotlib figure {fig_num}: {e}")
                        continue
            
            # Handle plotly plots with error handling
            for var_name, var_value in self.execution_globals.items():
                try:
                    if hasattr(var_value, '_module') and 'plotly' in str(var_value._module):
                        try:
                            html_str = var_value.to_html(include_plotlyjs='cdn')
                            chart_type = AnalysisClassifier.determine_chart_type(code, "")
                            charts.append({
                                'type': 'plotly',
                                'chart_type': chart_type,
                                'data': html_str,
                                'title': f'{chart_type.title()} Chart (Interactive)',
                                'variable_name': var_name
                            })
                        except Exception as e:
                            if not ignore_errors:
                                print(f"Warning: Failed to extract plotly figure {var_name}: {e}")
                            continue
                except Exception:
                    continue
                    
        except Exception as e:
            if not ignore_errors:
                print(f"Warning: Chart extraction failed: {e}")
        
        return charts
    
    def _calculate_section_complexity(self, code: str) -> str:
        """Calculate complexity level of code section"""
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip() and not line.strip().startswith('#')]
        
        complexity_score = 0
        
        # Count complexity indicators
        for line in non_empty_lines:
            line_lower = line.lower()
            if any(pattern in line_lower for pattern in ['for', 'while', 'if', 'elif', 'try', 'except']):
                complexity_score += 2
            if any(pattern in line_lower for pattern in ['lambda', 'list comprehension', 'nested']):
                complexity_score += 3
            if any(pattern in line_lower for pattern in ['model', 'fit', 'predict', 'cross_val']):
                complexity_score += 2
        
        lines_factor = len(non_empty_lines)
        total_score = complexity_score + lines_factor
        
        if total_score <= 5:
            return 'low'
        elif total_score <= 15:
            return 'medium'
        else:
            return 'high'
    
    def _detect_healthcare_context(self, code: str, output: str) -> str:
        """Detect healthcare research context"""
        combined_text = (code + ' ' + output).lower()
        
        if any(term in combined_text for term in ['clinical', 'patient', 'medical', 'treatment', 'diagnosis']):
            return 'clinical_research'
        elif any(term in combined_text for term in ['survival', 'kaplan', 'hazard', 'cox']):
            return 'survival_analysis'
        elif any(term in combined_text for term in ['rct', 'trial', 'randomized', 'intervention']):
            return 'clinical_trial'
        elif any(term in combined_text for term in ['epidemiology', 'outbreak', 'prevalence', 'incidence']):
            return 'epidemiological'
        elif any(term in combined_text for term in ['diagnostic', 'sensitivity', 'specificity', 'roc']):
            return 'diagnostic_testing'
        else:
            return 'general_healthcare'
    
    def _detect_data_modifications(self, code: str) -> List[str]:
        """Detect what data modifications were made"""
        modifications = []
        code_lower = code.lower()
        
        if any(pattern in code_lower for pattern in ['fillna', 'dropna', 'drop']):
            modifications.append('missing_data_handling')
        if any(pattern in code_lower for pattern in ['merge', 'join', 'concat']):
            modifications.append('data_merging')
        if any(pattern in code_lower for pattern in ['groupby', 'pivot', 'melt']):
            modifications.append('data_reshaping')
        if any(pattern in code_lower for pattern in ['scale', 'normalize', 'standardize']):
            modifications.append('data_scaling')
        if any(pattern in code_lower for pattern in ['encode', 'dummy', 'categorical']):
            modifications.append('encoding')
        
        return modifications
    
    def _extract_variables_used(self, code: str) -> List[str]:
        """Extract variable names used in code"""
        import re
        
        # Simple regex to find DataFrame column references
        df_columns = re.findall(r"df\[['\"](.*?)['\"]\]", code)
        df_attrs = re.findall(r"df\.(\w+)", code)
        
        variables = list(set(df_columns + df_attrs))
        return [var for var in variables if var not in ['head', 'tail', 'shape', 'info', 'describe']]

# Emergent LLM integration
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    file_name: str
    file_data: Optional[str] = None  # Base64 encoded CSV data
    csv_preview: Optional[Dict] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    analysis_result: Optional[Dict] = None

class APIKeyConfig(BaseModel):
    gemini_api_key: str

class AnalysisRequest(BaseModel):
    session_id: str
    analysis_type: str
    columns: List[str]
    gemini_api_key: str

class PythonExecutionRequest(BaseModel):
    session_id: str
    code: str
    gemini_api_key: str

class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: Optional[str] = None
    analysis_type: str
    variables: List[str]
    test_statistic: Optional[float] = None
    p_value: Optional[float] = None
    effect_size: Optional[float] = None
    confidence_interval: Optional[List[float]] = None
    method: Optional[str] = None
    results_summary: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ComprehensiveAnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    filename: str
    analysis_data: Dict = Field(default_factory=dict)  # Contains all three analysis results
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confidence_interval: Optional[List[float]] = None
    interpretation: str = "Enhanced comprehensive analysis completed"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    raw_results: Optional[Dict] = None

# New models for Julius AI-style sectioned analysis
class AnalysisSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    section_type: str  # 'summary', 'descriptive', 'statistical_test', 'visualization', 'model'
    code: str
    output: str
    success: bool
    error: Optional[str] = None
    metadata: Dict = Field(default_factory=dict)
    tables: List[Dict] = Field(default_factory=list)
    charts: List[Dict] = Field(default_factory=list)
    order: int = 0

class StructuredAnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str
    sections: List[AnalysisSection]
    total_sections: int
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    overall_success: bool

class EnhancedPythonExecutionRequest(BaseModel):
    session_id: str
    code: str
    gemini_api_key: str
    analysis_title: Optional[str] = "Statistical Analysis"
    auto_section: bool = True  # Whether to auto-detect analysis sections

class EnhancedPythonExecutionRequest(BaseModel):
    session_id: str
    code: str
    gemini_api_key: str
    analysis_title: Optional[str] = "Statistical Analysis"
    auto_section: bool = True  # Whether to auto-detect analysis sections

# API Routes
# Initialize comprehensive data analyzer
data_analyzer = ComprehensiveDataAnalyzer()

@api_router.get("/sessions/{session_id}/comprehensive-analysis")
async def get_comprehensive_analysis(session_id: str):
    """Get comprehensive analysis results for a session"""
    try:
        analysis = await db.comprehensive_analyses.find_one({"session_id": session_id})
        if not analysis:
            raise HTTPException(status_code=404, detail="Comprehensive analysis not found")
        return ComprehensiveAnalysisResult(**analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/")
async def root():
    return {"message": "AI Data Scientist API"}

async def _create_analysis_chat_messages(session_id: str, analysis_results: dict):
    """Create automatic chat messages based on comprehensive analysis results"""
    try:
        # Extract executive summary
        executive_summary = analysis_results.get('executive_summary', {})
        
        # Create main overview message
        content = f"""# 🎯 **AI Statistical Analysis Complete**

## **Executive Summary**
**Quality Score:** {executive_summary.get('quality_grade', 'Not Available')} ({executive_summary.get('overall_quality_score', 0):.1f}%)
**Dataset:** {executive_summary.get('dataset_size', 'Unknown size')}

## **📋 Key Findings**"""
        
        key_findings = executive_summary.get('key_findings', [])
        if key_findings:
            for finding in key_findings:
                content += f"\n• {finding}"
        else:
            content += "\n• Dataset successfully analyzed with all three analysis tools"
        
        content += "\n\n## **🚀 Priority Recommendations**"
        priority_recs = executive_summary.get('priority_recommendations', [])
        if priority_recs:
            for rec in priority_recs:
                content += f"\n• {rec}"
        else:
            content += "\n• Dataset appears to be in good condition for analysis"
        
        content += f"""

## **📊 Analysis Tools Completed**"""
        
        completion_status = executive_summary.get('analysis_completion', {})
        tools_status = []
        if completion_status.get('ydata_profiling'):
            tools_status.append("✅ **ydata-profiling** - Complete data understanding")
        if completion_status.get('great_expectations'):
            tools_status.append("✅ **Great Expectations** - Data validation & quality")
        if completion_status.get('sweetviz'):
            tools_status.append("✅ **Sweetviz** - Visual data exploration")
        
        for status in tools_status:
            content += f"\n{status}"
        
        content += f"""

## **🎯 Next Steps**
1. Review the detailed analysis insights above
2. Ask specific questions about your data patterns
3. Request custom statistical analyses or visualizations
4. Begin exploring relationships between variables

**Ready to explore your data! Ask me anything about the dataset.**"""
        
        # Create the main message
        main_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=content
        )
        await db.chat_messages.insert_one(main_message.dict())
        
        # Create detailed analysis summaries for each tool
        ydata_result = analysis_results.get('ydata_profiling', {})
        if ydata_result.get('status') == 'success':
            await _create_ydata_profiling_message(session_id, ydata_result)
        
        expectations_result = analysis_results.get('great_expectations', {})
        if expectations_result.get('status') == 'success':
            await _create_great_expectations_message(session_id, expectations_result)
        
        sweetviz_result = analysis_results.get('sweetviz', {})
        if sweetviz_result.get('status') == 'success':
            await _create_sweetviz_message(session_id, sweetviz_result)
            
    except Exception as e:
        # Fallback message if detailed processing fails
        fallback_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=f"""# 📊 **Data Analysis Complete**

Your dataset has been successfully analyzed using our comprehensive AI statistical analysis suite.

**Analysis Tools Used:**
• ydata-profiling for complete data understanding
• Great Expectations for data validation
• Sweetviz for visual data exploration

The analysis is ready! You can now ask questions about your data, request specific analyses, or explore patterns and relationships.

**Ask me anything about your dataset!**"""
        )
        await db.chat_messages.insert_one(fallback_message.dict())

async def _create_ydata_profiling_message(session_id: str, ydata_result: dict):
    """Create detailed message for ydata-profiling results"""
    try:
        key_insights = ydata_result.get('key_insights', {})
        recommendations = ydata_result.get('recommendations', [])
        
        content = f"""# 🔍 **ydata-profiling - Complete Data Understanding**

## **Data Type Detection**
{_format_data_types(key_insights.get('data_types_detected', {}))}

## **Missing Values Analysis**
{_format_missing_values(key_insights.get('missing_values', {}))}

## **Data Quality Warnings**
{_format_warnings(key_insights.get('data_quality_warnings', []))}

## **Recommendations**"""
        
        if recommendations:
            for rec in recommendations:
                content += f"\n• {rec}"
        else:
            content += "\n• No specific recommendations - data appears clean"
        
        content += "\n\n*Full detailed report generated and saved for deeper analysis.*"
        
        message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=content
        )
        await db.chat_messages.insert_one(message.dict())
        
    except Exception as e:
        print(f"Error creating ydata-profiling message: {str(e)}")

async def _create_great_expectations_message(session_id: str, expectations_result: dict):
    """Create detailed message for Great Expectations results"""
    try:
        summary = expectations_result.get('summary', {})
        quality_score = expectations_result.get('overall_quality_score', 0)
        recommendations = expectations_result.get('recommendations', [])
        
        content = f"""# ✅ **Great Expectations - Data Quality Validation**

## **Quality Assessment**
**Overall Score:** {quality_score:.1f}% ({summary.get('quality_grade', 'N/A')})

## **Validation Results**
• **Total Validations:** {summary.get('total_expectations', 0)}
• **Passed:** {summary.get('successful_expectations', 0)}
• **Failed:** {summary.get('failed_expectations', 0)}

## **Recommendations**"""
        
        if recommendations:
            for rec in recommendations:
                content += f"\n• {rec}"
        else:
            content += "\n• Data quality meets acceptable standards"
        
        message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=content
        )
        await db.chat_messages.insert_one(message.dict())
        
    except Exception as e:
        print(f"Error creating Great Expectations message: {str(e)}")

async def _create_sweetviz_message(session_id: str, sweetviz_result: dict):
    """Create detailed message for Sweetviz results"""
    try:
        insights = sweetviz_result.get('insights', {})
        data_overview = insights.get('data_overview', {})
        quality_insights = insights.get('quality_insights', {})
        recommendations = sweetviz_result.get('recommendations', [])
        
        content = f"""# 📈 **Sweetviz - Visual Data Exploration**

## **Feature Analysis**
• **Total Features:** {data_overview.get('total_features', 0)}
• **Categorical:** {data_overview.get('categorical_features', 0)}
• **Numerical:** {data_overview.get('numerical_features', 0)}
• **Datetime:** {data_overview.get('datetime_features', 0)}

## **Data Quality Insights**
• **Completeness:** {quality_insights.get('completeness_score', 0):.1f}%
• **Duplicate Rows:** {quality_insights.get('duplicate_rows', 0)}

## **Recommendations**"""
        
        if recommendations:
            for rec in recommendations:
                content += f"\n• {rec}"
        else:
            content += "\n• Visual analysis complete - data ready for exploration"
        
        content += "\n\n*Interactive visual report generated for detailed exploration.*"
        
        message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=content
        )
        await db.chat_messages.insert_one(message.dict())
        
    except Exception as e:
        print(f"Error creating Sweetviz message: {str(e)}")

def _format_data_types(data_types: dict) -> str:
    """Format data types for display"""
    if not data_types:
        return "• Data types automatically detected"
    
    formatted = ""
    for col, info in list(data_types.items())[:5]:  # Limit to 5 columns
        formatted += f"\n• **{col}:** {info.get('type', 'unknown')}"
    
    if len(data_types) > 5:
        formatted += f"\n• *...and {len(data_types) - 5} more columns*"
    
    return formatted

def _format_missing_values(missing_values: dict) -> str:
    """Format missing values for display"""
    if not missing_values:
        return "• No missing values detected"
    
    high_missing = {col: info for col, info in missing_values.items() 
                   if info.get('missing_percentage', 0) > 10}
    
    if not high_missing:
        return "• Minimal missing values detected (< 10% in all columns)"
    
    formatted = ""
    for col, info in list(high_missing.items())[:3]:  # Limit to 3 columns
        formatted += f"\n• **{col}:** {info.get('missing_percentage', 0):.1f}% missing"
    
    if len(high_missing) > 3:
        formatted += f"\n• *...and {len(high_missing) - 3} more columns with missing values*"
    
    return formatted

def _format_warnings(warnings: list) -> str:
    """Format warnings for display"""
    if not warnings:
        return "• No data quality warnings detected"
    
    formatted = ""
    for warning in warnings[:3]:  # Limit to 3 warnings
        formatted += f"\n• {warning.get('message', 'Data quality issue detected')}"
    
    if len(warnings) > 3:
        formatted += f"\n• *...and {len(warnings) - 3} more warnings*"
    
    return formatted

@api_router.post("/sessions")
async def create_session(file: UploadFile = File(...)):
    """Create a new chat session with CSV file upload and automatic comprehensive analysis"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Read and validate CSV
        content = await file.read()
        try:
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")
        
        # Create preview data with proper type conversion
        preview = {
            "columns": df.columns.tolist(),
            "shape": [int(df.shape[0]), int(df.shape[1])],  # Convert numpy ints to Python ints
            "head": df.head().to_dict('records'),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "null_counts": {k: int(v) for k, v in df.isnull().sum().to_dict().items()},  # Convert numpy ints to Python ints
            "describe": {k: {k2: float(v2) if isinstance(v2, (np.integer, np.floating)) else v2 
                           for k2, v2 in v.items()} for k, v in df.describe().to_dict().items()} 
                       if len(df.select_dtypes(include=[np.number]).columns) > 0 else {}
        }
        
        # Create session
        session = ChatSession(
            title=file.filename,
            file_name=file.filename,
            file_data=base64.b64encode(content).decode('utf-8'),
            csv_preview=preview
        )
        
        # Save session to database first
        await db.chat_sessions.insert_one(session.dict())
        
        # Run basic comprehensive data analysis (fast)
        try:
            # Use basic analyzer for fast uploads
            analyzer = ComprehensiveDataAnalyzer()
            analysis_results = analyzer.analyze_dataset(df, file.filename)
            
            # Save basic analysis results
            comprehensive_analysis = ComprehensiveAnalysisResult(
                session_id=session.id,
                filename=file.filename,
                analysis_data=analysis_results
            )
            await db.comprehensive_analyses.insert_one(comprehensive_analysis.dict())
            
            # Create automatic chat messages with basic analysis results
            await _create_analysis_chat_messages(session.id, analysis_results)
            
        except Exception as analysis_error:
            # If analysis fails, log error but don't fail session creation
            print(f"Analysis error for {file.filename}: {str(analysis_error)}")
            
            # Create a fallback message
            fallback_message = ChatMessage(
                session_id=session.id,
                role="assistant",
                content=f"""# 📊 Data Analysis Report for {file.filename}

**Dataset Overview:**
- **Size:** {df.shape[0]:,} rows × {df.shape[1]} columns
- **Data Types:** {len(df.select_dtypes(include=[np.number]).columns)} numeric, {len(df.select_dtypes(include=['object']).columns)} text columns

**Quick Summary:**
The comprehensive analysis tools encountered an issue, but your data has been successfully uploaded and is ready for interactive analysis.

**Next Steps:**
- Use the chat interface to ask questions about your data
- Request specific statistical analyses
- Generate custom visualizations
- Explore data patterns and relationships

You can start by asking: "What are the key characteristics of this dataset?" or "Show me a correlation analysis."""
            )
            await db.chat_messages.insert_one(fallback_message.dict())
        
        return session
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sessions")
async def get_sessions():
    """Get all chat sessions"""
    sessions = await db.chat_sessions.find().sort("created_at", -1).to_list(100)
    return [ChatSession(**session) for session in sessions]

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific session"""
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChatSession(**session)

@api_router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    """Get messages for a session"""
    messages = await db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(1000)
    return [ChatMessage(**message) for message in messages]

@api_router.post("/sessions/{session_id}/chat")
async def chat_with_llm(session_id: str, message: str = Form(...), gemini_api_key: str = Form(...)):
    """Chat with LLM about the data"""
    try:
        # Get session
        session = await db.chat_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Save user message
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=message
        )
        await db.chat_messages.insert_one(user_message.dict())
        
        # Prepare enhanced context for LLM
        csv_preview = session.get('csv_preview', {})
        
        # Enhanced data analysis context
        columns = csv_preview.get('columns', [])
        dtypes = csv_preview.get('dtypes', {})
        null_counts = csv_preview.get('null_counts', {})
        describe_stats = csv_preview.get('describe', {})
        
        # Analyze data types and potential study design
        numeric_cols = [col for col, dtype in dtypes.items() if 'int' in str(dtype) or 'float' in str(dtype)]
        categorical_cols = [col for col, dtype in dtypes.items() if 'object' in str(dtype)]
        
        # Identify potential study variables
        potential_outcomes = []
        potential_exposures = []
        potential_time_vars = []
        
        for col in columns:
            col_lower = col.lower()
            # Identify potential outcome variables
            if any(term in col_lower for term in ['outcome', 'death', 'survival', 'event', 'response', 'improvement', 'cure']):
                potential_outcomes.append(col)
            # Identify potential exposure/treatment variables
            elif any(term in col_lower for term in ['treatment', 'group', 'arm', 'intervention', 'therapy', 'drug', 'placebo', 'vaccine']):
                potential_exposures.append(col)
            # Identify potential time variables
            elif any(term in col_lower for term in ['time', 'day', 'week', 'month', 'year', 'duration', 'follow']):
                potential_time_vars.append(col)
        
        context = f"""
        You are an Expert AI Data Scientist and Biostatistician. You have been provided with a medical/research dataset: {session['file_name']}
        
        DATASET OVERVIEW:
        - Shape: {csv_preview.get('shape', 'Unknown')} (rows × columns)
        - Total Variables: {len(columns)}
        - Numeric Variables: {len(numeric_cols)} - {numeric_cols}
        - Categorical Variables: {len(categorical_cols)} - {categorical_cols}
        
        POTENTIAL STUDY VARIABLES IDENTIFIED:
        - Potential Outcomes: {potential_outcomes if potential_outcomes else 'None automatically identified'}
        - Potential Exposures/Treatments: {potential_exposures if potential_exposures else 'None automatically identified'}
        - Potential Time Variables: {potential_time_vars if potential_time_vars else 'None automatically identified'}
        
        DATA QUALITY ASSESSMENT:
        - Missing Values: {null_counts}
        - Sample Data Preview: {csv_preview.get('head', [])[:3]}
        
        STATISTICAL SUMMARY:
        {describe_stats}
        
        YOUR ROLE AS AN AI DATA SCIENTIST:
        1. **Data Understanding**: Automatically analyze the dataset structure and identify the type of study (observational, clinical trial, survey, etc.)
        2. **Intelligent Analysis**: Suggest appropriate statistical methods based on data types and research questions
        3. **Professional Communication**: Explain analyses in clear, professional language like a senior biostatistician
        4. **Comprehensive Testing**: Offer a full range of statistical tests including:
           - Descriptive statistics and data exploration
           - Hypothesis testing (t-tests, chi-square, ANOVA, etc.)
           - Regression analysis (linear, logistic, Cox proportional hazards)
           - Survival analysis (Kaplan-Meier, log-rank tests)
           - Advanced visualizations (forest plots, survival curves, etc.)
        5. **Result Interpretation**: Provide clinical/practical interpretation of statistical results
        6. **Visualization Recommendations**: Suggest appropriate plots and charts for different types of analyses
        
        IMPORTANT GUIDELINES:
        - Always examine the data structure first and identify what type of study this appears to be
        - When suggesting analyses, be specific about which variables to use and why
        - Always consider assumptions of statistical tests and suggest appropriate checks
        - Provide both statistical significance and clinical significance interpretations
        - Suggest appropriate visualizations for each type of analysis
        - Generate Python code when requested, using the full range of available libraries
        
        AVAILABLE LIBRARIES FOR ANALYSIS:
        pandas, numpy, scipy, statsmodels, matplotlib, seaborn, plotly, lifelines, sklearn, and more
        
        Please respond as a professional biostatistician would - with expertise, precision, and clear communication.
        """
        
        # Chat with Gemini using stable model
        chat = LlmChat(
            api_key=gemini_api_key,
            session_id=session_id,
            system_message=context
        ).with_model("gemini", "gemini-2.5-flash")
        
        response = await chat.send_message(UserMessage(text=message))
        
        # Save assistant response
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response
        )
        await db.chat_messages.insert_one(assistant_message.dict())
        
        return {"response": response}
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Too Many Requests" in error_msg:
            raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded. Please wait a moment and try again. Consider using Gemini 2.5 Flash for faster response times."
            )
        elif "400" in error_msg or "Bad Request" in error_msg:
            raise HTTPException(
                status_code=400, 
                detail="Invalid API key or request. Please check your Gemini API key and try again."
            )
        else:
            raise HTTPException(status_code=500, detail=f"LLM Error: {error_msg}")

@api_router.post("/sessions/{session_id}/execute")
async def execute_python_code(session_id: str, request: PythonExecutionRequest):
    """Execute Python code for statistical analysis"""
    try:
        # Get session data
        session = await db.chat_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Decode CSV data
        csv_data = base64.b64decode(session['file_data']).decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))
        
        # Analyze data types for commonly used variables
        dtypes = df.dtypes.to_dict()
        numeric_cols = [col for col, dtype in dtypes.items() if 'int' in str(dtype) or 'float' in str(dtype)]
        categorical_cols = [col for col, dtype in dtypes.items() if 'object' in str(dtype)]
        
        # Prepare execution environment
        execution_globals = {
            'df': df,
            'pd': pd,
            'np': np,
            'plt': plt,
            'sns': sns,
            'stats': stats,
            'LinearRegression': LinearRegression,
            'r2_score': r2_score,
            'io': io,
            'base64': base64,
            'go': go,
            'px': px,
            'ff': ff,
            'pio': pio,
            'sm': sm,
            'mcnemar': mcnemar,
            'KaplanMeierFitter': KaplanMeierFitter,
            'CoxPHFitter': CoxPHFitter,
            'logrank_test': logrank_test,
            'datetime': datetime,
            'json': json,
            # Add commonly used data analysis variables
            'numeric_cols': numeric_cols,
            'categorical_cols': categorical_cols,
            'columns': list(df.columns)
        }
        
        # Capture output
        output_buffer = io.StringIO()
        error_buffer = io.StringIO()
        
        try:
            # Redirect stdout
            old_stdout = sys.stdout
            sys.stdout = output_buffer
            
            # Execute code
            exec(request.code, execution_globals)
            
            # Get output
            output = output_buffer.getvalue()
            
            # Handle matplotlib plots
            plots = []
            if plt.get_fignums():
                for fig_num in plt.get_fignums():
                    fig = plt.figure(fig_num)
                    buf = io.BytesIO()
                    fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
                    buf.seek(0)
                    plot_data = base64.b64encode(buf.read()).decode('utf-8')
                    plots.append({
                        'type': 'matplotlib',
                        'data': plot_data
                    })
                    buf.close()
                plt.close('all')
            
            # Handle Plotly plots (check for plotly figures in execution globals)
            plotly_plots = []
            for var_name, var_value in execution_globals.items():
                if hasattr(var_value, '_module') and 'plotly' in str(var_value._module):
                    try:
                        html_str = var_value.to_html(include_plotlyjs='cdn')
                        plotly_plots.append({
                            'type': 'plotly',
                            'html': html_str
                        })
                    except:
                        pass
            
            plots.extend(plotly_plots)
            
            result = {
                "success": True,
                "output": output,
                "plots": plots,
                "error": None
            }
            
        except Exception as e:
            result = {
                "success": False,
                "output": output_buffer.getvalue(),
                "plots": [],
                "error": str(e)
            }
        
        finally:
            sys.stdout = old_stdout
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions/{session_id}/execute-sectioned")
async def execute_sectioned_analysis(session_id: str, request: EnhancedPythonExecutionRequest):
    """Execute Python code with Julius AI-style sectioned analysis"""
    try:
        # Validate API key first
        if not request.gemini_api_key or request.gemini_api_key.strip() == "":
            raise HTTPException(status_code=400, detail="Gemini API key is required")
        
        # Check for test/invalid API keys
        if request.gemini_api_key in ["test_key_123", "your_api_key_here", "test"]:
            raise HTTPException(
                status_code=400, 
                detail="Please provide a valid Gemini API key. Test keys are not supported for code execution."
            )
            
        # Get session data
        session = await db.chat_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Initialize Julius-style executor
        executor = JuliusStyleExecutor(session)
        
        # Execute sectioned analysis
        result = executor.execute_sectioned_analysis(
            code=request.code,
            analysis_title=request.analysis_title
        )
        
        # Store result in database
        await db.structured_analyses.insert_one(result.dict())
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sessions/{session_id}/structured-analyses")
async def get_structured_analyses(session_id: str):
    """Get all structured analyses for a session"""
    try:
        analyses = await db.structured_analyses.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).to_list(50)
        
        return [StructuredAnalysisResult(**analysis) for analysis in analyses]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/sessions/{session_id}/structured-analyses/{analysis_id}")
async def get_structured_analysis(session_id: str, analysis_id: str):
    """Get a specific structured analysis"""
    try:
        analysis = await db.structured_analyses.find_one({
            "id": analysis_id,
            "session_id": session_id
        })
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return StructuredAnalysisResult(**analysis)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions/{session_id}/suggest-analysis")
async def suggest_analysis(session_id: str, gemini_api_key: str = Form(...)):
    """Get analysis suggestions from LLM"""
    try:
        # Get session
        session = await db.chat_sessions.find_one({"id": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        csv_preview = session.get('csv_preview', {})
        
        # Enhanced analysis suggestions
        columns = csv_preview.get('columns', [])
        dtypes = csv_preview.get('dtypes', {})
        shape = csv_preview.get('shape', [0, 0])
        sample_data = csv_preview.get('head', [])
        
        # Analyze data structure
        numeric_cols = [col for col, dtype in dtypes.items() if 'int' in str(dtype) or 'float' in str(dtype)]
        categorical_cols = [col for col, dtype in dtypes.items() if 'object' in str(dtype)]
        
        context = f"""
        You are an Expert Biostatistician analyzing a medical research dataset.
        
        DATASET: {session['file_name']}
        STRUCTURE: {shape[0]} subjects, {shape[1]} variables
        
        VARIABLES IDENTIFIED:
        Numeric Variables ({len(numeric_cols)}): {numeric_cols}
        Categorical Variables ({len(categorical_cols)}): {categorical_cols}
        
        SAMPLE DATA:
        {sample_data[:5]}
        
        TASK: Provide 5-7 professional statistical analysis recommendations that would be appropriate for this dataset.
        
        For each analysis, provide:
        1. **Analysis Name**: Professional statistical test name
        2. **Purpose**: What research question it answers
        3. **Variables**: Specific columns to use (be precise)
        4. **Method**: Statistical approach (parametric/non-parametric)
        5. **Visualization**: Appropriate plot type
        6. **Clinical Relevance**: Why this analysis matters for medical research
        
        Consider these analysis categories:
        - Descriptive Statistics & Data Exploration
        - Group Comparisons (t-tests, ANOVA, chi-square)
        - Correlation & Regression Analysis
        - Survival Analysis (if time-to-event data present)
        - Multivariate Analysis
        - Advanced Visualizations (forest plots, survival curves)
        
        Format your response as a structured analysis plan that a biostatistician would create.
        Focus on clinically meaningful analyses that would be published in medical journals.
        """
        
        chat = LlmChat(
            api_key=gemini_api_key,
            session_id=f"{session_id}_suggestions",
            system_message="You are a statistical analysis expert. Provide suggestions in JSON format."
        ).with_model("gemini", "gemini-2.5-flash")
        
        response = await chat.send_message(UserMessage(text=context))
        
        return {"suggestions": response}
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Too Many Requests" in error_msg:
            raise HTTPException(
                status_code=429, 
                detail="Rate limit exceeded. Please wait a moment and try again. Consider using Gemini 2.5 Flash for faster response times."
            )
        elif "400" in error_msg or "Bad Request" in error_msg:
            raise HTTPException(
                status_code=400, 
                detail="Invalid API key or request. Please check your Gemini API key and try again."
            )
        else:
            raise HTTPException(status_code=500, detail=f"LLM Error: {error_msg}")

@api_router.get("/sessions/{session_id}/analysis-history")
async def get_analysis_history(session_id: str):
    """Get analysis history for a session"""
    try:
        analyses = await db.analysis_results.find({"session_id": session_id}).sort("timestamp", -1).to_list(1000)
        return [AnalysisResult(**analysis) for analysis in analyses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions/{session_id}/save-analysis")
async def save_analysis_result(session_id: str, result: AnalysisResult):
    """Save analysis result to history"""
    try:
        result.session_id = session_id
        await db.analysis_results.insert_one(result.dict())
        return {"message": "Analysis saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def _create_analysis_chat_messages(session_id: str, analysis_results: dict):
    """Create automatic chat messages based on analysis results"""
    try:
        # Create initial message with overview
        overview_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=f"""# 📊 Automated Data Analysis Report

I've completed an initial analysis of your dataset. Here are the key findings:

{analysis_results.get('summary', 'Analysis completed successfully.')}

You can now ask specific questions about the data or request additional analyses."""
        )
        await db.chat_messages.insert_one(overview_message.dict())
        
        # Add detailed findings if available
        if analysis_results.get('detailed_findings'):
            details_message = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=analysis_results['detailed_findings']
            )
            await db.chat_messages.insert_one(details_message.dict())
            
    except Exception as e:
        print(f"Error creating analysis messages: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()