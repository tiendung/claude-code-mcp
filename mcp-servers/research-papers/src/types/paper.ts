/**
 * Core data structures for the Research Papers MCP
 */

export interface PaperEntity {
  id: string;                 // Unique identifier (DOI, arXiv ID, or generated)
  title: string;              // Paper title
  authors: Author[];          // List of authors
  abstract?: string;          // Paper abstract
  year?: number;              // Publication year
  venue?: string;             // Conference/journal
  url?: string;               // URL to the paper
  localPath?: string;         // Path to local copy if downloaded
  tags: string[];             // User-defined tags
  categories: string[];       // Subject categories
  readStatus: ReadStatus;     // Reading status
  importance: number;         // User-defined importance (1-5)
  notes: string[];            // User notes about the paper
  citationCount?: number;     // Number of citations
  referenceCount?: number;    // Number of references
  s2Id?: string;              // Semantic Scholar ID
  doi?: string;               // Digital Object Identifier
  arxivId?: string;           // arXiv identifier
  extractedContent?: ExtractedContent;  // Optional extracted content
  createdAt: string;          // ISO date string
  updatedAt: string;          // ISO date string
}

export interface Author {
  id?: string;                // Author ID (e.g., from Semantic Scholar)
  name: string;               // Author name
  url?: string;               // URL to author profile
}

export type ReadStatus = 'unread' | 'reading' | 'read';

export interface ExtractedContent {
  fullText?: string;          // Full text if available
  sections?: Section[];       // Extracted sections
  figures?: Figure[];         // Extracted figures
  algorithms?: Algorithm[];   // Extracted algorithms
  keyFindings?: string[];     // Key findings extracted
}

export interface Section {
  title: string;
  content: string;
}

export interface Figure {
  caption: string;
  description: string;
  reference: string;          // File reference or URL
}

export interface Algorithm {
  name: string;
  description: string;
  pseudocode: string;
}

export interface Citation {
  from: string;               // Paper ID that cites
  to: string;                 // Paper ID that is cited
  context?: string;           // Context of citation (text around citation)
  section?: string;           // Section where citation appears
  importance: number;         // Automatically gauged importance of citation
}

export interface SemanticRelation {
  from: string;               // Paper ID
  to: string;                 // Related paper ID
  relationType: string;       // Type of relation (e.g., 'builds-on', 'contradicts', 'evaluates')
  strength: number;           // Relationship strength (0-1)
  description?: string;       // Description of the relationship
}

export interface Collection {
  id: string;                 // Unique identifier
  name: string;               // Collection name
  description: string;        // Collection description
  papers: string[];           // List of paper IDs in collection
  tags: string[];             // Collection tags  
  createdAt: string;          // ISO date string
  updatedAt: string;          // ISO date string
}

// Type for paper search filters
export interface PaperFilter {
  title?: string;
  authors?: string[];
  year?: number | { from?: number; to?: number };
  venue?: string;
  tags?: string[];
  categories?: string[];
  readStatus?: ReadStatus;
  importance?: number | { min?: number; max?: number };
  citationCount?: number | { min?: number; max?: number };
}