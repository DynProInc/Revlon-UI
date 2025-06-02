import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'text';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  startIcon,
  className = '',
  ...props
}) => {
  // Map custom variants to MUI variants and colors
  const getMuiProps = () => {
    switch (variant) {
      case 'primary':
        return { variant: 'contained', color: 'primary' };
      case 'secondary':
        return { variant: 'contained', color: 'secondary' };
      case 'success':
        return { variant: 'contained', color: 'success' };
      case 'warning':
        return { variant: 'contained', color: 'warning' };
      case 'error':
        return { variant: 'contained', color: 'error' };
      case 'outline':
        return { variant: 'outlined', color: 'primary' };
      case 'text':
        return { variant: 'text', color: 'primary' };
      default:
        return { variant: 'contained', color: 'primary' };
    }
  };

  const { variant: muiVariant, color } = getMuiProps();

  return (
    <MuiButton
      variant={muiVariant as any}
      color={color as any}
      disabled={disabled || isLoading}
      startIcon={isLoading ? undefined : startIcon}
      className={`${className}`}
      {...props}
    >
      {isLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            left: '50%',
            marginLeft: '-12px',
          }}
        />
      )}
      <span className={isLoading ? 'invisible' : 'visible'}>{children}</span>
    </MuiButton>
  );
};

export default Button;
