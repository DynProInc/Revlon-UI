import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  IconButton,
  Badge,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Sort as SortIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { DataRecord, RecordStatus } from '@/services/api/types';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import { getDescriptiveFileName } from '@/utils/fileNameMapping';
import ApprovalActions from '@/components/modules/ReviewApproval/components/ApprovalActions';
import Search from '@/components/common/Search';
import { getApprovalQueue, getApprovalQueueItemByRecordId, approveRecord, rejectRecord, forwardRecord, ApprovalQueueItem } from '@/services/api/approvalService';
import { getRecordById } from '@/services/api/recordsService';

// Note: We're now using the ApprovalQueueItem interface from the approval service

const ApprovalWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [filteredApprovalQueue, setFilteredApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApprovalQueueItem | null>(null);
  const [recordDetails, setRecordDetails] = useState<DataRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ label: string; value: string }[]>([]);
  
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search
  const handleSearch = (value: string) => {
    // Add to search history if not already there
    if (value && !searchHistory.includes(value)) {
      setSearchHistory(prev => [value, ...prev.slice(0, 9)]); // Keep only the last 10 searches
    }
  };

  // Handle clear search history
  const handleClearSearchHistory = () => {
    setSearchHistory([]);
  };

  // Handle save search
  const handleSaveSearch = (search: string) => {
    if (!searchHistory.includes(search)) {
      setSearchHistory(prev => [search, ...prev.slice(0, 9)]);
    }
  };

  // Handle filter removal
  const handleRemoveFilter = (filterToRemove: { label: string; value: string }) => {
    setFilters(filters.filter(filter => 
      !(filter.label === filterToRemove.label && filter.value === filterToRemove.value)
    ));
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setFilters([]);
  };

  useEffect(() => {
    const loadApprovalQueue = async () => {
      setIsLoading(true);
      
      try {
        // Get real approval queue data from the service
        const queue = await getApprovalQueue();
        setApprovalQueue(queue);
        setFilteredApprovalQueue(queue);
      } catch (error) {
        console.error('Error loading approval queue:', error);
        addNotification({
          type: NotificationType.ERROR,
          message: 'Failed to load approval queue data'
        });
        setApprovalQueue([]);
        setFilteredApprovalQueue([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApprovalQueue();
  }, [addNotification]);

  // Apply search and filters to approval queue
  useEffect(() => {
    if (approvalQueue.length === 0) return;
    
    let result = [...approvalQueue];
    
    // Apply search query
    if (searchQuery) {
      result = result.filter(item => 
        item.recordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    filters.forEach(filter => {
      if (filter.label === 'priority') {
        result = result.filter(item => item.priority === filter.value);
      } else if (filter.label === 'status') {
        result = result.filter(item => item.status === filter.value);
      }
    });
    
    setFilteredApprovalQueue(result);
  }, [approvalQueue, searchQuery, filters]);
  
  useEffect(() => {
    const loadRecordDetails = async () => {
      if (selectedRecord) {
        try {
          // Get the full record details using the record ID
          const record = await getRecordById(selectedRecord.recordId);
          if (record) {
            setRecordDetails(record);
          } else {
            setRecordDetails(null);
            addNotification({
              type: NotificationType.WARNING,
              message: 'Record details not found'
            });
          }
        } catch (error) {
          console.error('Error loading record details:', error);
          setRecordDetails(null);
          addNotification({
            type: NotificationType.ERROR,
            message: 'Failed to load record details'
          });
        }
      } else {
        setRecordDetails(null);
      }
    };
    
    loadRecordDetails();
  }, [selectedRecord, addNotification]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Get priority color
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Get confidence color
  const getConfidenceColor = (confidence: string | undefined): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!confidence) return 'default';
    
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Handle record selection
  const handleRecordSelect = (record: ApprovalQueueItem) => {
    setSelectedRecord(record);
  };
  
  // Handle view record details
  const handleViewRecord = (recordId: string) => {
    router.push(`/records/${recordId}`);
  };
  
  // Handle approval action
  const handleApprovalAction = async (action: any) => {
    if (!selectedRecord || !recordDetails) return;
    
    setActionLoading(true);
    
    try {
      let success = false;
      
      // Use the appropriate service method based on the action
      if (action.status === 'approved') {
        success = await approveRecord(selectedRecord.recordId, action.comment || '');
      } else if (action.status === 'rejected') {
        success = await rejectRecord(selectedRecord.recordId, action.comment || '');
      } else if (action.status === 'forwarded') {
        const toLevel = selectedRecord.level === 1 ? 2 : 1; // Toggle between levels
        success = await forwardRecord(selectedRecord.recordId, toLevel, action.comment || '');
      }
      
      if (success) {
        // Update approval queue by removing the processed record
        const updatedQueue = approvalQueue.filter(item => item.recordId !== selectedRecord.recordId);
        setApprovalQueue(updatedQueue);
        
        // Show success notification
        const actionText = action.status === 'approved' ? 'approved' : 
                          action.status === 'rejected' ? 'rejected' : 'forwarded';
        
        addNotification({
          type: action.status === 'approved' ? NotificationType.SUCCESS : 
                action.status === 'rejected' ? NotificationType.ERROR : NotificationType.INFO,
          title: `Record ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
          message: `Record "${selectedRecord.recordName}" has been ${actionText} successfully.`
        });
        
        setSelectedRecord(null);
      } else {
        // Show error notification
        addNotification({
          type: NotificationType.ERROR,
          message: `Failed to process the record. Please try again.`
        });
      }
    } catch (error) {
      console.error('Error processing approval action:', error);
      addNotification({
        type: NotificationType.ERROR,
        message: `An error occurred while processing the record.`
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle sort menu
  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Approval Workflow
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="My Queue" />
          <Tab label="Team Queue" />
          <Tab label="All Records" />
        </Tabs>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Left side - Approval Queue */}
        <Grid item xs={12} md={selectedRecord ? 6 : 12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {activeTab === 0 ? 'My Approval Queue' : 
                 activeTab === 1 ? 'Team Approval Queue' : 'All Records'}
              </Typography>
              
              <Box>
                <Tooltip title="Filter">
                  <IconButton onClick={handleFilterClick}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                >
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemText primary="All Priorities" />
                  </MenuItem>
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemIcon>
                      <Chip 
                        label="High" 
                        size="small" 
                        color="error" 
                        sx={{ minWidth: 70 }} 
                      />
                    </ListItemIcon>
                    <ListItemText primary="High Priority" />
                  </MenuItem>
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemIcon>
                      <Chip 
                        label="Medium" 
                        size="small" 
                        color="warning" 
                        sx={{ minWidth: 70 }} 
                      />
                    </ListItemIcon>
                    <ListItemText primary="Medium Priority" />
                  </MenuItem>
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemIcon>
                      <Chip 
                        label="Low" 
                        size="small" 
                        color="success" 
                        sx={{ minWidth: 70 }} 
                      />
                    </ListItemIcon>
                    <ListItemText primary="Low Priority" />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemText primary="Level 1 Approval" />
                  </MenuItem>
                  <MenuItem onClick={handleFilterClose}>
                    <ListItemText primary="Level 2 Approval" />
                  </MenuItem>
                </Menu>
                
                <Tooltip title="Sort">
                  <IconButton onClick={handleSortClick}>
                    <SortIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={handleSortClose}
                >
                  <MenuItem onClick={handleSortClose}>
                    <ListItemText primary="Newest First" />
                  </MenuItem>
                  <MenuItem onClick={handleSortClose}>
                    <ListItemText primary="Oldest First" />
                  </MenuItem>
                  <MenuItem onClick={handleSortClose}>
                    <ListItemText primary="Due Date (Ascending)" />
                  </MenuItem>
                  <MenuItem onClick={handleSortClose}>
                    <ListItemText primary="Due Date (Descending)" />
                  </MenuItem>
                  <MenuItem onClick={handleSortClose}>
                    <ListItemText primary="Priority (High to Low)" />
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            {/* Search Box */}
            <Box sx={{ mb: 2 }}>
              <Search
                value={searchQuery}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                searchHistory={searchHistory}
                onClearHistory={handleClearSearchHistory}
                onSaveSearch={handleSaveSearch}
                filters={filters}
                onFilterRemove={handleRemoveFilter}
                onFiltersClear={handleClearFilters}
              />
            </Box>
            
            {isLoading ? (
              <Box sx={{ py: 4 }}>
                <LinearProgress />
              </Box>
            ) : filteredApprovalQueue.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ScheduleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No items in queue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no items waiting for your approval
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Record Name</TableCell>
                      <TableCell>Submitted By</TableCell>
                      <TableCell>Submitted Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApprovalQueue.map((item) => (
                      <TableRow 
                        key={item.recordId}
                        hover
                        onClick={() => handleRecordSelect(item)}
                        selected={selectedRecord?.recordId === item.recordId}
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: selectedRecord?.recordId === item.recordId ? 
                            alpha(theme.palette.primary.main, 0.08) : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AssignmentIcon 
                              sx={{ mr: 1, color: 'primary.main' }} 
                              fontSize="small" 
                            />
                            {getDescriptiveFileName(item.recordName) || 'Unnamed Record'}
                          </Box>
                        </TableCell>
                        <TableCell>{item.submittedBy || 'Unknown'}</TableCell>
                        <TableCell>{item.submittedAt ? formatDate(item.submittedAt) : 'N/A'}</TableCell>
                        <TableCell>{item.dueDate ? formatDate(item.dueDate) : 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.priority ? (item.priority.charAt(0).toUpperCase() + item.priority.slice(1)) : 'Unknown'} 
                            size="small" 
                            color={item.priority ? getPriorityColor(item.priority) : 'default'}
                            sx={{ minWidth: 70 }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Record">
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRecord(item.recordId);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Right side - Selected Record Details */}
        {selectedRecord && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              {recordDetails ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {getDescriptiveFileName(recordDetails?.name || '') || 'Unnamed Record'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={`Level ${selectedRecord?.level || 'N/A'} Approval`}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={selectedRecord?.priority ? (selectedRecord.priority.charAt(0).toUpperCase() + selectedRecord.priority.slice(1)) : 'Unknown'} 
                          size="small" 
                          color={selectedRecord?.priority ? getPriorityColor(selectedRecord.priority) : 'default'}
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewRecord(selectedRecord.recordId)}
                    >
                      View Full Record
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted By
                      </Typography>
                      <Typography variant="body1">
                        {selectedRecord?.submittedBy || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Submitted Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedRecord?.submittedAt ? formatDate(selectedRecord.submittedAt) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedRecord?.dueDate ? formatDate(selectedRecord.dueDate) : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        AI Confidence
                      </Typography>
                      <Chip 
                        label={recordDetails?.aiConfidence?.overall || 'Unknown'}
                        size="small"
                        color={getConfidenceColor(recordDetails?.aiConfidence?.overall)}
                      />
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Record Summary
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Customer Name
                      </Typography>
                      <Typography variant="body1">
                        {recordDetails?.sourceData?.customerName || recordDetails?.sourceData?.customer?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {recordDetails?.sourceData?.email || recordDetails?.sourceData?.customer?.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {recordDetails?.sourceData?.phone || recordDetails?.sourceData?.customer?.phone || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Order Date
                      </Typography>
                      <Typography variant="body1">
                        {recordDetails?.sourceData?.orderDate ? formatDate(recordDetails.sourceData.orderDate) : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Approval Actions
                  </Typography>
                  
                  <ApprovalActions
                    recordId={recordDetails?.id || ''}
                    currentStatus={selectedRecord?.status || 'pending'}
                    currentLevel={selectedRecord?.level || 1}
                    canApprove={true}
                    canReject={true}
                    canForward={true}
                    forwardableUsers={[
                      { id: 'user-1001', name: 'John Smith', role: 'Data Analyst' },
                      { id: 'user-1002', name: 'Emily Johnson', role: 'Quality Reviewer' },
                      { id: 'user-1003', name: 'Michael Chen', role: 'Senior Reviewer' },
                      { id: 'user-1004', name: 'Sarah Williams', role: 'Data Manager' },
                      { id: 'user-1005', name: 'Robert Davis', role: 'Department Head' }
                    ]}
                    onAction={handleApprovalAction}
                    isProcessing={actionLoading}
                  />
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ApprovalWorkflow;
