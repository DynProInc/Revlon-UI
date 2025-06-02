import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Grid,
  Alert,
  Fade,
  Paper,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Types
export type ExportFormat = 'json' | 'csv' | 'xml';
export type DataSelection = 'source' | 'transformed' | 'both';

interface Field {
  id: string;
  name: string;
  category: 'source' | 'transformed' | 'both';
}

interface ExportOptionsProps {
  /**
   * Available fields to select for export
   */
  fields: Field[];
  
  /**
   * Optional function to execute when export is started
   */
  onExport?: (options: ExportConfig) => Promise<void>;
  
  /**
   * Number of records available for export
   */
  recordCount?: number;
  
  /**
   * Whether the data is currently being loaded
   */
  loading?: boolean;
}

// Export configuration
export interface ExportConfig {
  format: ExportFormat;
  dataSelection: DataSelection;
  selectedFields: string[];
  includeMetadata: boolean;
  includeAuditTrail: boolean;
  fileName: string;
  batchSize?: number;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  fields,
  onExport,
  recordCount = 0,
  loading = false
}) => {
  const theme = useTheme();
  const [format, setFormat] = useState<ExportFormat>('json');
  const [dataSelection, setDataSelection] = useState<DataSelection>('both');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [includeAuditTrail, setIncludeAuditTrail] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>('data-export');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean | null>(null);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(1000);
  
  // Filter fields based on data selection
  const filteredFields = fields.filter(
    field => dataSelection === 'both' || field.category === dataSelection || field.category === 'both'
  );

  // Handle field selection
  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  // Handle select all fields
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFields([]);
    } else {
      setSelectedFields(filteredFields.map(field => field.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle export
  const handleExport = async () => {
    if (!onExport) return;
    
    const config: ExportConfig = {
      format,
      dataSelection,
      selectedFields: selectedFields.length > 0 ? selectedFields : filteredFields.map(field => field.id),
      includeMetadata,
      includeAuditTrail,
      fileName,
      batchSize
    };
    
    setIsExporting(true);
    setExportSuccess(null);
    
    try {
      await onExport(config);
      setExportSuccess(true);
    } catch (error) {
      console.error('Export failed:', error);
      setExportSuccess(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card 
      elevation={0} 
      variant="outlined"
      sx={{
        borderRadius: theme.shape.borderRadius,
        overflow: 'visible',
      }}
    >
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Export Options
        </Typography>
        
        {exportSuccess === true && (
          <Fade in={true}>
            <Alert 
              severity="success" 
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Export completed successfully.
            </Alert>
          </Fade>
        )}
        
        {exportSuccess === false && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              icon={<CancelIcon fontSize="inherit" />}
              sx={{ mb: 2 }}
            >
              Export failed. Please try again.
            </Alert>
          </Fade>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Format</FormLabel>
              <RadioGroup
                value={format}
                onChange={(e) => setFormat(e.target.value as ExportFormat)}
                row
              >
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                <FormControlLabel value="xml" control={<Radio />} label="XML" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Data to Export</FormLabel>
              <RadioGroup
                value={dataSelection}
                onChange={(e) => setDataSelection(e.target.value as DataSelection)}
                row
              >
                <FormControlLabel value="source" control={<Radio />} label="Source Data" />
                <FormControlLabel value="transformed" control={<Radio />} label="Transformed Data" />
                <FormControlLabel value="both" control={<Radio />} label="Both" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Field Selection
              </Typography>
              <Button
                onClick={handleSelectAll}
                size="small"
                variant="text"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                maxHeight: 200,
                overflowY: 'auto',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: theme.palette.background.default,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.divider,
                  borderRadius: '4px',
                },
              }}
            >
              <Grid container spacing={1}>
                {filteredFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap>
                            {field.name}
                          </Typography>
                          <Tooltip title={`Category: ${field.category}`}>
                            <InfoIcon fontSize="small" color="action" sx={{ ml: 0.5, fontSize: 16 }} />
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="small"
                sx={{ mt: 2 }}
              >
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Button>
            </Box>
            
            {showAdvanced && (
              <Fade in={showAdvanced}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includeMetadata}
                            onChange={(e) => setIncludeMetadata(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Include Metadata"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includeAuditTrail}
                            onChange={(e) => setIncludeAuditTrail(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Include Audit Trail"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <FormLabel component="legend" sx={{ mb: 1 }}>File Name</FormLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            component="input"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            sx={{
                              px: 1.5,
                              py: 1,
                              flex: 1,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: theme.shape.borderRadius,
                              outline: 'none',
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              '&:focus': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                              }
                            }}
                          />
                          <Box sx={{ ml: 1 }}>
                            .{format}
                          </Box>
                        </Box>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={16} thickness={6} sx={{ mr: 1 }} />
                    Loading record count...
                  </Box>
                ) : (
                  `${recordCount} record${recordCount !== 1 ? 's' : ''} will be exported`
                )}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExport}
                disabled={isExporting || loading || recordCount === 0}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;
