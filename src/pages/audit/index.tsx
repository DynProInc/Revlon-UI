import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  Collapse,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Sort as SortIcon,
  GetApp as DownloadIcon,
  Archive as ArchiveIcon,
  Timeline as TimelineIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { mockRecords, DataRecord, RecordStatus, ApprovalHistoryItem } from '@/mock-data/records';
import { mockUsers } from '@/mock-data/users';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/context/AuthContext';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'approved' | 'rejected' | 'modified' | 'reviewed' | 'created' | 'exported' | 'viewed';
  recordId: string;
  recordName: string;
  details: string;
  category: 'approval' | 'data' | 'system' | 'export';
}

// Generate mock audit events from approval history
const generateAuditEvents = (): AuditEvent[] => {
  const auditEvents: AuditEvent[] = [];
  
  // Add events from approval history
  mockRecords.forEach(record => {
    // Add creation event
    auditEvents.push({
      id: `create-${record.id}`,
      timestamp: record.createdAt,
      userId: mockUsers[0].id,
      userName: mockUsers[0].name,
      userRole: mockUsers[0].role,
      action: 'created',
      recordId: record.id,
      recordName: record.name,
      details: `Record created with source data from customer ${record.sourceData.customerName}`,
      category: 'data'
    });
    
    // Add approval history events
    record.approvalHistory.forEach(history => {
      auditEvents.push({
        id: history.id,
        timestamp: history.timestamp,
        userId: history.userId,
        userName: history.userName,
        userRole: history.userRole,
        action: history.action as any,
        recordId: record.id,
        recordName: record.name,
        details: history.comments || `Record ${history.action}`,
        category: 'approval'
      });
    });
    
    // Add some view events
    if (Math.random() > 0.7) {
      const viewUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const viewDate = new Date(record.updatedAt);
      viewDate.setHours(viewDate.getHours() + Math.floor(Math.random() * 24));
      
      auditEvents.push({
        id: `view-${record.id}-${viewDate.getTime()}`,
        timestamp: viewDate.toISOString(),
        userId: viewUser.id,
        userName: viewUser.name,
        userRole: viewUser.role,
        action: 'viewed',
        recordId: record.id,
        recordName: record.name,
        details: `Record viewed by ${viewUser.name}`,
        category: 'data'
      });
    }
    
    // Add export events for some records
    if (Math.random() > 0.8 && record.status === RecordStatus.APPROVED) {
      const exportUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const exportDate = new Date(record.updatedAt);
      exportDate.setHours(exportDate.getHours() + Math.floor(Math.random() * 48));
      
      auditEvents.push({
        id: `export-${record.id}-${exportDate.getTime()}`,
        timestamp: exportDate.toISOString(),
        userId: exportUser.id,
        userName: exportUser.name,
        userRole: exportUser.role,
        action: 'exported',
        recordId: record.id,
        recordName: record.name,
        details: `Record exported to JSON format by ${exportUser.name}`,
        category: 'export'
      });
    }
  });
  
  // Sort by timestamp (most recent first)
  auditEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return auditEvents;
};

const AuditTrail: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [expandedRows, setExpandedRows] = useState<{[key: string]: boolean}>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const router = useRouter();
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  
  useEffect(() => {
    const loadAuditData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const events = generateAuditEvents();
      setAuditEvents(events);
      setFilteredEvents(events);
      
      setIsLoading(false);
    };
    
    loadAuditData();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    if (auditEvents.length === 0) return;
    
    let filtered = [...auditEvents];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.recordName.toLowerCase().includes(query) ||
        event.userName.toLowerCase().includes(query) ||
        event.details.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Apply action filter
    if (selectedAction) {
      filtered = filtered.filter(event => event.action === selectedAction);
    }
    
    // Apply user filter
    if (selectedUser) {
      filtered = filtered.filter(event => event.userId === selectedUser);
    }
    
    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.timestamp) >= startDate);
    }
    
    if (endDate) {
      // Add one day to end date to include the end date fully
      const endDateCopy = new Date(endDate);
      endDateCopy.setDate(endDateCopy.getDate() + 1);
      filtered = filtered.filter(event => new Date(event.timestamp) <= endDateCopy);
    }
    
    setFilteredEvents(filtered);
  }, [auditEvents, searchQuery, selectedCategory, selectedAction, selectedUser, startDate, endDate]);
  
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
    return format(new Date(dateString), 'HH:mm:ss');
  };
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle row expansion
  const handleExpandRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle filter selection
  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    handleFilterClose();
  };
  
  const handleActionFilter = (action: string | null) => {
    setSelectedAction(action);
    handleFilterClose();
  };
  
  const handleUserFilter = (userId: string | null) => {
    setSelectedUser(userId);
    handleFilterClose();
  };
  
  // Handle date range change
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedAction(null);
    setSelectedUser(null);
    setStartDate(null);
    setEndDate(null);
  };
  
  // Get chip color based on action
  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'modified':
        return 'warning';
      case 'created':
        return 'info';
      case 'exported':
        return 'secondary';
      case 'viewed':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval':
        return <AssignmentTurnedInIcon fontSize="small" />;
      case 'data':
        return <EditIcon fontSize="small" />;
      case 'system':
        return <HistoryIcon fontSize="small" />;
      case 'export':
        return <DownloadIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };
  
  // Calculate active filters count
  const activeFiltersCount = [
    selectedCategory, 
    selectedAction, 
    selectedUser,
    startDate,
    endDate
  ].filter(Boolean).length;
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Audit Trail
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Activities" />
          <Tab label="Approval Activities" />
          <Tab label="Data Changes" />
          <Tab label="Export Activities" />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by record, user, or details..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Tooltip title="Filter">
                <Badge color="primary" badgeContent={activeFiltersCount > 0 ? activeFiltersCount : undefined}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleFilterClick}
                    size="medium"
                  >
                    Filters
                  </Button>
                </Badge>
              </Tooltip>
              
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2">Filter by Category</Typography>
                </MenuItem>
                <MenuItem onClick={() => handleCategoryFilter(null)} selected={selectedCategory === null}>
                  <ListItemText primary="All Categories" />
                </MenuItem>
                <MenuItem onClick={() => handleCategoryFilter('approval')} selected={selectedCategory === 'approval'}>
                  <ListItemIcon>
                    <AssignmentTurnedInIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Approval" />
                </MenuItem>
                <MenuItem onClick={() => handleCategoryFilter('data')} selected={selectedCategory === 'data'}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Data" />
                </MenuItem>
                <MenuItem onClick={() => handleCategoryFilter('export')} selected={selectedCategory === 'export'}>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Export" />
                </MenuItem>
                
                <Divider />
                
                <MenuItem disabled>
                  <Typography variant="subtitle2">Filter by Action</Typography>
                </MenuItem>
                <MenuItem onClick={() => handleActionFilter(null)} selected={selectedAction === null}>
                  <ListItemText primary="All Actions" />
                </MenuItem>
                <MenuItem onClick={() => handleActionFilter('approved')} selected={selectedAction === 'approved'}>
                  <ListItemIcon>
                    <Chip 
                      label="Approved" 
                      size="small" 
                      color="success" 
                      sx={{ minWidth: 80 }} 
                    />
                  </ListItemIcon>
                </MenuItem>
                <MenuItem onClick={() => handleActionFilter('rejected')} selected={selectedAction === 'rejected'}>
                  <ListItemIcon>
                    <Chip 
                      label="Rejected" 
                      size="small" 
                      color="error" 
                      sx={{ minWidth: 80 }} 
                    />
                  </ListItemIcon>
                </MenuItem>
                <MenuItem onClick={() => handleActionFilter('modified')} selected={selectedAction === 'modified'}>
                  <ListItemIcon>
                    <Chip 
                      label="Modified" 
                      size="small" 
                      color="warning" 
                      sx={{ minWidth: 80 }} 
                    />
                  </ListItemIcon>
                </MenuItem>
                <MenuItem onClick={() => handleActionFilter('created')} selected={selectedAction === 'created'}>
                  <ListItemIcon>
                    <Chip 
                      label="Created" 
                      size="small" 
                      color="info" 
                      sx={{ minWidth: 80 }} 
                    />
                  </ListItemIcon>
                </MenuItem>
                
                <Divider />
                
                <MenuItem disabled>
                  <Typography variant="subtitle2">Filter by User</Typography>
                </MenuItem>
                <MenuItem onClick={() => handleUserFilter(null)} selected={selectedUser === null}>
                  <ListItemText primary="All Users" />
                </MenuItem>
                {mockUsers.map(user => (
                  <MenuItem 
                    key={user.id} 
                    onClick={() => handleUserFilter(user.id)}
                    selected={selectedUser === user.id}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={user.name} />
                  </MenuItem>
                ))}
                
                <Divider />
                
                <MenuItem onClick={handleClearFilters}>
                  <ListItemIcon>
                    <CancelIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Clear All Filters" />
                </MenuItem>
              </Menu>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="medium"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <LinearProgress />
          </Box>
        ) : filteredEvents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No audit events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Date/Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Record</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <TableRow 
                      hover
                      sx={{ 
                        '& > *': { borderBottom: expandedRows[event.id] ? 'none' : 'inherit' },
                        cursor: 'pointer'
                      }}
                      onClick={() => handleExpandRow(event.id)}
                    >
                      <TableCell padding="checkbox">
                        <IconButton size="small">
                          {expandedRows[event.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">{formatDate(event.timestamp)}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatTime(event.timestamp)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.8 }} fontSize="small" />
                          <Typography variant="body2">{event.userName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.action.charAt(0).toUpperCase() + event.action.slice(1)} 
                          size="small" 
                          color={getActionColor(event.action) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Record">
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              '&:hover': { textDecoration: 'underline', cursor: 'pointer' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/records/${event.recordId}`);
                            }}
                          >
                            <VisibilityIcon sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                            <Typography variant="body2">{event.recordName}</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {event.details}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getCategoryIcon(event.category)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ py: 0 }} colSpan={7}>
                        <Collapse in={expandedRows[event.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Event Details
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Event ID
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.id}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Timestamp
                                        </Typography>
                                        <Typography variant="body2">
                                          {format(new Date(event.timestamp), 'PPpp')}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Full Details
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.details}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                      User Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          User Name
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.userName}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          User Role
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.userRole}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          User ID
                                        </Typography>
                                        <Typography variant="body2">
                                          {event.userId}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => router.push(`/records/${event.recordId}`)}
                              >
                                View Record
                              </Button>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AuditTrail;
