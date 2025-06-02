// Record Status Types
export enum RecordStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Confidence Level Types
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Feedback Category Type
export enum FeedbackCategory {
  DATA_QUALITY = 'data_quality',
  AI_IMPROVEMENT = 'ai_improvement',
  USER_INTERFACE = 'user_interface',
  GENERAL = 'general',
}

// Record Type for dynamic data handling
export interface DataRecord {
  sourceData: any;
  id: string;
  name: string;
  originalFilename?: string; // Original PDF filename for reference
  sourceDataFilePath: string;
  transformedDataFilePath: string;
  transformedData: any;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  feedback?: Feedback[];
  approvalHistory: ApprovalHistoryItem[];
  dynproApproved: boolean;
  aiConfidence: {
    overall: ConfidenceLevel;
    fields: {
      [key: string]: ConfidenceLevel;
    };
  };
}

// Feedback Type
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  content: string;
  category: FeedbackCategory;
  fieldName?: string;
  resolved: boolean;
  aiResponse?: string;
}

// Approval History Item Type
export interface ApprovalHistoryItem {
  id: string;
  timestamp: string;
  action: 'approved' | 'rejected' | 'modified' | 'reviewed';
  userId: string;
  userName: string;
  userRole: string;
  comments?: string;
  changes?: {
    fieldName: string;
    oldValue: any;
    newValue: any;
  }[];
}

// AI Performance Metrics Type
export interface AIPerformanceMetrics {
  recordId: string;
  accuracy: number; // Percentage
  processingTime: number; // milliseconds
  confidenceScores: {
    [key: string]: number; // Field name: confidence score (0-1)
  };
  errorRate: number; // Percentage
  improvementRate?: number; // Percentage improvement from previous version
  modelVersion: string;
  timestamp: string;
}
