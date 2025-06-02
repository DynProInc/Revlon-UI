import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Snackbar, 
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification, NotificationType } from '@/context/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getSeverity = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.INFO:
      default:
        return 'info';
    }
  };

  return (
    <Stack 
      spacing={2} 
      sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 2000,
        width: { xs: 'calc(100% - 32px)', sm: '350px' }
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          sx={{ position: 'relative', mt: 0, mb: 2 }}
        >
          <Alert
            severity={getSeverity(notification.type)}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => removeNotification(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default NotificationContainer;
