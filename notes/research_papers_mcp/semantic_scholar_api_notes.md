# Semantic Scholar API Notes

## Overview

The Semantic Scholar API provides access to a vast database of academic papers, authors, citations, and related information. It offers several services that can be valuable for our Research Papers MCP server:

1. **Academic Graph API**: Data about papers, authors, citations, venues
2. **Recommendations API**: Paper recommendations based on a reference paper
3. **Datasets API**: Downloadable links for datasets in the academic graph

Base URLs:
- Academic Graph API: `https://api.semanticscholar.org/graph/v1`
- Recommendations API: `https://api.semanticscholar.org/recommendations/v1`
- Datasets API: `https://api.semanticscholar.org/datasets/v1`

## API Access & Rate Limits

- Most endpoints are available without authentication (rate limited to 1000 requests/second shared)
- API key authentication provides higher rate limits (initially 1 request/second)
- Best practice: Include API key with every request
- Request an API key from Semantic Scholar website for production use

## Key Endpoints for Research Papers MCP

### Paper Data

1. **Get Paper Details**
   - Endpoint: `/paper/{paper_id}`
   - Example: `GET https://api.semanticscholar.org/graph/v1/paper/10.1093/mind/lix.236.433`
   - Returns detailed information about a specific paper
   - Can include fields parameter to customize response

2. **Paper Search**
   - Endpoint: `/paper/search`
   - Example: `GET https://api.semanticscholar.org/graph/v1/paper/search?query=machine%20learning`
   - Searches papers by keyword
   - Supports pagination with offset and limit parameters

3. **Paper Batch**
   - Endpoint: `/paper/batch`
   - Method: POST
   - Retrieves details for multiple papers in a single request
   - More efficient than individual requests

4. **Citation Data**
   - Endpoints: 
     - `/paper/{paper_id}/citations`
     - `/paper/{paper_id}/references`
   - Get papers that cite or are cited by a specific paper
   - Useful for building citation network

### Author Data

1. **Get Author Details**
   - Endpoint: `/author/{author_id}`
   - Returns detailed information about an author

2. **Author Search**
   - Endpoint: `/author/search`
   - Searches for authors by name

3. **Author Papers**
   - Endpoint: `/author/{author_id}/papers`
   - Gets papers written by a specific author

## Recommendations

1. **Paper Recommendations**
   - Endpoint: `/recommendations`
   - Returns papers similar to a given reference paper
   - Useful for "related papers" feature

## API Response Structure

Sample paper response (fields vary based on request parameters):

```json
{
  "paperId": "10.1093/mind/lix.236.433",
  "externalIds": {
    "DOI": "10.1093/mind/lix.236.433",
    "MAG": "1976896427",
    "DBLP": "journals/mind/Turing50"
  },
  "url": "https://academic.oup.com/mind/article/LIX/236/433/986238",
  "title": "Computing Machinery and Intelligence",
  "abstract": "I propose to consider the question, 'Can machines think?' This should begin...",
  "venue": "Mind",
  "year": 1950,
  "authors": [
    {
      "authorId": "51453144",
      "name": "A. Turing"
    }
  ],
  "citations": [...],
  "references": [...],
  "fieldsOfStudy": ["Computer Science"],
  "s2FieldsOfStudy": [
    {
      "category": "Computer Science",
      "source": "s2-fos-model"
    }
  ],
  "publicationTypes": ["JournalArticle"],
  "journal": {
    "name": "Mind",
    "volume": "LIX",
    "pages": "433-460"
  },
  "publicationDate": "1950-10-01",
  "citationCount": 15291,
  "influentialCitationCount": 1393,
  "referenceCount": 9,
  "isOpenAccess": false,
  "openAccessPdf": null,
  "citationStyles": {...},
  "embedding": {"model": "specter_v2_cosentbert", "vector": [...]}
}
```

## Implementation Considerations

1. **API Client Design**
   - Implement rate limiting and throttling
   - Handle pagination for multi-page responses
   - Cache frequently accessed data
   - Implement retry mechanisms for failed requests

2. **Error Handling**
   - 400: Bad Request - Check parameters
   - 401: Unauthorized - Check API key
   - 404: Not Found - Paper/author not in database
   - 429: Too Many Requests - Implement backoff and retry

3. **Optimizations**
   - Use batch endpoints where possible
   - Request only needed fields to reduce response size
   - Implement local caching of frequently accessed papers
   - Periodically update metadata for frequently accessed papers

## Python Client Library

For prototyping and testing, we can use the unofficial Python client library:
- Package: `semanticscholar`
- GitHub: https://github.com/danielnsilva/semanticscholar
- Documentation: https://semanticscholar.readthedocs.io/

Basic usage:
```python
from semanticscholar import SemanticScholar

sch = SemanticScholar()
paper = sch.get_paper('10.1093/mind/lix.236.433')
print(paper.title)  # "Computing Machinery and Intelligence"
```

The library provides:
- Typed responses
- Simplified pagination
- Support for asynchronous requests
- Comprehensive coverage of API endpoints