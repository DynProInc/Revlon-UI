import React, { useState, useCallback, useEffect } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Box, 
  Chip,
  Tooltip,
  Popper,
  ClickAwayListener,
  Grow,
  MenuList,
  MenuItem,
  Paper as MenuPaper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface SearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  showAdvancedSearch?: boolean;
  onAdvancedSearch?: () => void;
  searchHistory?: string[];
  onClearHistory?: () => void;
  onSaveSearch?: (search: string) => void;
  filters?: { label: string; value: string }[];
  onFilterRemove?: (filter: { label: string; value: string }) => void;
  onFiltersClear?: () => void;
  disabled?: boolean;
}

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  showAdvancedSearch = false,
  onAdvancedSearch,
  searchHistory = [],
  onClearHistory,
  onSaveSearch,
  filters = [],
  onFilterRemove,
  onFiltersClear,
  disabled = false,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // Handle search on Enter key
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSearch(value);
    }
  };

  // Handle clear search
  const handleClear = () => {
    onChange('');
    onSearch('');
  };

  // Handle history menu toggle
  const handleHistoryToggle = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!searchHistory.length) return;
      
      setAnchorEl(event.currentTarget);
      setHistoryOpen((prevOpen) => !prevOpen);
    },
    [searchHistory]
  );

  // Handle clicking away from history menu
  const handleClickAway = () => {
    setHistoryOpen(false);
  };

  // Handle selecting a search history item
  const handleHistoryItemClick = (item: string) => {
    onChange(item);
    onSearch(item);
    setHistoryOpen(false);
  };

  // Handle history clear
  const handleClearHistory = () => {
    if (onClearHistory) {
      onClearHistory();
    }
    setHistoryOpen(false);
  };

  // Handle saving current search
  const handleSaveSearch = () => {
    if (value && onSaveSearch) {
      onSaveSearch(value);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    return () => {
      setHistoryOpen(false);
    };
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(value);
        }}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: '8px',
          bgcolor: '#ffffff',
          boxShadow: (theme) => 
            theme.palette.mode === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        elevation={1}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search" onClick={() => onSearch(value)}>
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          inputProps={{ 'aria-label': 'search' }}
          disabled={disabled}
        />
        {value && (
          <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
            <ClearIcon />
          </IconButton>
        )}
        
        {searchHistory.length > 0 && (
          <>
            <Tooltip title="Search History">
              <IconButton sx={{ p: '10px' }} aria-label="search history" onClick={handleHistoryToggle}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            <Popper
              open={historyOpen}
              anchorEl={anchorEl}
              role={undefined}
              placement="bottom-start"
              transition
              disablePortal
              style={{ zIndex: 1000, width: anchorEl ? anchorEl.clientWidth : undefined }}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom-start' ? 'left top' : 'left bottom',
                  }}
                >
                  <MenuPaper sx={{ maxHeight: 300, overflow: 'auto', width: '100%' }}>
                    <ClickAwayListener onClickAway={handleClickAway}>
                      <MenuList autoFocusItem={historyOpen}>
                        <MenuItem 
                          sx={{ 
                            justifyContent: 'space-between', 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            py: 0.5,
                          }}
                        >
                          <span>RECENT SEARCHES</span>
                          <IconButton 
                            size="small" 
                            onClick={handleClearHistory}
                            sx={{ p: 0.5 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </MenuItem>
                        {searchHistory.map((item, index) => (
                          <MenuItem 
                            key={`${item}-${index}`} 
                            onClick={() => handleHistoryItemClick(item)}
                          >
                            <HistoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            {item}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </MenuPaper>
                </Grow>
              )}
            </Popper>
          </>
        )}
        
        {value && onSaveSearch && (
          <Tooltip title="Save Search">
            <IconButton sx={{ p: '10px' }} aria-label="save search" onClick={handleSaveSearch}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {showAdvancedSearch && onAdvancedSearch && (
          <Tooltip title="Advanced Search">
            <IconButton
              sx={{ p: '10px' }}
              aria-label="advanced search"
              onClick={onAdvancedSearch}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
      
      {filters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {filters.map((filter, index) => (
            <Chip
              key={`${filter.label}-${index}`}
              label={`${filter.label}: ${filter.value}`}
              onDelete={() => onFilterRemove && onFilterRemove(filter)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
          {filters.length > 1 && onFiltersClear && (
            <Chip
              label="Clear all filters"
              onDelete={onFiltersClear}
              size="small"
              color="default"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default Search;
