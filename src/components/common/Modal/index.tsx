import React, { ReactNode } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@/components/common/Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  actions?: ReactNode;
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  cancelButtonProps?: any;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  confirmButtonProps?: any;
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  actions,
  showCloseButton = true,
  showCancelButton = true,
  cancelButtonText = 'Cancel',
  cancelButtonProps,
  showConfirmButton = false,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
  confirmButtonProps,
  onConfirm,
  isConfirmLoading = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
}) => {
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disableBackdropClick) {
      event.stopPropagation();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onClick={handleBackdropClick}
      onBackdropClick={disableBackdropClick ? () => {} : onClose}
      onKeyDown={(event) => {
        if (disableEscapeKeyDown && event.key === 'Escape') {
          event.stopPropagation();
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        {actions ? (
          actions
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {showCancelButton && (
              <Button 
                variant="outline" 
                onClick={onClose}
                {...cancelButtonProps}
              >
                {cancelButtonText}
              </Button>
            )}
            {showConfirmButton && (
              <Button
                variant={confirmButtonVariant}
                onClick={handleConfirm}
                isLoading={isConfirmLoading}
                {...confirmButtonProps}
              >
                {confirmButtonText}
              </Button>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
