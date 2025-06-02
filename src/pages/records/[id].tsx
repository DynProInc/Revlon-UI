import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Divider, 
  Button, 
  Tabs, 
  Tab, 
  TextField,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  Tooltip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  alpha,
  useTheme,
  Container,
  Stack,
  useMediaQuery,
  MenuItem
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Send as SendIcon,
  CompareArrows as CompareArrowsIcon,
  FormatListBulleted as ListIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Comment as CommentIcon,
  DataObject as DataObjectIcon,
  PictureAsPdf as PdfIcon,
  Sync as SyncIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  VerticalSplit as SplitViewIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { RecordStatus, ConfidenceLevel, FeedbackCategory, getRecordById, updateRecordStatus, addFeedbackToRecord } from '@/services/api';
import { getJSONFileRawContent, getPDFFileUrl } from '@/services/api/fileService';
import type { DataRecord, ApprovalHistoryItem, Feedback } from '@/services/api/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import PDFViewer from '@/components/common/PDFViewer';
import { v4 as uuidv4 } from 'uuid';

// Define the enum values for tab navigation
enum TabValue {
  DETAILS = 'details',
  COMPARE = 'compare',
  HISTORY = 'history',
  FEEDBACK = 'feedback'
}

// Define the enum values for view modes in the comparison tab
enum ViewMode {
  SPLIT = 'split',
  SOURCE = 'source',
  TRANSFORMED = 'transformed'
}

/**
 * RecordDetail Component - Shows a detailed view of a record with side-by-side comparison
 * of source PDF and transformed JSON data.
 */
const RecordDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Record data state
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.COMPARE);
  
  // Comparison view states
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SPLIT);
  const [pdfScale, setPdfScale] = useState<number>(1.0);
  const [jsonRawContent, setJsonRawContent] = useState<string>('');
  const [jsonLoadingError, setJsonLoadingError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState<boolean>(true);
  const [jsonViewerOpen, setJsonViewerOpen] = useState<boolean>(true);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState<boolean>(false);
  
  // Form states
  const [approvalNote, setApprovalNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>(FeedbackCategory.DATA_QUALITY);
  const [feedbackField, setFeedbackField] = useState<string>('');
  const [useForTraining, setUseForTraining] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load record data when component mounts or ID changes
  useEffect(() => {
    const fetchRecordData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        setJsonLoadingError(null);
        
        console.log(`Fetching record with ID: ${id}`);
        const recordData = await getRecordById(id as string);
        
        if (recordData) {
          console.log('Record data fetched successfully:', recordData);
          console.log('Source data file path:', recordData.sourceDataFilePath);
          console.log('Transformed data file path:', recordData.transformedDataFilePath);
          setRecord(recordData);
          
          // Fetch the raw JSON content for the comparison view
          try {
            // Use the original filename if available, otherwise extract from path
            const filename = recordData.originalFilename || 
                          (recordData.sourceDataFilePath ? recordData.sourceDataFilePath.split('/').pop() : null) || 
                          recordData.name + '.pdf';
            
            console.log(`Using filename for JSON content: ${filename}`);
            
            // Always use the getJSONFileRawContent service which has improved fetching logic
            // This will try multiple paths including the exact filename with spaces preserved
            console.log(`Using getJSONFileRawContent with filename: ${filename}`);
            try {
              const rawJson = await getJSONFileRawContent(filename);
              console.log(`Successfully fetched JSON content for: ${filename}`);
              setJsonRawContent(rawJson);
            } catch (jsonError) {
              console.error('Error fetching JSON content:', jsonError);
              // If we have transformedData in the record object, use that as fallback
              if (recordData.transformedData && typeof recordData.transformedData === 'object') {
                console.log('Using transformedData from record as fallback');
                const formattedJson = JSON.stringify(recordData.transformedData, null, 2);
                setJsonRawContent(formattedJson);
              } else {
                setJsonLoadingError('Failed to load JSON content for comparison view. Using fallback data.');
                // Create a basic fallback JSON
                const fallbackJson = JSON.stringify({
                  error: 'JSON content could not be loaded',
                  message: 'Using fallback data',
                  recordId: recordData.id,
                  recordName: recordData.name
                }, null, 2);
                setJsonRawContent(fallbackJson);
              }
            }
          } catch (jsonErr) {
            console.error('Error fetching JSON content:', jsonErr);
            setJsonLoadingError('Failed to load JSON content for comparison view. Using fallback data.');
          }
        } else {
          console.error('Record not found');
          setError('Record not found. Please check the URL and try again.');
          // Redirect back to records list after showing the error
          setTimeout(() => router.push('/records'), 3000);
        }
      } catch (err) {
        console.error('Error fetching record:', err);
        setError('Failed to load record. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecordData();
  }, [id, router]);

  // Handler for tab navigation
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  }, []);

  // Handlers for view mode in comparison tab
  const handleViewModeChange = useCallback((_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode | null) => {
    if (newViewMode) {
      setViewMode(newViewMode);
    }
  }, []);

  // Handlers for PDF scaling
  const handleZoomIn = useCallback(() => {
    setPdfScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  // Toggle fullscreen mode
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle PDF viewer
  const handleTogglePdfViewer = useCallback(() => {
    setPdfViewerOpen(prev => !prev);
    if (!jsonViewerOpen) {
      setJsonViewerOpen(true);
    }
  }, [jsonViewerOpen]);

  // Toggle JSON viewer
  const handleToggleJsonViewer = useCallback(() => {
    setJsonViewerOpen(prev => !prev);
    if (!pdfViewerOpen) {
      setPdfViewerOpen(true);
    }
  }, [pdfViewerOpen]);

  // Helper function to format dates
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Helper function to get status color
  const getStatusColor = useCallback((status: RecordStatus) => {
    switch (status) {
      case RecordStatus.APPROVED:
        return 'success';
      case RecordStatus.REJECTED:
        return 'error';
      case RecordStatus.PENDING:
      default:
        return 'warning';
    }
  }, []);

  // Helper function to get confidence color
  const getConfidenceColor = useCallback((level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH:
        return 'success';
      case ConfidenceLevel.MEDIUM:
        return 'warning';
      case ConfidenceLevel.LOW:
        return 'error';
      default:
        return 'info';
    }
  }, []);

  // Helper function to render confidence indicator
  const renderConfidenceIndicator = useCallback((level: ConfidenceLevel) => {
    let color: 'success' | 'warning' | 'error' | 'info' = 'info';
    let percentage = 50;

    switch (level) {
      case ConfidenceLevel.HIGH:
        color = 'success';
        percentage = 90;
        break;
      case ConfidenceLevel.MEDIUM:
        color = 'warning';
        percentage = 60;
        break;
      case ConfidenceLevel.LOW:
        color = 'error';
        percentage = 30;
        break;
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color={`${color}.main`}>
          {level}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
          sx={{ width: 80, height: 8, borderRadius: 4 }}
        />
      </Box>
    );
  }, []);

  // Record approval/rejection handlers
  const handleApproveRecord = useCallback(async () => {
    if (!record || !user) return;
    
    try {
      setIsSubmitting(true);
      
      const result = await updateRecordStatus(record.id, RecordStatus.APPROVED, approvalNote);
      
      if (result) {
        // Update the record with the new status and history
        setRecord(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: RecordStatus.APPROVED,
            approvalHistory: [...(prev.approvalHistory || []), result]
          };
        });
        
        setApproveDialogOpen(false);
        setApprovalNote('');
        
        addNotification({
          type: NotificationType.SUCCESS,
          title: 'Record Approved',
          message: 'The record has been successfully approved.',
        });
      }
    } catch (error) {
      console.error('Error approving record:', error);
      
      addNotification({
        type: NotificationType.ERROR,
        title: 'Approval Error',
        message: 'Failed to approve the record. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [record, user, approvalNote, addNotification]);
  
  const handleRejectRecord = useCallback(async () => {
    if (!record || !user) return;
    
    try {
      setIsSubmitting(true);
      
      const result = await updateRecordStatus(record.id, RecordStatus.REJECTED, rejectionReason);
      
      if (result) {
        // Update the record with the new status and history
        setRecord(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: RecordStatus.REJECTED,
            approvalHistory: [...(prev.approvalHistory || []), result]
          };
        });
        
        setRejectDialogOpen(false);
        setRejectionReason('');
        
        addNotification({
          type: NotificationType.SUCCESS,
          title: 'Record Rejected',
          message: 'The record has been rejected.',
        });
      }
    } catch (error) {
      console.error('Error rejecting record:', error);
      
      addNotification({
        type: NotificationType.ERROR,
        title: 'Rejection Error',
        message: 'Failed to reject the record. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [record, user, rejectionReason, addNotification]);
  
  const handleSubmitFeedback = useCallback(async () => {
    if (!record || !user || !feedbackText) return;
    
    try {
      setIsSubmitting(true);
      
      const feedback = {
        userId: user.id,
        userName: user.name,
        content: feedbackText,
        category: feedbackCategory,
        fieldName: feedbackField || undefined,
        // useForTraining is not part of the Feedback interface, so we don't include it
      };
      
      const result = await addFeedbackToRecord(record.id, feedbackText, feedbackCategory, feedbackField);
      
      if (result) {
        // Update the record with the new feedback
        setRecord(prev => {
          if (!prev) return null;
          return {
            ...prev,
            feedback: [...(prev.feedback || []), result]
          };
        });
        
        setFeedbackDialogOpen(false);
        setFeedbackText('');
        setFeedbackField('');
        
        addNotification({
          type: NotificationType.SUCCESS,
          title: 'Feedback Submitted',
          message: 'Your feedback has been submitted successfully.',
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      addNotification({
        type: NotificationType.ERROR,
        title: 'Feedback Error',
        message: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [record, user, feedbackText, feedbackCategory, feedbackField, addNotification]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading record details...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/records')}
        >
          Back to Records
        </Button>
      </Box>
    );
  }

  // Render no record state
  if (!record) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No record found with the specified ID.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/records')}
        >
          Back to Records
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Record Details | {record.name || 'Document Processing'}</title>
      </Head>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header with back button, title, and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/records')}
            sx={{ borderRadius: 2 }}
          >
            Back to Records
          </Button>
          
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Record Details
          </Typography>
          
          <Box>
            {record.status === RecordStatus.PENDING && (
              <>
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircleIcon />} 
                  onClick={() => setApproveDialogOpen(true)}
                  sx={{ mr: 1, borderRadius: 2 }}
                >
                  Approve
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<CancelIcon />} 
                  onClick={() => setRejectDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button 
              variant="outlined" 
              startIcon={<CommentIcon />} 
              onClick={() => setFeedbackDialogOpen(true)}
              sx={{ ml: 1, borderRadius: 2 }}
            >
              Add Feedback
            </Button>
          </Box>
        </Box>
        
        {/* Record summary card */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PdfIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {record.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ID: {record.id}
                </Typography>
                <Typography variant="body2">
                  Created: {formatDate(record.createdAt)}
                </Typography>
                {record.updatedAt && (
                  <Typography variant="body2">
                    Last Updated: {formatDate(record.updatedAt)}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                <Chip 
                  label={record.status} 
                  color={getStatusColor(record.status) as 'success' | 'warning' | 'error' | 'default'}
                  sx={{ fontWeight: 'bold', px: 1 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Confidence Level:
                  </Typography>
                  {renderConfidenceIndicator(record.aiConfidence.overall)}
                </Box>
                <Typography variant="body2">
                  Fields Extracted: {record.transformedData ? Object.keys(record.transformedData).length : 0}
                </Typography>
                {record.approvalHistory && record.approvalHistory.length > 0 && (
                  <Typography variant="body2">
                    Last Action by: {record.approvalHistory[record.approvalHistory.length - 1].userName}
                  </Typography>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs for different views */}
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab 
              label="Details" 
              value={TabValue.DETAILS} 
              icon={<AssignmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Compare" 
              value={TabValue.COMPARE} 
              icon={<CompareArrowsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="History" 
              value={TabValue.HISTORY} 
              icon={<HistoryIcon />} 
              iconPosition="start"
              disabled={!record.approvalHistory || record.approvalHistory.length === 0}
            />
            <Tab 
              label="Feedback" 
              value={TabValue.FEEDBACK} 
              icon={<CommentIcon />} 
              iconPosition="start"
              disabled={!record.feedback || record.feedback.length === 0}
            />
          </Tabs>
        </Box>
        
        {/* Details tab content */}
        {activeTab === TabValue.DETAILS && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Record Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              {/* Source Data */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <PdfIcon sx={{ mr: 1 }} /> Source Document
                    </Typography>
                    
                    <Box sx={{ height: 400, overflow: 'hidden' }}>
                      <PDFViewer 
                        url={getPDFFileUrl(record.name + '.pdf')} 
                        scale={1.0}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<VisibilityIcon />}
                        fullWidth
                        onClick={() => {
                          setActiveTab(TabValue.COMPARE);
                          setViewMode(ViewMode.SOURCE);
                        }}
                      >
                        View Full Document
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Transformed Data */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <DataObjectIcon sx={{ mr: 1 }} /> Extracted Data
                    </Typography>
                    
                    <Box sx={{ height: 400, overflow: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 1 }}>
                      {record.transformedData ? (
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {JSON.stringify(record.transformedData, null, 2)}
                        </pre>
                      ) : (
                        <Typography color="text.secondary">
                          No transformed data available
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<DataObjectIcon />}
                        fullWidth
                        onClick={() => {
                          setActiveTab(TabValue.COMPARE);
                          setViewMode(ViewMode.TRANSFORMED);
                        }}
                      >
                        View Full Data
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Additional Metadata */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Additional Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Source File Path
                        </Typography>
                        <Typography variant="body1">
                          {record.sourceDataFilePath || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Transformed File Path
                        </Typography>
                        <Typography variant="body1">
                          {record.transformedDataFilePath || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Processing Time
                        </Typography>
                        <Typography variant="body1">
                          Processing Time: N/A
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* Compare tab content */}
        {activeTab === TabValue.COMPARE && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Side-by-Side Comparison
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  <ToggleButton value={ViewMode.SPLIT}>
                    <Tooltip title="Split View">
                      <SplitViewIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={ViewMode.SOURCE}>
                    <Tooltip title="Source Only">
                      <PdfIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value={ViewMode.TRANSFORMED}>
                    <Tooltip title="Transformed Only">
                      <DataObjectIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <Tooltip title="Toggle Fullscreen">
                  <IconButton onClick={handleToggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
              display: 'flex', 
              height: isFullscreen ? 'calc(100vh - 200px)' : 600,
              ...(isFullscreen && {
                position: 'fixed',
                top: 100,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                p: 3,
                bgcolor: 'background.paper',
              })
            }}>
              {/* Source PDF Viewer */}
              {(viewMode === ViewMode.SPLIT || viewMode === ViewMode.SOURCE) && (
                <Box sx={{ 
                  flex: viewMode === ViewMode.SPLIT ? 1 : 'auto',
                  width: viewMode === ViewMode.SOURCE ? '100%' : 'auto',
                  mr: viewMode === ViewMode.SPLIT ? 2 : 0,
                  display: pdfViewerOpen ? 'block' : 'none'
                }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      p: 1, 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <PdfIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} /> Source Document
                      </Typography>
                      
                      <Box>
                        <Tooltip title="Zoom Out">
                          <IconButton size="small" onClick={handleZoomOut} disabled={pdfScale <= 0.5}>
                            <ZoomOutIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Zoom In">
                          <IconButton size="small" onClick={handleZoomIn} disabled={pdfScale >= 3.0}>
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {viewMode === ViewMode.SPLIT && (
                          <Tooltip title="Hide PDF">
                            <IconButton size="small" onClick={handleTogglePdfViewer}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      <PDFViewer 
                        url={getPDFFileUrl(record.name + '.pdf')} 
                        scale={pdfScale}
                        onScaleChange={setPdfScale}
                        isFullscreen={isFullscreen}
                        onFullscreenToggle={handleToggleFullscreen}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}
              
              {/* Transformed JSON Viewer */}
              {(viewMode === ViewMode.SPLIT || viewMode === ViewMode.TRANSFORMED) && (
                <Box sx={{                  flex: viewMode === ViewMode.SPLIT ? 1 : 'auto',
                    width: viewMode === ViewMode.TRANSFORMED ? '100%' : 'auto',
                    display: jsonViewerOpen ? 'block' : 'none'
                  }}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ 
                        p: 1, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <DataObjectIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} /> Transformed Data
                        </Typography>
                        
                        {viewMode === ViewMode.SPLIT && (
                          <Tooltip title="Hide JSON">
                            <IconButton size="small" onClick={handleToggleJsonViewer}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        p: 2,
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.875rem',
                        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                      }}>
                        {jsonLoadingError && (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            {jsonLoadingError}
                          </Alert>
                        )}
                        
                        {jsonRawContent ? (
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {jsonRawContent}
                          </pre>
                        ) : (
                          <Typography color="text.secondary">
                            No JSON content available
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Paper>
          )}
          
          {/* History tab content */}
          {activeTab === TabValue.HISTORY && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Approval History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {record.approvalHistory && record.approvalHistory.length > 0 ? (
                <Stack spacing={2}>
                  {record.approvalHistory.map((historyItem, index) => (
                    <Paper 
                      key={historyItem.id || index} 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        borderLeft: 4,
                        borderColor: historyItem.action === 'approved' ? 'success.main' : 'error.main'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                            {historyItem.action === 'approved' ? (
                              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                            ) : (
                              <CancelIcon sx={{ mr: 1, color: 'error.main' }} />
                            )}
                            {historyItem.action}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            By {historyItem.userName} on {formatDate(historyItem.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {historyItem.comments && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Comments:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {historyItem.comments}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No approval history available
                </Typography>
              )}
            </Paper>
          )}
          
          {/* Feedback tab content */}
          {activeTab === TabValue.FEEDBACK && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {record.feedback && record.feedback.length > 0 ? (
                <Stack spacing={2}>
                  {record.feedback.map((feedbackItem, index) => (
                    <Paper 
                      key={feedbackItem.id || index} 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        borderLeft: 4,
                        borderColor: 'primary.main'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {feedbackItem.category}
                            {feedbackItem.fieldName && ` - ${feedbackItem.fieldName}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            By {feedbackItem.userName} on {formatDate(feedbackItem.timestamp)}
                          </Typography>
                        </Box>
                        <Chip 
                          label={feedbackItem.resolved ? 'Resolved' : 'Open'} 
                          color={feedbackItem.resolved ? 'success' : 'default'} 
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {feedbackItem.content}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No feedback available
                </Typography>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<CommentIcon />} 
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  Add New Feedback
                </Button>
              </Box>
            </Paper>
          )}
        </Container>
        
        {/* Approve Dialog */}
        <Dialog
          open={approveDialogOpen}
          onClose={() => setApproveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Approve Record
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to approve this record? This action will mark the record as approved.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Comments (Optional)"
              fullWidth
              multiline
              rows={3}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleApproveRecord} 
              color="success" 
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Reject Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Reject Record
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to reject this record? Please provide a reason for rejection.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for Rejection"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              variant="outlined"
              required
              error={rejectDialogOpen && rejectionReason.trim() === ''}
              helperText={rejectDialogOpen && rejectionReason.trim() === '' ? 'Reason is required' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleRejectRecord} 
              color="error" 
              variant="contained"
              disabled={isSubmitting || rejectionReason.trim() === ''}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <CancelIcon />}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Feedback Dialog */}
        <Dialog
          open={feedbackDialogOpen}
          onClose={() => setFeedbackDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Add Feedback
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please provide your feedback about this record. This will help improve the system.
            </DialogContentText>
            
            <TextField
              select
              margin="dense"
              label="Feedback Category"
              fullWidth
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value as FeedbackCategory)}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {Object.values(FeedbackCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              margin="dense"
              label="Field Name (Optional)"
              fullWidth
              value={feedbackField}
              onChange={(e) => setFeedbackField(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              autoFocus
              margin="dense"
              label="Feedback"
              fullWidth
              multiline
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              variant="outlined"
              required
              error={feedbackDialogOpen && feedbackText.trim() === ''}
              helperText={feedbackDialogOpen && feedbackText.trim() === '' ? 'Feedback is required' : ''}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={useForTraining}
                  onChange={(e) => setUseForTraining(e.target.checked)}
                  color="primary"
                />
              }
              label="Use this feedback for training the system"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback} 
              color="primary" 
              variant="contained"
              disabled={isSubmitting || feedbackText.trim() === ''}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  
  export default RecordDetail;