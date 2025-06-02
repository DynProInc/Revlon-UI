import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox,
  Typography,
  Skeleton,
  useTheme
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
  hidden?: boolean;
}

export interface VirtualizedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  rowHeight?: number;
  selectableRows?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  initialSortBy?: string;
  initialSortDirection?: SortDirection;
  // For pagination or infinite loading
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSortChange?: (column: string, direction: SortDirection) => void;
  highlightedRowIds?: (string | number)[];
  emptyStateMessage?: string;
  stickyHeader?: boolean;
}

function VirtualizedTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  onRowClick,
  rowHeight = 56,
  selectableRows = false,
  onSelectionChange,
  initialSortBy,
  initialSortDirection = 'asc',
  hasNextPage = false,
  onLoadMore,
  onSortChange,
  highlightedRowIds = [],
  emptyStateMessage = 'No data available',
  stickyHeader = true
}: VirtualizedTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [sortedData, setSortedData] = useState<T[]>([]);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  
  const theme = useTheme();

  // Filter visible columns
  const visibleColumns = columns.filter(col => !col.hidden);

  // Sort data when sort parameters change
  useEffect(() => {
    if (!sortBy) {
      setSortedData([...data]);
      return;
    }

    const column = columns.find(col => col.id === sortBy);
    
    if (column && column.sortable) {
      const sorted = [...data].sort((a: T, b: T) => {
        // Use custom sort function if provided
        if (column.sortFn) {
          return column.sortFn(a, b, sortDirection);
        }
        
        // Default sort
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        
        if (sortDirection === 'asc') {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        } else {
          if (aValue > bValue) return -1;
          if (aValue < bValue) return 1;
          return 0;
        }
      });
      
      setSortedData(sorted);
    } else {
      setSortedData([...data]);
    }
  }, [data, sortBy, sortDirection, columns]);

  // Update selections when data changes
  useEffect(() => {
    if (selectableRows && onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows, selectableRows, onSelectionChange]);

  // Handle sort request
  const handleRequestSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortBy(columnId);
    
    if (onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };

  // Row click handler
  const handleRowClick = useCallback((item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  }, [onRowClick]);

  // Select all rows
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(sortedData);
    } else {
      setSelectedRows([]);
    }
  };

  // Select a single row
  const handleSelectRow = (event: React.MouseEvent<HTMLButtonElement>, item: T) => {
    event.stopPropagation();
    
    const id = keyExtractor(item);
    const selectedIndex = selectedRows.findIndex(row => keyExtractor(row) === id);
    
    let newSelected: T[] = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selectedRows, item];
    } else {
      newSelected = [
        ...selectedRows.slice(0, selectedIndex),
        ...selectedRows.slice(selectedIndex + 1)
      ];
    }
    
    setSelectedRows(newSelected);
  };

  // Check if a row is selected
  const isSelected = (item: T) => {
    return selectedRows.findIndex(row => keyExtractor(row) === keyExtractor(item)) !== -1;
  };

  // Row renderer for virtualized list
  const RowRenderer = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    if (index >= sortedData.length && !loading) {
      // Load more when we reach the end
      if (hasNextPage && onLoadMore) {
        onLoadMore();
      }
      return null;
    }
    
    // Show loading placeholder for not-yet-loaded items
    if (index >= sortedData.length && loading) {
      return (
        <TableRow 
          hover 
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {selectableRows && (
            <TableCell 
              padding="checkbox"
              style={{ 
                width: 48,
                flexShrink: 0 
              }}
            >
              <Skeleton variant="circular" width={24} height={24} />
            </TableCell>
          )}
          {visibleColumns.map((column, colIndex) => (
            <TableCell
              key={`loading-${index}-${colIndex}`}
              align={column.align || 'left'}
              style={{ 
                flex: column.minWidth ? `0 0 ${column.minWidth}px` : 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      );
    }
    
    // Normal data row
    const item = sortedData[index];
    const isItemSelected = selectableRows ? isSelected(item) : false;
    const itemId = keyExtractor(item);
    const isHighlighted = highlightedRowIds.includes(itemId);
    
    return (
      <TableRow
        hover
        onClick={() => handleRowClick(item)}
        role="checkbox"
        aria-checked={isItemSelected}
        selected={isItemSelected}
        tabIndex={-1}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          cursor: onRowClick ? 'pointer' : 'default',
          backgroundColor: isHighlighted 
            ? theme.palette.mode === 'dark' 
              ? 'rgba(144, 202, 249, 0.16)'
              : 'rgba(33, 150, 243, 0.08)'
            : (hoveredRowIndex === index ? theme.palette.action.hover : 'inherit')
        }}
        onMouseEnter={() => setHoveredRowIndex(index)}
        onMouseLeave={() => setHoveredRowIndex(null)}
      >
        {selectableRows && (
          <TableCell 
            padding="checkbox"
            style={{ 
              width: 48,
              flexShrink: 0 
            }}
            onClick={(event) => handleSelectRow(event as any, item)}
          >
            <Checkbox
              checked={isItemSelected}
              inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${index}` }}
              color="primary"
            />
          </TableCell>
        )}
        
        {visibleColumns.map((column) => {
          const value = (item as any)[column.id];
          return (
            <TableCell
              key={`${itemId}-${column.id}`}
              align={column.align || 'left'}
              style={{ 
                flex: column.minWidth ? `0 0 ${column.minWidth}px` : 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {column.format ? column.format(value) : value}
            </TableCell>
          );
        })}
      </TableRow>
    );
  }, [
    sortedData, 
    loading, 
    visibleColumns, 
    selectableRows, 
    selectedRows, 
    onLoadMore, 
    hasNextPage, 
    handleRowClick, 
    keyExtractor, 
    highlightedRowIds, 
    theme, 
    hoveredRowIndex
  ]);

  // Header renderer
  const TableHeaderRenderer = useCallback(() => (
    <TableHead>
      <TableRow style={{ display: 'flex' }}>
        {selectableRows && (
          <TableCell
            padding="checkbox"
            style={{ 
              width: 48,
              flexShrink: 0 
            }}
          >
            <Checkbox
              indeterminate={selectedRows.length > 0 && selectedRows.length < sortedData.length}
              checked={sortedData.length > 0 && selectedRows.length === sortedData.length}
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
              flex: column.minWidth ? `0 0 ${column.minWidth}px` : 1,
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            sortDirection={sortBy === column.id ? sortDirection : false}
          >
            {column.sortable ? (
              <TableSortLabel
                active={sortBy === column.id}
                direction={sortBy === column.id ? sortDirection : 'asc'}
                onClick={() => handleRequestSort(column.id)}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  ), [visibleColumns, sortBy, sortDirection, selectableRows, selectedRows, sortedData]);

  // Empty state renderer
  const EmptyStateRenderer = useCallback(() => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4,
        height: 200
      }}
    >
      <Typography variant="body1" color="textSecondary">
        {loading ? 'Loading data...' : emptyStateMessage}
      </Typography>
    </Box>
  ), [loading, emptyStateMessage]);

  // Function to determine if an item is loaded
  const isItemLoaded = (index: number) => {
    return !hasNextPage || index < sortedData.length;
  };

  // Calculate total items
  const itemCount = hasNextPage ? sortedData.length + 1 : sortedData.length;

  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 1,
        bgcolor: 'background.paper'
      }}
    >
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          maxHeight: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Table stickyHeader={stickyHeader} aria-label="virtualized table" style={{ tableLayout: 'fixed' }}>
          <TableHeaderRenderer />
        </Table>
        
        {sortedData.length === 0 && !loading ? (
          <EmptyStateRenderer />
        ) : (
          <Box sx={{ flex: 1, height: '100%', width: '100%' }}>
            <AutoSizer>
              {({ height, width }) => (
                <InfiniteLoader
                  isItemLoaded={isItemLoaded}
                  itemCount={itemCount}
                  loadMoreItems={onLoadMore || (() => {})}
                  threshold={5}
                >
                  {({ onItemsRendered, ref }) => (
                    <List
                      ref={ref}
                      height={height}
                      width={width}
                      itemCount={itemCount}
                      itemSize={rowHeight}
                      onItemsRendered={onItemsRendered}
                    >
                      {RowRenderer}
                    </List>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </Box>
        )}
      </TableContainer>
    </Paper>
  );
}

export default VirtualizedTable;
