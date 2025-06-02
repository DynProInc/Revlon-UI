import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  Box, 
  Typography, 
  Chip,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Tooltip,
  Stack,
  LinearProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
  Badge,
  Avatar,
  Fade,
  CircularProgress,
  Skeleton,
  useMediaQuery,
  Collapse,
  Alert,
  Tabs,
  Tab,
  Grid,
  Link
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CompareArrows as CompareIcon,
  Timer as TimerIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FileDownload as ExportIcon,
  PictureAsPdf as PdfIcon,
  Article as JsonIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Search from '@/components/common/Search';
import Table, { Column } from '@/components/common/Table';
import { format } from 'date-fns';
import Modal from '@/components/common/Modal';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import PDFViewer from '@/components/common/PDFViewer';
import { getDescriptiveFileName } from '@/utils/fileNameMapping';

// Import the new API services instead of mock data
import { 
  DataRecord, 
  RecordStatus, 
  ConfidenceLevel,
  getAllRecords,
  updateRecordStatus
} from '@/services/api';

// Memoized filter chip component for better performance
const FilterChip = memo(({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <Chip 
    label={label} 
    onDelete={onDelete} 
    size="small" 
    sx={{ 
      borderRadius: '4px',
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
      color: 'primary.main',
      '& .MuiChip-deleteIcon': {
        color: 'primary.main',
        '&:hover': {
          color: 'primary.dark',
        },
      },
    }} 
  />
));

FilterChip.displayName = 'FilterChip';

// Memoized action button component for better performance
const ActionButton = memo(({ icon, label, onClick, disabled = false }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: (event: React.MouseEvent<HTMLElement>) => void; 
  disabled?: boolean;
}) => {
  const button = (
    <IconButton
      onClick={onClick}
      color="primary"
      disabled={disabled}
      sx={{ 
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
        }
      }}
    >
      {icon}
    </IconButton>
  );

  // Wrap the button in a span when it's disabled to allow the Tooltip to work
  return (
    <Tooltip title={label}>
      {disabled ? <span>{button}</span> : button}
    </Tooltip>
  );
});

ActionButton.displayName = 'ActionButton';

const RecordsList: React.FC = () => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DataRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ label: string; value: string }[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const { addNotification } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Handle data refresh with visual feedback
  const handleRefreshData = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    
    try {
      // Use the new API service to fetch dynamic data
      const fetchedRecords = await getAllRecords();
      setRecords(fetchedRecords);
      setFilteredRecords(fetchedRecords);
      
      addNotification({
        type: NotificationType.SUCCESS,
        title: 'Data Refreshed',
        message: 'Records have been refreshed successfully.',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      addNotification({
        type: NotificationType.ERROR,
        title: 'Refresh Failed',
        message: 'Failed to refresh records. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [addNotification]);
  
  // Load initial data
  useEffect(() => {
    // Initialize data
    setIsLoading(true);
    
    // Use the new API service to fetch dynamic data
    getAllRecords()
      .then(fetchedRecords => {
        setRecords(fetchedRecords);
        setFilteredRecords(fetchedRecords);
      })
      .catch(error => {
        console.error('Error loading records:', error);
        addNotification({
          type: NotificationType.ERROR,
          title: 'Loading Error',
          message: 'Failed to load records. Please refresh to try again.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addNotification]);
  
  // Handle functions for PDF preview and JSON data viewing
  const [jsonViewDialogOpen, setJsonViewDialogOpen] = useState(false);
  const [selectedJsonData, setSelectedJsonData] = useState<any>(null);
  const [pdfPreviewDialogOpen, setPdfPreviewDialogOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [selectedPdfName, setSelectedPdfName] = useState<string>('');

  const handleViewJsonData = (record: DataRecord) => {
    setSelectedJsonData(record.transformedData);
    setJsonViewDialogOpen(true);
  };

  const handlePreviewPdf = (record: DataRecord) => {
    setSelectedPdfUrl(record.sourceDataFilePath);
    setSelectedPdfName(record.name);
    setPdfPreviewDialogOpen(true);
  };

  // Handle adding a filter
  const handleAddFilter = (label: string, value: string) => {
    // Remove existing filter with same label
    const updatedFilters = filters.filter(filter => filter.label !== label);
    setFilters([...updatedFilters, { label, value }]);
    setFilterAnchorEl(null);
  };

  // Handle filter menu actions
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement> | null) => {
    if (event) {
      setFilterAnchorEl(event.currentTarget);
    } else {
      // For advanced search, use the search box as anchor element
      const searchElement = document.querySelector('.search-box') as HTMLElement || document.body;
      setFilterAnchorEl(searchElement);
    }
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle removing a filter
  const handleRemoveFilter = (filter: { label: string; value: string }) => {
    setFilters(filters.filter(f => !(f.label === filter.label && f.value === filter.value)));
  };
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setFilters([]);
  };

  // Handle deleting a record
  const handleDeleteRecord = (record: DataRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  // Handle edit record
  const handleEditRecord = (record: DataRecord) => {
    router.push(`/records/edit/${record.id}`);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedRecord) {
      // In a real app, this would call an API to delete the record
      setRecords(records.filter(record => record.id !== selectedRecord.id));
      setFilteredRecords(filteredRecords.filter(record => record.id !== selectedRecord.id));
      
      addNotification({
        type: NotificationType.SUCCESS,
        title: 'Record Deleted',
        message: `Record "${selectedRecord.name}" has been deleted successfully.`,
      });
      
      setDeleteDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  // Handle viewing a record
  const handleViewRecord = (record: DataRecord) => {
    router.push(`/records/${record.id}`);
  };

  useEffect(() => {
    // Check if there's a status filter in the URL and apply it
    const { status } = router.query;
    if (status && typeof status === 'string') {
      handleAddFilter('status', status);
    }
  }, [router.query]);
  
  // Apply search and filters to records
  useEffect(() => {
    if (records.length === 0) return;
    
    let result = [...records];
    
    // Apply search query - updated for new data structure
    if (searchQuery) {
      result = result.filter(record => 
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Search in transformed data if available
        (record.transformedData && 
         JSON.stringify(record.transformedData).toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply filters
    filters.forEach(filter => {
      if (filter.label === 'status') {
        result = result.filter(record => record.status === filter.value);
      } else if (filter.label === 'confidence') {
        result = result.filter(record => record.aiConfidence.overall === filter.value);
      } else if (filter.label === 'dynproApproved') {
        result = result.filter(record => 
          (filter.value === 'true' && record.dynproApproved) || 
          (filter.value === 'false' && !record.dynproApproved)
        );
      } else if (filter.label === 'dateRange') {
        const [startDate, endDate] = filter.value.split('to').map(date => new Date(date.trim()));
        result = result.filter(record => {
          const recordDate = new Date(record.createdAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }
    });
    
    setFilteredRecords(result);
  }, [records, searchQuery, filters]);
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Table columns configuration
  const columns: Column<DataRecord>[] = [
    {
      id: 'sourceFile',
      label: 'Record Name',
      minWidth: 250,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PdfIcon color="error" fontSize="small" sx={{ mr: 1 }} />
          <Typography 
            variant="body2"
            sx={{ 
              fontWeight: 500, 
              cursor: 'pointer',
              '&:hover': { 
                color: theme.palette.primary.main,
                textDecoration: 'underline'
              }
            }}
            onClick={() => handlePreviewPdf(row)}
          >
            {getDescriptiveFileName(row.name)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => {
        if (!value) return '';
        
        type StatusConfigType = {
          [key: string]: {
            color: string;
            bgColor: string;
            icon: React.ReactNode;
            label: string;
          }
        };
        
        const statusConfig: StatusConfigType = {
          [RecordStatus.APPROVED]: {
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.1),
            icon: <CheckCircleIcon fontSize="small" />,
            label: 'Approved'
          },
          [RecordStatus.REJECTED]: {
            color: theme.palette.error.main,
            bgColor: alpha(theme.palette.error.main, 0.1),
            icon: <CancelIcon fontSize="small" />,
            label: 'Rejected'
          },
          [RecordStatus.PENDING]: {
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            icon: <TimerIcon fontSize="small" />,
            label: 'Pending'
          }
        };
        
        const config = statusConfig[value] || { 
          color: theme.palette.grey[500], 
          bgColor: alpha(theme.palette.grey[500], 0.1),
          label: value, 
          icon: null 
        };
        
        return (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: config.bgColor,
              color: config.color,
              borderRadius: '16px',
              px: 1.5,
              py: 0.5,
              minWidth: '100px',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 1px ${config.color}`,
              }
            }}
          >
            {config.icon}
            <Typography 
              variant="caption" 
              fontWeight="medium"
              sx={{ color: 'inherit' }}
            >
              {config.label}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'name',
      label: 'File Name',
      minWidth: 180,
      format: (value, row) => {
        let iconColor;
        switch (row.status) {
          case RecordStatus.PENDING:
            iconColor = theme.palette.warning.main;
            break;
          case RecordStatus.APPROVED:
            iconColor = theme.palette.success.main;
            break;
          case RecordStatus.REJECTED:
            iconColor = theme.palette.error.main;
            break;
          default:
            iconColor = theme.palette.primary.main;
        }
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
                bgcolor: alpha(iconColor, 0.1),
                color: iconColor,
              }}
            >
              <AssignmentIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography 
                variant="body2" 
                fontWeight="medium"
                sx={{ 
                  display: 'block',
                  color: theme.palette.text.primary,
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                {value}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                ID: {row.id.substring(0, 8)}...
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      id: 'transformedData',
      label: 'Transformed Data',
      minWidth: 200,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <JsonIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { 
                color: theme.palette.primary.main,
                textDecoration: 'underline'
              }
            }}
            onClick={() => handleViewJsonData(row)}
          >
            View JSON Data
          </Typography>
        </Box>
      ),
    },
    {
      id: 'aiConfidence',
      label: 'AI Confidence',
      minWidth: 150,
      format: (value) => {
        const confidence = value.overall;
        let color, bgColor, icon;
        
        switch (confidence) {
          case ConfidenceLevel.HIGH:
            color = theme.palette.success.main;
            bgColor = alpha(theme.palette.success.main, 0.1);
            icon = <CheckCircleIcon fontSize="small" />;
            break;
          case ConfidenceLevel.MEDIUM:
            color = theme.palette.warning.main;
            bgColor = alpha(theme.palette.warning.main, 0.1);
            icon = <TimerIcon fontSize="small" />;
            break;
          case ConfidenceLevel.LOW:
            color = theme.palette.error.main;
            bgColor = alpha(theme.palette.error.main, 0.1);
            icon = <CancelIcon fontSize="small" />;
            break;
          default:
            color = theme.palette.grey[500];
            bgColor = alpha(theme.palette.grey[500], 0.1);
            icon = null;
        }
        
        const label = confidence.charAt(0).toUpperCase() + confidence.slice(1);
        
        return (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: bgColor,
              color: color,
              borderRadius: '16px',
              px: 1.5,
              py: 0.5,
              minWidth: '80px',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 1px ${color}`,
              }
            }}
          >
            {icon}
            <Typography 
              variant="caption" 
              fontWeight="medium"
              sx={{ color: 'inherit' }}
            >
              {label}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'dynproApproved',
      label: 'QA Approved',
      minWidth: 150,
      format: (value) => {
        const color = value ? theme.palette.success.main : theme.palette.grey[500];
        const bgColor = value ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1);
        const icon = value ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />;
        const label = value ? 'Yes' : 'No';
        
        return (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: bgColor,
              color: color,
              borderRadius: '16px',
              px: 1.5,
              py: 0.5,
              minWidth: '70px',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 0 0 1px ${color}`,
              }
            }}
          >
            {icon}
            <Typography 
              variant="caption" 
              fontWeight="medium"
              sx={{ color: 'inherit' }}
            >
              {label}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      minWidth: 170,
      format: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
  ];
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };
  
  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };
  
  // Handle search submission
  const handleSearch = (value: string) => {
    if (value && !searchHistory.includes(value)) {
      setSearchHistory([value, ...searchHistory.slice(0, 9)]);
    }
  };
  
  // Handle clearing search history
  const handleClearSearchHistory = () => {
    setSearchHistory([]);
  };
  
  // Handle saving a search query
  const handleSaveSearch = (search: string) => {
    // In a real app, this would save to user preferences or backend
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'Search Saved',
      message: `Search "${search}" has been saved to your preferences.`,
    });
  };
  
  // Handle row selection
  const handleSelectRecords = (selectedRowIds: (string | number)[]) => {
    setSelectedRecords(selectedRowIds as string[]);
  };
  
  // Memoize the action buttons for better performance
  const filteredColumns = useMemo(() => {
    if (user?.role === UserRole.DATA_STEWARD) {
      return columns.filter(column => column.id !== 'dynproApproved');
    }
    return columns;
  }, [columns, user]);

  const renderActions = useMemo(() => (record: DataRecord) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <ActionButton
        icon={<VisibilityIcon fontSize="small" />}
        label="View Details"
        onClick={() => handleViewRecord(record)}
      />
      <ActionButton
        icon={<PdfIcon fontSize="small" />}
        label="Preview PDF"
        onClick={() => handlePreviewPdf(record)}
      />
      <ActionButton
        icon={<CompareIcon fontSize="small" />}
        label="Compare"
        onClick={() => router.push(`/comparison?record=${record.id}`)}
      />
      <ActionButton
        icon={<EditIcon fontSize="small" />}
        label="Edit"
        onClick={() => handleEditRecord(record)}
      />
      <ActionButton
        icon={<DeleteIcon fontSize="small" />}
        label="Delete"
        onClick={() => handleDeleteRecord(record)}
      />
    </Box>
  ), [router]);
  
  // We'll use the columns already defined earlier

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 3,
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Data Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and review all data records in the system
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => router.push('/records/new')}
          sx={{ 
            borderRadius: '8px',
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Create New Record
        </Button>
      </Box>
      
      <Card 
        elevation={0}
        sx={{ 
          mb: 3, 
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          overflow: 'visible'
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Search
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                onSearch={handleSearch}
                showAdvancedSearch={true}
                onAdvancedSearch={() => handleFilterMenuOpen(null)}
                searchHistory={searchHistory}
                onClearHistory={handleClearSearchHistory}
                onSaveSearch={handleSaveSearch}
                filters={filters}
                onFilterRemove={handleRemoveFilter}
                onFiltersClear={handleClearFilters}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ActionButton 
                icon={refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                label="Refresh Records"
                onClick={handleRefreshData}
                disabled={refreshing}
              />
              
              <ActionButton 
                icon={
                  <Badge badgeContent={filters.length} color="primary" invisible={filters.length === 0}>
                    <FilterListIcon />
                  </Badge>
                }
                label="Filter Records"
                onClick={handleFilterMenuOpen}
              />
              
              <ActionButton 
                icon={<ExportIcon />}
                label="Export Records"
                onClick={() => {
                  addNotification({
                    type: NotificationType.INFO,
                    title: 'Export Records',
                    message: 'Export functionality is not implemented in this demo.',
                  });
                }}
                disabled={filteredRecords.length === 0}
              />
            </Box>
          </Box>
        </Box>
      </Card>
      
      {isLoading && (
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
        </Box>
      )}
      
      <Card 
        elevation={0}
        sx={{ 
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 300px)', // Fixed container height for better control
        }}
      >
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          overflow: 'auto',
          minHeight: '500px', // Minimum height to ensure scrolling works
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Table
            columns={filteredColumns}
            data={filteredRecords}
            keyExtractor={(item) => item.id}
            onRowClick={handleViewRecord}
            showPagination={true}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            totalItems={filteredRecords.length}
            loading={isLoading}
            emptyStateMessage="No records found matching your criteria"
            sortable={true}
            selectable={true}
            selectedRows={selectedRecords}
            onSelectRows={handleSelectRecords}
            stickyHeader={true}
            maxHeight="100%" // Use 100% of the parent container
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '& .MuiTableCell-head': {
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              },
              '& .MuiTableRow-root:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              },
              '& .MuiTableRow-root.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }
              },
              '& .MuiTablePagination-root': {
                bgcolor: alpha(theme.palette.background.default, 0.5),
                position: 'sticky',
                bottom: 0,
                zIndex: 5,
              },
              '& .MuiTableContainer-root': {
                maxHeight: '100%', // Make table container take full height
                flex: '1 1 auto',
                overflowY: 'auto', // Ensure vertical scrolling
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  },
                },
              },
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: 0,
              }
            }}
          />
        </Box>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        maxWidth="sm"
      >
        <Typography variant="body1">
          Are you sure you want to delete this record? This action cannot be undone.
        </Typography>
        {selectedRecord && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Record Details:
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedRecord.name}
            </Typography>
            <Typography variant="body2">
              <strong>ID:</strong> {selectedRecord.id}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {selectedRecord.status}
            </Typography>
          </Box>
        )}
      </Modal>
      
      {/* JSON Data Viewer Modal */}
      <Modal
        title="Transformed JSON Data"
        open={jsonViewDialogOpen}
        onClose={() => setJsonViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            maxHeight: '70vh', 
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#F5F5F5'
          }}
        >
          <pre style={{ 
            margin: 0, 
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {selectedJsonData ? JSON.stringify(selectedJsonData, null, 2) : 'No data available'}
          </pre>
        </Paper>
      </Modal>
      
      {/* PDF Preview Modal */}
      <Modal
        title={`PDF Preview: ${selectedPdfName}`}
        open={pdfPreviewDialogOpen}
        onClose={() => setPdfPreviewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ height: '70vh', width: '100%' }}>
          <PDFViewer 
            url={selectedPdfUrl} 
            scale={1.0}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default RecordsList;
