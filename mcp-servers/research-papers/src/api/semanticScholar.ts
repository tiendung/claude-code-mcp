/**
 * Semantic Scholar API client for the Research Papers MCP
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { Author, PaperEntity } from '../types/paper.js';

// Import axios-rate-limit correctly
// @ts-ignore - TS doesn't correctly handle the CommonJS/ESM interop for this package
import rateLimit from 'axios-rate-limit';

// Semantic Scholar API response types
interface S2Paper {
  paperId: string;
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
    MAG?: string;
    DBLP?: string;
  };
  url?: string;
  title: string;
  abstract?: string;
  venue?: string;
  year?: number;
  authors?: S2Author[];
  citationCount?: number;
  referenceCount?: number;
  fieldsOfStudy?: string[];
  isOpenAccess?: boolean;
  openAccessPdf?: { url: string } | null;
}

interface S2Author {
  authorId?: string;
  name: string;
  url?: string;
}

interface S2PaperSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: S2Paper[];
}

interface S2PaperResponse {
  data: S2Paper;
}

interface S2PaperBatchResponse {
  data: S2Paper[];
}

export class SemanticScholarClient {
  private client: AxiosInstance;
  private readonly baseUrl = 'https://api.semanticscholar.org/graph/v1';
  
  constructor(apiKey?: string) {
    // Create axios instance with rate limiting
    // Default rate limit: 100 requests per minute (or 5 req/3sec for unauthenticated)
    // @ts-ignore - TS doesn't correctly handle the CommonJS/ESM interop for this package
    this.client = rateLimit(
      axios.create({
        baseURL: this.baseUrl,
        timeout: 10000,
        headers: apiKey ? {
          'x-api-key': apiKey
        } : {}
      }),
      { maxRequests: apiKey ? 60 : 5, perMilliseconds: apiKey ? 60000 : 3000 }
    );
    
    // Add retry capability
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError): boolean => {
        // Retry on network errors or 429 (rate limit) or 5xx (server errors)
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.response?.status === 429 ||
               (error.response?.status !== undefined && error.response.status >= 500);
      }
    });
  }
  
  /**
   * Search for papers by query terms
   * @param query Search query
   * @param limit Maximum number of results to return
   * @param offset Starting offset for pagination
   * @param fields Fields to include in the response
   * @returns Search results with paper data
   */
  async searchPapers(
    query: string, 
    limit: number = 10, 
    offset: number = 0,
    fields: string[] = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'authors', 'citationCount', 'referenceCount', 'fieldsOfStudy', 'isOpenAccess', 'openAccessPdf']
  ): Promise<S2PaperSearchResponse> {
    try {
      const response = await this.client.get('/paper/search', {
        params: {
          query,
          limit,
          offset,
          fields: fields.join(',')
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching papers:', error);
      throw error;
    }
  }
  
  /**
   * Get paper details by ID (DOI, arXiv ID, etc.)
   * @param paperId Paper identifier
   * @param fields Fields to include in the response
   * @returns Paper data
   */
  async getPaper(
    paperId: string,
    fields: string[] = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'authors', 'citationCount', 'referenceCount', 'fieldsOfStudy', 'isOpenAccess', 'openAccessPdf']
  ): Promise<S2Paper> {
    try {
      // Handle different ID types (DOI, arXiv)
      const idPath = paperId.includes('/') ? encodeURIComponent(paperId) : paperId;
      const response = await this.client.get(`/paper/${idPath}`, {
        params: {
          fields: fields.join(',')
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get multiple papers in a single batch request
   * @param paperIds Array of paper IDs
   * @param fields Fields to include in the response
   * @returns Array of paper data
   */
  async getPaperBatch(
    paperIds: string[],
    fields: string[] = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'authors', 'citationCount', 'referenceCount', 'fieldsOfStudy', 'isOpenAccess', 'openAccessPdf']
  ): Promise<S2Paper[]> {
    try {
      const response = await this.client.post('/paper/batch', {
        ids: paperIds,
        fields: fields.join(',')
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in batch paper request:', error);
      throw error;
    }
  }
  
  /**
   * Get citation data for a paper
   * @param paperId Paper identifier
   * @param limit Maximum number of citations to return
   * @param fields Fields to include in the response
   * @returns Papers that cite the specified paper
   */
  async getCitations(
    paperId: string,
    limit: number = 100,
    fields: string[] = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'authors']
  ): Promise<S2PaperSearchResponse> {
    try {
      const idPath = paperId.includes('/') ? encodeURIComponent(paperId) : paperId;
      const response = await this.client.get(`/paper/${idPath}/citations`, {
        params: {
          limit,
          fields: fields.join(',')
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting citations for paper ${paperId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get references data for a paper
   * @param paperId Paper identifier
   * @param limit Maximum number of references to return
   * @param fields Fields to include in the response
   * @returns Papers cited by the specified paper
   */
  async getReferences(
    paperId: string,
    limit: number = 100,
    fields: string[] = ['paperId', 'externalIds', 'url', 'title', 'abstract', 'venue', 'year', 'authors']
  ): Promise<S2PaperSearchResponse> {
    try {
      const idPath = paperId.includes('/') ? encodeURIComponent(paperId) : paperId;
      const response = await this.client.get(`/paper/${idPath}/references`, {
        params: {
          limit,
          fields: fields.join(',')
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting references for paper ${paperId}:`, error);
      throw error;
    }
  }

  /**
   * Convert a Semantic Scholar paper object to our internal PaperEntity format
   * @param s2Paper Semantic Scholar paper object
   * @returns Converted PaperEntity
   */
  convertToPaperEntity(s2Paper: S2Paper): PaperEntity {
    const now = new Date().toISOString();
    
    // Convert authors
    const authors: Author[] = (s2Paper.authors || []).map(author => ({
      id: author.authorId,
      name: author.name,
      url: author.url
    }));
    
    // Create the paper entity
    return {
      id: s2Paper.paperId,
      title: s2Paper.title,
      authors,
      abstract: s2Paper.abstract,
      year: s2Paper.year,
      venue: s2Paper.venue,
      url: s2Paper.url,
      tags: [],
      categories: s2Paper.fieldsOfStudy || [],
      readStatus: 'unread',
      importance: 3,
      notes: [],
      citationCount: s2Paper.citationCount,
      referenceCount: s2Paper.referenceCount,
      s2Id: s2Paper.paperId,
      doi: s2Paper.externalIds?.DOI,
      arxivId: s2Paper.externalIds?.ArXiv,
      createdAt: now,
      updatedAt: now
    };
  }
}

// Export singleton instance with no API key for testing
export const semanticScholar = new SemanticScholarClient();