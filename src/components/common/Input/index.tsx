import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  FormControl, 
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  type?: string;
  options?: Array<{ value: string | number; label: string }>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error = false,
  helperText,
  type = 'text',
  options,
  startAdornment,
  endAdornment,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  // Password visibility toggle
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // If type is select, render a select input
  if (type === 'select' && options) {
    return (
      <FormControl fullWidth error={error} size={props.size}>
        <InputLabel id={`${props.id || label}-label`}>{label}</InputLabel>
        <Select
          labelId={`${props.id || label}-label`}
          id={props.id}
          value={props.value}
          label={label}
          onChange={props.onChange}
          name={props.name}
          disabled={props.disabled}
          defaultValue={props.defaultValue}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  // If type is checkbox, render a checkbox
  if (type === 'checkbox') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={props.value as boolean}
            onChange={props.onChange}
            name={props.name}
            color="primary"
            disabled={props.disabled}
          />
        }
        label={label || ''}
      />
    );
  }

  // For password input, handle visibility toggle
  if (type === 'password') {
    const inputProps = {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            edge="end"
            size="small"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    };

    return (
      <TextField
        {...props}
        type={showPassword ? 'text' : 'password'}
        label={label}
        error={error}
        helperText={helperText}
        fullWidth
        variant="outlined"
        InputProps={inputProps}
      />
    );
  }

  // For regular inputs with optional adornments
  const inputProps: any = {};
  if (startAdornment) {
    inputProps.startAdornment = (
      <InputAdornment position="start">{startAdornment}</InputAdornment>
    );
  }
  if (endAdornment) {
    inputProps.endAdornment = (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    );
  }

  // Default text input
  return (
    <TextField
      {...props}
      type={type}
      label={label}
      error={error}
      helperText={helperText}
      fullWidth
      variant="outlined"
      InputProps={Object.keys(inputProps).length ? inputProps : undefined}
    />
  );
};

export default Input;
