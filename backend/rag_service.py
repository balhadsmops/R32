"""
Enhanced RAG Service with ChromaDB for AI Statistical Analysis
Sophisticated query understanding and semantic search capabilities
"""

import os
import uuid
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import re
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryType(Enum):
    """Query classification types"""
    DESCRIPTIVE = "descriptive"
    INFERENTIAL = "inferential"
    CORRELATION = "correlation"
    VISUALIZATION = "visualization"
    COMPARISON = "comparison"
    PREDICTIVE = "predictive"
    TEMPORAL = "temporal"
    DISTRIBUTION = "distribution"
    OUTLIER = "outlier"
    SUMMARY = "summary"

@dataclass
class QueryIntent:
    """Structured query intent representation"""
    type: QueryType
    variables: List[str]
    operations: List[str]
    filters: Dict[str, Any]
    confidence: float
    statistical_tests: List[str]
    visualization_type: Optional[str] = None

@dataclass
class DataChunk:
    """Structured data chunk with metadata"""
    id: str
    content: str
    chunk_type: str  # 'row_group', 'column_group', 'statistical_summary', 'correlation_matrix'
    variables: List[str]
    data_types: Dict[str, str]
    statistical_context: Dict[str, Any]
    metadata: Dict[str, Any]

class QueryClassifier:
    """Advanced query classification system"""
    
    def __init__(self):
        self.descriptive_patterns = [
            r'\b(describe|summary|overview|statistics|mean|average|median|mode|std|variance|distribution)\b',
            r'\b(what is|what are|show me|tell me about|describe)\b',
            r'\b(characteristics|profile|basic stats|descriptive)\b'
        ]
        
        self.inferential_patterns = [
            r'\b(test|hypothesis|significance|p-value|confidence|interval)\b',
            r'\b(ttest|anova|chi-square|regression|correlation test)\b',
            r'\b(difference|association|relationship|effect)\b'
        ]
        
        self.correlation_patterns = [
            r'\b(correlat|relationship|association|connect)\b',
            r'\b(relate|link|depend|influence|affect)\b',
            r'\b(between|among|with)\b.*\b(and|&)\b'
        ]
        
        self.visualization_patterns = [
            r'\b(plot|graph|chart|visualize|show|display)\b',
            r'\b(histogram|scatter|bar|line|box|heatmap)\b',
            r'\b(trend|pattern|distribution)\b'
        ]
        
        self.comparison_patterns = [
            r'\b(compare|contrast|difference|versus|vs|against)\b',
            r'\b(group|category|segment|cohort)\b',
            r'\b(higher|lower|greater|less|more|fewer)\b'
        ]
        
        self.predictive_patterns = [
            r'\b(predict|forecast|model|estimate|project)\b',
            r'\b(future|outcome|result|prognosis)\b',
            r'\b(regression|machine learning|ml|classification)\b'
        ]
        
        self.temporal_patterns = [
            r'\b(time|temporal|trend|over time|longitudinal)\b',
            r'\b(before|after|during|period|season)\b',
            r'\b(change|evolution|progression|development)\b'
        ]
        
        self.statistical_test_patterns = {
            'ttest': r'\b(t-test|ttest|paired|unpaired|independent|student)\b',
            'anova': r'\b(anova|analysis of variance|f-test|one-way|two-way)\b',
            'chi_square': r'\b(chi-square|chi2|contingency|independence)\b',
            'correlation': r'\b(correlation|pearson|spearman|kendall)\b',
            'regression': r'\b(regression|linear|logistic|multiple)\b',
            'nonparametric': r'\b(mann-whitney|wilcoxon|kruskal|friedman)\b'
        }
        
        self.visualization_types = {
            'histogram': r'\b(histogram|distribution|frequency)\b',
            'scatter': r'\b(scatter|relationship|correlation)\b',
            'bar': r'\b(bar|category|group|count)\b',
            'line': r'\b(line|trend|time|temporal)\b',
            'box': r'\b(box|quartile|outlier|spread)\b',
            'heatmap': r'\b(heatmap|correlation matrix|intensity)\b'
        }
    
    def classify_query(self, query: str) -> QueryIntent:
        """Classify query and extract intent"""
        query_lower = query.lower()
        
        # Calculate confidence scores for each type
        type_scores = {}
        
        for pattern in self.descriptive_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.DESCRIPTIVE] = type_scores.get(QueryType.DESCRIPTIVE, 0) + 1
        
        for pattern in self.inferential_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.INFERENTIAL] = type_scores.get(QueryType.INFERENTIAL, 0) + 1
        
        for pattern in self.correlation_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.CORRELATION] = type_scores.get(QueryType.CORRELATION, 0) + 1
        
        for pattern in self.visualization_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.VISUALIZATION] = type_scores.get(QueryType.VISUALIZATION, 0) + 1
        
        for pattern in self.comparison_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.COMPARISON] = type_scores.get(QueryType.COMPARISON, 0) + 1
        
        for pattern in self.predictive_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.PREDICTIVE] = type_scores.get(QueryType.PREDICTIVE, 0) + 1
        
        for pattern in self.temporal_patterns:
            if re.search(pattern, query_lower):
                type_scores[QueryType.TEMPORAL] = type_scores.get(QueryType.TEMPORAL, 0) + 1
        
        # Determine primary query type
        if type_scores:
            primary_type = max(type_scores, key=type_scores.get)
            confidence = type_scores[primary_type] / sum(type_scores.values())
        else:
            primary_type = QueryType.DESCRIPTIVE
            confidence = 0.5
        
        # Extract variables mentioned in query
        variables = self._extract_variables(query)
        
        # Extract operations
        operations = self._extract_operations(query)
        
        # Extract filters
        filters = self._extract_filters(query)
        
        # Extract statistical tests
        statistical_tests = []
        for test, pattern in self.statistical_test_patterns.items():
            if re.search(pattern, query_lower):
                statistical_tests.append(test)
        
        # Extract visualization type
        visualization_type = None
        for viz_type, pattern in self.visualization_types.items():
            if re.search(pattern, query_lower):
                visualization_type = viz_type
                break
        
        return QueryIntent(
            type=primary_type,
            variables=variables,
            operations=operations,
            filters=filters,
            confidence=confidence,
            statistical_tests=statistical_tests,
            visualization_type=visualization_type
        )
    
    def _extract_variables(self, query: str) -> List[str]:
        """Extract potential variable names from query"""
        # Common statistical variable patterns
        variable_patterns = [
            r'\b(age|gender|sex|height|weight|bmi|income|salary|education|experience)\b',
            r'\b(score|rating|price|cost|value|amount|quantity|count)\b',
            r'\b(blood_pressure|heart_rate|temperature|cholesterol|glucose)\b',
            r'\b(treatment|medication|therapy|intervention|group|category)\b'
        ]
        
        variables = []
        query_lower = query.lower()
        
        for pattern in variable_patterns:
            matches = re.findall(pattern, query_lower)
            variables.extend(matches)
        
        return list(set(variables))
    
    def _extract_operations(self, query: str) -> List[str]:
        """Extract statistical operations from query"""
        operations = []
        query_lower = query.lower()
        
        operation_patterns = {
            'mean': r'\b(mean|average|avg)\b',
            'median': r'\b(median|middle)\b',
            'mode': r'\b(mode|most common)\b',
            'std': r'\b(standard deviation|std|variability)\b',
            'var': r'\b(variance|var)\b',
            'min': r'\b(minimum|min|lowest)\b',
            'max': r'\b(maximum|max|highest)\b',
            'sum': r'\b(sum|total|add)\b',
            'count': r'\b(count|number|frequency)\b',
            'correlation': r'\b(correlation|relate|associate)\b',
            'regression': r'\b(regression|predict|model)\b'
        }
        
        for operation, pattern in operation_patterns.items():
            if re.search(pattern, query_lower):
                operations.append(operation)
        
        return operations
    
    def _extract_filters(self, query: str) -> Dict[str, Any]:
        """Extract filters and conditions from query"""
        filters = {}
        query_lower = query.lower()
        
        # Age filters
        age_match = re.search(r'age\s*[><=]\s*(\d+)', query_lower)
        if age_match:
            filters['age'] = int(age_match.group(1))
        
        # Gender filters
        if re.search(r'\b(male|female|men|women)\b', query_lower):
            gender_match = re.search(r'\b(male|female|men|women)\b', query_lower)
            filters['gender'] = gender_match.group(1)
        
        # Group filters
        group_match = re.search(r'group\s*[=:]\s*["\']?([^"\']+)["\']?', query_lower)
        if group_match:
            filters['group'] = group_match.group(1)
        
        return filters

class DataChunker:
    """Advanced data chunking strategies for CSV data"""
    
    def __init__(self):
        self.medical_variables = [
            'age', 'gender', 'sex', 'height', 'weight', 'bmi', 'blood_pressure',
            'heart_rate', 'temperature', 'cholesterol', 'glucose', 'medication',
            'treatment', 'diagnosis', 'outcome', 'survival', 'mortality'
        ]
        
        self.statistical_variables = [
            'mean', 'median', 'mode', 'std', 'variance', 'min', 'max', 'quartile',
            'percentile', 'correlation', 'p_value', 'confidence_interval'
        ]
    
    def chunk_data(self, df: pd.DataFrame, chunk_size: int = 100) -> List[DataChunk]:
        """Create intelligent data chunks from DataFrame"""
        chunks = []
        
        # Strategy 1: Row-based chunking for large datasets
        chunks.extend(self._create_row_chunks(df, chunk_size))
        
        # Strategy 2: Column-based chunking for variable analysis
        chunks.extend(self._create_column_chunks(df))
        
        # Strategy 3: Statistical summary chunks
        chunks.extend(self._create_statistical_chunks(df))
        
        # Strategy 4: Correlation matrix chunks
        chunks.extend(self._create_correlation_chunks(df))
        
        return chunks
    
    def _create_row_chunks(self, df: pd.DataFrame, chunk_size: int) -> List[DataChunk]:
        """Create chunks based on row groups"""
        chunks = []
        
        for i in range(0, len(df), chunk_size):
            chunk_df = df.iloc[i:i + chunk_size]
            
            # Create contextual description
            content = self._create_row_chunk_content(chunk_df, i)
            
            chunk = DataChunk(
                id=str(uuid.uuid4()),
                content=content,
                chunk_type='row_group',
                variables=list(chunk_df.columns),
                data_types=chunk_df.dtypes.astype(str).to_dict(),
                statistical_context=self._calculate_chunk_stats(chunk_df),
                metadata={
                    'start_row': i,
                    'end_row': min(i + chunk_size, len(df)),
                    'row_count': len(chunk_df),
                    'chunk_index': i // chunk_size
                }
            )
            chunks.append(chunk)
        
        return chunks
    
    def _create_column_chunks(self, df: pd.DataFrame) -> List[DataChunk]:
        """Create chunks based on column groups"""
        chunks = []
        
        # Group columns by type and medical context
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Medical variable grouping
        medical_cols = [col for col in df.columns if any(med_var in col.lower() for med_var in self.medical_variables)]
        
        # Create chunks for each group
        for col_group, group_name in [(numeric_cols, 'numeric'), (categorical_cols, 'categorical'), (medical_cols, 'medical')]:
            if col_group:
                content = self._create_column_chunk_content(df, col_group, group_name)
                
                chunk = DataChunk(
                    id=str(uuid.uuid4()),
                    content=content,
                    chunk_type='column_group',
                    variables=col_group,
                    data_types={col: str(df[col].dtype) for col in col_group},
                    statistical_context=self._calculate_column_stats(df[col_group]),
                    metadata={
                        'group_type': group_name,
                        'column_count': len(col_group),
                        'medical_context': group_name == 'medical'
                    }
                )
                chunks.append(chunk)
        
        return chunks
    
    def _create_statistical_chunks(self, df: pd.DataFrame) -> List[DataChunk]:
        """Create chunks with statistical summaries"""
        chunks = []
        
        # Overall dataset statistics
        stats_content = self._create_statistical_summary(df)
        
        chunk = DataChunk(
            id=str(uuid.uuid4()),
            content=stats_content,
            chunk_type='statistical_summary',
            variables=list(df.columns),
            data_types=df.dtypes.astype(str).to_dict(),
            statistical_context=self._calculate_comprehensive_stats(df),
            metadata={
                'summary_type': 'comprehensive',
                'includes_all_variables': True
            }
        )
        chunks.append(chunk)
        
        return chunks
    
    def _create_correlation_chunks(self, df: pd.DataFrame) -> List[DataChunk]:
        """Create chunks with correlation information"""
        chunks = []
        
        numeric_df = df.select_dtypes(include=[np.number])
        if len(numeric_df.columns) > 1:
            correlation_content = self._create_correlation_summary(numeric_df)
            
            chunk = DataChunk(
                id=str(uuid.uuid4()),
                content=correlation_content,
                chunk_type='correlation_matrix',
                variables=list(numeric_df.columns),
                data_types=numeric_df.dtypes.astype(str).to_dict(),
                statistical_context={'correlation_matrix': numeric_df.corr().to_dict()},
                metadata={
                    'analysis_type': 'correlation',
                    'variable_count': len(numeric_df.columns)
                }
            )
            chunks.append(chunk)
        
        return chunks
    
    def _create_row_chunk_content(self, chunk_df: pd.DataFrame, start_index: int) -> str:
        """Create contextual content for row chunks"""
        content = f"Data subset from rows {start_index} to {start_index + len(chunk_df) - 1}:\n\n"
        
        # Add basic statistics
        content += "Sample statistics:\n"
        for col in chunk_df.select_dtypes(include=[np.number]).columns:
            mean_val = float(chunk_df[col].mean())
            std_val = float(chunk_df[col].std())
            content += f"- {col}: mean={mean_val:.2f}, std={std_val:.2f}\n"
        
        # Add categorical summaries
        for col in chunk_df.select_dtypes(include=['object']).columns:
            value_counts = chunk_df[col].value_counts()
            content += f"- {col}: {dict(value_counts.head(3))}\n"
        
        # Add sample of actual data
        content += f"\nSample data:\n{chunk_df.head(3).to_string()}"
        
        return content
    
    def _create_column_chunk_content(self, df: pd.DataFrame, columns: List[str], group_name: str) -> str:
        """Create contextual content for column chunks"""
        content = f"{group_name.title()} variables analysis:\n\n"
        
        for col in columns:
            content += f"Variable: {col}\n"
            content += f"Type: {df[col].dtype}\n"
            
            if df[col].dtype in ['object']:
                value_counts = df[col].value_counts()
                content += f"Categories: {list(value_counts.head(5).index)}\n"
                content += f"Most frequent: {value_counts.index[0]} ({value_counts.iloc[0]} occurrences)\n"
            else:
                content += f"Range: {df[col].min():.2f} to {df[col].max():.2f}\n"
                content += f"Mean: {df[col].mean():.2f}, Std: {df[col].std():.2f}\n"
            
            content += f"Missing values: {df[col].isnull().sum()}\n\n"
        
        return content
    
    def _create_statistical_summary(self, df: pd.DataFrame) -> str:
        """Create comprehensive statistical summary"""
        content = "Comprehensive Dataset Statistical Summary:\n\n"
        
        content += f"Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns\n"
        content += f"Data types: {df.dtypes.value_counts().to_dict()}\n"
        content += f"Missing values: {df.isnull().sum().sum()} total\n\n"
        
        # Numeric variables summary
        numeric_df = df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            content += "Numeric Variables Summary:\n"
            content += numeric_df.describe().to_string()
            content += "\n\n"
        
        # Categorical variables summary
        categorical_df = df.select_dtypes(include=['object'])
        if not categorical_df.empty:
            content += "Categorical Variables Summary:\n"
            for col in categorical_df.columns:
                content += f"- {col}: {categorical_df[col].nunique()} unique values\n"
            content += "\n"
        
        return content
    
    def _create_correlation_summary(self, numeric_df: pd.DataFrame) -> str:
        """Create correlation analysis summary"""
        content = "Correlation Analysis:\n\n"
        
        corr_matrix = numeric_df.corr()
        
        # Find strong correlations
        strong_correlations = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i + 1, len(corr_matrix.columns)):
                corr_val = corr_matrix.iloc[i, j]
                if abs(corr_val) > 0.5:
                    strong_correlations.append((
                        corr_matrix.columns[i],
                        corr_matrix.columns[j],
                        corr_val
                    ))
        
        if strong_correlations:
            content += "Strong correlations (|r| > 0.5):\n"
            for var1, var2, corr in strong_correlations:
                content += f"- {var1} ↔ {var2}: {corr:.3f}\n"
        else:
            content += "No strong correlations found (|r| > 0.5)\n"
        
        content += f"\nCorrelation matrix:\n{corr_matrix.to_string()}"
        
        return content
    
    def _calculate_chunk_stats(self, chunk_df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate statistical context for chunk"""
        stats = {
            'row_count': int(len(chunk_df)),
            'column_count': int(len(chunk_df.columns)),
            'missing_values': int(chunk_df.isnull().sum().sum()),
            'numeric_columns': int(len(chunk_df.select_dtypes(include=[np.number]).columns)),
            'categorical_columns': int(len(chunk_df.select_dtypes(include=['object']).columns))
        }
        
        # Add basic statistics for numeric columns
        numeric_df = chunk_df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            stats['numeric_stats'] = {
                'means': {k: float(v) for k, v in numeric_df.mean().to_dict().items()},
                'stds': {k: float(v) for k, v in numeric_df.std().to_dict().items()},
                'mins': {k: float(v) for k, v in numeric_df.min().to_dict().items()},
                'maxs': {k: float(v) for k, v in numeric_df.max().to_dict().items()}
            }
        
        return stats
    
    def _calculate_column_stats(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate statistical context for column group"""
        stats = {
            'column_count': int(len(df.columns)),
            'total_values': int(df.size),
            'missing_values': int(df.isnull().sum().sum())
        }
        
        if df.select_dtypes(include=[np.number]).empty:
            # Categorical statistics
            stats['categorical_stats'] = {}
            for col in df.columns:
                if df[col].dtype == 'object':
                    stats['categorical_stats'][col] = {
                        'unique_count': int(df[col].nunique()),
                        'most_frequent': str(df[col].mode().iloc[0]) if not df[col].mode().empty else None
                    }
        else:
            # Numeric statistics
            numeric_df = df.select_dtypes(include=[np.number])
            stats['numeric_stats'] = {
                'means': {k: float(v) for k, v in numeric_df.mean().to_dict().items()},
                'stds': {k: float(v) for k, v in numeric_df.std().to_dict().items()},
                'correlations': {k: {k2: float(v2) for k2, v2 in v.items()} 
                               for k, v in numeric_df.corr().to_dict().items()} if len(numeric_df.columns) > 1 else {}
            }
        
        return stats
    
    def _calculate_comprehensive_stats(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate comprehensive statistical context"""
        stats = {
            'dataset_shape': [int(df.shape[0]), int(df.shape[1])],
            'data_types': df.dtypes.astype(str).to_dict(),
            'missing_values': {k: int(v) for k, v in df.isnull().sum().to_dict().items()},
            'memory_usage': {k: int(v) for k, v in df.memory_usage(deep=True).to_dict().items()}
        }
        
        # Numeric statistics
        numeric_df = df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            describe_dict = numeric_df.describe().to_dict()
            stats['descriptive_stats'] = {
                k: {k2: float(v2) for k2, v2 in v.items()} 
                for k, v in describe_dict.items()
            }
            if len(numeric_df.columns) > 1:
                corr_dict = numeric_df.corr().to_dict()
                stats['correlation_matrix'] = {
                    k: {k2: float(v2) for k2, v2 in v.items()} 
                    for k, v in corr_dict.items()
                }
        
        # Categorical statistics
        categorical_df = df.select_dtypes(include=['object'])
        if not categorical_df.empty:
            stats['categorical_stats'] = {}
            for col in categorical_df.columns:
                value_counts = categorical_df[col].value_counts().to_dict()
                stats['categorical_stats'][col] = {
                    'unique_count': int(categorical_df[col].nunique()),
                    'value_counts': {k: int(v) for k, v in value_counts.items()}
                }
        
        return stats

class EnhancedRAGService:
    """Enhanced RAG service with ChromaDB and intelligent query processing"""
    
    def __init__(self, persist_directory: str = "/tmp/chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(allow_reset=True)
        )
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize query classifier and data chunker
        self.query_classifier = QueryClassifier()
        self.data_chunker = DataChunker()
        
        # Track collections
        self.collections = {}
        
        logger.info(f"Enhanced RAG service initialized with persistence at {persist_directory}")
    
    def create_collection(self, session_id: str, df: pd.DataFrame, filename: str) -> str:
        """Create a new collection for a dataset"""
        collection_name = f"session_{session_id}"
        
        # Delete existing collection if it exists
        try:
            self.client.delete_collection(collection_name)
        except Exception:
            pass
        
        # Create new collection
        collection = self.client.create_collection(
            name=collection_name,
            metadata={
                "session_id": session_id,
                "filename": filename,
                "created_at": datetime.utcnow().isoformat(),
                "row_count": len(df),
                "column_count": len(df.columns)
            }
        )
        
        # Create data chunks
        chunks = self.data_chunker.chunk_data(df)
        
        # Process chunks and add to collection
        documents = []
        embeddings = []
        metadatas = []
        ids = []
        
        for chunk in chunks:
            # Generate embeddings
            embedding = self.embedding_model.encode(chunk.content)
            
            documents.append(chunk.content)
            embeddings.append(embedding.tolist())
            metadatas.append({
                "chunk_type": chunk.chunk_type,
                "variables": json.dumps(chunk.variables),
                "data_types": json.dumps(chunk.data_types),
                "statistical_context": json.dumps(chunk.statistical_context),
                "metadata": json.dumps(chunk.metadata)
            })
            ids.append(chunk.id)
        
        # Add to collection
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        self.collections[session_id] = collection
        
        logger.info(f"Created collection for session {session_id} with {len(chunks)} chunks")
        
        return collection_name
    
    def query_collection(self, session_id: str, query: str, n_results: int = 5) -> Tuple[List[str], QueryIntent]:
        """Query the collection with intelligent processing"""
        
        # Classify query intent
        query_intent = self.query_classifier.classify_query(query)
        
        # Get or create collection
        collection = self.collections.get(session_id)
        if not collection:
            collection_name = f"session_{session_id}"
            try:
                collection = self.client.get_collection(collection_name)
                self.collections[session_id] = collection
            except Exception:
                raise ValueError(f"No collection found for session {session_id}")
        
        # Enhanced query processing
        enhanced_query = self._enhance_query(query, query_intent)
        
        # Generate query embedding
        query_embedding = self.embedding_model.encode(enhanced_query)
        
        # Perform semantic search with filtering
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where=self._build_query_filter(query_intent)
        )
        
        # Process and rank results
        relevant_chunks = self._process_search_results(results, query_intent)
        
        logger.info(f"Query processed for session {session_id}: {query_intent.type.value} with {len(relevant_chunks)} results")
        
        return relevant_chunks, query_intent
    
    def _enhance_query(self, query: str, query_intent: QueryIntent) -> str:
        """Enhance query with statistical context"""
        enhanced_query = query
        
        # Add statistical context based on query type
        if query_intent.type == QueryType.DESCRIPTIVE:
            enhanced_query += " statistical summary descriptive statistics mean median mode standard deviation"
        elif query_intent.type == QueryType.INFERENTIAL:
            enhanced_query += " hypothesis testing statistical significance p-value confidence interval"
        elif query_intent.type == QueryType.CORRELATION:
            enhanced_query += " correlation relationship association linear regression"
        elif query_intent.type == QueryType.VISUALIZATION:
            enhanced_query += " plot graph chart visualization data display"
        elif query_intent.type == QueryType.COMPARISON:
            enhanced_query += " comparison group difference statistical test"
        elif query_intent.type == QueryType.PREDICTIVE:
            enhanced_query += " prediction modeling machine learning regression classification"
        
        # Add variable context
        if query_intent.variables:
            enhanced_query += f" variables: {' '.join(query_intent.variables)}"
        
        # Add statistical test context
        if query_intent.statistical_tests:
            enhanced_query += f" statistical tests: {' '.join(query_intent.statistical_tests)}"
        
        return enhanced_query
    
    def _build_query_filter(self, query_intent: QueryIntent) -> Optional[Dict[str, Any]]:
        """Build metadata filter based on query intent"""
        filter_conditions = {}
        
        # Filter by chunk type based on query intent
        if query_intent.type == QueryType.DESCRIPTIVE:
            # Prefer statistical summaries for descriptive queries
            filter_conditions = None  # No filtering, let ranking handle it
        elif query_intent.type == QueryType.CORRELATION:
            # Prefer correlation chunks
            filter_conditions = None  # No filtering, let ranking handle it
        elif query_intent.type == QueryType.VISUALIZATION:
            # Prefer chunks with relevant data for visualization
            filter_conditions = None  # No filtering, let ranking handle it
        
        return filter_conditions
    
    def _process_search_results(self, results: Dict[str, Any], query_intent: QueryIntent) -> List[str]:
        """Process and rank search results based on query intent"""
        if not results['documents'] or not results['documents'][0]:
            return []
        
        documents = results['documents'][0]
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        distances = results['distances'][0] if results['distances'] else []
        
        # Rank results based on query intent
        ranked_results = []
        for i, doc in enumerate(documents):
            metadata = metadatas[i] if i < len(metadatas) else {}
            distance = distances[i] if i < len(distances) else 1.0
            
            # Calculate relevance score
            relevance_score = self._calculate_relevance_score(doc, metadata, query_intent, distance)
            
            ranked_results.append({
                'content': doc,
                'metadata': metadata,
                'score': relevance_score,
                'distance': distance
            })
        
        # Sort by relevance score
        ranked_results.sort(key=lambda x: x['score'], reverse=True)
        
        return [result['content'] for result in ranked_results]
    
    def _calculate_relevance_score(self, document: str, metadata: Dict[str, Any], 
                                  query_intent: QueryIntent, distance: float) -> float:
        """Calculate relevance score for a document"""
        base_score = 1.0 - distance  # Convert distance to similarity
        
        # Boost score based on chunk type and query intent
        chunk_type = metadata.get('chunk_type', '')
        
        if query_intent.type == QueryType.DESCRIPTIVE:
            if chunk_type == 'statistical_summary':
                base_score *= 1.5
            elif chunk_type == 'column_group':
                base_score *= 1.2
        elif query_intent.type == QueryType.CORRELATION:
            if chunk_type == 'correlation_matrix':
                base_score *= 1.8
            elif chunk_type == 'statistical_summary':
                base_score *= 1.3
        elif query_intent.type == QueryType.VISUALIZATION:
            if chunk_type == 'column_group':
                base_score *= 1.4
            elif chunk_type == 'correlation_matrix':
                base_score *= 1.3
        
        # Boost score if relevant variables are present
        if query_intent.variables:
            variables_str = metadata.get('variables', '[]')
            try:
                chunk_variables = json.loads(variables_str)
                if any(var in chunk_variables for var in query_intent.variables):
                    base_score *= 1.3
            except (json.JSONDecodeError, TypeError):
                pass
        
        return base_score
    
    def get_collection_info(self, session_id: str) -> Dict[str, Any]:
        """Get information about a collection"""
        collection = self.collections.get(session_id)
        if not collection:
            collection_name = f"session_{session_id}"
            try:
                collection = self.client.get_collection(collection_name)
                self.collections[session_id] = collection
            except Exception:
                return {}
        
        return {
            "name": collection.name,
            "count": collection.count(),
            "metadata": collection.metadata
        }
    
    def delete_collection(self, session_id: str) -> bool:
        """Delete a collection"""
        try:
            collection_name = f"session_{session_id}"
            self.client.delete_collection(collection_name)
            
            if session_id in self.collections:
                del self.collections[session_id]
            
            logger.info(f"Deleted collection for session {session_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting collection for session {session_id}: {e}")
            return False
    
    def list_collections(self) -> List[Dict[str, Any]]:
        """List all collections"""
        try:
            collections = self.client.list_collections()
            return [
                {
                    "name": col.name,
                    "metadata": col.metadata,
                    "count": col.count()
                }
                for col in collections
            ]
        except Exception as e:
            logger.error(f"Error listing collections: {e}")
            return []