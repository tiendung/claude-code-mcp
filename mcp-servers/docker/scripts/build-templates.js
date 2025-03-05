#!/usr/bin/env node

/**
 * Script to build Docker images for MCP server templates
 * 
 * This script reads template definitions from the templates directory
 * and builds Docker images for each template that has a build configuration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

// Configuration
const TEMPLATES_DIR = path.resolve(process.cwd(), 'templates');
const PROJECT_ROOT = path.resolve(process.cwd(), '../..');

// Get template files
const templateFiles = fs.readdirSync(TEMPLATES_DIR)
  .filter(file => file.endsWith('.json'));

// Logging with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Build a Docker image from a template
async function buildImage(templateFile) {
  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  const templateName = path.basename(templateFile, '.json');
  
  try {
    // Read template file
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = JSON.parse(templateContent);
    
    // Check if template has build configuration
    if (!template.build) {
      log(`Template ${templateName} has no build configuration, skipping...`);
      return;
    }
    
    // Resolve build context path
    const contextPath = path.resolve(PROJECT_ROOT, template.build.context);
    
    // Check if context directory exists
    if (!fs.existsSync(contextPath)) {
      log(`Build context ${contextPath} does not exist for template ${templateName}, skipping...`);
      return;
    }
    
    // Build Docker image
    log(`Building Docker image for ${templateName}...`);
    
    const dockerfilePath = template.build.dockerfile 
      ? path.join(contextPath, template.build.dockerfile)
      : path.join(contextPath, 'Dockerfile');
    
    // Check if Dockerfile exists
    if (!fs.existsSync(dockerfilePath)) {
      log(`Dockerfile not found at ${dockerfilePath} for template ${templateName}, skipping...`);
      return;
    }
    
    // Build command
    const buildCmd = `docker build -t ${template.image} -f ${dockerfilePath} ${contextPath}`;
    log(`Running command: ${buildCmd}`);
    
    // Execute build
    const { stdout, stderr } = await execPromise(buildCmd);
    
    if (stderr) {
      log(`Warnings/errors during build of ${templateName}:\n${stderr}`);
    }
    
    log(`Successfully built image ${template.image} for template ${templateName}`);
    return template.image;
  } catch (error) {
    log(`Error building image for template ${templateName}: ${error.message}`);
    if (error.stdout) log(`stdout: ${error.stdout}`);
    if (error.stderr) log(`stderr: ${error.stderr}`);
    return null;
  }
}

// Main function
async function main() {
  log(`Found ${templateFiles.length} template files in ${TEMPLATES_DIR}`);
  
  const results = [];
  
  // Build each template
  for (const templateFile of templateFiles) {
    const result = await buildImage(templateFile);
    if (result) {
      results.push({
        template: templateFile,
        image: result,
        status: 'success'
      });
    } else {
      results.push({
        template: templateFile,
        status: 'failed'
      });
    }
  }
  
  // Print results
  log('\nBuild Results:');
  results.forEach(result => {
    log(`- ${result.template}: ${result.status}${result.image ? ` (${result.image})` : ''}`);
  });
  
  // Exit with error if any build failed
  const failedBuilds = results.filter(r => r.status === 'failed');
  if (failedBuilds.length > 0) {
    log(`${failedBuilds.length} build(s) failed`);
    process.exit(1);
  }
  
  log('All builds completed successfully');
}

// Run the script
main().catch(error => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});