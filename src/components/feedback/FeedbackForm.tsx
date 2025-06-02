import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Rating,
  Chip,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNotification } from '@/context/NotificationContext';

interface FeedbackCategory {
  id: string;
  label: string;
}

interface FeedbackFormProps {
  recordId: string;
  fieldName?: string;
  originalValue?: string;
  transformedValue?: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  recordId,
  fieldName = '',
  originalValue = '',
  transformedValue = '',
  onSubmitSuccess,
  onCancel
}) => {
  const { addNotification } = useNotification();
  
  // Feedback categories
  const feedbackCategories: FeedbackCategory[] = [
    { id: 'incorrect_transformation', label: 'Incorrect Transformation' },
    { id: 'missing_data', label: 'Missing Data' },
    { id: 'wrong_format', label: 'Wrong Format' },
    { id: 'suggestion', label: 'Suggestion' },
    { id: 'other', label: 'Other' }
  ];
  
  // State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [satisfactionRating, setSatisfactionRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [aiPerception, setAiPerception] = useState<'helpful' | 'not_helpful' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestionField, setShowSuggestionField] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    
    // Show suggestion field if the "suggestion" category is selected
    if (categoryId === 'suggestion') {
      setShowSuggestionField(true);
    } else if (categoryId === 'suggestion' && selectedCategories.includes('suggestion')) {
      setShowSuggestionField(false);
    }
  };
  
  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0 || !satisfactionRating || feedbackText.trim() === '') {
      addNotification({
        id: 'feedback-validation-error',
        type: 'error',
        message: 'Please fill in all required fields',
        title: 'Form Validation Error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success!
      setSubmitted(true);
      addNotification({
        id: 'feedback-submitted',
        type: 'success',
        message: 'Your feedback has been submitted successfully. Thank you for helping us improve!',
        title: 'Feedback Submitted'
      });
      
      // Reset form
      setTimeout(() => {
        setSelectedCategories([]);
        setSatisfactionRating(null);
        setFeedbackText('');
        setSuggestedCorrection('');
        setAiPerception('');
        setIsSubmitting(false);
        setShowSuggestionField(false);
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 1000);
      
    } catch (error) {
      setIsSubmitting(false);
      addNotification({
        id: 'feedback-error',
        type: 'error',
        message: 'Failed to submit feedback. Please try again later.',
        title: 'Submission Error'
      });
    }
  };
  
  // Reset form
  const handleReset = () => {
    setSelectedCategories([]);
    setSatisfactionRating(null);
    setFeedbackText('');
    setSuggestedCorrection('');
    setAiPerception('');
    setShowSuggestionField(false);
  };
  
  if (submitted) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom align="center">
            Thank You For Your Feedback!
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Your input helps us improve the AI transformation process and delivers better results for everyone.
          </Typography>
          <Button 
            variant="contained" 
            onClick={onCancel} 
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit Feedback
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Help us improve our AI transformation process by providing your feedback. Your insights are valuable to us!
        </Typography>
      </Box>
      
      {/* Display transformation data if available */}
      {(originalValue || transformedValue) && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          {fieldName && (
            <Typography variant="subtitle2" gutterBottom>
              Field: {fieldName}
            </Typography>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Original Value:</Typography>
              <Typography variant="body2" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, wordBreak: 'break-word' }}>
                {originalValue || 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Transformed Value:</Typography>
              <Typography variant="body2" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, wordBreak: 'break-word' }}>
                {transformedValue || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Categories */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          What type of feedback are you providing? *
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {feedbackCategories.map(category => (
            <Chip
              key={category.id}
              label={category.label}
              onClick={() => handleCategoryToggle(category.id)}
              color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
              variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Box>
      
      {/* Satisfaction Rating */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          How satisfied are you with the AI transformation? *
        </Typography>
        <Rating
          name="satisfaction-rating"
          value={satisfactionRating}
          onChange={(event, newValue) => {
            setSatisfactionRating(newValue);
          }}
          size="large"
          sx={{ mt: 1 }}
        />
      </Box>
      
      {/* AI Perception */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Was the AI transformation helpful? *
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button
            variant={aiPerception === 'helpful' ? 'contained' : 'outlined'}
            startIcon={<ThumbUpIcon />}
            onClick={() => setAiPerception('helpful')}
            color="success"
          >
            Helpful
          </Button>
          <Button
            variant={aiPerception === 'not_helpful' ? 'contained' : 'outlined'}
            startIcon={<ThumbDownIcon />}
            onClick={() => setAiPerception('not_helpful')}
            color="error"
          >
            Not Helpful
          </Button>
        </Stack>
      </Box>
      
      {/* Feedback Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Feedback Details *
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Please provide specific details about your feedback..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          variant="outlined"
          required
        />
      </Box>
      
      {/* Suggested Correction */}
      <Collapse in={showSuggestionField}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Suggested Correction
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your suggested correction..."
            value={suggestedCorrection}
            onChange={(e) => setSuggestedCorrection(e.target.value)}
            variant="outlined"
          />
        </Box>
      </Collapse>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onCancel || handleReset}
          disabled={isSubmitting}
        >
          {onCancel ? 'Cancel' : 'Reset'}
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm;
