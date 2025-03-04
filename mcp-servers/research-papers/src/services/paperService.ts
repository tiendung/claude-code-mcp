/**
 * Paper service for handling paper operations
 */

import { PaperEntity, Collection, Citation, SemanticRelation, PaperFilter } from '../types/paper.js';
import { paperRepository } from '../storage/paperRepository.js';
import { semanticScholar } from '../api/semanticScholar.js';
import crypto from 'crypto';

export class PaperService {
  /**
   * Import a paper from Semantic Scholar by ID (DOI, arXiv ID, etc.)
   * @param paperId The ID of the paper to import
   * @returns The imported paper entity
   */
  async importPaperById(paperId: string): Promise<PaperEntity> {
    try {
      // Check if paper already exists in repository
      const existingPaper = await paperRepository.getPaper(paperId);
      if (existingPaper) {
        return existingPaper;
      }
      
      // Fetch paper data from Semantic Scholar
      const s2Paper = await semanticScholar.getPaper(paperId);
      
      // Convert to our internal format
      const paperEntity = semanticScholar.convertToPaperEntity(s2Paper);
      
      // Save to repository
      return paperRepository.savePaper(paperEntity);
    } catch (error) {
      console.error(`Error importing paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for papers on Semantic Scholar and import matching papers
   * @param query Search query
   * @param limit Maximum number of results
   * @returns Array of imported paper entities
   */
  async searchAndImportPapers(query: string, limit: number = 10): Promise<PaperEntity[]> {
    try {
      // Search for papers on Semantic Scholar
      const searchResults = await semanticScholar.searchPapers(query, limit);
      
      // Import each paper
      const importedPapers: PaperEntity[] = [];
      for (const paper of searchResults.data) {
        // Convert to our internal format
        const paperEntity = semanticScholar.convertToPaperEntity(paper);
        
        // Save to repository
        const savedPaper = await paperRepository.savePaper(paperEntity);
        importedPapers.push(savedPaper);
      }
      
      return importedPapers;
    } catch (error) {
      console.error(`Error searching and importing papers for query "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Create a new paper manually
   * @param paperData The paper data to create
   * @returns The created paper entity
   */
  async createPaper(paperData: Omit<PaperEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaperEntity> {
    try {
      const now = new Date().toISOString();
      
      // Generate a unique ID if not provided
      const id = paperData.s2Id || paperData.doi || paperData.arxivId || 
                 crypto.randomUUID();
      
      // Create the paper entity
      const paperEntity: PaperEntity = {
        ...paperData,
        id,
        createdAt: now,
        updatedAt: now
      };
      
      // Save to repository
      return paperRepository.savePaper(paperEntity);
    } catch (error) {
      console.error('Error creating paper:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing paper
   * @param paperId The ID of the paper to update
   * @param paperData The updated paper data
   * @returns The updated paper entity or null if not found
   */
  async updatePaper(paperId: string, paperData: Partial<PaperEntity>): Promise<PaperEntity | null> {
    try {
      // Get existing paper
      const existingPaper = await paperRepository.getPaper(paperId);
      if (!existingPaper) {
        return null;
      }
      
      // Update paper data
      const updatedPaper: PaperEntity = {
        ...existingPaper,
        ...paperData,
        id: existingPaper.id, // Ensure ID doesn't change
        createdAt: existingPaper.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString() // Update modification date
      };
      
      // Save to repository
      return paperRepository.savePaper(updatedPaper);
    } catch (error) {
      console.error(`Error updating paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a paper by ID
   * @param paperId The ID of the paper to retrieve
   * @returns The paper entity or null if not found
   */
  async getPaper(paperId: string): Promise<PaperEntity | null> {
    return paperRepository.getPaper(paperId);
  }
  
  /**
   * Delete a paper by ID
   * @param paperId The ID of the paper to delete
   * @returns True if deleted, false if not found
   */
  async deletePaper(paperId: string): Promise<boolean> {
    return paperRepository.deletePaper(paperId);
  }
  
  /**
   * List all papers with optional filtering
   * @param filter Optional filter criteria
   * @returns Array of matching paper entities
   */
  async listPapers(filter?: PaperFilter): Promise<PaperEntity[]> {
    return paperRepository.listPapers(filter);
  }
  
  /**
   * Add tags to a paper
   * @param paperId The ID of the paper
   * @param tags Tags to add
   * @returns The updated paper or null if not found
   */
  async addPaperTags(paperId: string, tags: string[]): Promise<PaperEntity | null> {
    try {
      // Get existing paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Add tags (avoid duplicates)
      const updatedTags = [...new Set([...paper.tags, ...tags])];
      
      // Update paper
      paper.tags = updatedTags;
      paper.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.savePaper(paper);
    } catch (error) {
      console.error(`Error adding tags to paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove tags from a paper
   * @param paperId The ID of the paper
   * @param tags Tags to remove
   * @returns The updated paper or null if not found
   */
  async removePaperTags(paperId: string, tags: string[]): Promise<PaperEntity | null> {
    try {
      // Get existing paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Remove tags
      paper.tags = paper.tags.filter(tag => !tags.includes(tag));
      paper.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.savePaper(paper);
    } catch (error) {
      console.error(`Error removing tags from paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update the read status of a paper
   * @param paperId The ID of the paper
   * @param readStatus The new read status
   * @returns The updated paper or null if not found
   */
  async updateReadStatus(paperId: string, readStatus: 'unread' | 'reading' | 'read'): Promise<PaperEntity | null> {
    try {
      // Get existing paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Update read status
      paper.readStatus = readStatus;
      paper.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.savePaper(paper);
    } catch (error) {
      console.error(`Error updating read status for paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a note to a paper
   * @param paperId The ID of the paper
   * @param note The note to add
   * @returns The updated paper or null if not found
   */
  async addPaperNote(paperId: string, note: string): Promise<PaperEntity | null> {
    try {
      // Get existing paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Add note
      paper.notes.push(note);
      paper.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.savePaper(paper);
    } catch (error) {
      console.error(`Error adding note to paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Set the importance level of a paper
   * @param paperId The ID of the paper
   * @param importance The importance level (1-5)
   * @returns The updated paper or null if not found
   */
  async setPaperImportance(paperId: string, importance: number): Promise<PaperEntity | null> {
    try {
      // Validate importance level
      if (importance < 1 || importance > 5) {
        throw new Error('Importance must be between 1 and 5');
      }
      
      // Get existing paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Update importance
      paper.importance = importance;
      paper.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.savePaper(paper);
    } catch (error) {
      console.error(`Error setting importance for paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new collection
   * @param name Collection name
   * @param description Collection description
   * @param paperIds Initial paper IDs to include
   * @param tags Collection tags
   * @returns The created collection
   */
  async createCollection(
    name: string, 
    description: string, 
    paperIds: string[] = [], 
    tags: string[] = []
  ): Promise<Collection> {
    try {
      const now = new Date().toISOString();
      
      // Create collection entity
      const collection: Collection = {
        id: crypto.randomUUID(),
        name,
        description,
        papers: paperIds,
        tags,
        createdAt: now,
        updatedAt: now
      };
      
      // Save to repository
      return paperRepository.saveCollection(collection);
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }
  
  /**
   * Update a collection
   * @param collectionId The ID of the collection to update
   * @param updateData The updated collection data
   * @returns The updated collection or null if not found
   */
  async updateCollection(
    collectionId: string, 
    updateData: Partial<Collection>
  ): Promise<Collection | null> {
    try {
      // Get existing collection
      const collection = await paperRepository.getCollection(collectionId);
      if (!collection) {
        return null;
      }
      
      // Update collection data
      const updatedCollection: Collection = {
        ...collection,
        ...updateData,
        id: collection.id, // Ensure ID doesn't change
        createdAt: collection.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString() // Update modification date
      };
      
      // Save to repository
      return paperRepository.saveCollection(updatedCollection);
    } catch (error) {
      console.error(`Error updating collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add papers to a collection
   * @param collectionId The ID of the collection
   * @param paperIds Paper IDs to add
   * @returns The updated collection or null if not found
   */
  async addPapersToCollection(collectionId: string, paperIds: string[]): Promise<Collection | null> {
    try {
      // Get existing collection
      const collection = await paperRepository.getCollection(collectionId);
      if (!collection) {
        return null;
      }
      
      // Add papers (avoid duplicates)
      const updatedPapers = [...new Set([...collection.papers, ...paperIds])];
      
      // Update collection
      collection.papers = updatedPapers;
      collection.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.saveCollection(collection);
    } catch (error) {
      console.error(`Error adding papers to collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove papers from a collection
   * @param collectionId The ID of the collection
   * @param paperIds Paper IDs to remove
   * @returns The updated collection or null if not found
   */
  async removePapersFromCollection(collectionId: string, paperIds: string[]): Promise<Collection | null> {
    try {
      // Get existing collection
      const collection = await paperRepository.getCollection(collectionId);
      if (!collection) {
        return null;
      }
      
      // Remove papers
      collection.papers = collection.papers.filter(id => !paperIds.includes(id));
      collection.updatedAt = new Date().toISOString();
      
      // Save to repository
      return paperRepository.saveCollection(collection);
    } catch (error) {
      console.error(`Error removing papers from collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all papers in a collection
   * @param collectionId The ID of the collection
   * @returns Array of papers in the collection or null if collection not found
   */
  async getCollectionPapers(collectionId: string): Promise<PaperEntity[] | null> {
    try {
      // Get collection
      const collection = await paperRepository.getCollection(collectionId);
      if (!collection) {
        return null;
      }
      
      // Get all papers in the collection
      const papers: PaperEntity[] = [];
      for (const paperId of collection.papers) {
        const paper = await paperRepository.getPaper(paperId);
        if (paper) {
          papers.push(paper);
        }
      }
      
      return papers;
    } catch (error) {
      console.error(`Error getting papers for collection ${collectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get citation information for a paper
   * @param paperId The ID of the paper
   * @returns Citation information or null if paper not found
   */
  async getPaperCitationInfo(paperId: string): Promise<{
    paper: PaperEntity;
    citations: PaperEntity[];
    references: PaperEntity[];
  } | null> {
    try {
      // Get paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        return null;
      }
      
      // Get citation relationships
      const { citations, references } = await paperRepository.getPaperCitations(paperId);
      
      // Get the actual papers
      const citingPapers: PaperEntity[] = [];
      for (const citation of citations) {
        const citingPaper = await paperRepository.getPaper(citation.from);
        if (citingPaper) {
          citingPapers.push(citingPaper);
        }
      }
      
      const referencedPapers: PaperEntity[] = [];
      for (const reference of references) {
        const referencedPaper = await paperRepository.getPaper(reference.to);
        if (referencedPaper) {
          referencedPapers.push(referencedPaper);
        }
      }
      
      return {
        paper,
        citations: citingPapers,
        references: referencedPapers
      };
    } catch (error) {
      console.error(`Error getting citation info for paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Import citations for a paper from Semantic Scholar
   * @param paperId The ID of the paper
   * @returns Number of citations imported
   */
  async importPaperCitations(paperId: string): Promise<number> {
    try {
      // Get paper
      const paper = await paperRepository.getPaper(paperId);
      if (!paper) {
        throw new Error(`Paper ${paperId} not found`);
      }
      
      // Use S2 ID if available, otherwise try DOI or arXiv ID
      const s2Id = paper.s2Id || paper.doi || paper.arxivId;
      if (!s2Id) {
        throw new Error(`No valid identifier found for paper ${paperId}`);
      }
      
      // Get citations from Semantic Scholar
      const citationsResponse = await semanticScholar.getCitations(s2Id);
      
      let importCount = 0;
      
      // Process each citation
      for (const citingPaper of citationsResponse.data) {
        // Convert and save the citing paper
        const citingPaperEntity = semanticScholar.convertToPaperEntity(citingPaper);
        await paperRepository.savePaper(citingPaperEntity);
        
        // Create citation relationship
        const citation: Citation = {
          from: citingPaperEntity.id,
          to: paperId,
          importance: 3 // Default importance
        };
        
        await paperRepository.saveCitation(citation);
        importCount++;
      }
      
      // Get references from Semantic Scholar
      const referencesResponse = await semanticScholar.getReferences(s2Id);
      
      // Process each reference
      for (const referencedPaper of referencesResponse.data) {
        // Convert and save the referenced paper
        const referencedPaperEntity = semanticScholar.convertToPaperEntity(referencedPaper);
        await paperRepository.savePaper(referencedPaperEntity);
        
        // Create citation relationship
        const citation: Citation = {
          from: paperId,
          to: referencedPaperEntity.id,
          importance: 3 // Default importance
        };
        
        await paperRepository.saveCitation(citation);
        importCount++;
      }
      
      return importCount;
    } catch (error) {
      console.error(`Error importing citations for paper ${paperId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const paperService = new PaperService();