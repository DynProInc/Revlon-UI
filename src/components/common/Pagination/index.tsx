import React from 'react';
import { 
  Pagination as MuiPagination,
  PaginationItem,
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export interface PaginationProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (value: number) => void;
  rowsPerPageOptions?: number[];
  showRowsPerPage?: boolean;
  totalItems?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  count,
  page,
  onChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  showRowsPerPage = true,
  totalItems = 0,
  size = 'medium',
  disabled = false,
}) => {
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event.target.value as number);
    }
  };

  // Calculate the start and end of displayed items
  const start = totalItems === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 2,
      }}
    >
      {totalItems > 0 && (
        <Typography variant="body2" color="text.secondary">
          Showing {start} to {end} of {totalItems} entries
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
        {showRowsPerPage && onRowsPerPageChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl size="small" variant="outlined">
              <Select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                disabled={disabled}
                sx={{ minWidth: 80 }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 40 * 4.5,
                    },
                  },
                }}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        <MuiPagination
          count={count}
          page={page}
          onChange={onChange}
          disabled={disabled}
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: KeyboardArrowLeftIcon, next: KeyboardArrowRightIcon }}
              {...item}
            />
          )}
          size={size}
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>
    </Box>
  );
};

export default Pagination;
