import { v4 as uuidv4 } from 'uuid';

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

// Record Type
export interface DataRecord {
  id: string;
  name: string;
  sourceData: SourceData;
  transformedData: TransformedData;
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

// Source Data Type
export interface SourceData {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  orderDate: string;
  productDetails: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentDetails: {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
  };
  notes?: string;
  attachments?: string[];
  rawData?: string;
}

// Transformed Data Type
export interface TransformedData {
  id: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  orderDate: Date;
  products: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  maskedCardNumber?: string;
  cardExpiry?: string;
  additionalNotes?: string;
  attachmentUrls?: string[];
  orderTotal: number;
  currency: string;
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

// Feedback Category Type
export enum FeedbackCategory {
  DATA_QUALITY = 'data_quality',
  AI_IMPROVEMENT = 'ai_improvement',
  USER_INTERFACE = 'user_interface',
  GENERAL = 'general',
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

// Helper function to generate a random date within the last year
const generateRandomDate = (daysBack = 365): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// Helper function to format phone number
const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// Helper function to mask card number
const maskCardNumber = (cardNumber: string): string => {
  return 'xxxx-xxxx-xxxx-' + cardNumber.slice(-4);
};

// Generate 50 mock records with varying statuses and confidence levels
export const generateMockRecords = (count = 50): DataRecord[] => {
  const records: DataRecord[] = [];
  const statuses = Object.values(RecordStatus);
  const confidenceLevels = Object.values(ConfidenceLevel);
  
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const createdAt = generateRandomDate();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 10).toISOString();
    
    // Random status weighted toward pending
    const randomStatusIndex = Math.floor(Math.random() * (statuses.length + 2)); // Weighted to have more pending
    const status = statuses[randomStatusIndex >= statuses.length ? 0 : randomStatusIndex];
    
    // Source data
    const customerName = `Customer ${i + 1}`;
    const email = `customer${i + 1}@example.com`;
    const phone = `555${Math.floor(1000000 + Math.random() * 9000000)}`;
    const orderDate = generateRandomDate(180);
    
    // Create a source data object
    const sourceData: SourceData = {
      id: uuidv4(),
      customerName,
      email,
      phone,
      orderDate,
      productDetails: [
        {
          productId: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
          productName: `Product ${Math.floor(1 + Math.random() * 100)}`,
          quantity: Math.floor(1 + Math.random() * 5),
          price: parseFloat((10 + Math.random() * 90).toFixed(2)),
        },
      ],
      shippingAddress: {
        street: `${Math.floor(100 + Math.random() * 9900)} Main St`,
        city: `City ${Math.floor(1 + Math.random() * 100)}`,
        state: `State ${Math.floor(1 + Math.random() * 50)}`,
        zipCode: `${Math.floor(10000 + Math.random() * 90000)}`,
        country: 'USA',
      },
      paymentDetails: {
        method: Math.random() > 0.5 ? 'Credit Card' : 'PayPal',
        cardNumber: Math.random() > 0.5 ? `${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}` : undefined,
        expiryDate: Math.random() > 0.5 ? `${Math.floor(1 + Math.random() * 12)}/${Math.floor(23 + Math.random() * 7)}` : undefined,
      },
      notes: Math.random() > 0.7 ? `Note for order ${i + 1}` : undefined,
      attachments: Math.random() > 0.8 ? [`attachment${i + 1}.pdf`] : undefined,
    };
    
    // Add 1-3 more products randomly
    const additionalProductCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < additionalProductCount; j++) {
      sourceData.productDetails.push({
        productId: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
        productName: `Product ${Math.floor(1 + Math.random() * 100)}`,
        quantity: Math.floor(1 + Math.random() * 5),
        price: parseFloat((10 + Math.random() * 90).toFixed(2)),
      });
    }
    
    // Calculate total price
    const orderTotal = sourceData.productDetails.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    // Create transformed data with potential errors based on confidence
    const confidenceLevel = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
    
    // Introduce errors based on confidence level
    let transformedCustomerName = customerName;
    let transformedEmail = email;
    let transformedPhone = formatPhoneNumber(phone);
    
    // Low confidence might have errors
    if (confidenceLevel === ConfidenceLevel.LOW) {
      if (Math.random() > 0.5) {
        transformedCustomerName = customerName.split(' ').reverse().join(' ');
      }
      if (Math.random() > 0.5) {
        transformedEmail = email.replace('@example.com', '@gmail.com');
      }
      if (Math.random() > 0.5) {
        transformedPhone = transformedPhone.replace(/\d{4}$/, `${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } 
    // Medium confidence might have minor issues
    else if (confidenceLevel === ConfidenceLevel.MEDIUM) {
      if (Math.random() > 0.7) {
        transformedCustomerName = customerName.replace(/(\w+)$/, match => match.toUpperCase());
      }
      if (Math.random() > 0.7) {
        transformedPhone = transformedPhone.replace(/\d{4}$/, `${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
    
    // Create transformed data
    const transformedData: TransformedData = {
      id: uuidv4(),
      customerName: transformedCustomerName,
      customerEmail: transformedEmail,
      phoneNumber: transformedPhone,
      orderDate: new Date(orderDate),
      products: sourceData.productDetails.map(product => ({
        id: product.productId,
        name: product.productName,
        quantity: product.quantity,
        unitPrice: product.price,
        totalPrice: product.quantity * product.price,
      })),
      shippingAddress: {
        streetAddress: sourceData.shippingAddress.street,
        city: sourceData.shippingAddress.city,
        state: sourceData.shippingAddress.state,
        postalCode: sourceData.shippingAddress.zipCode,
        country: sourceData.shippingAddress.country,
      },
      paymentMethod: sourceData.paymentDetails.method,
      maskedCardNumber: sourceData.paymentDetails.cardNumber 
        ? maskCardNumber(sourceData.paymentDetails.cardNumber) 
        : undefined,
      cardExpiry: sourceData.paymentDetails.expiryDate,
      additionalNotes: sourceData.notes,
      attachmentUrls: sourceData.attachments,
      orderTotal,
      currency: 'USD',
    };
    
    // Generate field confidence levels
    const fieldConfidence: { [key: string]: ConfidenceLevel } = {
      customerName: confidenceLevel,
      customerEmail: confidenceLevel,
      phoneNumber: confidenceLevel,
      orderDate: ConfidenceLevel.HIGH, // Dates are usually well-formatted
      products: confidenceLevel,
      shippingAddress: confidenceLevel,
      paymentMethod: confidenceLevel,
    };
    
    // Randomly modify some field confidence levels
    Object.keys(fieldConfidence).forEach(field => {
      if (Math.random() > 0.7) {
        const randomLevel = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
        fieldConfidence[field] = randomLevel;
      }
    });
    
    // Generate approval history based on status
    const approvalHistory: ApprovalHistoryItem[] = [];
    
    // Always add a review entry
    approvalHistory.push({
      id: uuidv4(),
      timestamp: createdAt,
      action: 'reviewed',
      userId: uuidv4(),
      userName: 'System',
      userRole: 'AI',
      comments: 'Automated initial review',
    });
    
    // If status is approved or rejected, add corresponding entries
    if (status !== RecordStatus.PENDING) {
      approvalHistory.push({
        id: uuidv4(),
        timestamp: updatedAt,
        action: status === RecordStatus.APPROVED ? 'approved' : 'rejected',
        userId: uuidv4(),
        userName: 'John Reviewer',
        userRole: 'Data Steward',
        comments: status === RecordStatus.APPROVED
          ? 'Approved after verification'
          : 'Rejected due to inconsistencies',
      });
    }
    
    // Randomly add modification entries
    if (Math.random() > 0.7) {
      approvalHistory.push({
        id: uuidv4(),
        timestamp: new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 5).toISOString(),
        action: 'modified',
        userId: uuidv4(),
        userName: 'Emily Editor',
        userRole: 'Data Steward',
        comments: 'Fixed data inconsistencies',
        changes: [
          {
            fieldName: 'customerName',
            oldValue: sourceData.customerName,
            newValue: transformedData.customerName,
          },
        ],
      });
    }
    
    // Randomly determine if Dynpro has approved
    const dynproApproved = status === RecordStatus.APPROVED || (status === RecordStatus.PENDING && Math.random() > 0.3);
    
    // Generate random feedback
    const feedbackCount = Math.floor(Math.random() * 3);
    const feedback: Feedback[] = [];
    
    for (let j = 0; j < feedbackCount; j++) {
      feedback.push({
        id: uuidv4(),
        userId: uuidv4(),
        userName: `Feedback User ${j + 1}`,
        timestamp: new Date(new Date(createdAt).getTime() + Math.random() * 86400000 * 15).toISOString(),
        content: `Feedback comment ${j + 1} for record ${i + 1}`,
        category: Object.values(FeedbackCategory)[Math.floor(Math.random() * Object.values(FeedbackCategory).length)],
        fieldName: Math.random() > 0.5 ? Object.keys(fieldConfidence)[Math.floor(Math.random() * Object.keys(fieldConfidence).length)] : undefined,
        resolved: Math.random() > 0.5,
        aiResponse: Math.random() > 0.7 ? 'AI response to feedback' : undefined,
      });
    }
    
    // Create the record
    const record: DataRecord = {
      id,
      name: `Record ${i + 1}`,
      sourceData,
      transformedData,
      status,
      createdAt,
      updatedAt,
      feedback: feedback.length > 0 ? feedback : undefined,
      approvalHistory,
      dynproApproved,
      aiConfidence: {
        overall: confidenceLevel,
        fields: fieldConfidence,
      },
    };
    
    records.push(record);
  }
  
  return records;
};

// Generate mock records
export const mockRecords = generateMockRecords(50);
