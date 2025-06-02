import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  RotateLeft as RotateLeftIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REVERT = 'REVERT',
  EXPORT = 'EXPORT',
  VIEW = 'VIEW',
  AI_TRANSFORM = 'AI_TRANSFORM',
  FEEDBACK = 'FEEDBACK'
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  actionType: AuditActionType;
  recordId: string;
  description: string;
  changes?: {
    fieldName: string;
    oldValue: string;
    newValue: string;
  }[];
  metadata?: Record<string, any>;
}

interface AuditLogProps {
  entries: AuditLogEntry[];
  recordId?: string;
  showFilters?: boolean;
  maxHeight?: number | string;
}

const AuditLog: React.FC<AuditLogProps> = ({
  entries,
  recordId,
  showFilters = false,
  maxHeight = 600
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [actionTypeFilter, setActionTypeFilter] = useState<AuditActionType | 'ALL'>('ALL');
  
  // If recordId is provided, filter entries by that record
  const filteredEntries = recordId 
    ? entries.filter(entry => entry.recordId === recordId)
    : entries;
  
  // Apply action type filter if not 'ALL'
  const displayedEntries = actionTypeFilter === 'ALL'
    ? filteredEntries
    : filteredEntries.filter(entry => entry.actionType === actionTypeFilter);
  
  // Toggle expanded state for an entry
  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };
  
  // Handle action type filter change
  const handleActionTypeFilterChange = (event: SelectChangeEvent) => {
    setActionTypeFilter(event.target.value as AuditActionType | 'ALL');
  };
  
  // Get color for action type badge
  const getActionColor = (actionType: AuditActionType): string => {
    switch (actionType) {
      case AuditActionType.CREATE:
        return 'success';
      case AuditActionType.UPDATE:
        return 'info';
      case AuditActionType.APPROVE:
        return 'success';
      case AuditActionType.REJECT:
        return 'error';
      case AuditActionType.REVERT:
        return 'warning';
      case AuditActionType.EXPORT:
        return 'secondary';
      case AuditActionType.VIEW:
        return 'default';
      case AuditActionType.AI_TRANSFORM:
        return 'primary';
      case AuditActionType.FEEDBACK:
        return 'info';
      default:
        return 'default';
    }
  };
  
  // Get icon for action type
  const getActionIcon = (actionType: AuditActionType) => {
    switch (actionType) {
      case AuditActionType.CREATE:
        return <PersonIcon fontSize="small" />;
      case AuditActionType.UPDATE:
        return <EditIcon fontSize="small" />;
      case AuditActionType.APPROVE:
        return <CheckIcon fontSize="small" />;
      case AuditActionType.REJECT:
        return <CloseIcon fontSize="small" />;
      case AuditActionType.REVERT:
        return <RotateLeftIcon fontSize="small" />;
      case AuditActionType.EXPORT:
        return <HistoryIcon fontSize="small" />;
      case AuditActionType.VIEW:
        return <VisibilityIcon fontSize="small" />;
      case AuditActionType.AI_TRANSFORM:
        return <EditIcon fontSize="small" />;
      case AuditActionType.FEEDBACK:
        return <EditIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };
  
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" component="h2">
          Audit Log
        </Typography>
        
        {showFilters && (
          <Box>
            <Tooltip title="Filter">
              <IconButton 
                size="small" 
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                color={showFilterOptions ? 'primary' : 'default'}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      
      {/* Filter options */}
      <Collapse in={showFilterOptions && showFilters}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="action-type-filter-label">Action Type</InputLabel>
            <Select
              labelId="action-type-filter-label"
              value={actionTypeFilter}
              label="Action Type"
              onChange={handleActionTypeFilterChange}
            >
              <MenuItem value="ALL">All Actions</MenuItem>
              {Object.values(AuditActionType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>
      
      {/* Audit log entries */}
      <List 
        sx={{ 
          overflow: 'auto',
          maxHeight,
          flex: '1 1 auto',
          p: 0
        }}
      >
        {displayedEntries.length > 0 ? (
          displayedEntries.map((entry, index) => {
            const isExpanded = expandedEntries.has(entry.id);
            const hasDetails = entry.changes && entry.changes.length > 0;
            const actionColor = getActionColor(entry.actionType);
            const actionIcon = getActionIcon(entry.actionType);
            
            return (
              <React.Fragment key={entry.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    py: 2, 
                    px: 3,
                    cursor: hasDetails ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: hasDetails ? 'action.hover' : 'transparent'
                    }
                  }}
                  onClick={hasDetails ? () => toggleExpanded(entry.id) : undefined}
                >
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      <Avatar
                        alt={entry.userName}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          bgcolor: `${actionColor}.light`
                        }}
                      >
                        {entry.userName.charAt(0)}
                      </Avatar>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {entry.userName}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {entry.userRole}
                          </Typography>
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          {format(entry.timestamp, 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          icon={actionIcon}
                          label={entry.actionType.replace('_', ' ')}
                          size="small"
                          color={actionColor as "success" | "error" | "warning" | "info" | "secondary" | "primary" | "default"}
                          variant="filled"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.primary">
                        {entry.description}
                      </Typography>
                      
                      {hasDetails && (
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mt: 1,
                            color: 'primary.main'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              fontWeight: 'medium'
                            }}
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                            {isExpanded ? (
                              <ExpandLessIcon fontSize="small" sx={{ ml: 0.5 }} />
                            ) : (
                              <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />
                            )}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* Changes details */}
                      <Collapse in={isExpanded && hasDetails} timeout="auto" unmountOnExit>
                        <Box 
                          sx={{ 
                            mt: 2, 
                            pt: 1,
                            borderTop: '1px dashed',
                            borderColor: 'divider'
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Changes
                          </Typography>
                          
                          <List disablePadding dense>
                            {entry.changes?.map((change, changeIndex) => (
                              <ListItem 
                                key={`${entry.id}-change-${changeIndex}`}
                                disablePadding
                                sx={{ 
                                  py: 0.5,
                                  display: 'block'
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ mb: 0.5 }}
                                >
                                  Field: <strong>{change.fieldName}</strong>
                                </Typography>
                                
                                <Box 
                                  sx={{ 
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    gap: 1,
                                    ml: 1
                                  }}
                                >
                                  <Box 
                                    sx={{ 
                                      p: 1, 
                                      backgroundColor: 'error.lighter',
                                      borderRadius: 1,
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      flex: 1
                                    }}
                                  >
                                    <Typography variant="body2" color="error.dark" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                      {change.oldValue || '(empty)'}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ArrowForwardIcon color="action" fontSize="small" />
                                  </Box>
                                  
                                  <Box 
                                    sx={{ 
                                      p: 1, 
                                      backgroundColor: 'success.lighter',
                                      borderRadius: 1,
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      flex: 1
                                    }}
                                  >
                                    <Typography variant="body2" color="success.dark" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                      {change.newValue || '(empty)'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            );
          })
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No audit log entries found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity related to this record will appear here
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default AuditLog;
