import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Paper,
  LinearProgress,
  Grid,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { ConfidenceLevel } from '@/mock-data/records';

interface FieldConfidence {
  name: string;
  level: ConfidenceLevel;
  score: number;
  reason?: string;
}

interface AIConfidenceData {
  overall: ConfidenceLevel;
  overallScore: number;
  fields: FieldConfidence[];
  reasonSummary?: string;
}

interface ConfidenceIndicatorProps {
  confidenceData: AIConfidenceData;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidenceData,
  showDetails = false,
  size = 'medium',
  onClick
}) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Define colors and sizes based on confidence level and component size
  const getConfidenceColor = (level: ConfidenceLevel): string => {
    switch(level) {
      case ConfidenceLevel.HIGH:
        return 'success';
      case ConfidenceLevel.MEDIUM:
        return 'warning';
      case ConfidenceLevel.LOW:
        return 'error';
      default:
        return 'info';
    }
  };
  
  const getConfidenceIcon = (level: ConfidenceLevel, iconSize: 'small' | 'medium' | 'large' = 'medium') => {
    switch(level) {
      case ConfidenceLevel.HIGH:
        return <CheckCircleIcon color="success" fontSize={iconSize} />;
      case ConfidenceLevel.MEDIUM:
        return <WarningIcon color="warning" fontSize={iconSize} />;
      case ConfidenceLevel.LOW:
        return <ErrorIcon color="error" fontSize={iconSize} />;
      default:
        return <HelpOutlineIcon color="info" fontSize={iconSize} />;
    }
  };
  
  const getBadgeSize = () => {
    switch(size) {
      case 'small':
        return { height: 24, fontSize: '0.75rem' };
      case 'large':
        return { height: 36, fontSize: '1rem' };
      default:
        return { height: 30, fontSize: '0.875rem' };
    }
  };
  
  const confidenceColor = getConfidenceColor(confidenceData.overall);
  const badgeSize = getBadgeSize();
  
  // Handle details toggle
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const renderConfidenceBadge = () => {
    return (
      <Box 
        onClick={onClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <Chip
          icon={getConfidenceIcon(confidenceData.overall, size === 'small' ? 'small' : 'medium')}
          label={`${confidenceData.overall} (${Math.round(confidenceData.overallScore * 100)}%)`}
          color={confidenceColor as "success" | "warning" | "error" | "info"}
          variant="filled"
          size={size === 'small' ? 'small' : 'medium'}
          sx={{
            height: badgeSize.height,
            fontSize: badgeSize.fontSize,
            fontWeight: 'medium',
          }}
        />
        
        {showDetails && (
          <IconButton
            size="small"
            onClick={handleToggleExpand}
            sx={{ ml: 0.5 }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
    );
  };
  
  // Simplified view with just the badge
  if (!showDetails) {
    return renderConfidenceBadge();
  }
  
  // Detailed view with expandable details
  return (
    <Box>
      {renderConfidenceBadge()}
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            mt: 1, 
            p: 2, 
            backgroundColor: 'background.paper',
            borderRadius: 1
          }}
        >
          {/* Overall confidence with progress bar */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Confidence
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={confidenceData.overallScore * 100}
                  color={confidenceColor as "success" | "warning" | "error" | "info"}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round(confidenceData.overallScore * 100)}%
              </Typography>
            </Box>
            
            {confidenceData.reasonSummary && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                {confidenceData.reasonSummary}
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Field-by-field confidence */}
          <Typography variant="subtitle2" gutterBottom>
            Field-level Confidence
          </Typography>
          
          <List dense disablePadding>
            {confidenceData.fields.map((field, index) => (
              <ListItem 
                key={field.name}
                disablePadding
                sx={{ 
                  py: 0.5, 
                  px: 0,
                  borderBottom: index < confidenceData.fields.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={3}>
                    <Typography variant="body2" fontWeight="medium">
                      {field.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={field.score * 100}
                          color={getConfidenceColor(field.level) as "success" | "warning" | "error" | "info"}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                        {Math.round(field.score * 100)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'right' }}>
                    <Tooltip title={field.level}>
                      <Box component="span">
                        {getConfidenceIcon(field.level, 'small')}
                      </Box>
                    </Tooltip>
                  </Grid>
                  
                  {field.reason && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                        {field.reason}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ConfidenceIndicator;
