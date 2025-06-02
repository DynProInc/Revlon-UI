import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  IconButton,
  Avatar,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Rating,
  Tab,
  Tabs,
  Badge,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LiveHelp as LiveHelpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { mockRecords, DataRecord, FeedbackCategory } from '@/mock-data/records';
import { mockUsers } from '@/mock-data/users';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  timestamp: string;
  content: string;
  recordId?: string;
  recordName?: string;
  category: FeedbackCategory;
  rating: number;
  status: 'pending' | 'in_progress' | 'resolved';
  aiResponse?: string;
  responseTimestamp?: string;
  useForTraining: boolean;
  fieldName?: string;
}

// Generate mock feedback items
const generateFeedbackItems = (): FeedbackItem[] => {
  const feedbackItems: FeedbackItem[] = [];
  
  // Add feedback from records
  mockRecords.forEach(record => {
    if (record.feedback && record.feedback.length > 0) {
      record.feedback.forEach(feedback => {
        const user = mockUsers.find(u => u.id === feedback.userId) || mockUsers[0];
        
        feedbackItems.push({
          id: feedback.id,
          userId: feedback.userId,
          userName: user.name,
          userRole: user.role,
          userAvatar: user.avatar,
          timestamp: feedback.timestamp,
          content: feedback.content,
          recordId: record.id,
          recordName: record.name,
          category: feedback.category,
          rating: 3 + Math.floor(Math.random() * 3),
          status: feedback.resolved ? 'resolved' : Math.random() > 0.7 ? 'in_progress' : 'pending',
          aiResponse: feedback.aiResponse,
          responseTimestamp: feedback.resolved ? new Date(new Date(feedback.timestamp).getTime() + 86400000 * Math.random() * 2).toISOString() : undefined,
          useForTraining: true,
          fieldName: feedback.fieldName
        });
      });
    }
  });
  
  // Add some general feedback not related to specific records
  const generalFeedbackTopics = [
    'AI model seems to struggle with unusual product names',
    'The confidence scores are very helpful for identifying problematic transformations',
    'Would like to see better suggestions for address field corrections',
    'Customer name parsing has improved significantly in the last update',
    'Sometimes quantity fields are incorrectly extracted',
    'UI could use a more intuitive way to show field-level confidence scores'
  ];
  
  generalFeedbackTopics.forEach((topic, index) => {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const categories = Object.values(FeedbackCategory);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    feedbackItems.push({
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      timestamp: date.toISOString(),
      content: topic,
      category: randomCategory,
      rating: 2 + Math.floor(Math.random() * 4),
      status: Math.random() > 0.6 ? 'resolved' : Math.random() > 0.5 ? 'in_progress' : 'pending',
      aiResponse: Math.random() > 0.4 ? 'Thank you for your feedback. We\'ve noted this issue and will address it in our next model update.' : undefined,
      responseTimestamp: Math.random() > 0.4 ? new Date(date.getTime() + 86400000 * Math.random() * 3).toISOString() : undefined,
      useForTraining: true
    });
  });
  
  // Sort by timestamp (most recent first)
  feedbackItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return feedbackItems;
};

const FeedbackPage: React.FC = () => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedbackItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [newFeedback, setNewFeedback] = useState('');
  const [newFeedbackCategory, setNewFeedbackCategory] = useState<FeedbackCategory>(FeedbackCategory.AI_IMPROVEMENT);
  const [useForTraining, setUseForTraining] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState(0);
  
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  useEffect(() => {
    const loadFeedbackData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const items = generateFeedbackItems();
      setFeedbackItems(items);
      setFilteredItems(items);
      
      setIsLoading(false);
    };
    
    loadFeedbackData();
  }, []);
  
  useEffect(() => {
    if (feedbackItems.length === 0) return;
    
    // Filter items based on active tab
    let filtered = [...feedbackItems];
    
    if (activeTab === 1) {
      filtered = filtered.filter(item => item.status === 'pending');
    } else if (activeTab === 2) {
      filtered = filtered.filter(item => item.status === 'in_progress');
    } else if (activeTab === 3) {
      filtered = filtered.filter(item => item.status === 'resolved');
    }
    
    setFilteredItems(filtered);
  }, [feedbackItems, activeTab]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  // Handle new feedback submission
  const handleFeedbackSubmit = async () => {
    if (!newFeedback.trim() || !user) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new feedback item
    const newItem: FeedbackItem = {
      id: uuidv4(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      timestamp: new Date().toISOString(),
      content: newFeedback,
      category: newFeedbackCategory,
      rating: feedbackRating,
      status: 'pending',
      useForTraining: useForTraining
    };
    
    // Add to feedback items
    const updatedItems = [newItem, ...feedbackItems];
    setFeedbackItems(updatedItems);
    
    // Reset form
    setNewFeedback('');
    setNewFeedbackCategory(FeedbackCategory.AI_IMPROVEMENT);
    setUseForTraining(true);
    setFeedbackRating(4);
    
    // Show notification
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'Feedback Submitted',
      message: 'Your feedback has been submitted successfully.'
    });
    
    setIsSubmitting(false);
  };
  
  // Handle item expansion
  const handleExpandItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle item selection
  const handleSelectItem = (item: FeedbackItem) => {
    setSelectedItem(item);
  };
  
  // Get category icon
  const getCategoryIcon = (category: FeedbackCategory) => {
    switch (category) {
      case FeedbackCategory.DATA_QUALITY:
        return <AssignmentIcon />;
      case FeedbackCategory.AI_IMPROVEMENT:
        return <PsychologyIcon />;
      case FeedbackCategory.USER_INTERFACE:
        return <LightbulbIcon />;
      case FeedbackCategory.GENERAL:
        return <CommentIcon />;
      default:
        return <FeedbackIcon />;
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: FeedbackCategory) => {
    switch (category) {
      case FeedbackCategory.DATA_QUALITY:
        return 'Data Quality';
      case FeedbackCategory.AI_IMPROVEMENT:
        return 'AI Improvement';
      case FeedbackCategory.USER_INTERFACE:
        return 'User Interface';
      case FeedbackCategory.GENERAL:
        return 'General';
      default:
        return 'Unknown';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon fontSize="small" />;
      case 'in_progress':
        return <AnalyticsIcon fontSize="small" />;
      case 'pending':
        return <HourglassEmptyIcon fontSize="small" />;
      default:
        return <FeedbackIcon fontSize="small" />;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        AI Feedback
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left side - Feedback List */}
        <Grid item xs={12} md={selectedItem ? 6 : 12}>
          <Paper sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submit New Feedback
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Your Feedback"
                  placeholder="Share your feedback about the AI system, data quality, or interface..."
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newFeedbackCategory}
                    onChange={(e) => setNewFeedbackCategory(e.target.value as FeedbackCategory)}
                    label="Category"
                  >
                    <MenuItem value={FeedbackCategory.DATA_QUALITY}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1 }} fontSize="small" />
                        Data Quality
                      </Box>
                    </MenuItem>
                    <MenuItem value={FeedbackCategory.AI_IMPROVEMENT}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PsychologyIcon sx={{ mr: 1 }} fontSize="small" />
                        AI Improvement
                      </Box>
                    </MenuItem>
                    <MenuItem value={FeedbackCategory.USER_INTERFACE}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightbulbIcon sx={{ mr: 1 }} fontSize="small" />
                        User Interface
                      </Box>
                    </MenuItem>
                    <MenuItem value={FeedbackCategory.GENERAL}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CommentIcon sx={{ mr: 1 }} fontSize="small" />
                        General
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    AI Quality Rating
                  </Typography>
                  <Rating
                    value={feedbackRating}
                    onChange={(event, newValue) => {
                      setFeedbackRating(newValue || 0);
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useForTraining}
                      onChange={(e) => setUseForTraining(e.target.checked)}
                    />
                  }
                  label="Use this feedback for AI model improvement"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleFeedbackSubmit}
                    disabled={!newFeedback.trim() || isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit Feedback'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="All Feedback" />
              <Tab
                label={
                  <Badge
                    color="error"
                    badgeContent={feedbackItems.filter(item => item.status === 'pending').length}
                    max={99}
                  >
                    Pending
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    color="warning"
                    badgeContent={feedbackItems.filter(item => item.status === 'in_progress').length}
                    max={99}
                  >
                    In Progress
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge
                    color="success"
                    badgeContent={feedbackItems.filter(item => item.status === 'resolved').length}
                    max={99}
                  >
                    Resolved
                  </Badge>
                }
              />
            </Tabs>
          </Paper>
          
          {isLoading ? (
            <LinearProgress />
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <FeedbackIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No feedback found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 0
                  ? 'No feedback has been submitted yet'
                  : activeTab === 1
                  ? 'No pending feedback items'
                  : activeTab === 2
                  ? 'No feedback items in progress'
                  : 'No resolved feedback items'}
              </Typography>
            </Box>
          ) : (
            <Box>
              {filteredItems.map((item) => (
                <Paper
                  key={item.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedItem?.id === item.id ? 'primary.main' : 'divider',
                    backgroundColor: selectedItem?.id === item.id ? alpha(theme.palette.primary.main, 0.05) : 'background.paper'
                  }}
                  onClick={() => handleSelectItem(item)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={item.userAvatar}
                        alt={item.userName}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="subtitle2">{item.userName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={getCategoryLabel(item.category)}
                        icon={getCategoryIcon(item.category)}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        size="small"
                        label={item.status === 'pending' ? 'Pending' : item.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                        color={getStatusColor(item.status) as any}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={item.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        AI Rating
                      </Typography>
                    </Box>
                    
                    {item.recordId && (
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/records/${item.recordId}`);
                        }}
                      >
                        View Record
                      </Button>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Grid>
        
        {/* Right side - Selected Feedback Details */}
        {selectedItem && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h6">Feedback Details</Typography>
                <IconButton onClick={() => setSelectedItem(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={selectedItem.userAvatar}
                      alt={selectedItem.userName}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{selectedItem.userName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedItem.userRole}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCategoryIcon(selectedItem.category)}
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {getCategoryLabel(selectedItem.category)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedItem.timestamp)} at {formatTime(selectedItem.timestamp)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={selectedItem.status === 'pending' ? 'Pending' : selectedItem.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                        color={getStatusColor(selectedItem.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      AI Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={selectedItem.rating} readOnly />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({selectedItem.rating}/5)
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedItem.recordId && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Related Record
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => router.push(`/records/${selectedItem.recordId}`)}
                        sx={{ mt: 0.5 }}
                      >
                        {selectedItem.recordName || 'View Record'}
                      </Button>
                    </Box>
                  )}
                  
                  {selectedItem.fieldName && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Field Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedItem.fieldName}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Feedback Content
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
                  <Typography variant="body1">{selectedItem.content}</Typography>
                </Paper>
              </Box>
              
              {selectedItem.aiResponse && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    AI Response
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.2)
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32,
                          mr: 2,
                          mt: 0.5
                        }}
                      >
                        <PsychologyIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{selectedItem.aiResponse}</Typography>
                        {selectedItem.responseTimestamp && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Responded on {formatDate(selectedItem.responseTimestamp)} at {formatTime(selectedItem.responseTimestamp)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => router.push(`/records/${selectedItem.recordId}`)}
                  sx={{ mr: 1 }}
                  disabled={!selectedItem.recordId}
                >
                  View Record
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PsychologyIcon />}
                  disabled={selectedItem.status === 'resolved'}
                >
                  {selectedItem.status === 'pending' ? 'Process Feedback' : 
                   selectedItem.status === 'in_progress' ? 'Mark as Resolved' : 'Resolved'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FeedbackPage;
