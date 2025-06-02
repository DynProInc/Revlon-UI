import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  VerticalSplit as VerticalSplitIcon,
  TableRows as TableRowsIcon,
  Code as CodeIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Article as JsonIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { DataRecord, ConfidenceLevel, RecordStatus } from '@/services/api/types';
import { getAllRecords, getRecordById } from '@/services/api/recordsService';
import { format } from 'date-fns';
import { getDescriptiveFileName } from '@/utils/fileNameMapping';

const ComparisonPage: React.FC = () => {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'source-only' | 'transformed-only' | 'differences'>('side-by-side');
  const [displayMode, setDisplayMode] = useState<'structured' | 'json'>('structured');
  
  const router = useRouter();
  
  useEffect(() => {
    // Load real records from the API service
    const loadRecords = async () => {
      setIsLoading(true);
      try {
        const allRecords = await getAllRecords();
        console.log('Loaded records for comparison:', allRecords);
        setRecords(allRecords);
      } catch (error) {
        console.error('Error loading records for comparison:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecords();
  }, []);
  
  // Get confidence color based on level
  const getConfidenceColor = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH:
        return 'success';
      case ConfidenceLevel.MEDIUM:
        return 'warning';
      case ConfidenceLevel.LOW:
        return 'error';
      default:
        return 'default';
    }
  };
  
  const handleRecordSelect = async (record: DataRecord) => {
    try {
      // Get the full record with all data to ensure we have everything needed
      const fullRecord = await getRecordById(record.id);
      if (fullRecord) {
        setSelectedRecord(fullRecord);
      } else {
        setSelectedRecord(record);
      }
    } catch (error) {
      console.error('Error loading full record details:', error);
      setSelectedRecord(record);
    }
  };
  
  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'side-by-side' | 'source-only' | 'transformed-only' | 'differences') => {
    setViewMode(newValue);
  };
  
  const handleBackToList = () => {
    setSelectedRecord(null);
  };
  
  const handleViewDetails = (record: DataRecord) => {
    router.push(`/records/${record.id}`);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Helper to check if values are different
  const areValuesDifferent = (sourceValue: any, transformedValue: any) => {
    // Handle undefined or null values
    if (sourceValue === undefined || transformedValue === undefined) return false;
    if (sourceValue === null && transformedValue === null) return false;
    if (sourceValue === null || transformedValue === null) return true;
    
    // Check for different types
    if (typeof sourceValue !== typeof transformedValue) return true;
    
    // Handle objects (including arrays)
    if (typeof sourceValue === 'object') {
      try {
        return JSON.stringify(sourceValue) !== JSON.stringify(transformedValue);
      } catch (error) {
        console.error('Error comparing objects:', error);
        return false;
      }
    }
    
    // Handle primitive values
    return sourceValue !== transformedValue;
  };
  
  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string) => {
    if (!obj) return null;
    try {
      return path.split('.').reduce((prev, curr) => {
        return prev && typeof prev === 'object' ? prev[curr] : null;
      }, obj);
    } catch (error) {
      console.error(`Error getting nested value for path ${path}:`, error);
      return null;
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  if (selectedRecord) {
    // Add debugging to identify the exact error
    console.log('Selected Record:', selectedRecord);
    console.log('TransformedData:', selectedRecord.transformedData);
    
    // Render detailed comparison view for selected record
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToList}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Typography variant="h5" component="h1">
            Data Comparison: {getDescriptiveFileName(selectedRecord.name) || 'Unknown'}
          </Typography>
        </Box>
        
        {/* Record summary card */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Document Name
                </Typography>
                <Typography variant="h6">
                  {getDescriptiveFileName(selectedRecord.originalFilename || selectedRecord.name) || 'Unknown'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="h6">
                  {selectedRecord.status && (
                    <Chip 
                      label={selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                      color={
                        selectedRecord.status === RecordStatus.APPROVED 
                          ? 'success' 
                          : selectedRecord.status === RecordStatus.REJECTED
                            ? 'error'
                            : 'warning'
                      }
                      size="small"
                    />
                  )}
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  AI Confidence
                </Typography>
                {selectedRecord.aiConfidence && (
                  <Chip 
                    label={selectedRecord.aiConfidence.overall}
                    size="small"
                    color={getConfidenceColor(selectedRecord.aiConfidence.overall) as any}
                  />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Dynpro Approved
                </Typography>
                <Chip 
                  label={selectedRecord.dynproApproved ? 'Yes' : 'No'}
                  color={selectedRecord.dynproApproved ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
          
          {/* Links to view source files */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PdfIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {selectedRecord.sourceDataFilePath ? (
                    <a href={selectedRecord.sourceDataFilePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      View Source PDF
                    </a>
                  ) : (
                    <span>PDF not available</span>
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <JsonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {selectedRecord.transformedDataFilePath ? (
                    <a href={selectedRecord.transformedDataFilePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      View Transformed JSON
                    </a>
                  ) : (
                    <span>JSON not available</span>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Comparison view controls */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tabs
              value={viewMode}
              onChange={handleViewModeChange}
              aria-label="view mode tabs"
            >
              <Tab 
                icon={<VerticalSplitIcon fontSize="small" />}
                iconPosition="start"
                label="Side by Side"
                value="side-by-side"
              />
              <Tab 
                label="Source Only"
                value="source-only"
              />
              <Tab 
                label="Transformed Only"
                value="transformed-only"
              />
              <Tab 
                label="Differences Only"
                value="differences"
              />
            </Tabs>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Structured View">
                <IconButton 
                  color={displayMode === 'structured' ? 'primary' : 'default'}
                  onClick={() => setDisplayMode('structured')}
                >
                  <TableRowsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="JSON View">
                <IconButton 
                  color={displayMode === 'json' ? 'primary' : 'default'}
                  onClick={() => setDisplayMode('json')}
                >
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        
        {/* PDF Preview Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
            Source PDF Preview
          </Typography>
          <Paper elevation={1} sx={{ p: 2, height: '500px', overflow: 'hidden' }}>
            {selectedRecord.sourceDataFilePath ? (
              <iframe 
                src={selectedRecord.sourceDataFilePath}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  PDF preview not available
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Comparison content */}
        {displayMode === 'structured' ? (
          // Structured view
          <Box>
            {/* Customer Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                Customer Information
              </Typography>
              <Paper elevation={1} sx={{ overflow: 'hidden' }}>
                {/* Customer Name Field */}
                <Box 
                  sx={{ 
                    p: 2,
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: viewMode === 'side-by-side' ? 'row' : 'column' },
                    backgroundColor: 'transparent' // Simplified to avoid errors
                  }}
                >
                  {(viewMode === 'side-by-side' || viewMode === 'source-only') && (
                    <Box sx={{ width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' }, mb: { xs: 2, md: 0 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Customer Name
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Source Data:
                        </Typography>
                        <Typography>
                          {selectedRecord.transformedData ? 
                            (getNestedValue(selectedRecord.transformedData, 'customer.name') || <em>Not available</em>) : 
                            <em>No data available</em>}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {(viewMode === 'side-by-side' || viewMode === 'transformed-only') && (
                    <Box sx={{ 
                      width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' },
                      pl: { md: viewMode === 'side-by-side' ? 2 : 0 },
                      borderLeft: { md: viewMode === 'side-by-side' ? 1 : 0, borderColor: 'divider' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Transformed Data:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {selectedRecord.aiConfidence && selectedRecord.aiConfidence.overall ? (
                            <Chip 
                              label={selectedRecord.aiConfidence.overall}
                              size="small"
                              color={getConfidenceColor(selectedRecord.aiConfidence.overall) as any}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ) : (
                            <Chip 
                              label="Unknown"
                              size="small"
                              color="default"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          <Tooltip title="Edit value">
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: 'transparent', // Simplified to avoid errors
                      }}>
                        <Typography>
                          {selectedRecord.transformedData ? 
                            (getNestedValue(selectedRecord.transformedData, 'customer.name') || <em>Not available</em>) : 
                            <em>No data available</em>}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <Divider />
                
                {/* Email Field */}
                <Box 
                  sx={{ 
                    p: 2,
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: viewMode === 'side-by-side' ? 'row' : 'column' },
                    backgroundColor: 'transparent' // Simplified to avoid errors
                  }}
                >
                  {(viewMode === 'side-by-side' || viewMode === 'source-only') && (
                    <Box sx={{ width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' }, mb: { xs: 2, md: 0 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Source Data:
                        </Typography>
                        <Typography>
                          {selectedRecord.sourceData && selectedRecord.sourceData.email ? 
                            selectedRecord.sourceData.email : <em>Not available</em>}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {(viewMode === 'side-by-side' || viewMode === 'transformed-only') && (
                    <Box sx={{ 
                      width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' },
                      pl: { md: viewMode === 'side-by-side' ? 2 : 0 },
                      borderLeft: { md: viewMode === 'side-by-side' ? 1 : 0, borderColor: 'divider' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Transformed Data:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {selectedRecord.aiConfidence && (
                            <Chip 
                              label={
                                selectedRecord.aiConfidence.fields && selectedRecord.aiConfidence.fields.customerEmail ?
                                selectedRecord.aiConfidence.fields.customerEmail :
                                (selectedRecord.aiConfidence.overall || 'Unknown')
                              }
                              size="small"
                              color={getConfidenceColor(
                                selectedRecord.aiConfidence.fields && selectedRecord.aiConfidence.fields.customerEmail ?
                                selectedRecord.aiConfidence.fields.customerEmail :
                                (selectedRecord.aiConfidence.overall || ConfidenceLevel.LOW)
                              ) as any}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          <Tooltip title="Edit value">
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: 'transparent' // Simplified to avoid errors
                      }}>
                        <Typography>
                          {selectedRecord.transformedData && selectedRecord.transformedData.customerEmail ? 
                            selectedRecord.transformedData.customerEmail : <em>Not available</em>}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Additional fields would be added here in a similar pattern */}
              </Paper>
            </Box>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleBackToList}
              >
                Back to List
              </Button>
              <Button 
                variant="contained" 
                onClick={() => handleViewDetails(selectedRecord)}
              >
                View Full Details
              </Button>
            </Box>
          </Box>
        ) : (
          // JSON view
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {(viewMode === 'side-by-side' || viewMode === 'source-only') && (
              <Box sx={{ width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Source Data:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto', maxHeight: 600 }}>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {selectedRecord.sourceData ? 
                      JSON.stringify(selectedRecord.sourceData, null, 2) : 
                      'No source data available'}
                  </pre>
                </Paper>
              </Box>
            )}
            
            {(viewMode === 'side-by-side' || viewMode === 'transformed-only') && (
              <Box sx={{ width: { xs: '100%', md: viewMode === 'side-by-side' ? '50%' : '100%' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Transformed Data:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100', overflow: 'auto', maxHeight: 600 }}>
                  <pre style={{ margin: 0, overflow: 'auto' }}>
                    {selectedRecord.transformedData ? 
                      JSON.stringify(selectedRecord.transformedData, null, 2) : 
                      'No transformed data available'}
                  </pre>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
  
  // Records list view
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Comparison
      </Typography>
      
      <Typography variant="body1" paragraph>
        Select a record to view a detailed comparison between source and transformed data.
      </Typography>
      
      <Grid container spacing={3}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                height: '100%',
              }}
              onClick={() => handleRecordSelect(record)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon 
                      sx={{ 
                        mr: 1, 
                        color: record.status ? (
                          record.status === RecordStatus.PENDING 
                            ? 'warning.main' 
                            : record.status === RecordStatus.APPROVED 
                              ? 'success.main' 
                              : 'error.main'
                        ) : 'text.secondary'
                      }} 
                    />
                    <Typography variant="h6">
                      {getDescriptiveFileName(record.name) || 'Unnamed Record'}
                    </Typography>
                  </Box>
                  {record.aiConfidence && record.aiConfidence.overall ? (
                    <Chip 
                      label={record.aiConfidence.overall}
                      size="small"
                      color={getConfidenceColor(record.aiConfidence.overall) as any}
                    />
                  ) : (
                    <Chip 
                      label="Unknown"
                      size="small"
                      color="default"
                    />
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Document
                  </Typography>
                  <Typography variant="body1">
                    {getDescriptiveFileName(record.originalFilename || record.name) || 'Unknown'}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  {record.status ? (
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
                  ) : (
                    <Chip 
                      label="Unknown"
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(record.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ComparisonPage;
