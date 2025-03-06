import searchService from './services/searchService.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testSearch() {
  try {
    // Load menu and embeddings data
    const menuPath = path.join(__dirname, '..', 'public', 'menu.json');
    const embeddingsPath = path.join(__dirname, '..', 'public', 'embeddings.json');
    
    const [menuData, embeddingsData] = await Promise.all([
      readFile(menuPath, 'utf8').then(JSON.parse),
      readFile(embeddingsPath, 'utf8').then(JSON.parse)
    ]);
    
    // Set embeddings directly
    searchService.embeddings = embeddingsData;
    
    // Initialize with menu data
    await searchService.initializeIndex(menuData.menu);
    
    // Perform a search with a query string
    const searchQuery = "soup";
    console.log('Searching for:', searchQuery);
    const results = await searchService.search(searchQuery);
    console.log('Search results:', JSON.stringify(results, null, 2));
    
    // Clean up
    await searchService.cleanup();
  } catch (error) {
    console.error('Error during search:', error);
  }
}

testSearch();
