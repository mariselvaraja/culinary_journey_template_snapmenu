import { EmbeddingIndex } from 'client-vector-search';

// Search states for tracking progress
const SEARCH_STATES = {
  UNINITIALIZED: 'uninitialized',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
};

class SearchService {
  checkBrowserSupport() {
    // Check for required browser features
    if (!window.indexedDB) {
      throw new Error('IndexedDB is not supported in this browser');
    }
    if (!window.TextEncoder) {
      throw new Error('TextEncoder is not supported in this browser');
    }
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API is not supported in this browser');
    }
    return true;
  }
  //
  /**
   * Generates a deterministic hash value for a string
   * Used for consistent vector position mapping of words
   * @param {string} str - Input string to hash
   * @returns {number} - Positive integer hash value
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // djb2 hashing algorithm - produces well-distributed hash values
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generates n-gram sequences from an array of words
   * N-grams help capture phrase patterns and word relationships
   * Example: ["hot", "fresh", "pizza"] with n=2 returns ["hot fresh", "fresh pizza"]
   * @param {string[]} words - Array of words
   * @param {number} n - Size of each n-gram
   * @returns {string[]} - Array of n-gram phrases
   */
  generateNgrams(words, n) {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  /**
   * Expands health-related search terms with relevant synonyms and related concepts
   * Improves semantic matching by including related health terms
   * Example: "healthy" expands to include "nutritious fresh light lean natural wholesome balanced"
   * 
   * @param {string} query - Original search query
   * @returns {string} - Expanded query with related health terms
   */
  expandHealthTerms(query) {
    // Comprehensive mapping of health-related terms to their semantic relatives
    const healthTermsMap = {
      // Core health concepts
      'healthy': 'nutritious fresh light lean natural wholesome balanced',
      'nutritious': 'healthy vitamin mineral protein fiber nutrient-rich',
      
      // Preparation and quality terms
      'light': 'low-calorie fresh healthy salad grilled steamed',
      'fresh': 'crisp raw garden seasonal unprocessed natural',
      'natural': 'organic unprocessed whole fresh pure clean',
      
      // Dietary categories
      'low-calorie': 'light diet healthy lean reduced-fat',
      'vegetarian': 'plant-based meatless veggie vegetables',
      'vegan': 'plant-based dairy-free egg-free animal-free',
      'gluten-free': 'celiac wheat-free grain-free',
      
      // Food quality and sourcing
      'organic': 'natural pesticide-free chemical-free pure',
      
      // Nutrient categories
      'protein': 'meat fish chicken tofu beans legumes nuts',
      'fiber': 'whole-grain vegetables fruits beans legumes',
      'vitamin': 'fruits vegetables nutrients healthy nutritious',
      'mineral': 'nutrients healthy nutritious balanced'
    };

    // Split query into individual terms
    const queryTerms = query.toLowerCase().split(/\s+/);
    // Use Set to avoid duplicate terms
    const expandedTerms = new Set(queryTerms);

    // Expand each query term if it exists in our health terms mapping
    queryTerms.forEach(term => {
      if (healthTermsMap[term]) {
        healthTermsMap[term].split(' ').forEach(expandedTerm => {
          expandedTerms.add(expandedTerm);
        });
      }
    });

    // Convert Set back to space-separated string
    return Array.from(expandedTerms).join(' ');
  }

  /**
   * Creates a feature vector from text with enhanced semantic understanding
   * Uses n-grams and position-aware features for better matching
   * 
   * @param {string} text - Input text to vectorize
   * @param {number} weight - Importance weight of this text
   * @returns {number[]} - Normalized feature vector
   */
  createFeatureVector(text, weight = 1.0) {
    // Initialize zero vector with embedding dimension
    const vector = new Array(384).fill(0);
    if (!text) return vector;

    const processedText = text.toLowerCase().trim();
    if (processedText.length === 0) return vector;

    // Generate word tokens and n-grams for better phrase matching
    const words = processedText.split(/\s+/);
    const bigrams = this.generateNgrams(words, 2);  // pairs of words
    const trigrams = this.generateNgrams(words, 3);  // triplets of words

    // Process individual words with position awareness
    words.forEach((word, index) => {
      const hash = this.hashString(word);
      // Use multiple hash positions to reduce collisions
      const positions = [
        hash % 384,
        (hash * 31) % 384,  // Prime multiplier for better distribution
        (hash * 37) % 384   // Different prime for variation
      ];

      // Add weighted values to vector positions
      positions.forEach(pos => {
        vector[pos] += weight;
      });

      // Position-aware weighting: words earlier in text get higher weight
      const positionWeight = 1 - (index / words.length) * 0.5;
      vector[hash % 384] += weight * positionWeight;
    });

    // Add bigram features with reduced weight
    bigrams.forEach(ngram => {
      const hash = this.hashString(ngram);
      const pos = hash % 384;
      vector[pos] += weight * 0.5;  // Lower weight for bigrams
    });

    // Add trigram features with further reduced weight
    trigrams.forEach(ngram => {
      const hash = this.hashString(ngram);
      const pos = hash % 384;
      vector[pos] += weight * 0.3;  // Even lower weight for trigrams
    });

    // Normalize vector to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  }

  constructor() {
    console.log('Initializing SearchService');
    this.vectorSearch = null;
    this.state = SEARCH_STATES.UNINITIALIZED;
    this.error = null;
    this.progress = 0;
    this.stateListeners = new Set();
    this.SEARCH_STATES = SEARCH_STATES;
    this.embeddings = null;
    this.menuData = null;
  }

  // Create a feature vector from text with weight
  createFeatureVector(text, weight = 1.0) {
    const vector = new Array(384).fill(0);
    if (!text) return vector;

    const processedText = text.toLowerCase().trim();
    if (processedText.length === 0) return vector;

    // Create a deterministic vector based on text content
    for (let i = 0; i < processedText.length; i++) {
      const charCode = processedText.charCodeAt(i);
      // Use multiple positions to create more unique vectors
      const positions = [
        i % 384,
        (i * 2) % 384,
        (charCode * i) % 384
      ];
      positions.forEach(pos => {
        vector[pos] = (vector[pos] + charCode * weight) / 255;
      });
    }

    // Add word-level features
    const words = processedText.split(/\s+/);
    words.forEach((word, wordIndex) => {
      const wordHash = word.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0);
      }, 0);
      const pos = Math.abs(wordHash) % 384;
      vector[pos] = (vector[pos] + (wordIndex + 1) * weight) / 255;
    });

    return vector;
  }

  // Add state change listener
  addStateListener(listener) {
    console.log('Adding state listener');
    this.stateListeners.add(listener);
    // Immediately notify of current state
    listener(this.state, this.error, this.progress);
  }

  // Remove state change listener
  removeStateListener(listener) {
    console.log('Removing state listener');
    this.stateListeners.delete(listener);
  }

  // Notify all listeners of stateChange
  notifyStateChange() {
    console.log('Notifying state change:', this.state, this.error, this.progress);
    this.stateListeners.forEach(listener =>
      listener(this.state, this.error, this.progress)
    );
  }

  // Update state and notify listeners
  setState(state, error = null, progress = 0) {
    console.log('Setting state:', state, error, progress);
    this.state = state;
    this.error = error;
    this.progress = progress;
    this.notifyStateChange();
  }

  // Initialize search with menu data
  async initializeIndex(menuData) {
    try {
      console.log('Starting index initialization');
      this.setState(SEARCH_STATES.LOADING);

      if (!menuData) {
        throw new Error('Menu data is required for initialization');
      }

      // Store the original menu structure and validate
      if (!menuData.items || !Array.isArray(menuData.items)) {
        throw new Error('Menu data must contain an items array');
      }
      this.menuData = menuData;
      console.log('Menu items:', menuData.items.length);

      // Create embeddings from menu items
      this.embeddings = {};
      
      // Process each menu item
      for (const item of menuData.items) {
        if (!item.id || !item.name || !item.category) {
          console.warn('Skipping invalid item:', item);
          continue;
        }

          // Create weighted feature vectors with more context
          const nameVector = this.createFeatureVector(item.name, 4.0); // Highest weight for name
          const descVector = this.createFeatureVector(item.description || '', 2.0); // Higher weight for description
          const categoryVector = this.createFeatureVector(
            `${item.category} ${item.subCategory || ''}`, 
            3.0
          ); // High weight for category
          const ingredientsVector = this.createFeatureVector(
            (item.ingredients || []).join(' '), 
            2.5
          ); // Higher weight for ingredients
          const allergensVector = this.createFeatureVector(
            (item.allergens || []).join(' '),
            1.5
          ); // Include allergens
          const pairingsVector = this.createFeatureVector(
            (item.pairings || []).join(' '),
            1.0
          ); // Include pairings

          // Enhanced dietary and health context
          const healthContext = [
            // Dietary preferences
            item.dietary?.isVegetarian ? 'vegetarian vegetable vegetables healthy plant-based' : '',
            item.dietary?.isVegan ? 'vegan plant-based healthy natural' : '',
            item.dietary?.isGlutenFree ? 'gluten-free celiac healthy' : '',
            // Health indicators from ingredients
            (item.ingredients || []).some(i => 
              ['vegetable', 'fruit', 'salad', 'lean', 'fresh'].some(term => 
                i.toLowerCase().includes(term)
              )
            ) ? 'healthy nutritious' : '',
            // Health indicators from description
            (item.description || '').toLowerCase().includes('fresh') ? 'healthy fresh' : '',
            // Low calorie items
            (item.calories || 0) < 500 ? 'healthy light' : '',
            // Fresh ingredients and preparations
            item.subCategory === 'salads' ? 'healthy fresh nutritious' : '',
            ['grilled', 'steamed', 'fresh'].some(term => 
              (item.description || '').toLowerCase().includes(term)
            ) ? 'healthy light' : ''
          ].filter(Boolean).join(' ');

          const dietaryVector = this.createFeatureVector(healthContext, 2.0);

        // Combine all feature vectors
        const vector = new Array(384).fill(0);
        [
          nameVector,
          descVector,
          categoryVector,
          ingredientsVector,
          allergensVector,
          pairingsVector,
          dietaryVector
        ].forEach(featureVector => {
          featureVector.forEach((val, i) => {
            vector[i] += val;
          });
        });

        // Normalize the combined vector
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        const normalizedVector = magnitude === 0 ? vector : vector.map(val => val / magnitude);
        
        // Create embedding with item data and normalized vector
        this.embeddings[item.id] = {
          vector: normalizedVector,
          item: {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            category: item.category,
            dietary: item.dietary || {},
            ingredients: item.ingredients || [],
            allergens: item.allergens || [],
            pairings: item.pairings || [],
            image: item.image || ''
          }
        };

        // Log the normalized vector for debugging
        console.log(`Created normalized vector for ${item.id}:`, {
          name: item.name,
          vectorSum: normalizedVector.reduce((sum, val) => sum + val, 0),
          vectorMagnitude: Math.sqrt(normalizedVector.reduce((sum, val) => sum + val * val, 0))
        });
      }

      // Log and validate embeddings
      console.log('Created embeddings for', Object.keys(this.embeddings).length, 'items');
      
      for (const [itemId, embedding] of Object.entries(this.embeddings)) {
        if (!embedding.item || !embedding.vector) {
          console.error(`Invalid embedding data for ${itemId}:`, embedding);
          throw new Error(`Invalid embedding data for ${itemId}`);
        }
        console.log(`Validated embedding for ${itemId}:`, embedding.item);
      }

      // Convert embeddings to vectors for search index
      const vectors = Object.entries(this.embeddings)
        .map(([itemId, embeddingData]) => {
          if (!embeddingData.item || !embeddingData.vector) {
            console.warn(`Skipping invalid embedding for ${itemId}:`, embeddingData);
            return null;
          }

          // Create vector for search index
          const vector = {
            id: itemId,
            embedding: embeddingData.vector,
            metadata: embeddingData.item,
            // Add additional fields for debugging
            _debug: {
              name: embeddingData.item.name,
              category: embeddingData.item.category,
              vectorSum: embeddingData.vector.reduce((sum, val) => sum + val, 0),
              vectorMagnitude: Math.sqrt(embeddingData.vector.reduce((sum, val) => sum + val * val, 0))
            }
          };

          // Log vector details
          console.log(`Creating search vector for ${itemId}:`, vector._debug);

          return vector;
        })
        .filter(Boolean);

      console.log('Created vectors:', vectors.length);

      if (vectors.length === 0) {
        throw new Error('No valid vectors created from menu items');
      }

      // Log vector creation results
      const skippedCount = menuData.items.length - vectors.length;
      if (skippedCount > 0) {
        console.warn(`Skipped ${skippedCount} invalid items`);
      }

      console.log(`Created ${vectors.length} vectors from ${menuData.items.length} menu items`);

      // Initialize search index with menu items
      console.log('Initializing EmbeddingIndex with vectors');
      this.vectorSearch = new EmbeddingIndex(vectors);
      console.log('EmbeddingIndex initialized successfully');
      
      // Save index to IndexedDB for persistence
      try {
        await this.vectorSearch.saveIndex('indexedDB');
        console.log('Index saved to IndexedDB');
      } catch (storageError) {
        console.warn('Failed to save index to IndexedDB:', storageError);
        // Continue even if storage fails - it's not critical
      }
      
      console.log('Search initialization complete');
      this.setState(SEARCH_STATES.READY);
    } catch (error) {
      console.error('Search initialization error:', error);
      this.setState(SEARCH_STATES.ERROR, error.message);
      throw error;
    }
  }

  // Group search results by category
  groupResults(results) {
    if (!Array.isArray(results)) {
      console.warn('Expected array of results, got:', typeof results);
      return {};
    }

    console.log('Grouping results:', JSON.stringify(results, null, 2));

    const grouped = {};
    for (const result of results) {
      if (!result || !result.item) {
        console.warn('Invalid result format:', JSON.stringify(result, null, 2));
        continue;
      }

      // Log the result being processed
      console.log('Processing result for grouping:', result);

      if (!result.item.category) {
        console.log('Item missing category:', result.item);
      }

      // Get category from item, default to 'Other' if missing
      const category = result.item.category || 'Other';
      
      // Initialize category array if it doesn't exist
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      // Add item to its category group
      grouped[category].push({
        item: result.item,
        score: result.similarity
      });
    }

    // Log the grouped results for debugging
    console.log('Final grouped results:', JSON.stringify(grouped, null, 2));
    return grouped;
  }

  // Create a query embedding from text
  createQueryEmbedding(query) {
    // Create weighted feature vectors for query
    const nameVector = this.createFeatureVector(query, 4.0);
    const categoryVector = this.createFeatureVector(query, 3.0);
    const descriptionVector = this.createFeatureVector(query, 2.0);
    const ingredientsVector = this.createFeatureVector(query, 2.5);
    const dietaryVector = this.createFeatureVector(
      [
        query.includes('vegetarian') ? 'vegetarian vegetable vegetables' : '',
        query.includes('vegan') ? 'vegan plant-based' : '',
        query.includes('gluten') ? 'gluten-free celiac' : ''
      ].filter(Boolean).join(' '),
      2.0
    );

    // Combine feature vectors
    const vector = new Array(384).fill(0);
    [
      nameVector,
      categoryVector,
      descriptionVector,
      ingredientsVector,
      dietaryVector
    ].forEach(featureVector => {
      featureVector.forEach((val, i) => {
        vector[i] += val;
      });
    });

    // Normalize the combined vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = magnitude === 0 ? vector : vector.map(val => val / magnitude);

    // Find matching items for query terms
    const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    console.log('Search words:', words);

    // Find items that match query terms
    const matchingItems = Object.entries(this.embeddings)
      .map(([id, data]) => {
        const item = data.item;
        if (!item) return null;

        // Calculate text match scores for different fields
        let nameScore = 0;
        let categoryScore = 0;
        let descriptionScore = 0;
        let ingredientsScore = 0;
        let dietaryScore = 0;

        words.forEach(word => {
          // Name matches (highest weight)
          if (item.name.toLowerCase().includes(word)) {
            nameScore += 1.0;
          }

          // Category matches (high weight)
          if (item.category.toLowerCase().includes(word)) {
            categoryScore += 0.8;
          }

          // Description matches (medium weight)
          if (item.description.toLowerCase().includes(word)) {
            descriptionScore += 0.6;
          }

          // Ingredients matches (medium weight)
          if ((item.ingredients || []).some(i => i.toLowerCase().includes(word))) {
            ingredientsScore += 0.5;
          }

          // Dietary preference matches (medium-high weight)
          const dietaryText = [
            item.dietary?.isVegetarian ? 'vegetarian vegetable vegetables' : '',
            item.dietary?.isVegan ? 'vegan plant-based' : '',
            item.dietary?.isGlutenFree ? 'gluten-free celiac' : ''
          ].join(' ').toLowerCase();
          if (dietaryText.includes(word)) {
            dietaryScore += 0.7;
          }
        });

        // Combine all scores with weights
        const score = (
          (nameScore * 0.35) +
          (categoryScore * 0.25) +
          (descriptionScore * 0.15) +
          (ingredientsScore * 0.15) +
          (dietaryScore * 0.10)
        );

        return score > 0 ? { id, data, score } : null;
      })
      .filter(Boolean);

    console.log('Found matching items:', matchingItems.length);

    if (matchingItems.length === 0) {
      console.log('No matches found, using normalized query vector');
      return normalizedVector;
    }

    // Sort by score and get the top matches
    const topMatches = matchingItems
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Get top 5 matches

    console.log('Found matching items:', topMatches.length);

    // Create context vector from matching items
    const contextVector = new Array(384).fill(0);
    let totalWeight = 0;

    topMatches.forEach(({ data, score }) => {
      data.vector.forEach((value, i) => {
        contextVector[i] += value * score;
      });
      totalWeight += score;
    });

    // Normalize context vector
    const normalizedContextVector = contextVector.map(val => val / (totalWeight || 1));

    // Combine normalized query vector and context vector with weights
    const combinedVector = normalizedVector.map((val, i) => 
      (val * 0.4) + (normalizedContextVector[i] * 0.6)
    );

    // Normalize the final combined vector
    const finalMagnitude = Math.sqrt(combinedVector.reduce((sum, val) => sum + val * val, 0));
    return finalMagnitude === 0 ? normalizedVector : combinedVector.map(val => val / finalMagnitude);
  }

  // Perform search with error handling
  async search(query) {
    if (this.state !== SEARCH_STATES.READY) {
      throw new Error('Search index not initialized');
    }

    try {
      // Check if input is raw results
      const isRawResults = Array.isArray(query) && query.length > 0 && 'similarity' in query[0];
      
      let searchResults;
      if (isRawResults) {
        console.log('Processing raw search results');
        searchResults = query;
      } else {
        if (!query || typeof query !== 'string') {
          console.warn('Invalid search query:', query);
          return { results: [], grouped: {} };
        }
        
        console.log('Performing search for:', query);
        const queryEmbedding = this.createQueryEmbedding(query);

        // Log the query and its embedding
        console.log('Query:', query);
        console.log('Query Embedding:', queryEmbedding);

        // Get matching items from embeddings
        const matchingItems = Object.entries(this.embeddings)
          .map(([id, data]) => {
            const item = data.item;
            if (!item) return null;
            
            // Log item details for debugging
            console.log('Item:', item.name, item.category, item.description);

            // Calculate text match scores for different fields
            let nameScore = 0;
            let categoryScore = 0;
            let descriptionScore = 0;
            let ingredientsScore = 0;
            let dietaryScore = 0;

            const words = query.toLowerCase().split(/\s+/);
            words.forEach(word => {
              // Name matches (highest weight)
              if (item.name.toLowerCase().includes(word)) {
                nameScore += 1.0;
              }

              // Category matches (high weight)
              if (item.category.toLowerCase().includes(word)) {
                categoryScore += 0.8;
              }

              // Description matches (medium weight)
              if (item.description.toLowerCase().includes(word)) {
                descriptionScore += 0.6;
              }

              // Ingredients matches (medium weight)
              if ((item.ingredients || []).some(i => i.toLowerCase().includes(word))) {
                ingredientsScore += 0.5;
              }

              // Dietary preference matches (medium-high weight)
              const dietaryText = [
                item.dietary?.isVegetarian ? 'vegetarian vegetable vegetables' : '',
                item.dietary?.isVegan ? 'vegan plant-based' : '',
                item.dietary?.isGlutenFree ? 'gluten-free celiac' : ''
              ].join(' ').toLowerCase();
              if (dietaryText.includes(word)) {
                dietaryScore += 0.7;
              }
            });

            // Calculate combined score
            const textScore = (
              (nameScore * 0.35) +
              (categoryScore * 0.25) +
              (descriptionScore * 0.15) +
              (ingredientsScore * 0.15) +
              (dietaryScore * 0.10)
            );

            return textScore > 0 ? { id, item, score: textScore } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);

        // Perform vector search with increased topK for better coverage
        const vectorResults = await this.vectorSearch.search(queryEmbedding, {
          topK: 50,  // Increased from 20 to get more potential matches
          includeMetadata: true
        });

        console.log('Vector Search Results:', vectorResults);

        // Initialize combined results map
        const combinedResults = new Map();

        // Process vector results first
        vectorResults.forEach(result => {
          if (result.metadata && result.metadata.id) {
            const item = result.metadata;
            let similarity = result.similarity * 0.6; // Base vector similarity weight

            // Calculate semantic boost based on item properties
            let semanticBoost = 0;

            // Boost for healthy indicators
            if (query.toLowerCase().includes('healthy')) {
              // Dietary preferences
              if (item.dietary?.isVegetarian) semanticBoost += 0.3;
              if (item.dietary?.isVegan) semanticBoost += 0.3;
              if (item.dietary?.isGlutenFree) semanticBoost += 0.2;

              // Healthy subcategories
              if (item.subCategory === 'salads' || item.subCategory === 'vegetarian') {
                semanticBoost += 0.4;
              }

              // Fresh ingredients and preparations
              const description = (item.description || '').toLowerCase();
              if (description.includes('fresh') || description.includes('grilled') || 
                  description.includes('steamed')) {
                semanticBoost += 0.3;
              }

              // Low calorie items
              if (item.calories && item.calories < 500) {
                semanticBoost += 0.3;
              }

              // Healthy ingredients
              const ingredients = (item.ingredients || []).join(' ').toLowerCase();
              const healthyIngredients = ['vegetable', 'fruit', 'salad', 'lean'];
              healthyIngredients.forEach(ingredient => {
                if (ingredients.includes(ingredient)) {
                  semanticBoost += 0.2;
                }
              });
            }

            // Add the result with combined similarity score
            combinedResults.set(item.id, {
              item,
              similarity: similarity + semanticBoost
            });
          }
        });

        // Add text match results
        matchingItems.forEach(({ id, item, score }) => {
          const existingResult = combinedResults.get(id);
          if (existingResult) {
            existingResult.similarity += score * 0.4; // Text matching weight
          } else {
            combinedResults.set(id, {
              item,
              similarity: score * 0.4
            });
          }
        });

        // Enhance semantic matching by considering related terms
        const semanticTerms = {
          'healthy': ['fresh', 'light', 'nutritious', 'lean', 'salad', 'grilled', 'steamed'],
          'spicy': ['hot', 'chili', 'pepper', 'seasoned', 'flavorful'],
          'light': ['fresh', 'healthy', 'salad', 'grilled', 'steamed'],
          'fresh': ['healthy', 'light', 'crisp', 'garden', 'seasonal'],
          'rich': ['creamy', 'decadent', 'indulgent', 'luxurious'],
          'sweet': ['dessert', 'sugar', 'honey', 'fruit'],
          'savory': ['umami', 'rich', 'flavorful', 'seasoned']
        };

        // Add semantic boost for related terms and dietary preferences
        const queryTerms = query.toLowerCase().split(/\s+/);
        queryTerms.forEach(term => {
          if (semanticTerms[term]) {
            const relatedTerms = semanticTerms[term];
            combinedResults.forEach((result, id) => {
              const description = (result.item.description || '').toLowerCase();
              const ingredients = (result.item.ingredients || []).join(' ').toLowerCase();
              const subCategory = (result.item.subCategory || '').toLowerCase();
              const dietary = result.item.dietary || {};
              
              // Calculate semantic boost based on various factors
              let boost = 0;
              
              // Check related terms in description and ingredients
              relatedTerms.forEach(relatedTerm => {
                if (description.includes(relatedTerm)) boost += 0.15;
                if (ingredients.includes(relatedTerm)) boost += 0.15;
              });
              
              // Boost for healthy indicators
              if (term === 'healthy') {
                // Dietary preferences
                if (dietary.isVegetarian) boost += 0.2;
                if (dietary.isVegan) boost += 0.2;
                if (dietary.isGlutenFree) boost += 0.1;
                
                // Healthy subcategories
                if (subCategory === 'salads' || subCategory === 'vegetarian') boost += 0.3;
                
                // Fresh ingredients and preparations
                if (description.includes('fresh') || description.includes('grilled') || 
                    description.includes('steamed')) boost += 0.2;
                
                // Low calorie items
                if (result.item.calories && result.item.calories < 500) boost += 0.2;
                
                // Healthy ingredients
                const healthyIngredients = ['vegetable', 'fruit', 'salad', 'lean'];
                healthyIngredients.forEach(ingredient => {
                  if (ingredients.includes(ingredient)) boost += 0.15;
                });
              }
              
              result.similarity += boost;
            });
          }
        });

        // Convert combined results to array and sort by similarity score
        searchResults = Array.from(combinedResults.values())
          .filter(result => result && result.item && result.item.name && result.item.category)
          .sort((a, b) => b.similarity - a.similarity)
          .map(result => ({
            similarity: result.similarity,
            item: {
              id: result.item.id,
              name: result.item.name,
              description: result.item.description || '',
              category: result.item.category,
              price: typeof result.item.price === 'number' ? result.item.price : parseFloat(result.item.price) || 0,
              dietary: result.item.dietary || {},
              ingredients: result.item.ingredients || [],
              allergens: result.item.allergens || [],
              pairings: result.item.pairings || [],
              image: result.item.image || '',
              subCategory: result.item.subCategory || ''
            }
          }));

        // Log the search results for debugging
        console.log('Search results after processing:', searchResults);
      }

      console.log('Raw search results from vector search:', searchResults);

      // Filter out any invalid results and ensure all fields are properly formatted
      searchResults = searchResults
        .filter(result => {
          if (!result?.item?.name || !result?.item?.category) {
            console.warn('Filtering out invalid result:', result);
            return false;
          }
          return true;
        })
        .map(result => {
          // Ensure price is a number
          const price = typeof result.item.price === 'string' ? 
            parseFloat(result.item.price) : 
            result.item.price || 0;

          return {
            similarity: result.similarity,
            item: {
              ...result.item,
              id: result.item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
              description: result.item.description || '',
              price: isNaN(price) ? 0 : price,
              dietary: result.item.dietary || {},
              ingredients: result.item.ingredients || [],
              allergens: result.item.allergens || [],
              pairings: result.item.pairings || [],
              image: result.item.image || ''
            }
          };
        });

      // Group the results by category
      const grouped = this.groupResults(searchResults);

      // Log the final results
      console.log('Search complete, found', searchResults.length, 'results');
      console.log('Results by category:', grouped);

      return {
        results: searchResults,
        grouped: grouped
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Clean up resources
  async cleanup() {
    try {
      console.log('Cleaning up search resources');
      if (this.vectorSearch) {
        this.vectorSearch.clear();
        // Clean up IndexedDB storage
        try {
          await this.vectorSearch.deleteIndexedDB();
          console.log('IndexedDB storage cleaned up');
        } catch (storageError) {
          console.warn('Failed to clean up IndexedDB:', storageError);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

// Create and export singleton instance
const searchService = new SearchService();
export default searchService;
