// Mapping of filenames to their descriptive names
export const fileNameMapping: Record<string, string> = {
  'AQL_CLOSURE_AQL_EN.pdf': 'Technical Specification',
  'ARTWORKS_ 2227825001.pdf': 'Material Safety Datasheet (Pink)',
  'ARTWORKS_ 2227825002 1.pdf': 'Material Safety Datasheet (Lavend)',
  'ARTWORKS_ 2227825003.pdf': 'Material Safety Datasheet (Orange)',
  'DRAWING_ 2227825XXXMATERIAL.pdf': 'Rigid Packaging & Housewares',
  'DRAWING_ 2227825XXX_MATERIAL ALTERNATIVO.pdf': 'Braskem',
  'Jax Component spec.pdf': 'Packaging Component Specification',
  'Jax Pkg Std example.pdf': 'Packing Standards',
  'QRO Component specification.pdf': 'Component Specification',
  'QRO RPPS (Finish good specification).pdf': 'Components',
  'Superlustrous Lipstick RPPS example with mark ups.pdf': 'Assembly RPPS Report'
};

// Function to get descriptive name from filename
export const getDescriptiveFileName = (filename: string): string => {
  // Remove .pdf extension if present for lookup
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  
  // Return the descriptive name if found, otherwise return the original filename
  return fileNameMapping[cleanFilename] || filename;
};
