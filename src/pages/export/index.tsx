import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { mockRecords, DataRecord, RecordStatus } from '@/mock-data/records';
import { useNotification, NotificationType } from '@/context/NotificationContext';

// Export format types
enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml'
}

// Data source types
enum DataSource {
  SOURCE = 'source',
  TRANSFORMED = 'transformed',
  BOTH = 'both'
}

// Export mode types
enum ExportMode {
  FILTERED = 'filtered',
  SELECTED = 'selected',
  SINGLE = 'single'
}

// Date range type
interface DateRange {
  start: string;
  end: string;
}

const ExportPage: React.FC = () => {
  const { addNotification } = useNotification();
  const theme = useTheme();
  
  // State for records
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // State for record selection
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [exportMode, setExportMode] = useState<ExportMode>(ExportMode.FILTERED);
  const [singleRecordId, setSingleRecordId] = useState<string>('');
  
  // State for export options
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.TRANSFORMED);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });
  
  // State for filters
  const [statusFilters, setStatusFilters] = useState<RecordStatus[]>([]);
  const [includeApproved, setIncludeApproved] = useState(true);
  const [includePending, setIncludePending] = useState(false);
  const [includeRejected, setIncludeRejected] = useState(false);
  const [includeFeedback, setIncludeFeedback] = useState(true);
  const [includeApprovalHistory, setIncludeApprovalHistory] = useState(true);
  const [includeAIMetrics, setIncludeAIMetrics] = useState(true);
  
  // State for field selection
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'customerName',
    'customerEmail',
    'phoneNumber',
    'orderDate',
    'products',
    'shippingAddress',
    'paymentMethod'
  ]);
  
  const availableFields = [
    { value: 'customerName', label: 'Customer Name' },
    { value: 'customerEmail', label: 'Email' },
    { value: 'phoneNumber', label: 'Phone Number' },
    { value: 'orderDate', label: 'Order Date' },
    { value: 'products', label: 'Products' },
    { value: 'shippingAddress', label: 'Shipping Address' },
    { value: 'paymentMethod', label: 'Payment Method' },
    { value: 'maskedCardNumber', label: 'Card Number (Masked)' },
    { value: 'cardExpiry', label: 'Card Expiry' },
    { value: 'additionalNotes', label: 'Notes' },
    { value: 'orderTotal', label: 'Order Total' },
    { value: 'currency', label: 'Currency' }
  ];
  
  // Load records on mount
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setRecords(mockRecords);
      applyFilters(mockRecords);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters when filter options change
  useEffect(() => {
    applyFilters(records);
  }, [records, statusFilters, includeApproved, includePending, includeRejected, dateRange]);
  
  // Handle status filter changes
  useEffect(() => {
    const newFilters: RecordStatus[] = [];
    
    if (includeApproved) newFilters.push(RecordStatus.APPROVED);
    if (includePending) newFilters.push(RecordStatus.PENDING);
    if (includeRejected) newFilters.push(RecordStatus.REJECTED);
    
    setStatusFilters(newFilters);
  }, [includeApproved, includePending, includeRejected]);
  
  // Apply filters to records
  const applyFilters = (records: DataRecord[]) => {
    let result = [...records];
    
    if (exportMode === ExportMode.SELECTED && selectedRecordIds.length > 0) {
      // If in selected mode, only show selected records
      result = result.filter(record => selectedRecordIds.includes(record.id));
    } else if (exportMode === ExportMode.SINGLE && singleRecordId) {
      // If in single mode, only show the specified record
      result = result.filter(record => record.id === singleRecordId);
    } else {
      // Apply status filters
      if (statusFilters.length > 0) {
        result = result.filter(record => statusFilters.includes(record.status));
      }
      
      // Apply date range filter if both dates are set
      if (dateRange.start && dateRange.end) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        result = result.filter(record => {
          const recordDate = new Date(record.createdAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }
    }
    
    setFilteredRecords(result);
  };
  
  // Handle export format change
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportFormat(event.target.value as ExportFormat);
  };
  
  // Handle data source change
  const handleDataSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataSource(event.target.value as DataSource);
  };
  
  // Handle date range changes
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle field selection changes
  const handleFieldsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedFields(typeof value === 'string' ? value.split(',') : value);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setIncludeApproved(true);
    setIncludePending(false);
    setIncludeRejected(false);
    setDateRange({ start: '', end: '' });
  };
  
  // Handle change in export mode
  const handleExportModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportMode(event.target.value as ExportMode);
  };
  
  // Handle selecting individual records
  const handleRecordSelectionChange = (recordId: string) => {
    setSelectedRecordIds(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };
  
  // Handle selecting all visible records
  const handleSelectAllRecords = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Get all record IDs from the filtered view
      const allIds = filteredRecords.map(record => record.id);
      setSelectedRecordIds(allIds);
    } else {
      setSelectedRecordIds([]);
    }
  };
  
  // Handle export
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      addNotification({
        type: NotificationType.WARNING,
        title: 'No Records to Export',
        message: 'There are no records matching your criteria to export.'
      });
      return;
    }
    
    setIsExporting(true);
    
    // Prepare export message based on mode
    let exportMessage = '';
    switch (exportMode) {
      case ExportMode.SINGLE:
        exportMessage = `Record has been exported as ${exportFormat.toUpperCase()}.`;
        break;
      case ExportMode.SELECTED:
        exportMessage = `${filteredRecords.length} selected records have been exported as ${exportFormat.toUpperCase()}.`;
        break;
      default:
        exportMessage = `${filteredRecords.length} filtered records have been exported as ${exportFormat.toUpperCase()}.`;
    }
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      addNotification({
        type: NotificationType.SUCCESS,
        title: 'Export Successful',
        message: exportMessage
      });
      
      // In a real application, this would trigger a file download
      // For example:
      // const exportData = prepareExportData(filteredRecords);
      // const blob = new Blob([exportData], { type: `application/${exportFormat}` });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `data_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
    }, 1500);
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Export Data
      </Typography>
      
      <Grid container spacing={3}>
        {/* Export Options */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Export Options
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend">Export Mode</FormLabel>
              <RadioGroup
                value={exportMode}
                onChange={handleExportModeChange}
              >
                <FormControlLabel 
                  value={ExportMode.FILTERED} 
                  control={<Radio />} 
                  label="Filtered Records" 
                />
                <FormControlLabel 
                  value={ExportMode.SELECTED} 
                  control={<Radio />} 
                  label={`Selected Records (${selectedRecordIds.length})`} 
                />
                <FormControlLabel 
                  value={ExportMode.SINGLE} 
                  control={<Radio />} 
                  label={singleRecordId ? `Single Record: ${records.find(r => r.id === singleRecordId)?.name || 'Selected'}` : 'Single Record'}
                />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend">Format</FormLabel>
              <RadioGroup
                value={exportFormat}
                onChange={handleFormatChange}
              >
                <FormControlLabel value={ExportFormat.JSON} control={<Radio />} label="JSON" />
                <FormControlLabel value={ExportFormat.CSV} control={<Radio />} label="CSV" />
                <FormControlLabel value={ExportFormat.XML} control={<Radio />} label="XML" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend">Data Source</FormLabel>
              <RadioGroup
                value={dataSource}
                onChange={handleDataSourceChange}
              >
                <FormControlLabel value={DataSource.SOURCE} control={<Radio />} label="Source Data Only" />
                <FormControlLabel value={DataSource.TRANSFORMED} control={<Radio />} label="Transformed Data Only" />
                <FormControlLabel value={DataSource.BOTH} control={<Radio />} label="Both Source and Transformed" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
              <FormLabel component="legend">Include</FormLabel>
              <FormControlLabel
                control={<Checkbox checked={includeFeedback} onChange={(e) => setIncludeFeedback(e.target.checked)} />}
                label="Feedback"
              />
              <FormControlLabel
                control={<Checkbox checked={includeApprovalHistory} onChange={(e) => setIncludeApprovalHistory(e.target.checked)} />}
                label="Approval History"
              />
              <FormControlLabel
                control={<Checkbox checked={includeAIMetrics} onChange={(e) => setIncludeAIMetrics(e.target.checked)} />}
                label="AI Confidence Metrics"
              />
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting || 
                ((exportMode === ExportMode.FILTERED && filteredRecords.length === 0) || 
                 (exportMode === ExportMode.SELECTED && selectedRecordIds.length === 0) ||
                 (exportMode === ExportMode.SINGLE && !singleRecordId))}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isExporting ? 'Exporting...' : exportMode === ExportMode.SELECTED ? `Export ${selectedRecordIds.length} Records` : exportMode === ExportMode.SINGLE ? 'Export Record' : `Export ${filteredRecords.length} Records`}
            </Button>
          </Paper>
        </Grid>
        
        {/* Filters */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {exportMode === ExportMode.SELECTED ? 'Record Selection' : exportMode === ExportMode.SINGLE ? 'Single Record' : 'Filters'}
              </Typography>
              
              <Button
                startIcon={<CloseIcon />}
                onClick={handleClearFilters}
                size="small"
                disabled={exportMode === ExportMode.SELECTED || exportMode === ExportMode.SINGLE}
              >
                Clear Filters
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Record Status</FormLabel>
                  <FormControlLabel
                    control={<Checkbox checked={includeApproved} onChange={(e) => setIncludeApproved(e.target.checked)} />}
                    label="Approved"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={includePending} onChange={(e) => setIncludePending(e.target.checked)} />}
                    label="Pending"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={includeRejected} onChange={(e) => setIncludeRejected(e.target.checked)} />}
                    label="Rejected"
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <TextField
                    label="End Date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Filters:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {statusFilters.map((status) => (
                  <Chip
                    key={status}
                    label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                    onDelete={() => {
                      if (status === RecordStatus.APPROVED) setIncludeApproved(false);
                      if (status === RecordStatus.PENDING) setIncludePending(false);
                      if (status === RecordStatus.REJECTED) setIncludeRejected(false);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                
                {dateRange.start && dateRange.end && (
                  <Chip
                    label={`Date Range: ${dateRange.start} to ${dateRange.end}`}
                    onDelete={() => setDateRange({ start: '', end: '' })}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {statusFilters.length === 0 && !dateRange.start && !dateRange.end && (
                  <Typography variant="body2" color="text.secondary">
                    No filters applied
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Field Selection
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="field-selection-label">Select Fields to Include</InputLabel>
              <Select
                labelId="field-selection-label"
                multiple
                value={selectedFields}
                onChange={handleFieldsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const field = availableFields.find(f => f.value === value);
                      return (
                        <Chip 
                          key={value} 
                          label={field?.label || value} 
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availableFields.map((field) => (
                  <MenuItem key={field.value} value={field.value}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              onClick={() => setSelectedFields(availableFields.map(f => f.value))}
              sx={{ mr: 1 }}
            >
              Select All
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setSelectedFields([])}
            >
              Clear All
            </Button>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            
            {isLoading ? (
              <LinearProgress />
            ) : filteredRecords.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No records match your current filter criteria. Please adjust your filters to see records.
              </Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {filteredRecords.length} records that will be exported
                </Typography>
                
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedRecordIds.length > 0 && selectedRecordIds.length < filteredRecords.length}
                            checked={filteredRecords.length > 0 && selectedRecordIds.length === filteredRecords.length}
                            onChange={handleSelectAllRecords}
                          />
                        </TableCell>
                        <TableCell>Record Name</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRecords.slice(0, 10).map((record) => (
                        <TableRow 
                          key={record.id}
                          selected={selectedRecordIds.includes(record.id) || singleRecordId === record.id}
                          onClick={() => {
                            // If clicking a row in single mode, select that record
                            if (exportMode === ExportMode.SINGLE) {
                              setSingleRecordId(record.id);
                            }
                          }}
                          sx={singleRecordId === record.id ? { backgroundColor: theme.palette.primary.light } : {}}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedRecordIds.includes(record.id)}
                              onChange={() => handleRecordSelectionChange(record.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.sourceData.customerName}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              size="small"
                              color={
                                record.status === RecordStatus.APPROVED
                                  ? 'success'
                                  : record.status === RecordStatus.REJECTED
                                  ? 'error'
                                  : 'warning'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {filteredRecords.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    ... and {filteredRecords.length - 10} more records
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Export Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom>
            Export Formats
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>JSON:</strong> JavaScript Object Notation format is ideal for maintaining hierarchical data structures. Use this if you need to preserve complex relationships in your data.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>CSV:</strong> Comma-Separated Values format is best for importing into spreadsheet applications like Excel or Google Sheets. This flattens hierarchical data.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>XML:</strong> Extensible Markup Language format is useful for systems that require XML for data interchange. Like JSON, it preserves hierarchical structures.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Data Privacy Notice
          </Typography>
          <Typography variant="body2">
            Exported data may contain sensitive information. Ensure you follow data protection regulations and your organization's security policies when handling exported files.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ExportPage;
