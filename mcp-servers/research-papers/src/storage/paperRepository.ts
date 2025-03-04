/**
 * Paper repository for storing and retrieving papers
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PaperEntity, Collection, Citation, SemanticRelation, PaperFilter } from '../types/paper.js';

export class PaperRepository {
  private basePath: string;
  private papersPath: string;
  private collectionsPath: string;
  private citationsPath: string;
  private relationsPath: string;
  
  constructor(basePath?: string) {
    // Use provided base path or default to data directory
    this.basePath = basePath || path.join(
      path.dirname(fileURLToPath(import.meta.url)), 
      '../../data'
    );
    
    // Set paths for different data types
    this.papersPath = path.join(this.basePath, 'papers');
    this.collectionsPath = path.join(this.basePath, 'collections');
    this.citationsPath = path.join(this.basePath, 'citations');
    this.relationsPath = path.join(this.basePath, 'relations');
    
    // Ensure directories exist
    this.initializeDirectories();
  }
  
  /**
   * Create necessary directories if they don't exist
   */
  private async initializeDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.papersPath, { recursive: true });
      await fs.mkdir(this.collectionsPath, { recursive: true });
      await fs.mkdir(this.citationsPath, { recursive: true });
      await fs.mkdir(this.relationsPath, { recursive: true });
    } catch (error) {
      console.error('Error initializing directories:', error);
      throw error;
    }
  }
  
  /**
   * Save a paper entity to storage
   * @param paper The paper entity to save
   * @returns The saved paper entity
   */
  async savePaper(paper: PaperEntity): Promise<PaperEntity> {
    try {
      // Update the timestamp
      paper.updatedAt = new Date().toISOString();
      
      // Create a file path based on the paper ID
      const filePath = path.join(this.papersPath, `${paper.id}.json`);
      
      // Serialize and save the paper
      await fs.writeFile(
        filePath, 
        JSON.stringify(paper, null, 2), 
        'utf-8'
      );
      
      return paper;
    } catch (error) {
      console.error(`Error saving paper ${paper.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a paper entity by ID
   * @param paperId The ID of the paper to retrieve
   * @returns The paper entity or null if not found
   */
  async getPaper(paperId: string): Promise<PaperEntity | null> {
    try {
      const filePath = path.join(this.papersPath, `${paperId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as PaperEntity;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File not found, paper doesn't exist
        return null;
      }
      console.error(`Error retrieving paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a paper entity by ID
   * @param paperId The ID of the paper to delete
   * @returns True if deleted, false if not found
   */
  async deletePaper(paperId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.papersPath, `${paperId}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File not found
        return false;
      }
      console.error(`Error deleting paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * List all papers with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of matching paper entities
   */
  async listPapers(filter?: PaperFilter): Promise<PaperEntity[]> {
    try {
      // Get list of all paper files
      const files = await fs.readdir(this.papersPath);
      
      // Read and parse each paper file
      const papers: PaperEntity[] = [];
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(this.papersPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const paper = JSON.parse(data) as PaperEntity;
          papers.push(paper);
        }
      }
      
      // Apply filters if provided
      if (filter) {
        return this.filterPapers(papers, filter);
      }
      
      return papers;
    } catch (error) {
      console.error('Error listing papers:', error);
      throw error;
    }
  }
  
  /**
   * Apply filters to a list of papers
   * @param papers Array of papers to filter
   * @param filter Filter criteria
   * @returns Filtered array of papers
   */
  private filterPapers(papers: PaperEntity[], filter: PaperFilter): PaperEntity[] {
    return papers.filter(paper => {
      // Title filter (case-insensitive partial match)
      if (filter.title && !paper.title.toLowerCase().includes(filter.title.toLowerCase())) {
        return false;
      }
      
      // Authors filter (match any author's name)
      if (filter.authors && filter.authors.length > 0) {
        if (!filter.authors.some(author => 
          paper.authors.some(a => a.name.toLowerCase().includes(author.toLowerCase()))
        )) {
          return false;
        }
      }
      
      // Year filter
      if (typeof filter.year === 'number') {
        if (paper.year !== filter.year) {
          return false;
        }
      } else if (filter.year) {
        // Year range
        if ((filter.year.from !== undefined && paper.year !== undefined && paper.year < filter.year.from) || 
            (filter.year.to !== undefined && paper.year !== undefined && paper.year > filter.year.to)) {
          return false;
        }
      }
      
      // Venue filter
      if (filter.venue && paper.venue && !paper.venue.toLowerCase().includes(filter.venue.toLowerCase())) {
        return false;
      }
      
      // Tags filter (must have all specified tags)
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.every(tag => paper.tags.includes(tag))) {
          return false;
        }
      }
      
      // Categories filter (must have at least one of the specified categories)
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.some(category => paper.categories.includes(category))) {
          return false;
        }
      }
      
      // Read status filter
      if (filter.readStatus && paper.readStatus !== filter.readStatus) {
        return false;
      }
      
      // Importance filter
      if (typeof filter.importance === 'number') {
        if (paper.importance !== filter.importance) {
          return false;
        }
      } else if (filter.importance) {
        // Importance range
        if ((filter.importance.min !== undefined && paper.importance < filter.importance.min) || 
            (filter.importance.max !== undefined && paper.importance > filter.importance.max)) {
          return false;
        }
      }
      
      // Citation count filter
      if (typeof filter.citationCount === 'number') {
        if (paper.citationCount !== filter.citationCount) {
          return false;
        }
      } else if (filter.citationCount) {
        // Citation count range
        if ((filter.citationCount.min !== undefined && paper.citationCount !== undefined && 
             paper.citationCount < filter.citationCount.min) || 
            (filter.citationCount.max !== undefined && paper.citationCount !== undefined && 
             paper.citationCount > filter.citationCount.max)) {
          return false;
        }
      }
      
      // If all filters pass, include the paper
      return true;
    });
  }
  
  /**
   * Save a collection to storage
   * @param collection The collection to save
   * @returns The saved collection
   */
  async saveCollection(collection: Collection): Promise<Collection> {
    try {
      // Update timestamp
      collection.updatedAt = new Date().toISOString();
      
      // Create a file path
      const filePath = path.join(this.collectionsPath, `${collection.id}.json`);
      
      // Serialize and save
      await fs.writeFile(
        filePath, 
        JSON.stringify(collection, null, 2), 
        'utf-8'
      );
      
      return collection;
    } catch (error) {
      console.error(`Error saving collection ${collection.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieve a collection by ID
   * @param collectionId The ID of the collection
   * @returns The collection or null if not found
   */
  async getCollection(collectionId: string): Promise<Collection | null> {
    try {
      const filePath = path.join(this.collectionsPath, `${collectionId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Collection;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      console.error(`Error retrieving collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a collection by ID
   * @param collectionId The ID of the collection to delete
   * @returns True if deleted, false if not found
   */
  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.collectionsPath, `${collectionId}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      console.error(`Error deleting collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * List all collections
   * @returns Array of collections
   */
  async listCollections(): Promise<Collection[]> {
    try {
      const files = await fs.readdir(this.collectionsPath);
      
      const collections: Collection[] = [];
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(this.collectionsPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const collection = JSON.parse(data) as Collection;
          collections.push(collection);
        }
      }
      
      return collections;
    } catch (error) {
      console.error('Error listing collections:', error);
      throw error;
    }
  }
  
  /**
   * Save a citation to storage
   * @param citation The citation to save
   * @returns The saved citation
   */
  async saveCitation(citation: Citation): Promise<Citation> {
    try {
      // Create a filename based on the from-to relationship
      const filename = `${citation.from}_${citation.to}.json`;
      const filePath = path.join(this.citationsPath, filename);
      
      // Serialize and save
      await fs.writeFile(
        filePath, 
        JSON.stringify(citation, null, 2), 
        'utf-8'
      );
      
      return citation;
    } catch (error) {
      console.error(`Error saving citation from ${citation.from} to ${citation.to}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all citations for a paper (both citing and cited by)
   * @param paperId The paper ID
   * @returns Object with citations and references
   */
  async getPaperCitations(paperId: string): Promise<{
    citations: Citation[]; // Papers that cite this paper
    references: Citation[]; // Papers that this paper cites
  }> {
    try {
      const files = await fs.readdir(this.citationsPath);
      
      const citations: Citation[] = [];
      const references: Citation[] = [];
      
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(this.citationsPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const citation = JSON.parse(data) as Citation;
          
          // Check if this paper is cited by other papers
          if (citation.to === paperId) {
            citations.push(citation);
          }
          
          // Check if this paper cites other papers
          if (citation.from === paperId) {
            references.push(citation);
          }
        }
      }
      
      return { citations, references };
    } catch (error) {
      console.error(`Error getting citations for paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Save a semantic relation between papers
   * @param relation The semantic relation to save
   * @returns The saved relation
   */
  async saveRelation(relation: SemanticRelation): Promise<SemanticRelation> {
    try {
      // Create a filename based on the from-to-type relationship
      const filename = `${relation.from}_${relation.to}_${relation.relationType}.json`;
      const filePath = path.join(this.relationsPath, filename);
      
      // Serialize and save
      await fs.writeFile(
        filePath, 
        JSON.stringify(relation, null, 2), 
        'utf-8'
      );
      
      return relation;
    } catch (error) {
      console.error(`Error saving relation from ${relation.from} to ${relation.to}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all semantic relations for a paper
   * @param paperId The paper ID
   * @returns Object with outgoing and incoming relations
   */
  async getPaperRelations(paperId: string): Promise<{
    outgoing: SemanticRelation[]; // Relations where this paper is the source
    incoming: SemanticRelation[]; // Relations where this paper is the target
  }> {
    try {
      const files = await fs.readdir(this.relationsPath);
      
      const outgoing: SemanticRelation[] = [];
      const incoming: SemanticRelation[] = [];
      
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(this.relationsPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const relation = JSON.parse(data) as SemanticRelation;
          
          // Check outgoing relations (from this paper to others)
          if (relation.from === paperId) {
            outgoing.push(relation);
          }
          
          // Check incoming relations (from others to this paper)
          if (relation.to === paperId) {
            incoming.push(relation);
          }
        }
      }
      
      return { outgoing, incoming };
    } catch (error) {
      console.error(`Error getting relations for paper ${paperId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const paperRepository = new PaperRepository();