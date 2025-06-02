import React, { useState } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NoDataIcon from '@mui/icons-material/InboxOutlined';
import Pagination from '@/components/common/Pagination';

export type Column<T> = {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
};

type Order = 'asc' | 'desc';

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  showPagination?: boolean;
  page?: number;
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  totalItems?: number;
  loading?: boolean;
  emptyStateMessage?: string;
  sortable?: boolean;
  sx?: any; // Add sx prop for styling
  onSort?: (property: string, order: Order) => void;
  defaultSortBy?: string;
  defaultOrder?: Order;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectRows?: (selectedRowIds: (string | number)[]) => void;
  actions?: (item: T) => React.ReactNode;
  rowActions?: (item: T) => React.ReactNode;
  getRowClassName?: (item: T) => string;
  getRowId?: (item: T) => string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

const Table = <T extends {}>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  showPagination = false,
  page = 1,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  totalItems = 0,
  loading = false,
  emptyStateMessage = 'No data available',
  sortable = false,
  onSort,
  defaultSortBy = '',
  defaultOrder = 'asc',
  selectable = false,
  selectedRows = [],
  onSelectRows,
  actions,
  rowActions,
  getRowClassName,
  getRowId,
  stickyHeader = true,
  maxHeight = 600,
  sx,
}: TableProps<T>) => {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [orderBy, setOrderBy] = useState<string>(defaultSortBy);
  const visibleColumns = columns.filter(column => !column.hidden);

  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);
    
    if (onSort) {
      onSort(property, newOrder);
    }
  };

  // Handle row selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectRows) {
      if (event.target.checked) {
        // Select all rows
        const newSelectedRows = data.map((row) => keyExtractor(row));
        onSelectRows(newSelectedRows);
      } else {
        // Deselect all rows
        onSelectRows([]);
      }
    }
  };

  // Handle single row selection
  const handleRowSelect = (event: React.MouseEvent<HTMLButtonElement>, id: string | number) => {
    event.stopPropagation();
    
    if (onSelectRows) {
      const selectedIndex = selectedRows.indexOf(id);
      let newSelected: (string | number)[] = [];

      if (selectedIndex === -1) {
        newSelected = [...selectedRows, id];
      } else {
        newSelected = selectedRows.filter((rowId) => rowId !== id);
      }

      onSelectRows(newSelected);
    }
  };

  // Calculate number of pages
  const pageCount = Math.ceil(totalItems / rowsPerPage);

  // Check if a row is selected
  const isRowSelected = (id: string | number) => selectedRows.indexOf(id) !== -1;

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: maxHeight,
            boxShadow: theme.shadows[2]
          }}
        >
          <MuiTable stickyHeader={stickyHeader}>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
                  >
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
                {(actions || rowActions) && <TableCell align="right" width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(new Array(5)).map((_, index) => (
                <TableRow hover tabIndex={-1} key={index}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={24} height={24} />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      <Skeleton variant="text" width="100%" />
                    </TableCell>
                  ))}
                  {(actions || rowActions) && (
                    <TableCell align="right">
                      <Skeleton variant="circular" width={40} height={40} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        {showPagination && (
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={40} />
          </Box>
        )}
      </Box>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper 
          elevation={2}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 4,
            minHeight: 300
          }}
        >
          <NoDataIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {emptyStateMessage}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: stickyHeader ? maxHeight : 'none',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          ...(sx || {}),
        }}
      >
        <MuiTable stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                    color="primary"
                  />
                </TableCell>
              )}
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    minWidth: column.minWidth, 
                    maxWidth: column.maxWidth,
                    fontWeight: 600,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.default, 0.9)
                      : alpha(theme.palette.background.paper, 0.9),
                  }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {(actions || rowActions) && (
                <TableCell 
                  align="right" 
                  width={60}
                  style={{
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.default, 0.9)
                      : alpha(theme.palette.background.paper, 0.9),
                  }}
                >
                  {typeof actions === 'function' ? null : actions}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => {
              const rowId = keyExtractor(row);
              const isItemSelected = isRowSelected(rowId);
              const rowClassName = getRowClassName ? getRowClassName(row) : '';
              const rowIdAttribute = getRowId ? { id: getRowId(row) } : {};

              return (
                <TableRow
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={rowId}
                  selected={isItemSelected}
                  className={rowClassName}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                  }}
                  {...rowIdAttribute}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => handleRowSelect(event, rowId)}
                        color="primary"
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => {
                    const value = (row as any)[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? 
                          <>{column.format(value, row)}</> : 
                          value
                        }
                      </TableCell>
                    );
                  })}
                  {(actions || rowActions) && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {rowActions && typeof rowActions === 'function' ? 
                        <>{rowActions(row)}</> : 
                        null
                      }
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>
      
      {showPagination && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={onPageChange!}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          totalItems={totalItems}
          disabled={loading}
        />
      )}
    </Box>
  );
};

export default Table;
