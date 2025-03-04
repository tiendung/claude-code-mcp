# Research Papers MCP Server Design Document

## Overview

The Research Papers MCP Server will provide a comprehensive system for indexing, storing, retrieving, and analyzing research papers. This system extends beyond simple document storage to include metadata extraction, content indexing, citation tracking, and semantic relationships between papers.

## Core Data Structures

### Paper Entity
```typescript
interface PaperEntity {
  id: string;                 // Unique identifier (DOI, arXiv ID, or generated)
  title: string;              // Paper title
  authors: string[];          // List of authors
  abstract: string;           // Paper abstract
  year: number;               // Publication year
  venue: string;              // Conference/journal
  url: string;                // URL to the paper
  localPath?: string;         // Path to local copy if downloaded
  tags: string[];             // User-defined tags
  categories: string[];       // Subject categories
  readStatus: 'unread' | 'reading' | 'read';  // Reading status
  importance: number;         // User-defined importance (1-5)
  notes: string[];            // User notes about the paper
  citationCount?: number;     // Number of citations
  referenceCount?: number;    // Number of references
  embeddings?: {              // Vector embeddings for semantic search
    title?: number[];
    abstract?: number[];
    fullText?: number[];
  };
  extractedContent?: {        // Optional extracted content
    fullText?: string;        // Full text if available
    sections?: {              // Extracted sections
      title: string;
      content: string;
    }[];
    figures?: {               // Extracted figures
      caption: string;
      description: string;
      reference: string;      // File reference or URL
    }[];
    algorithms?: {            // Extracted algorithms
      name: string;
      description: string;
      pseudocode: string;
    }[];
    keyFindings?: string[];   // Key findings extracted
  };
}
```

### Citation Graph
```typescript
interface Citation {
  from: string;               // Paper ID that cites
  to: string;                 // Paper ID that is cited
  context?: string;           // Context of citation (text around citation)
  section?: string;           // Section where citation appears
  importance: number;         // Automatically gauged importance of citation
}
```

### Semantic Relationships
```typescript
interface SemanticRelation {
  from: string;               // Paper ID
  to: string;                 // Related paper ID
  relationType: string;       // Type of relation (e.g., 'builds-on', 'contradicts', 'evaluates')
  strength: number;           // Relationship strength (0-1)
  description?: string;       // Description of the relationship
}
```

### Collection Entity
```typescript
interface Collection {
  id: string;                 // Unique identifier
  name: string;               // Collection name
  description: string;        // Collection description
  papers: string[];           // List of paper IDs in collection
  tags: string[];             // Collection tags  
  lastUpdated: string;        // ISO date string
}
```

## Storage Architecture

The system will use a hybrid storage approach:

1. **Metadata Index**: A JSON-based index for fast querying of paper metadata
2. **Full-text Index**: An optional separate full-text index for content search
3. **File Storage**: Local storage of PDF files and extracted assets
4. **Graph Database**: For storing and querying the citation network and semantic relationships

## Integration with Semantic Scholar API

The system will leverage the Semantic Scholar API for:

1. **Paper Metadata**: Fetching comprehensive metadata about papers, including titles, authors, abstracts, and publication details
2. **Citation Information**: Retrieving citation data to build the citation network
3. **Related Papers**: Finding semantically related papers based on content similarity
4. **Author Information**: Getting author profiles and publication histories
5. **Paper Search**: Searching for papers by keywords, topics, or authors

### Key API Endpoints to Use:

- `/paper/{paper_id}`: Detailed information about a specific paper
- `/paper/search`: Search for papers based on keywords
- `/paper/batch`: Retrieve details for multiple papers in a single request
- `/paper/{paper_id}/citations`: Get papers that cite a specific paper
- `/paper/{paper_id}/references`: Get papers cited by a specific paper
- `/recommendations`: Get paper recommendations based on a reference paper

### API Integration Strategy:

1. **Caching Layer**: Implement a local cache to minimize redundant API calls
2. **Rate Limiting Handling**: Respect API rate limits with proper request throttling
3. **Bulk Operations**: Use batch endpoints for efficient data retrieval
4. **Incremental Updates**: Implement a mechanism to periodically update paper metadata
5. **Fallback Mechanisms**: Handle API unavailability with graceful degradation

## Core Functionality

### Paper Import & Indexing
- Import papers via URLs (arXiv, DOI, PDF links)
- Parse and extract metadata from PDFs
- Extract structured content where possible (sections, figures, algorithms)
- Generate embeddings for semantic search
- Extract and store citation information

### Organization & Management
- Create and manage collections
- Tag papers with custom tags
- Track reading status and importance
- Add notes and annotations

### Search & Discovery
- Full-text search
- Metadata-based filtering
- Semantic similarity search
- Citation-based discovery (find papers cited by/citing a paper)
- Trend analysis (hot topics, influential papers)

### Analysis Tools
- Citation graph visualization
- Research topic clustering
- Literature review generation
- Research gap identification
- Co-author network analysis

## MCP Endpoints

### Import & Indexing
- `import_paper_by_url`: Import paper from URL (arXiv, DOI, direct PDF)
- `import_paper_from_file`: Import from local PDF file
- `bulk_import`: Import multiple papers from BibTeX or CSV
- `update_paper_metadata`: Update paper metadata
- `extract_paper_content`: Extract structured content from paper

### Organization
- `create_collection`: Create a new paper collection
- `add_papers_to_collection`: Add papers to a collection
- `remove_papers_from_collection`: Remove papers from a collection
- `update_collection`: Update collection metadata
- `delete_collection`: Delete a collection

### Paper Management
- `add_paper_tags`: Add tags to paper
- `update_read_status`: Update reading status
- `add_paper_note`: Add note to paper
- `set_paper_importance`: Set importance level

### Relationships
- `add_semantic_relation`: Add semantic relationship between papers
- `get_paper_relations`: Get all relations for a paper
- `find_related_papers`: Find papers semantically related to a paper

### Search & Retrieval
- `search_papers`: Search papers by query terms
- `filter_papers`: Filter papers by metadata criteria
- `get_paper_by_id`: Get paper by ID
- `get_papers_by_author`: Get papers by author
- `get_papers_by_venue`: Get papers by venue/conference
- `get_papers_by_year`: Get papers by publication year
- `get_papers_by_tag`: Get papers by tag
- `get_collection_papers`: Get papers in a collection
- `get_citation_network`: Get citation network for paper(s)

### Analysis
- `generate_literature_review`: Generate literature review for a topic or collection
- `identify_research_gaps`: Identify potential research gaps in a topic area
- `analyze_paper_influence`: Analyze the influence of a paper
- `find_key_papers`: Find key papers in a research area
- `analyze_citation_patterns`: Analyze citation patterns in a set of papers

## Implementation Phases

### Phase 1: Core Paper Storage and Retrieval
- Basic paper metadata storage
- Import from URLs (arXiv, DOI) using Semantic Scholar API
- Basic search and filtering
- Collections management

### Phase 2: Content Extraction and Analysis
- PDF content extraction
- Citation extraction
- Full-text search
- Basic semantic relationships

### Phase 3: Advanced Features
- Semantic search with embeddings
- Citation graph analysis
- Research gap identification
- Literature review generation
- Trend analysis

## Technical Considerations

### Embedding Models
- Use of vector embeddings for papers to enable semantic search
- Integration with embedding models (e.g., SPECTER, SciBERT)

### PDF Processing
- Integration with PDF extraction libraries (e.g., GROBID, science-parse)
- Handling of complex layouts, tables, and figures

### Scalability
- Efficient storage for potentially thousands of papers
- Optimized indexing for fast queries
- Selective content extraction to manage storage requirements

### Privacy and Security
- Local storage of papers to respect copyright
- Access control for shared environments
- Optional cloud backup with encryption

## Implementation Details

### Tech Stack
- **Backend**: Node.js/TypeScript for MCP server
- **Storage**: 
  - File-based JSON storage for metadata and relationships
  - Local file system for PDFs and extracted content
- **External APIs**: 
  - Semantic Scholar API for metadata and citation information
  - arXiv API for additional paper sourcing
  - DOI resolution services for paper identification

### Storage Schema
- `/data/papers/`: Directory for paper metadata JSON files
- `/data/collections/`: Directory for collection metadata
- `/data/citations/`: Citation network data
- `/data/relations/`: Semantic relationships between papers
- `/data/pdfs/`: Local storage for paper PDFs
- `/data/extracted/`: Extracted content from papers
- `/data/embeddings/`: Vector embeddings for semantic search

### API Integration
- Implement a client for Semantic Scholar API with rate limiting
- Create adaptors for other academic APIs (arXiv, DOI)
- Build a caching layer to prevent redundant API calls

## Prototype Implementation Plan

1. Create basic storage models and file structure
2. Implement Semantic Scholar API client
3. Build paper import and basic metadata retrieval
4. Implement collections management
5. Add basic search and filtering
6. Build citation network from Semantic Scholar data
7. Implement basic semantic relationships
8. Create simple visualization tools

## Next Steps

1. Set up the project structure in the playground/ directory
2. Implement the Semantic Scholar API client
3. Create the basic data structures for papers and collections
4. Build a simple import function using the Semantic Scholar API
5. Test with a small set of research papers
6. Implement basic search and retrieval functions
7. Build a simple command-line interface for testing