import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding, cleanup } from '../src/services/embeddingsService.js';

/**
 * Generates embeddings for menu items and saves them to both src and public directories
 */
export async function generateEmbeddings() {
  try {
    // Read menu data
    const menuPath = join(process.cwd(), 'src/data/menu/menu.json');
    const menuData = JSON.parse(readFileSync(menuPath, 'utf8'));

    // Generate embeddings for each menu item
    const embeddings = {};
    
    for (const [category, items] of Object.entries(menuData.menu)) {
      console.log(`Generating embeddings for ${category}...`);
      
      for (const item of items) {
        // Create a rich text representation for embedding
        const textToEmbed = [
          item.name,
          item.description,
          category,
          item.subCategory,
          item.dietary?.isVegetarian ? 'vegetarian' : '',
          item.dietary?.isVegan ? 'vegan' : '',
          item.dietary?.isGlutenFree ? 'gluten free' : '',
          item.allergens?.join(' '),
          item.ingredients?.join(' '),
          `price ${item.price}`,
          item.pairings?.join(' ')
        ].filter(Boolean).join(' ');

        // Generate embedding
        const vector = await getEmbedding(textToEmbed);
        
        // Store both the vector and item data for search
        embeddings[item.id] = {
          vector,
          item: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category,
            subCategory: item.subCategory,
            dietary: item.dietary,
            allergens: item.allergens,
            ingredients: item.ingredients
          }
        };
      }
    }

    // Save embeddings to both src and public directories
    const srcEmbeddingsPath = join(process.cwd(), 'src/data/embeddings.json');
    const publicEmbeddingsPath = join(process.cwd(), 'public/embeddings.json');
    
    writeFileSync(srcEmbeddingsPath, JSON.stringify(embeddings, null, 2));
    writeFileSync(publicEmbeddingsPath, JSON.stringify(embeddings, null, 2));

    console.log('Embeddings generated and saved successfully');
    
    // Clean up resources
    cleanup();
    
    return { success: true };
  } catch (error) {
    console.error('Error generating embeddings:', error);
    cleanup();
    throw error;
  }
}

// Allow running script directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateEmbeddings().catch(console.error);
}
