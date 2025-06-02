import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Paper, IconButton, Tooltip, Alert } from '@mui/material';
import { ZoomIn, ZoomOut, Fullscreen, FullscreenExit, Refresh } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  scale?: number;
  onScaleChange?: (newScale: number) => void;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  url, 
  scale = 1.0, 
  onScaleChange,
  isFullscreen = false,
  onFullscreenToggle
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    // Create a more detailed error message
    setError(`Failed to load PDF document: ${error.message}. Please check if the file exists in the correct location.`);
    setLoading(false);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.25, 3.0);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.25, 0.5);
    if (onScaleChange) {
      onScaleChange(newScale);
    }
  };

  const handleFullscreenToggle = () => {
    if (onFullscreenToggle) {
      onFullscreenToggle();
    }
  };

  // Function to clean up URL if needed
  const cleanUrl = (url: string) => {
    // Remove any double extensions like .pdf.pdf
    if (url.endsWith('.pdf.pdf')) {
      return url.substring(0, url.length - 4);
    }
    return url;
  };

  // Handle retry
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force a re-render
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          height: '100vh',
          width: '100vw',
          borderRadius: 0,
        })
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">
          {numPages ? `Page ${pageNumber} of ${numPages}` : 'PDF Viewer'}
        </Typography>
        <Box>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} disabled={scale >= 3.0}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={handleFullscreenToggle}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 2,
        backgroundColor: '#f5f5f5'
      }}>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            bgcolor: 'rgba(255, 255, 255, 0.8)'
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading PDF...
            </Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            p: 2
          }}>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The PDF document could not be loaded. Please check that the file exists in the public folder.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton color="primary" onClick={handleRetry}>
                <Refresh />
              </IconButton>
              <Typography variant="body2" sx={{ lineHeight: '40px' }}>Retry loading</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              URL: {cleanUrl(url)}
            </Typography>
          </Box>
        )}
        
        {!error && (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'auto',
            '& .react-pdf__Document': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '100%',
              justifyContent: 'flex-start',
            }
          }}>
            <Document
              file={cleanUrl(url)}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<CircularProgress size={20} />}
                />
              ))}
            </Document>
          </Box>
        )}
      </Box>

      {numPages && numPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <IconButton 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
          >
            &lt;
          </IconButton>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            {pageNumber} / {numPages}
          </Typography>
          <IconButton 
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            &gt;
          </IconButton>
        </Box>
      )}
    </Paper>
  );
};

export default PDFViewer;
