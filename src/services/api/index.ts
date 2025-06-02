// Export all types
export * from './types';

// Export all services
export * from './fileService';
export * from './recordsService';

// Export a default API object with all services
export default {
  // File services
  getAllPDFFiles: () => import('./fileService').then(module => module.getAllPDFFiles()),
  getPDFFileUrl: (filename: string) => import('./fileService').then(module => module.getPDFFileUrl(filename)),
  getJSONFileContent: (filename: string) => import('./fileService').then(module => module.getJSONFileContent(filename)),
  
  // Record services
  getAllRecords: () => import('./recordsService').then(module => module.getAllRecords()),
  getRecordById: (id: string) => import('./recordsService').then(module => module.getRecordById(id)),
  updateRecord: (record: import('./types').DataRecord) => import('./recordsService').then(module => module.updateRecord(record)),
  addFeedbackToRecord: (recordId: string, content: string, category: any, fieldName?: string) => 
    import('./recordsService').then(module => module.addFeedbackToRecord(recordId, content, category, fieldName)),
  updateRecordStatus: (recordId: string, status: any, comments?: string) => 
    import('./recordsService').then(module => module.updateRecordStatus(recordId, status, comments)),
};
