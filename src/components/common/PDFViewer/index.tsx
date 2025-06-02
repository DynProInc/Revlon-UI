import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Button, 
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  height?: string | number;
  width?: string | number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  title,
  height = '600px',
  width = '100%'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // In a real application, these would control the PDF viewer
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Handle PDF load
  const handleLoad = () => {
    setLoading(false);
    // In a real application, you would get the total pages from the PDF document
    setTotalPages(Math.floor(Math.random() * 10) + 1);
  };

  // Handle PDF error
  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF document. The file may not exist or is not accessible.');
    console.warn(`Failed to load PDF from: ${pdfUrl}`);
  };

  // Zoom in
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 25, 200));
  };

  // Zoom out
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 25, 50));
  };

  // Go to previous page
  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  // Go to next page
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  // Download PDF
  const handleDownload = () => {
    // In a real application, this would download the PDF
    window.open(pdfUrl, '_blank');
  };

  // Open in fullscreen
  const handleFullscreen = () => {
    // In a real application, this would open the PDF in fullscreen
    window.open(pdfUrl, '_blank');
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width, 
        height, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 1
      }}
    >
      {/* PDF viewer toolbar */}
      <Box 
        sx={{ 
          p: 1, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: theme.palette.background.paper
        }}
      >
        <Typography variant="subtitle1" fontWeight={500}>
          {title || 'PDF Document'}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" alignItems="center">
            <Tooltip title="Previous Page">
              <IconButton 
                size="small" 
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ px: 1 }}>
              Page {currentPage} of {totalPages}
            </Typography>
            
            <Tooltip title="Next Page">
              <IconButton 
                size="small" 
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box display="flex" alignItems="center">
            <Tooltip title="Zoom Out">
              <IconButton 
                size="small" 
                onClick={handleZoomOut}
                disabled={zoom <= 50 || loading}
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ px: 1 }}>
              {zoom}%
            </Typography>
            
            <Tooltip title="Zoom In">
              <IconButton 
                size="small" 
                onClick={handleZoomIn}
                disabled={zoom >= 200 || loading}
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Tooltip title="Download PDF">
            <IconButton 
              size="small" 
              onClick={handleDownload}
              disabled={loading || !!error}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Open in New Tab">
            <IconButton 
              size="small" 
              onClick={handleFullscreen}
              disabled={loading || !!error}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* PDF Container */}
      <Paper
        elevation={1}
        sx={{
          height: 'calc(100% - 50px)',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        }}
      >
        {loading && (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading PDF...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body1" color="error" gutterBottom>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This might happen if the file doesn't exist or if you're running in development mode without the actual files.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.open('https://www.adobe.com/acrobat/pdf-reader.html', '_blank')}
              sx={{ mt: 1 }}
            >
              Open with Adobe Reader
            </Button>
          </Box>
        )}
        
        {!loading && !error && (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <iframe
              src={pdfUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
              title={title || 'PDF Document'}
              onLoad={handleLoad}
              onError={handleError}
            />
          </Box>
        )}
      </Paper>
    </Paper>
  );
};

export default PDFViewer;
