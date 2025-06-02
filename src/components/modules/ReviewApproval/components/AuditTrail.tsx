import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Button,
  Fade,
  useTheme
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Article as ArticleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types for audit trail
export interface FieldChange {
  fieldName: string;
  oldValue: any;
  newValue: any;
}

export interface AuditEvent {
  id: string;
  timestamp: string | Date;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  recordId: string;
  action: 'create' | 'update' | 'approve' | 'reject' | 'view' | 'comment' | 'revert';
  changes?: FieldChange[];
  comment?: string;
  status?: 'pending' | 'approved' | 'rejected';
  level?: number; // For multi-level approval
}

// Props for the component
interface AuditTrailProps {
  /**
   * The audit events to display
   */
  events: AuditEvent[];
  
  /**
   * Title for the audit trail component
   */
  title?: string;
  
  /**
   * Whether to show the full audit trail or a compact version
   */
  compact?: boolean;
  
  /**
   * Whether to show field-level changes by default
   */
  expandChanges?: boolean;
  
  /**
   * Max number of events to show when compact is true
   */
  compactLimit?: number;
  
  /**
   * Whether to filter events
   */
  filterable?: boolean;
  
  /**
   * Element ID for testing
   */
  id?: string;
}

/**
 * Component to display a chronological audit trail of actions taken on a record
 */
const AuditTrail: React.FC<AuditTrailProps> = ({
  events,
  title = 'Audit Trail',
  compact = false,
  expandChanges = false,
  compactLimit = 3,
  filterable = true,
  id
}) => {
  const theme = useTheme();
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  const [showAll, setShowAll] = useState<boolean>(!compact);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  
  // Sort events chronologically, newest first
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, [events]);
  
  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(event => {
      if (filterAction && event.action !== filterAction) {
        return false;
      }
      if (filterUser && event.userId !== filterUser) {
        return false;
      }
      return true;
    });
  }, [sortedEvents, filterAction, filterUser]);
  
  // Handle toggling expanded state for an event
  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };
  
  // Get display data for an action type
  const getActionData = (action: string) => {
    switch (action) {
      case 'create':
        return { 
          label: 'Created', 
          color: theme.palette.success.main,
          icon: <ArticleIcon fontSize="small" />,
          description: 'Record created'
        };
      case 'update':
        return { 
          label: 'Updated', 
          color: theme.palette.info.main,
          icon: <EditIcon fontSize="small" />, 
          description: 'Record updated'
        };
      case 'approve':
        return { 
          label: 'Approved', 
          color: theme.palette.success.main,
          icon: <CheckIcon fontSize="small" />, 
          description: 'Record approved'
        };
      case 'reject':
        return { 
          label: 'Rejected', 
          color: theme.palette.error.main,
          icon: <CloseIcon fontSize="small" />, 
          description: 'Record rejected'
        };
      case 'view':
        return { 
          label: 'Viewed', 
          color: theme.palette.text.secondary,
          icon: <VisibilityIcon fontSize="small" />, 
          description: 'Record viewed'
        };
      case 'comment':
        return { 
          label: 'Commented', 
          color: theme.palette.warning.main,
          icon: <CommentIcon fontSize="small" />, 
          description: 'Comment added'
        };
      case 'revert':
        return { 
          label: 'Reverted', 
          color: theme.palette.warning.dark,
          icon: <HistoryIcon fontSize="small" />, 
          description: 'Changes reverted'
        };
      default:
        return { 
          label: action, 
          color: theme.palette.text.primary,
          icon: <ErrorOutlineIcon fontSize="small" />,
          description: 'Action performed'
        };
    }
  };
  
  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Get unique users for filtering
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    events.forEach(event => {
      if (!users.has(event.userId)) {
        users.set(event.userId, {
          id: event.userId,
          name: event.userName,
          role: event.userRole,
          avatar: event.userAvatar
        });
      }
    });
    return Array.from(users.values());
  }, [events]);
  
  // Get unique actions for filtering
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    events.forEach(event => actions.add(event.action));
    return Array.from(actions);
  }, [events]);
  
  // Display events in compact mode or just count by type
  const displayedEvents = showAll ? filteredEvents : filteredEvents.slice(0, compactLimit);
  
  return (
    <Card
      id={id}
      variant="outlined"
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            
            <Chip
              label={`${events.length} ${events.length === 1 ? 'Event' : 'Events'}`}
              size="small"
              sx={{ ml: 1, fontSize: '0.75rem' }}
            />
          </Box>
          
          {filterable && (
            <Box>
              <Tooltip title="Filter by action">
                <IconButton
                  size="small"
                  onClick={() => setFilterAction(null)} // This would open a filter menu in a real implementation
                  color={filterAction ? 'primary' : 'default'}
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        {filterable && (filterAction || filterUser) && (
          <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1, bgcolor: 'background.default' }}>
            {filterAction && (
              <Chip
                label={`Action: ${getActionData(filterAction).label}`}
                onDelete={() => setFilterAction(null)}
                size="small"
              />
            )}
            
            {filterUser && (
              <Chip
                label={`User: ${uniqueUsers.find(u => u.id === filterUser)?.name || filterUser}`}
                onDelete={() => setFilterUser(null)}
                size="small"
              />
            )}
          </Box>
        )}
        
        {events.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography color="textSecondary">No audit events recorded yet</Typography>
          </Box>
        ) : (
          <>
            <Timeline position="right" sx={{ p: 0, m: 0 }}>
              {displayedEvents.map((event) => {
                const actionData = getActionData(event.action);
                const isExpanded = expandedEvents.includes(event.id) || expandChanges;
                const hasChanges = event.changes && event.changes.length > 0;
                const hasComment = event.comment && event.comment.trim().length > 0;
                
                return (
                  <TimelineItem key={event.id}>
                    <TimelineOppositeContent sx={{ flex: 0.2, py: 1.5, px: { xs: 1, sm: 2 } }}>
                      <Typography variant="caption" color="textSecondary" component="span" sx={{ whiteSpace: 'nowrap' }}>
                        {formatTimestamp(event.timestamp)}
                      </Typography>
                    </TimelineOppositeContent>
                    
                    <TimelineSeparator>
                      <TimelineDot sx={{ bgcolor: actionData.color, p: 1, m: 0.5 }}>
                        {actionData.icon}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    
                    <TimelineContent sx={{ py: 1.5, px: { xs: 1, sm: 2 } }}>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={actionData.label}
                              size="small"
                              sx={{
                                bgcolor: `${actionData.color}20`,
                                color: actionData.color,
                                fontWeight: 'medium',
                                fontSize: '0.75rem',
                                height: 24,
                              }}
                            />
                            
                            {event.level && (
                              <Chip
                                label={`Level ${event.level}`}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1, height: 24, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                          
                          {(hasChanges || hasComment) && (
                            <IconButton
                              size="small"
                              onClick={() => toggleEventExpanded(event.id)}
                              aria-label={isExpanded ? 'Show less' : 'Show more'}
                              sx={{ ml: 1 }}
                            >
                              {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                          )}
                        </Box>
                        
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                          }}
                        >
                          <Avatar
                            src={event.userAvatar}
                            alt={event.userName}
                            sx={{ width: 24, height: 24, fontSize: '0.875rem', mr: 1 }}
                          >
                            {!event.userAvatar && event.userName.charAt(0).toUpperCase()}
                          </Avatar>
                          
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {event.userName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {event.userRole}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          {hasComment && (
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                mt: 1,
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                borderColor: theme.palette.divider,
                              }}
                            >
                              <Typography variant="body2">{event.comment}</Typography>
                            </Paper>
                          )}
                          
                          {hasChanges && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                                Changes:
                              </Typography>
                              
                              <List dense disablePadding>
                                {event.changes.map((change, idx) => (
                                  <ListItem
                                    key={`${event.id}-change-${idx}`}
                                    sx={{
                                      px: 1.5,
                                      py: 0.75,
                                      bgcolor: 'background.default',
                                      borderRadius: 1,
                                      mb: 0.5,
                                      '&:last-child': {
                                        mb: 0,
                                      },
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" fontWeight="medium">
                                          {change.fieldName}
                                        </Typography>
                                      }
                                      secondary={
                                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography 
                                              variant="caption" 
                                              sx={{ 
                                                mr: 0.5,
                                                color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
                                                textDecoration: 'line-through'
                                              }}
                                            >
                                              {typeof change.oldValue === 'object'
                                                ? JSON.stringify(change.oldValue)
                                                : String(change.oldValue) || '(empty)'}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography 
                                              variant="caption" 
                                              sx={{ 
                                                color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
                                              }}
                                            >
                                              {typeof change.newValue === 'object'
                                                ? JSON.stringify(change.newValue)
                                                : String(change.newValue) || '(empty)'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Collapse>
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
            
            {compact && filteredEvents.length > compactLimit && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAll(!showAll)}
                  startIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showAll ? 'Show Less' : `Show All (${filteredEvents.length})`}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
