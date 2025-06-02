import { v4 as uuidv4 } from 'uuid';
import { 
  DataRecord, 
  RecordStatus, 
  ConfidenceLevel, 
  Feedback, 
  ApprovalHistoryItem, 
  FeedbackCategory 
} from './types';
import { getAllPDFFiles, getJSONFileContent, getPDFFileUrl, normalizeFilename } from './fileService';

// Helper function to generate random dates
const generateRandomDate = (daysBack = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// Helper function to create a record from a PDF filename
const createRecordFromPDF = async (filename: string): Promise<DataRecord> => {
  try {
    // Get the transformed data from the corresponding JSON file
    let transformedData;
    try {
      transformedData = await getJSONFileContent(filename);
    } catch (jsonError) {
      console.warn(`Error loading JSON for ${filename}:`, jsonError);
      transformedData = null;
    }
    
    // Generate random data for the record
    const status = Math.random() > 0.7 ? 
      RecordStatus.APPROVED : 
      (Math.random() > 0.5 ? RecordStatus.REJECTED : RecordStatus.PENDING);
    
    const confidenceLevels = Object.values(ConfidenceLevel);
    const overallConfidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
    
    // Generate random confidence levels for fields
    const fields: Record<string, ConfidenceLevel> = {};
    ['title', 'author', 'date', 'content', 'summary'].forEach(field => {
      fields[field] = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
    });
    
    // Generate random dates
    const createdAt = generateRandomDate(60);
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 10).toISOString();
    
    // Generate random approval history
    const approvalHistory: ApprovalHistoryItem[] = [];
    if (status !== RecordStatus.PENDING) {
      approvalHistory.push({
        id: uuidv4(),
        timestamp: updatedAt,
        action: status === RecordStatus.APPROVED ? 'approved' : 'rejected',
        userId: `user-${Math.floor(1000 + Math.random() * 9000)}`,
        userName: `User ${Math.floor(1 + Math.random() * 5)}`,
        userRole: 'Reviewer',
        comments: status === RecordStatus.APPROVED ? 
          'Approved after review' : 
          'Rejected due to quality issues'
      });
    }
    
    // Generate random feedback
    const feedback: Feedback[] = [];
    if (Math.random() > 0.5) {
      const feedbackCategories = Object.values(FeedbackCategory);
      feedback.push({
        id: uuidv4(),
        userId: `user-${Math.floor(1000 + Math.random() * 9000)}`,
        userName: `User ${Math.floor(1 + Math.random() * 5)}`,
        timestamp: generateRandomDate(30),
        content: 'This is feedback for the document.',
        category: feedbackCategories[Math.floor(Math.random() * feedbackCategories.length)],
        resolved: Math.random() > 0.5,
        aiResponse: Math.random() > 0.7 ? 'AI response to feedback' : undefined,
      });
    }
    
    // Create the record with a deterministic ID based on the filename
    // This ensures that the same file always gets the same ID
    const fileBasedId = `rec-${filename.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
    
    return {
      id: fileBasedId,
      name: filename.replace('.pdf', ''),
      originalFilename: filename, // Store the original filename for reference
      sourceData: null, // Required field but not used in this implementation
      sourceDataFilePath: getPDFFileUrl(filename),
      transformedDataFilePath: `/Transformed Json Data/${encodeURIComponent(filename.replace('.pdf', '.json'))}`,
      transformedData: transformedData || { error: 'No data available' },
      status,
      createdAt,
      updatedAt,
      feedback,
      approvalHistory,
      dynproApproved: Math.random() > 0.5,
      aiConfidence: {
        overall: overallConfidence,
        fields
      }
    };
  } catch (error) {
    console.error(`Error creating record from PDF ${filename}:`, error);
    
    // Generate fallback data
    const statuses = Object.values(RecordStatus);
    const confidenceLevels = Object.values(ConfidenceLevel);
    const fallbackStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const fallbackConfidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
    
    // Return a basic fallback record if anything fails
    return {
      id: `rec-${uuidv4().substring(0, 8)}`,
      name: filename,
      sourceData: null, // Required field but not used in this implementation
      sourceDataFilePath: getPDFFileUrl(filename),
      transformedDataFilePath: `${filename.replace('.pdf', '.json')}`,
      transformedData: { error: 'Failed to load data', message: 'Fallback data created' },
      status: fallbackStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalHistory: [],
      dynproApproved: false,
      aiConfidence: {
        overall: fallbackConfidence,
        fields: {
          'fallback': fallbackConfidence
        }
      }
    };
  }
};

// Fallback mock data to use when file loading fails
const getFallbackMockRecords = (): DataRecord[] => {
  const mockPdfs = [
    'Sample_Document_1.pdf',
    'Sample_Document_2.pdf',
    'Sample_Document_3.pdf',
    'Sample_Document_4.pdf',
    'Sample_Document_5.pdf'
  ];
  
  const statuses = Object.values(RecordStatus);
  const confidenceLevels = Object.values(ConfidenceLevel);
  
  return mockPdfs.map((name, index) => {
    const id = `rec-${uuidv4().substring(0, 8)}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
    const createdAt = generateRandomDate(60);
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 10).toISOString();
    
    return {
      id,
      name,
      sourceData: null, // Required field but not used in this implementation
      sourceDataFilePath: `/fallback/Source Data/${name}`,
      transformedDataFilePath: `${name.replace('.pdf', '.json')}`,
      transformedData: {
        documentType: 'Invoice',
        extractedContent: {
          customerName: `Customer ${index + 1}`,
          email: `customer${index + 1}@example.com`,
          orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          orderDate: generateRandomDate(30),
          totalAmount: `$${(Math.random() * 1000).toFixed(2)}`
        }
      },
      status,
      createdAt,
      updatedAt,
      approvalHistory: [],
      dynproApproved: Math.random() > 0.5,
      aiConfidence: {
        overall: confidence,
        fields: {
          customerName: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
          email: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
          orderNumber: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
          orderDate: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
          totalAmount: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)]
        }
      }
    };
  });
};

// Function to get all records
export const getAllRecords = async (): Promise<DataRecord[]> => {
  try {
    // Get all PDF files
    const pdfFiles = await getAllPDFFiles();
    
    if (!pdfFiles || pdfFiles.length === 0) {
      console.warn('No PDF files found, using fallback mock data');
      return getFallbackMockRecords();
    }
    
    // Create records from PDF files
    const recordPromises = pdfFiles.map(filename => createRecordFromPDF(filename));
    
    const records = await Promise.all(recordPromises);
    
    if (records.length === 0) {
      console.warn('No records created from PDF files, using fallback mock data');
      return getFallbackMockRecords();
    }
    
    return records;
  } catch (error) {
    console.error('Error fetching records:', error);
    // Return fallback mock data instead of throwing an error
    console.warn('Using fallback mock data due to error');
    return getFallbackMockRecords();
  }
};

// Function to get a record by its ID
export const getRecordById = async (id: string): Promise<DataRecord | null> => {
  try {
    console.log(`Attempting to fetch record with ID: ${id}`);
    
    // Get all records
    const allRecords = await getAllRecords();
    
    // Find the record with the matching ID
    const record = allRecords.find(r => r.id === id);
    
    if (record) {
      console.log(`Found record with ID ${id}:`, record);
      
      // If we found the record, ensure we have the most up-to-date data
      try {
        // Try to get the latest transformed data
        const transformedData = await getJSONFileContent(record.originalFilename || record.name + '.pdf');
        if (transformedData) {
          record.transformedData = transformedData;
        }
      } catch (error) {
        console.warn(`Error updating transformed data for record ${id}:`, error);
        // Keep the existing transformed data if there's an error
      }
      
      return record;
    }
    
    console.warn(`Record with ID ${id} not found, will create a new one`);
    
    // If record not found, we need to create one based on the ID
    // With our new deterministic IDs, we can extract the filename from the ID
    
    // Get all available PDF files
    const pdfFiles = await getAllPDFFiles();
    if (!pdfFiles || pdfFiles.length === 0) {
      console.warn('No PDF files available');
      
      // If no real files found, use fallback as last resort
      const fallbackRecords = getFallbackMockRecords();
      if (fallbackRecords.length > 0) {
        // Return the first fallback record with modified ID to match requested ID
        const fallbackRecord = { ...fallbackRecords[0], id };
        return fallbackRecord;
      }
      
      return null;
    }
    
    // Try to find the PDF file that matches this ID
    // With our deterministic IDs, we can extract the filename
    let targetPdfFile = pdfFiles[0]; // Default to first file
    let bestMatchScore = 0;
    
    // For each PDF file, compute a match score with the ID
    for (const pdfFile of pdfFiles) {
      // Generate the ID this file would have
      const fileId = `rec-${pdfFile.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`;
      
      // If it's an exact match, use this file
      if (fileId === id) {
        console.log(`Found exact matching PDF file for ID ${id}: ${pdfFile}`);
        targetPdfFile = pdfFile;
        break;
      }
      
      // Otherwise, compute a similarity score
      let score = 0;
      const pdfBaseName = pdfFile.replace('.pdf', '').toLowerCase();
      const idLower = id.toLowerCase();
      
      // Check various forms of the filename against the ID
      if (idLower.includes(pdfBaseName)) score += 10;
      if (idLower.includes(pdfBaseName.replace(/\s+/g, ''))) score += 5;
      if (idLower.includes(pdfBaseName.replace(/[^a-z0-9]/gi, ''))) score += 3;
      
      // If this file has a better match score, use it
      if (score > bestMatchScore) {
        bestMatchScore = score;
        targetPdfFile = pdfFile;
        console.log(`Found better matching PDF file for ID ${id}: ${pdfFile} (score: ${score})`);
      }
    }
    
    // Create a record from the identified PDF file
    console.log(`Creating record from PDF file: ${targetPdfFile}`);
    const newRecord = await createRecordFromPDF(targetPdfFile);
    
    // Override the ID to match the requested ID
    // This ensures the URL remains consistent
    return { ...newRecord, id };
  } catch (error) {
    console.error(`Error fetching record with ID ${id}:`, error);
    return null;
  }
};

// Function to update a record's status
export const updateRecordStatus = async (
  recordId: string, 
  newStatus: RecordStatus, 
  comments?: string
): Promise<ApprovalHistoryItem> => {
  try {
    // In a real implementation, this would be an API call
    // For now, we'll just create a new history item
    
    const historyItem: ApprovalHistoryItem = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action: newStatus === RecordStatus.APPROVED ? 'approved' : 'rejected',
      userId: 'current-user-id',
      userName: 'Current User',
      userRole: 'Reviewer',
      comments
    };
    
    // Return the history item
    return historyItem;
  } catch (error) {
    console.error(`Error updating record status for ${recordId}:`, error);
    throw new Error('Failed to update record status');
  }
};

// Function to add feedback to a record
export const addFeedbackToRecord = async (
  recordId: string,
  content: string,
  category: FeedbackCategory,
  fieldName?: string
): Promise<Feedback> => {
  try {
    // In a real implementation, this would be an API call
    // For now, we'll just create a new feedback item
    
    const feedbackItem: Feedback = {
      id: uuidv4(),
      userId: 'current-user-id',
      userName: 'Current User',
      timestamp: new Date().toISOString(),
      content,
      category,
      fieldName,
      resolved: false
    };
    
    // Return the feedback item
    return feedbackItem;
  } catch (error) {
    console.error(`Error adding feedback to record ${recordId}:`, error);
    throw new Error('Failed to add feedback to record');
  }
};

// Function to update a record
export const updateRecord = async (record: DataRecord): Promise<DataRecord> => {
  try {
    // In a real implementation, this would be an API call
    // For now, we'll just return the updated record
    
    // Update the timestamp
    const updatedRecord = {
      ...record,
      updatedAt: new Date().toISOString()
    };
    
    return updatedRecord;
  } catch (error) {
    console.error(`Error updating record ${record.id}:`, error);
    throw new Error('Failed to update record');
  }
};
