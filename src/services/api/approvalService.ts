import { DataRecord, RecordStatus, ApprovalHistoryItem } from './types';
import { getAllRecords, getRecordById } from './recordsService';
import { v4 as uuidv4 } from 'uuid';
import { getDescriptiveFileName } from '@/utils/fileNameMapping';

// Approval Queue Item interface
export interface ApprovalQueueItem {
  recordId: string;
  recordName: string;
  originalFilename: string;
  submittedBy: string;
  submittedAt: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  level: 1 | 2;
  status: 'pending' | 'approved' | 'rejected' | 'forwarded';
  sourceDataFilePath?: string;
  transformedDataFilePath?: string;
  aiConfidence?: any;
}

// Mock users for approval workflow
const approvalUsers = [
  { id: 'user-1001', name: 'John Smith', role: 'Data Analyst' },
  { id: 'user-1002', name: 'Emily Johnson', role: 'Quality Reviewer' },
  { id: 'user-1003', name: 'Michael Chen', role: 'Senior Reviewer' },
  { id: 'user-1004', name: 'Sarah Williams', role: 'Data Manager' },
  { id: 'user-1005', name: 'Robert Davis', role: 'Department Head' }
];

// Helper function to get a random user
const getRandomUser = () => {
  return approvalUsers[Math.floor(Math.random() * approvalUsers.length)];
};

// Helper function to calculate a due date (3-7 days from submission)
const calculateDueDate = (submittedDate: string): string => {
  const date = new Date(submittedDate);
  date.setDate(date.getDate() + (Math.floor(Math.random() * 5) + 3)); // 3-7 days
  return date.toISOString();
};

// Helper function to determine priority based on content
const determinePriority = (record: DataRecord): 'high' | 'medium' | 'low' => {
  // Assign priority based on some criteria from the record
  // For example, if it contains certain keywords or has high confidence
  if (record.name.includes('RPPS') || record.name.includes('Component spec')) {
    return 'high';
  } else if (record.name.includes('DRAWING') || record.name.includes('MATERIAL')) {
    return 'medium';
  }
  return 'low';
};

// Function to get all approval queue items
export const getApprovalQueue = async (): Promise<ApprovalQueueItem[]> => {
  try {
    // Get all records
    const allRecords = await getAllRecords();
    
    // Filter records that are in PENDING status
    const pendingRecords = allRecords.filter(record => record.status === RecordStatus.PENDING);
    
    // Convert records to approval queue items
    return pendingRecords.map(record => {
      const submittedUser = getRandomUser();
      const priority = determinePriority(record);
      
      // Use descriptive file names for record names
      return {
        recordId: record.id,
        recordName: record.name, // Keep original name for internal use
        originalFilename: record.originalFilename || record.name,
        submittedBy: submittedUser.name,
        submittedAt: record.createdAt,
        dueDate: calculateDueDate(record.createdAt),
        priority,
        level: priority === 'high' ? 1 : 2, // Higher priority items go to level 1
        status: 'pending',
        sourceDataFilePath: record.sourceDataFilePath,
        transformedDataFilePath: record.transformedDataFilePath,
        aiConfidence: record.aiConfidence
      };
    });
  } catch (error) {
    console.error('Error fetching approval queue:', error);
    return [];
  }
};

// Function to get a specific approval queue item by record ID
export const getApprovalQueueItemByRecordId = async (recordId: string): Promise<ApprovalQueueItem | null> => {
  try {
    // Get the record
    const record = await getRecordById(recordId);
    
    if (!record) {
      return null;
    }
    
    // Convert to approval queue item
    const submittedUser = getRandomUser();
    const priority = determinePriority(record);
    
    // Use descriptive file names for record names
    return {
      recordId: record.id,
      recordName: record.name, // Keep original name for internal use
      originalFilename: record.originalFilename || record.name,
      submittedBy: submittedUser.name,
      submittedAt: record.createdAt,
      dueDate: calculateDueDate(record.createdAt),
      priority,
      level: priority === 'high' ? 1 : 2,
      status: record.status === RecordStatus.PENDING ? 'pending' : 
              record.status === RecordStatus.APPROVED ? 'approved' : 'rejected',
      sourceDataFilePath: record.sourceDataFilePath,
      transformedDataFilePath: record.transformedDataFilePath,
      aiConfidence: record.aiConfidence
    };
  } catch (error) {
    console.error(`Error fetching approval queue item for record ${recordId}:`, error);
    return null;
  }
};

// Function to approve a record
export const approveRecord = async (recordId: string, comment: string = ''): Promise<boolean> => {
  try {
    // In a real application, this would update the database
    // For now, we'll just log the action
    console.log(`Approved record ${recordId} with comment: ${comment}`);
    return true;
  } catch (error) {
    console.error(`Error approving record ${recordId}:`, error);
    return false;
  }
};

// Function to reject a record
export const rejectRecord = async (recordId: string, comment: string = ''): Promise<boolean> => {
  try {
    // In a real application, this would update the database
    // For now, we'll just log the action
    console.log(`Rejected record ${recordId} with comment: ${comment}`);
    return true;
  } catch (error) {
    console.error(`Error rejecting record ${recordId}:`, error);
    return false;
  }
};

// Function to forward a record to another level
export const forwardRecord = async (recordId: string, toLevel: number, comment: string = ''): Promise<boolean> => {
  try {
    // In a real application, this would update the database
    // For now, we'll just log the action
    console.log(`Forwarded record ${recordId} to level ${toLevel} with comment: ${comment}`);
    return true;
  } catch (error) {
    console.error(`Error forwarding record ${recordId}:`, error);
    return false;
  }
};
