import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Badge,
  Switch,
  FormControlLabel,
  Stack,
  Button
} from '@mui/material';
import {
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  FilterAlt as FilterAltIcon,
  ArrowForward as ArrowForwardIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
import ConfidenceIndicator from '@/components/ai/ConfidenceIndicator';
import { Record, ConfidenceLevel } from '@/mock-data/records';

interface DataComparisonProps {
  record: Record;
  showConfidence?: boolean;
  allowEdit?: boolean;
  onEditField?: (fieldName: string, value: string) => void;
}

// Tab values
enum TabValue {
  SIDE_BY_SIDE = 'side_by_side',
  ORIGINAL = 'original',
  TRANSFORMED = 'transformed',
  DIFFERENCES = 'differences'
}

interface FieldDifference {
  fieldName: string;
  original: string;
  transformed: string;
  confidence: {
    level: ConfidenceLevel;
    score: number;
  };
  hasChange: boolean;
}

const DataComparison: React.FC<DataComparisonProps> = ({
  record,
  showConfidence = true,
  allowEdit = false,
  onEditField
}) => {
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.SIDE_BY_SIDE);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };
  
  // Prepare data for comparison
  const prepareComparisonData = (): FieldDifference[] => {
    const fields: FieldDifference[] = [];
    
    // Process source data
    Object.entries(record.sourceData).forEach(([key, value]) => {
      const transformedValue = record.transformedData[key] || '';
      const confidenceObj = record.aiConfidence.fields.find(f => f.fieldName === key);
      
      fields.push({
        fieldName: key,
        original: value.toString(),
        transformed: transformedValue.toString(),
        confidence: {
          level: confidenceObj?.level || ConfidenceLevel.MEDIUM,
          score: confidenceObj?.score || 0.5
        },
        hasChange: value.toString() !== transformedValue.toString()
      });
    });
    
    // Add any fields that exist in transformed but not in source
    Object.entries(record.transformedData).forEach(([key, value]) => {
      if (!record.sourceData.hasOwnProperty(key)) {
        const confidenceObj = record.aiConfidence.fields.find(f => f.fieldName === key);
        
        fields.push({
          fieldName: key,
          original: '',
          transformed: value.toString(),
          confidence: {
            level: confidenceObj?.level || ConfidenceLevel.MEDIUM,
            score: confidenceObj?.score || 0.5
          },
          hasChange: true
        });
      }
    });
    
    // Sort: first by hasChange (changes first), then by fieldName
    return fields.sort((a, b) => {
      if (a.hasChange !== b.hasChange) {
        return a.hasChange ? -1 : 1;
      }
      return a.fieldName.localeCompare(b.fieldName);
    });
  };
  
  const comparisonData = prepareComparisonData();
  const filteredData = showOnlyDifferences 
    ? comparisonData.filter(field => field.hasChange)
    : comparisonData;
  
  // Handle edit click
  const handleEditClick = (fieldName: string, value: string) => {
    setEditingField(fieldName);
    setEditValue(value);
  };
  
  // Handle edit save
  const handleSaveEdit = (fieldName: string) => {
    if (onEditField) {
      onEditField(fieldName, editValue);
    }
    setEditingField(null);
    setEditValue('');
  };
  
  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };
  
  // Copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could show a notification here
  };
  
  // Render side-by-side comparison
  const renderSideBySideComparison = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell width="20%">Field</TableCell>
              <TableCell width="35%">Original Value</TableCell>
              <TableCell width="35%">Transformed Value</TableCell>
              {showConfidence && <TableCell width="10%" align="center">Confidence</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((field) => (
              <TableRow 
                key={field.fieldName}
                sx={{ 
                  backgroundColor: field.hasChange ? 'rgba(255, 244, 229, 0.5)' : 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ fontWeight: field.hasChange ? 'bold' : 'regular' }}
                >
                  {field.fieldName}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {field.original || '-'}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(field.original)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {editingField === field.fieldName ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '14px'
                        }}
                      />
                      <Box>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleSaveEdit(field.fieldName)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="small" 
                          variant="text" 
                          onClick={handleCancelEdit}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          color: field.hasChange ? 'secondary.main' : 'inherit'
                        }}
                      >
                        {field.transformed || '-'}
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Copy to clipboard">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(field.transformed)}
                            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {allowEdit && (
                          <Tooltip title="Edit value">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(field.fieldName, field.transformed)}
                              sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  )}
                </TableCell>
                {showConfidence && (
                  <TableCell align="center">
                    <ConfidenceIndicator 
                      confidenceData={{
                        overall: field.confidence.level,
                        overallScore: field.confidence.score,
                        fields: []
                      }}
                      size="small"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={showConfidence ? 4 : 3} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No{showOnlyDifferences ? ' differences' : ' data'} to display
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render differences table
  const renderDifferencesTable = () => {
    const differencesOnly = comparisonData.filter(field => field.hasChange);
    
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell width="20%">Field</TableCell>
              <TableCell width="30%">Original Value</TableCell>
              <TableCell width="10%" align="center"></TableCell>
              <TableCell width="30%">Transformed Value</TableCell>
              {showConfidence && <TableCell width="10%" align="center">Confidence</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {differencesOnly.map((field) => (
              <TableRow 
                key={field.fieldName}
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {field.fieldName}
                </TableCell>
                <TableCell sx={{ backgroundColor: 'rgba(255, 233, 213, 0.3)' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {field.original || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <ArrowForwardIcon color="action" />
                </TableCell>
                <TableCell sx={{ backgroundColor: 'rgba(230, 244, 255, 0.3)' }}>
                  {editingField === field.fieldName ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '14px'
                        }}
                      />
                      <Box>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleSaveEdit(field.fieldName)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="small" 
                          variant="text" 
                          onClick={handleCancelEdit}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color="primary"
                        sx={{ 
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {field.transformed || '-'}
                      </Typography>
                      {allowEdit && (
                        <Tooltip title="Edit value">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(field.fieldName, field.transformed)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </TableCell>
                {showConfidence && (
                  <TableCell align="center">
                    <ConfidenceIndicator 
                      confidenceData={{
                        overall: field.confidence.level,
                        overallScore: field.confidence.score,
                        fields: []
                      }}
                      size="small"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {differencesOnly.length === 0 && (
              <TableRow>
                <TableCell colSpan={showConfidence ? 5 : 4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No differences found between original and transformed data
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render original data table
  const renderOriginalDataTable = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell width="30%">Field</TableCell>
              <TableCell width="70%">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((field) => (
              <TableRow 
                key={field.fieldName}
                sx={{ 
                  backgroundColor: field.hasChange ? 'rgba(255, 244, 229, 0.5)' : 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ fontWeight: field.hasChange ? 'bold' : 'regular' }}
                >
                  {field.fieldName}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {field.original || '-'}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(field.original)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No data to display
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Render transformed data table
  const renderTransformedDataTable = () => {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell width="25%">Field</TableCell>
              <TableCell width="60%">Value</TableCell>
              {showConfidence && <TableCell width="15%" align="center">Confidence</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((field) => (
              <TableRow 
                key={field.fieldName}
                sx={{ 
                  backgroundColor: field.hasChange ? 'rgba(255, 244, 229, 0.5)' : 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  sx={{ fontWeight: field.hasChange ? 'bold' : 'regular' }}
                >
                  {field.fieldName}
                </TableCell>
                <TableCell>
                  {editingField === field.fieldName ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '14px'
                        }}
                      />
                      <Box>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleSaveEdit(field.fieldName)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Save
                        </Button>
                        <Button 
                          size="small" 
                          variant="text" 
                          onClick={handleCancelEdit}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          color: field.hasChange ? 'secondary.main' : 'inherit'
                        }}
                      >
                        {field.transformed || '-'}
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Copy to clipboard">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopyToClipboard(field.transformed)}
                            sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {allowEdit && (
                          <Tooltip title="Edit value">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditClick(field.fieldName, field.transformed)}
                              sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  )}
                </TableCell>
                {showConfidence && (
                  <TableCell align="center">
                    <ConfidenceIndicator 
                      confidenceData={{
                        overall: field.confidence.level,
                        overallScore: field.confidence.score,
                        fields: []
                      }}
                      size="small"
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={showConfidence ? 3 : 2} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No data to display
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // Get difference stats
  const differencesCount = comparisonData.filter(field => field.hasChange).length;
  const totalFieldsCount = comparisonData.length;
  
  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="data comparison tabs"
        >
          <Tab 
            icon={<CompareIcon />}
            iconPosition="start"
            label="Side by Side"
            value={TabValue.SIDE_BY_SIDE}
          />
          <Tab 
            label="Original Data"
            value={TabValue.ORIGINAL}
          />
          <Tab 
            label="Transformed Data"
            value={TabValue.TRANSFORMED}
          />
          <Tab 
            icon={
              <Badge badgeContent={differencesCount} color="warning" max={99}>
                <FilterAltIcon />
              </Badge>
            }
            iconPosition="start"
            label="Differences Only"
            value={TabValue.DIFFERENCES}
          />
        </Tabs>
        
        {activeTab !== TabValue.DIFFERENCES && (
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyDifferences}
                onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                {`Show only differences (${differencesCount}/${totalFieldsCount})`}
              </Typography>
            }
            sx={{ mr: 0 }}
          />
        )}
      </Box>
      
      <Box>
        {activeTab === TabValue.SIDE_BY_SIDE && renderSideBySideComparison()}
        {activeTab === TabValue.ORIGINAL && renderOriginalDataTable()}
        {activeTab === TabValue.TRANSFORMED && renderTransformedDataTable()}
        {activeTab === TabValue.DIFFERENCES && renderDifferencesTable()}
      </Box>
    </Box>
  );
};

export default DataComparison;
