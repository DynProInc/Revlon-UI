/**
 * File Service
 * This service handles file operations for PDF and JSON files
 */

// Function to get a list of all PDF files
export const getAllPDFFiles = async (): Promise<string[]> => {
  try {
    // Simulating a network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // These are the actual file names from the Source Data folder
    return [
      'AQL_CLOSURE_AQL_EN.pdf',
      'ARTWORKS_ 2227825001.pdf',
      'ARTWORKS_ 2227825002 1.pdf',
      'ARTWORKS_ 2227825003.pdf',
      'DRAWING_ 2227825XXXMATERIAL.pdf',
      'DRAWING_ 2227825XXX_MATERIAL ALTERNATIVO.pdf',
      'Jax Component spec.pdf',
      'Jax Pkg Std example.pdf',
      'QRO Component specification.pdf',
      'QRO RPPS (Finish good specification).pdf',
      'Superlustrous Lipstick RPPS example with mark ups.pdf'
    ];
  } catch (error) {
    console.error('Error fetching PDF files:', error);
    throw new Error('Failed to fetch PDF files');
  }
};

// Function to get the URL for a PDF file
export const getPDFFileUrl = (filename: string): string => {
  // Remove any .pdf.pdf duplications that might occur
  const cleanFilename = filename.endsWith('.pdf.pdf') 
    ? filename.substring(0, filename.length - 4) 
    : filename;
    
  // Check if the filename already includes the path
  if (cleanFilename.includes('/')) {
    return cleanFilename;
  }
  
  // Return the URL to the file in the public folder
  return `/Source Data/${encodeURIComponent(cleanFilename)}`;
};

// Helper function to normalize filenames
export const normalizeFilename = (filename: string): string => {
  console.log(`Normalizing filename: ${filename}`);
  
  // Remove any .pdf.pdf duplications
  let normalizedName = filename.endsWith('.pdf.pdf') 
    ? filename.substring(0, filename.length - 4) 
    : filename;
  
  // Special case mappings for specific files - using exact filenames as they appear in the directory
  const specialMappings: Record<string, string> = {
    'AQL_CLOSURE_AQL_EN.pdf': 'AQL_CLOSURE_AQL_EN.json',
    'ARTWORKS_ 2227825001.pdf': 'ARTWORKS_ 2227825001.json',
    'ARTWORKS_ 2227825002 1.pdf': 'ARTWORKS_ 2227825002.json',
    'ARTWORKS_ 2227825003.pdf': 'ARTWORKS_ 2227825003.json',
    'DRAWING_ 2227825XXXMATERIAL.pdf': 'DRAWING_ 2227825XXXMATERIAL.json',
    'DRAWING_ 2227825XXX_MATERIAL ALTERNATIVO.pdf': 'DRAWING_ 2227825XXX_MATERIAL ALTERNATIVO.json',
    'Jax Component spec.pdf': 'Jax Component spec.json',
    'Jax Pkg Std example.pdf': 'Jax Pkg Std example.json',
    'QRO Component specification.pdf': 'QRO Component specification.json',
    'QRO RPPS (Finish good specification).pdf': 'QRO RPPS (Finish good specification).json',
    'Superlustrous Lipstick RPPS example with mark ups.pdf': 'Superlustrous Lipstick RPPS example with mark ups.json'
  };
  
  // Check if we have a direct mapping for this file
  if (specialMappings[normalizedName]) {
    console.log(`Using special mapping for ${normalizedName}: ${specialMappings[normalizedName]}`);
    return specialMappings[normalizedName];
  }
  
  // General normalization if no special mapping exists
  
  // Ensure it ends with .json
  normalizedName = normalizedName.replace('.pdf', '.json');
  
  // Handle the special case for files with ' 1' in their name
  if (normalizedName.includes(' 1.json')) {
    normalizedName = normalizedName.replace(' 1.json', '.json');
  }
  
  // Replace spaces with underscores for better URL handling
  normalizedName = normalizedName.replace(/\s+/g, '_');
  
  // Remove any special characters that might cause issues
  normalizedName = normalizedName.replace(/[()]/g, '');
  
  console.log(`Normalized filename result: ${normalizedName}`);
  return normalizedName;
};

// Function to get the content of a JSON file
export const getJSONFileContent = async (filename: string): Promise<any> => {
  try {
    // First, try the exact filename with .json extension (preserving spaces)
    const exactFilename = filename.replace('.pdf', '.json');
    const exactPath = `/Transformed Json Data/${encodeURIComponent(exactFilename)}`;
    console.log(`Attempting to fetch JSON with exact filename: ${exactPath}`);
    
    // Array of paths to try in order
    const pathsToTry = [
      // 1. Exact filename with .json extension
      exactPath,
      // 2. Normalized filename (using our mapping function)
      `/Transformed Json Data/${encodeURIComponent(normalizeFilename(filename))}`,
      // 3. Normalized filename without encoding
      `/Transformed Json Data/${normalizeFilename(filename)}`,
      // 4. Original filename with .json extension without encoding
      `/Transformed Json Data/${exactFilename}`
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each path in sequence until one works
    for (const path of pathsToTry) {
      try {
        console.log(`Attempting to fetch JSON from: ${path}`);
        const attemptResponse = await fetch(path);
        if (attemptResponse.ok) {
          response = attemptResponse;
          console.log(`Successfully fetched JSON from: ${path}`);
          break;
        } else {
          console.warn(`Failed to fetch JSON at ${path} with status ${attemptResponse.status}`);
        }
      } catch (error: any) {
        console.warn(`Fetch error for ${path}: ${error?.message || 'Unknown error'}`);
        lastError = error;
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error(`Failed to fetch JSON for ${filename} from any path`);
    }
    
    const jsonData = await response.json();
    return jsonData;
    
  } catch (error) {
    console.error(`Error fetching JSON file for ${filename}:`, error);
    // Return a fallback JSON in case of error to avoid breaking the UI
    console.info(`Using fallback data for ${filename}`);
    return getFallbackJSON(filename);
  }
};

// Function to get the raw content of a JSON file as text
export const getJSONFileRawContent = async (filename: string): Promise<string> => {
  try {
    // First, try the exact filename with .json extension (preserving spaces)
    const exactFilename = filename.replace('.pdf', '.json');
    const exactPath = `/Transformed Json Data/${encodeURIComponent(exactFilename)}`;
    console.log(`Attempting to fetch raw JSON with exact filename: ${exactPath}`);
    
    // Array of paths to try in order
    const pathsToTry = [
      // 1. Exact filename with .json extension
      exactPath,
      // 2. Normalized filename (using our mapping function)
      `/Transformed Json Data/${encodeURIComponent(normalizeFilename(filename))}`,
      // 3. Normalized filename without encoding
      `/Transformed Json Data/${normalizeFilename(filename)}`,
      // 4. Original filename with .json extension without encoding
      `/Transformed Json Data/${exactFilename}`
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each path in sequence until one works
    for (const path of pathsToTry) {
      try {
        console.log(`Attempting to fetch raw JSON from: ${path}`);
        const attemptResponse = await fetch(path);
        if (attemptResponse.ok) {
          response = attemptResponse;
          console.log(`Successfully fetched raw JSON from: ${path}`);
          break;
        } else {
          console.warn(`Failed to fetch raw JSON at ${path} with status ${attemptResponse.status}`);
        }
      } catch (error: any) {
        console.warn(`Fetch error for ${path}: ${error?.message || 'Unknown error'}`);
        lastError = error;
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error(`Failed to fetch raw JSON for ${filename} from any path`);
    }
    
    const rawText = await response.text();
    return rawText;
    
  } catch (error) {
    console.error(`Error fetching raw JSON file for ${filename}:`, error);
    // Return a fallback JSON as string in case of error
    const fallbackData = getFallbackJSON(filename);
    return JSON.stringify(fallbackData, null, 2);
  }
};

// Fallback function to use when actual JSON fetching fails
const getFallbackJSON = (filename: string): any => {
  // Get a base name without extension for easier matching
  const baseName = filename.replace('.pdf', '').replace('.json', '');
  
  // Basic fallback structure that matches expected format
  const fallbackData = {
    documentInfo: {
      title: baseName,
      author: 'Revlon Document System',
      creationDate: new Date().toISOString(),
      producer: 'Document Processing Pipeline v1.2'
    },
    extractedContent: {
      specifications: {
        dimensions: {
          height: '75 mm',
          width: '80 mm',
          depth: '25 mm'
        },
        materials: [
          'Primary: Plastic',
          'Secondary: Cardboard'
        ],
        colors: [
          '#e5422b',
          '#000000'
        ]
      },
      productDetails: {
        productName: baseName.includes('ARTWORKS') ? 
          'Cosmetic Product ' + baseName.replace('ARTWORKS_', '') : 
          'Packaging Component ' + baseName,
        productId: 'PRD-' + baseName.substring(0, 5),
        category: 'Cosmetics',
        subcategory: 'Lipstick',
        version: '1.0'
      },
      approvalRequirements: {
        requiredApprovals: 2,
        approvalRoles: ['Quality Control', 'Design Team']
      }
    }
  };
  
  // Return specialized fallback based on the filename pattern
  if (baseName.includes('Component')) {
    return {
      ...fallbackData,
      extractedContent: {
        ...fallbackData.extractedContent,
        componentDetails: {
          type: 'Component',
          compatibleWith: ['Product Line A'],
          restrictions: 'None',
          specifications: {
            weight: '35 g',
            material: 'Plastic',
            finish: 'Matte'
          }
        }
      }
    };
  }
  
  if (baseName.includes('ARTWORKS')) {
    return {
      ...fallbackData,
      extractedContent: {
        ...fallbackData.extractedContent,
        artworkDetails: {
          designer: 'Design Team',
          version: '2.1',
          approvedBy: 'Creative Director',
          colors: ['#e5422b', '#000000', '#ffffff'],
          elements: [
            'Logo',
            'Product Name',
            'Ingredients List',
            'Barcode'
          ]
        }
      }
    };
  }
  
  return fallbackData;
};
