#!/usr/bin/env python3
import argparse
import os
import re
import requests
import logging
import sys
from urllib.parse import urlparse
import json

def setup_logging():
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    return logging.getLogger(__name__)

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Index a GitHub repository\'s documentation')
    parser.add_argument('-n', '--name', required=True, help='Name of the project')
    parser.add_argument('-u', '--url', required=True, help='URL to the GitHub repository')
    return parser.parse_args()

def sanitize_filename(path):
    """Create a sanitized, flat filename from a path."""
    # Replace slashes and other invalid chars with dashes
    sanitized = re.sub(r'[\\/*?:"<>|]', '-', path)
    sanitized = sanitized.replace('/', '-')
    
    # Limit filename length to avoid issues on some filesystems
    if len(sanitized) > 200:
        sanitized = sanitized[:200]
    
    return sanitized

def get_repo_info(repo_url):
    """Extract owner and repo name from GitHub URL."""
    # Clean up the URL to ensure it's just the repo base URL
    repo_url = repo_url.rstrip('/')
    if repo_url.endswith('.git'):
        repo_url = repo_url[:-4]
    
    # Parse the URL
    parsed = urlparse(repo_url)
    path_parts = [p for p in parsed.path.split('/') if p]
    
    if len(path_parts) < 2:
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
    
    owner = path_parts[0]
    repo = path_parts[1]
    
    return owner, repo

def get_contents(api_url, logger):
    """Get contents from GitHub API."""
    try:
        headers = {}
        if 'GITHUB_TOKEN' in os.environ:
            headers['Authorization'] = f"token {os.environ['GITHUB_TOKEN']}"
        
        response = requests.get(api_url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to get contents from {api_url}: {e}")
        return None

def download_file(download_url, output_path, logger):
    """Download a file from a URL to the specified output path."""
    try:
        headers = {}
        if 'GITHUB_TOKEN' in os.environ:
            headers['Authorization'] = f"token {os.environ['GITHUB_TOKEN']}"
        
        response = requests.get(download_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Write the content to the file
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"Downloaded: {download_url} -> {output_path}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download {download_url}: {e}")
        return False

def fetch_docs(owner, repo, base_dir, logger):
    """Fetch README.md and all files in the docs/ directory."""
    downloaded_files = []
    
    # First try to get the README.md file
    readme_api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/README.md"
    readme_content = get_contents(readme_api_url, logger)
    
    if readme_content and not isinstance(readme_content, list):
        output_path = os.path.join(base_dir, f"{owner}-{repo}-README.md")
        if download_file(readme_content['download_url'], output_path, logger):
            downloaded_files.append(output_path)
    else:
        logger.warning(f"README.md not found in {owner}/{repo}")
    
    # Now try to get the docs/ directory
    docs_api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/docs"
    docs_contents = get_contents(docs_api_url, logger)
    
    if docs_contents and isinstance(docs_contents, list):
        process_directory_contents(docs_contents, owner, repo, 'docs', base_dir, downloaded_files, logger)
    else:
        logger.warning(f"docs/ directory not found in {owner}/{repo}")
    
    return downloaded_files

def process_directory_contents(contents, owner, repo, path, base_dir, downloaded_files, logger):
    """Process the contents of a directory recursively."""
    for item in contents:
        if item['type'] == 'file':
            # Check if it's a markdown or text file
            if item['name'].endswith(('.md', '.txt', '.markdown')):
                sanitized_path = sanitize_filename(f"{path}/{item['name']}")
                output_path = os.path.join(base_dir, f"{owner}-{repo}-{sanitized_path}")
                if download_file(item['download_url'], output_path, logger):
                    downloaded_files.append(output_path)
        elif item['type'] == 'dir':
            # Recursively process subdirectories
            subdir_api_url = item['url']
            subdir_contents = get_contents(subdir_api_url, logger)
            if subdir_contents:
                process_directory_contents(
                    subdir_contents, 
                    owner, 
                    repo, 
                    f"{path}/{item['name']}", 
                    base_dir, 
                    downloaded_files, 
                    logger
                )

def main():
    """Main function."""
    logger = setup_logging()
    args = parse_arguments()
    
    # Create base directory
    base_dir = os.path.join("./docs", args.name)
    os.makedirs(base_dir, exist_ok=True)
    
    logger.info(f"Starting indexing of {args.url} into {base_dir}")
    
    try:
        # Extract owner and repo from URL
        owner, repo = get_repo_info(args.url)
        logger.info(f"Repository: {owner}/{repo}")
        
        # Fetch documentation
        downloaded_files = fetch_docs(owner, repo, base_dir, logger)
        
        logger.info(f"Indexing complete. Downloaded {len(downloaded_files)} files.")
    except Exception as e:
        logger.error(f"Error indexing repository: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
