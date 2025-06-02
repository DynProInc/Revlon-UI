import React from 'react';
import {
  Box,
  Tooltip,
  Typography,
  LinearProgress,
  Paper,
  Fade,
  Zoom,
  Chip,
  useTheme
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface ConfidenceScore {
  // Overall confidence score (0-100)
  overall: number;
  
  // Category-specific confidence scores
  categories?: {
    [key: string]: number;
  };
  
  // Field-level confidence details
  fields?: {
    [key: string]: {
      score: number;
      reasons?: string[];
      suggestions?: string[];
    }
  };
  
  // Optional metadata about the AI model
  modelInfo?: {
    name: string;
    version: string;
    lastTrainedOn?: string;
    accuracy?: number;
  };
}

interface ConfidenceIndicatorProps {
  /**
   * The confidence score data
   */
  data: ConfidenceScore;
  
  /**
   * Whether to show detailed breakdowns by category and field
   */
  detailed?: boolean;
  
  /**
   * Whether to show the model information
   */
  showModelInfo?: boolean;
  
  /**
   * Custom size variant
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Optional click handler for the component
   */
  onClick?: () => void;
  
  /**
   * Optional element ID for testing
   */
  id?: string;
}

/**
 * Component to display AI confidence levels visually
 */
const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  data,
  detailed = false,
  showModelInfo = false,
  size = 'medium',
  onClick,
  id
}) => {
  const theme = useTheme();
  
  // Determine confidence level category and color
  const getConfidenceLevel = (score: number): {
    label: string;
    color: string;
    icon: React.ReactNode;
    description: string;
  } => {
    if (score >= 90) {
      return {
        label: 'Very High',
        color: theme.palette.success.main,
        icon: <CheckCircleOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
        description: 'The AI is very confident in this transformation'
      };
    } else if (score >= 75) {
      return {
        label: 'High',
        color: theme.palette.success.light,
        icon: <CheckCircleOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
        description: 'The AI is confident in this transformation'
      };
    } else if (score >= 60) {
      return {
        label: 'Moderate',
        color: theme.palette.warning.main,
        icon: <WarningAmberIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
        description: 'The AI has moderate confidence in this transformation - human verification recommended'
      };
    } else if (score >= 40) {
      return {
        label: 'Low',
        color: theme.palette.warning.dark,
        icon: <WarningAmberIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
        description: 'The AI has low confidence in this transformation - human verification required'
      };
    } else {
      return {
        label: 'Very Low',
        color: theme.palette.error.main,
        icon: <ErrorOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
        description: 'The AI has very low confidence in this transformation - human correction required'
      };
    }
  };
  
  // Determine sizing
  const getSizing = () => {
    switch (size) {
      case 'small':
        return {
          height: 4,
          width: 80,
          fontSize: '0.75rem',
          padding: 0.5,
          margin: 0.5
        };
      case 'large':
        return {
          height: 8,
          width: 200,
          fontSize: '1rem',
          padding: 2,
          margin: 1
        };
      default:
        return {
          height: 6,
          width: 120,
          fontSize: '0.875rem',
          padding: 1,
          margin: 0.75
        };
    }
  };
  
  const sizing = getSizing();
  const overallConfidence = getConfidenceLevel(data.overall);
  
  // Inline display for simple/compact view
  if (!detailed) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="subtitle2">{overallConfidence.label} Confidence</Typography>
            <Typography variant="body2">{overallConfidence.description}</Typography>
            <Typography variant="caption">Score: {data.overall}%</Typography>
          </Box>
        }
        arrow
      >
        <Box
          id={id}
          onClick={onClick}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: onClick ? 'pointer' : 'default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: sizing.padding,
            py: sizing.padding / 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: onClick ? 'action.hover' : 'transparent',
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: overallConfidence.color,
              mr: 0.5
            }}
          >
            {overallConfidence.icon}
          </Box>
          
          <Box sx={{ minWidth: sizing.width }}>
            <LinearProgress
              variant="determinate"
              value={data.overall}
              sx={{
                height: sizing.height,
                borderRadius: sizing.height / 2,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: sizing.height / 2,
                  backgroundColor: overallConfidence.color,
                }
              }}
            />
          </Box>
          
          <Typography
            variant="caption"
            sx={{
              ml: 1,
              fontWeight: 'medium',
              fontSize: sizing.fontSize,
              color: overallConfidence.color
            }}
          >
            {data.overall}%
          </Typography>
        </Box>
      </Tooltip>
    );
  }
  
  // Detailed view with categories and fields
  return (
    <Paper
      id={id}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        borderColor: theme.palette.divider,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: onClick ? 'action.hover' : 'transparent',
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">AI Confidence Score</Typography>
          <Chip
            icon={overallConfidence.icon}
            label={overallConfidence.label}
            size="small"
            sx={{
              backgroundColor: `${overallConfidence.color}20`, // Using alpha
              color: overallConfidence.color,
              fontWeight: 'medium'
            }}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
              Overall
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {data.overall}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={data.overall}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: overallConfidence.color,
              }
            }}
          />
          
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            {overallConfidence.description}
          </Typography>
        </Box>
      </Box>
      
      {data.categories && Object.keys(data.categories).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Category Breakdown
          </Typography>
          
          <Box sx={{ pl: 1 }}>
            {Object.entries(data.categories).map(([category, score]) => {
              const categoryConfidence = getConfidenceLevel(score);
              
              return (
                <Box key={category} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color={categoryConfidence.color} sx={{ fontWeight: 'medium' }}>
                        {score}%
                      </Typography>
                      <Tooltip title={categoryConfidence.description} arrow>
                        <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, fontSize: 16, color: 'action.active' }} />
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={score}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        backgroundColor: categoryConfidence.color,
                      }
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      
      {data.fields && Object.keys(data.fields).length > 0 && (
        <Fade in={true}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Field-level Confidence
            </Typography>
            
            <Box 
              sx={{ 
                maxHeight: 300, 
                overflowY: 'auto', 
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.divider,
                  borderRadius: '4px',
                },
              }}
            >
              {Object.entries(data.fields).map(([field, fieldData]) => {
                const fieldConfidence = getConfidenceLevel(fieldData.score);
                
                return (
                  <Box
                    key={field}
                    sx={{
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {field}
                      </Typography>
                      <Chip
                        label={`${fieldData.score}%`}
                        size="small"
                        sx={{
                          backgroundColor: `${fieldConfidence.color}20`,
                          color: fieldConfidence.color,
                          height: 20,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={fieldData.score}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: fieldConfidence.color,
                        }
                      }}
                    />
                    
                    {(fieldData.reasons || fieldData.suggestions) && (
                      <Box sx={{ mt: 1, pl: 1 }}>
                        {fieldData.reasons && fieldData.reasons.length > 0 && (
                          <Box sx={{ mb: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              Confidence factors:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
                              {fieldData.reasons.map((reason, idx) => (
                                <li key={idx}>
                                  <Typography variant="caption">{reason}</Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                        
                        {fieldData.suggestions && fieldData.suggestions.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              AI Suggestions:
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
                              {fieldData.suggestions.map((suggestion, idx) => (
                                <li key={idx}>
                                  <Typography variant="caption" color="primary">
                                    {suggestion}
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Fade>
      )}
      
      {showModelInfo && data.modelInfo && (
        <Fade in={true}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HelpOutlineIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="textSecondary">
                AI Model Information
              </Typography>
            </Box>
            
            <Box sx={{ pl: 3, mt: 0.5 }}>
              <Typography variant="caption" display="block">
                <b>Model:</b> {data.modelInfo.name} v{data.modelInfo.version}
              </Typography>
              
              {data.modelInfo.lastTrainedOn && (
                <Typography variant="caption" display="block">
                  <b>Last trained:</b> {data.modelInfo.lastTrainedOn}
                </Typography>
              )}
              
              {data.modelInfo.accuracy && (
                <Typography variant="caption" display="block">
                  <b>Model accuracy:</b> {data.modelInfo.accuracy}%
                </Typography>
              )}
            </Box>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default ConfidenceIndicator;
