import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider,
  Tooltip,
  Alert,
  Fade,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon,
  HistoryToggleOff as HistoryToggleOffIcon,
  Comment as CommentIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'forwarded';
export type ApprovalLevel = 1 | 2;

export interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface ApprovalAction {
  recordId: string;
  status: ApprovalStatus;
  comment?: string;
  forwardToUserId?: string;
  level?: ApprovalLevel;
}

interface ApprovalActionsProps {
  /**
   * The ID of the record being reviewed
   */
  recordId: string;
  
  /**
   * The current approval status of the record
   */
  currentStatus: ApprovalStatus;
  
  /**
   * The current approval level (1 = initial review, 2 = final approval)
   */
  currentLevel: ApprovalLevel;
  
  /**
   * List of users the record can be forwarded to
   */
  forwardableUsers?: User[];
  
  /**
   * Whether the current user can approve at this level
   */
  canApprove: boolean;
  
  /**
   * Whether the current user can reject at this level
   */
  canReject: boolean;
  
  /**
   * Whether the current user can forward the record
   */
  canForward: boolean;
  
  /**
   * Callback when an approval action is taken
   */
  onAction?: (action: ApprovalAction) => Promise<void>;
  
  /**
   * Whether the record is currently being processed
   */
  isProcessing?: boolean;
  
  /**
   * Optional className
   */
  className?: string;
  
  /**
   * Optional element ID for testing
   */
  id?: string;
}

/**
 * Component to display approval actions for a record in the multi-level approval workflow
 */
const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  recordId,
  currentStatus,
  currentLevel,
  forwardableUsers = [],
  canApprove,
  canReject,
  canForward,
  onAction,
  isProcessing = false,
  className,
  id
}) => {
  const theme = useTheme();
  
  // State for dialog visibility
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState<boolean>(false);
  
  // State for form values
  const [approveComment, setApproveComment] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [forwardToUserId, setForwardToUserId] = useState<string>('');
  const [forwardComment, setForwardComment] = useState<string>('');
  
  // State for action status
  const [actionStatus, setActionStatus] = useState<'success' | 'error' | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');
  
  // Handle opening approve dialog
  const handleOpenApproveDialog = () => {
    setApproveDialogOpen(true);
  };
  
  // Handle closing approve dialog
  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
  };
  
  // Handle opening reject dialog
  const handleOpenRejectDialog = () => {
    setRejectDialogOpen(true);
  };
  
  // Handle closing reject dialog
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
  };
  
  // Handle opening forward dialog
  const handleOpenForwardDialog = () => {
    setForwardDialogOpen(true);
  };
  
  // Handle closing forward dialog
  const handleCloseForwardDialog = () => {
    setForwardDialogOpen(false);
  };
  
  // Handle approve action
  const handleApprove = async () => {
    if (!onAction) return;
    
    try {
      await onAction({
        recordId,
        status: 'approved',
        comment: approveComment.trim() || undefined,
        level: currentLevel
      });
      
      setActionStatus('success');
      setActionMessage('Record approved successfully');
      handleCloseApproveDialog();
      setApproveComment('');
    } catch (error) {
      console.error('Error approving record:', error);
      setActionStatus('error');
      setActionMessage('Failed to approve record. Please try again.');
    }
  };
  
  // Handle reject action
  const handleReject = async () => {
    if (!onAction) return;
    
    if (!rejectReason.trim()) {
      setActionStatus('error');
      setActionMessage('Please provide a reason for rejection');
      return;
    }
    
    try {
      await onAction({
        recordId,
        status: 'rejected',
        comment: rejectReason.trim(),
        level: currentLevel
      });
      
      setActionStatus('success');
      setActionMessage('Record rejected');
      handleCloseRejectDialog();
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting record:', error);
      setActionStatus('error');
      setActionMessage('Failed to reject record. Please try again.');
    }
  };
  
  // Handle forward action
  const handleForward = async () => {
    if (!onAction) return;
    
    if (!forwardToUserId) {
      setActionStatus('error');
      setActionMessage('Please select a user to forward to');
      return;
    }
    
    try {
      await onAction({
        recordId,
        status: 'forwarded',
        comment: forwardComment.trim() || undefined,
        forwardToUserId,
        level: currentLevel
      });
      
      setActionStatus('success');
      setActionMessage('Record forwarded successfully');
      handleCloseForwardDialog();
      setForwardToUserId('');
      setForwardComment('');
    } catch (error) {
      console.error('Error forwarding record:', error);
      setActionStatus('error');
      setActionMessage('Failed to forward record. Please try again.');
    }
  };
  
  // Handle forward user change
  const handleForwardUserChange = (event: SelectChangeEvent) => {
    setForwardToUserId(event.target.value);
  };
  
  // Helper function to get status chip
  const getStatusChip = () => {
    switch (currentStatus) {
      case 'pending':
        return (
          <Chip
            label="Pending"
            color="warning"
            size="small"
            icon={<HistoryToggleOffIcon />}
          />
        );
      case 'approved':
        return (
          <Chip
            label="Approved"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
          />
        );
      case 'rejected':
        return (
          <Chip
            label="Rejected"
            color="error"
            size="small"
            icon={<CancelIcon />}
          />
        );
      case 'forwarded':
        return (
          <Chip
            label="Forwarded"
            color="info"
            size="small"
            icon={<ArrowForwardIcon />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box id={id} className={className}>
      {/* Status and action messages */}
      <Box sx={{ mb: 2 }}>
        {actionStatus === 'success' && (
          <Fade in={true}>
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionStatus(null)}>
              {actionMessage}
            </Alert>
          </Fade>
        )}
        
        {actionStatus === 'error' && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionStatus(null)}>
              {actionMessage}
            </Alert>
          </Fade>
        )}
      </Box>
      
      {/* Main approval actions card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 1,
          borderColor: theme.palette.divider
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Approval Actions
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
              Current Status:
            </Typography>
            {getStatusChip()}
            
            <Chip
              label={`Level ${currentLevel}`}
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-end' }}>
          {canApprove && currentStatus !== 'approved' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenApproveDialog}
              disabled={isProcessing}
            >
              Approve
            </Button>
          )}
          
          {canReject && currentStatus !== 'rejected' && (
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleOpenRejectDialog}
              disabled={isProcessing}
            >
              Reject
            </Button>
          )}
          
          {canForward && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowForwardIcon />}
              onClick={handleOpenForwardDialog}
              disabled={isProcessing || forwardableUsers.length === 0}
            >
              Forward
            </Button>
          )}
          
          {isProcessing && (
            <CircularProgress size={24} thickness={4} />
          )}
        </Box>
      </Paper>
      
      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        aria-labelledby="approve-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="approve-dialog-title">
          Approve Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentLevel === 1 
              ? 'You are approving this record for the initial review. It will be forwarded for final approval.'
              : 'You are giving final approval to this record. This action cannot be undone.'}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="approveComment"
            label="Comments (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Approval'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        aria-labelledby="reject-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="reject-dialog-title">
          Reject Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this record. This will help the data steward understand what needs to be corrected.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="rejectReason"
            label="Reason for Rejection *"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
            error={rejectReason.trim() === ''}
            helperText={rejectReason.trim() === '' ? 'A reason is required' : ''}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <CancelIcon />}
            disabled={isProcessing || rejectReason.trim() === ''}
          >
            {isProcessing ? 'Processing...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Forward Dialog */}
      <Dialog
        open={forwardDialogOpen}
        onClose={handleCloseForwardDialog}
        aria-labelledby="forward-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="forward-dialog-title">
          Forward Record for Review
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a user to forward this record to for additional review.
          </DialogContentText>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="forward-user-label">Forward To *</InputLabel>
            <Select
              labelId="forward-user-label"
              id="forward-user-select"
              value={forwardToUserId}
              label="Forward To *"
              onChange={handleForwardUserChange}
              required
              error={forwardToUserId === ''}
            >
              {forwardableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            id="forwardComment"
            label="Comments (Optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={forwardComment}
            onChange={(e) => setForwardComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForwardDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleForward}
            color="primary"
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={isProcessing || forwardToUserId === ''}
          >
            {isProcessing ? 'Processing...' : 'Forward'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalActions;
