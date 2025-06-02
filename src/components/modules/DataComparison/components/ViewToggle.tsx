import React from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Compare as CompareIcon,
  Article as ArticleIcon,
  Transform as TransformIcon,
  CompareArrows as CompareArrowsIcon
} from '@mui/icons-material';

export type ComparisonViewMode = 'side-by-side' | 'source-only' | 'transformed-only' | 'differences-only';

interface ViewToggleProps {
  /**
   * The current view mode
   */
  value: ComparisonViewMode;
  
  /**
   * Callback for when the view mode changes
   */
  onChange: (value: ComparisonViewMode) => void;
  
  /**
   * Optional element ID for testing
   */
  id?: string;
  
  /**
   * Optional className
   */
  className?: string;
  
  /**
   * Whether to show labels alongside icons
   */
  showLabels?: boolean;
  
  /**
   * Optional size of the toggle buttons
   */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Component for toggling between different data comparison views
 */
const ViewToggle: React.FC<ViewToggleProps> = ({
  value,
  onChange,
  id,
  className,
  showLabels = true,
  size = 'medium'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const forcedSmall = isMobile || size === 'small';
  
  // Handle toggle button change
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: ComparisonViewMode | null
  ) => {
    // Don't allow deselecting
    if (newValue !== null) {
      onChange(newValue);
    }
  };
  
  // View mode options
  const viewModes = [
    {
      value: 'side-by-side',
      label: 'Side by Side',
      icon: <CompareIcon />,
      tooltip: 'View source and transformed data side by side'
    },
    {
      value: 'source-only',
      label: 'Source Only',
      icon: <ArticleIcon />,
      tooltip: 'View only the source data'
    },
    {
      value: 'transformed-only',
      label: 'Transformed Only',
      icon: <TransformIcon />,
      tooltip: 'View only the transformed data'
    },
    {
      value: 'differences-only',
      label: 'Differences Only',
      icon: <CompareArrowsIcon />,
      tooltip: 'View only fields with differences'
    }
  ];
  
  return (
    <Box
      id={id}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="comparison view mode"
        size={forcedSmall ? 'small' : size}
        sx={{
          mb: 2,
          '.MuiToggleButtonGroup-grouped': {
            border: 1,
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.primary.dark
                : theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? theme.palette.primary.main
                  : theme.palette.primary.main,
              }
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            transition: 'all 0.2s',
          }
        }}
      >
        {viewModes.map((mode) => (
          <ToggleButton 
            key={mode.value} 
            value={mode.value}
            aria-label={mode.label}
            sx={{
              display: 'flex',
              flexDirection: forcedSmall || !showLabels ? 'row' : 'column',
              gap: 0.5,
              py: forcedSmall || !showLabels ? 1 : 1.5,
              px: forcedSmall ? 1 : 2,
              minWidth: forcedSmall || !showLabels ? 'auto' : 88,
            }}
          >
            <Tooltip title={forcedSmall ? mode.tooltip : ''} arrow>
              {mode.icon}
            </Tooltip>
            
            {(showLabels && (!forcedSmall || mode.value === value)) && (
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 'medium',
                  display: forcedSmall && mode.value !== value ? 'none' : 'block'
                }}
              >
                {forcedSmall ? mode.label.split(' ')[0] : mode.label}
              </Typography>
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      
      {value === 'side-by-side' && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Viewing source and transformed data side by side. Use the highlight differences option to see where changes were made.
        </Typography>
      )}
      
      {value === 'source-only' && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Viewing only the original source data before transformation.
        </Typography>
      )}
      
      {value === 'transformed-only' && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Viewing only the AI-transformed data. Fields with high confidence are highlighted.
        </Typography>
      )}
      
      {value === 'differences-only' && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          Viewing only fields where the AI transformation differs from the source data.
        </Typography>
      )}
    </Box>
  );
};

export default ViewToggle;
