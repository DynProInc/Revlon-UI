import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Fade,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';

export type FeedbackCategory = 'accuracy' | 'suggestion' | 'error' | 'info';
export type FeedbackFieldType = 'general' | 'specific';

export interface FeedbackField {
  id: string;
  name: string;
  currentValue: string;
  suggestedValue?: string;
  confidenceScore?: number;
}

export interface FeedbackData {
  category: FeedbackCategory;
  fieldType: FeedbackFieldType;
  fieldId?: string;
  comment: string;
  suggestedValue?: string;
  recordId: string;
}

interface FeedbackFormProps {
  /**
   * Record ID the feedback is for
   */
  recordId: string;
  
  /**
   * Available fields to provide feedback on
   */
  fields?: FeedbackField[];
  
  /**
   * Callback when feedback is submitted
   */
  onSubmit?: (feedback: FeedbackData) => Promise<void>;
  
  /**
   * Whether to show preset suggestion chips
   */
  showSuggestionChips?: boolean;
  
  /**
   * Optional element ID for testing
   */
  id?: string;
}

/**
 * Component to collect user feedback on AI transformations
 */
const FeedbackForm: React.FC<FeedbackFormProps> = ({
  recordId,
  fields = [],
  onSubmit,
  showSuggestionChips = true,
  id
}) => {
  const theme = useTheme();
  
  // Form state
  const [category, setCategory] = useState<FeedbackCategory>('accuracy');
  const [fieldType, setFieldType] = useState<FeedbackFieldType>('general');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [suggestedValue, setSuggestedValue] = useState<string>('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  
  // Get selected field data
  const selectedField = fields.find(field => field.id === selectedFieldId);
  
  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(event.target.value as FeedbackCategory);
  };
  
  // Handle field type change
  const handleFieldTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldType(event.target.value as FeedbackFieldType);
    
    // Reset field selection when switching to general
    if (event.target.value === 'general') {
      setSelectedFieldId('');
    }
  };
  
  // Handle comment change
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };
  
  // Handle suggested value change
  const handleSuggestedValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSuggestedValue(event.target.value);
  };
  
  // Handle field selection
  const handleFieldSelection = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    
    // Pre-fill suggested value field if available
    const field = fields.find(f => f.id === fieldId);
    if (field && field.suggestedValue) {
      setSuggestedValue(field.suggestedValue);
    } else {
      setSuggestedValue('');
    }
  };
  
  // Handle suggestion chip click
  const handleSuggestionChipClick = (suggestion: string) => {
    setComment(prev => prev + (prev ? ' ' : '') + suggestion);
  };
  
  // Reset form
  const resetForm = () => {
    setCategory('accuracy');
    setFieldType('general');
    setSelectedFieldId('');
    setComment('');
    setSuggestedValue('');
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!onSubmit) return;
    
    // Validate form
    if (!comment.trim()) {
      setSubmitStatus('error');
      setSubmitMessage('Please provide a comment');
      return;
    }
    
    // Prepare feedback data
    const feedbackData: FeedbackData = {
      category,
      fieldType,
      comment: comment.trim(),
      recordId
    };
    
    // Add field-specific data if applicable
    if (fieldType === 'specific' && selectedFieldId) {
      feedbackData.fieldId = selectedFieldId;
      
      if (suggestedValue.trim()) {
        feedbackData.suggestedValue = suggestedValue.trim();
      }
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await onSubmit(feedbackData);
      setSubmitStatus('success');
      setSubmitMessage('Feedback submitted successfully');
      
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get category icon
  const getCategoryIcon = (cat: FeedbackCategory) => {
    switch (cat) {
      case 'accuracy':
        return category === 'accuracy' ? <ThumbUpIcon color="primary" /> : <ThumbUpIcon />;
      case 'suggestion':
        return category === 'suggestion' ? <InfoIcon color="primary" /> : <InfoIcon />;
      case 'error':
        return category === 'error' ? <BugReportIcon color="primary" /> : <BugReportIcon />;
      case 'info':
        return category === 'info' ? <InfoIcon color="primary" /> : <InfoIcon />;
      default:
        return null;
    }
  };
  
  // Suggestion chips by category
  const suggestionsByCategory: Record<FeedbackCategory, string[]> = {
    accuracy: [
      'The transformation is correct',
      'The value needs correction',
      'Partial match only',
      'Wrong value extracted'
    ],
    suggestion: [
      'Consider adding validation for this field',
      'This pattern occurs frequently',
      'Consider a new transformation rule',
      'This is a special case'
    ],
    error: [
      'Wrong field mapping',
      'Data format issue',
      'Missing required data',
      'Incorrect calculation'
    ],
    info: [
      'Additional context needed',
      'Field contains multiple values',
      'Special formatting required',
      'Needs human verification'
    ]
  };
  
  return (
    <Paper
      id={id}
      variant="outlined"
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 1,
        borderColor: theme.palette.divider,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Provide AI Feedback
      </Typography>
      
      {submitStatus === 'success' && (
        <Fade in={true}>
          <Alert 
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success" 
            sx={{ mb: 2 }}
          >
            {submitMessage}
          </Alert>
        </Fade>
      )}
      
      {submitStatus === 'error' && (
        <Fade in={true}>
          <Alert 
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            severity="error" 
            sx={{ mb: 2 }}
          >
            {submitMessage}
          </Alert>
        </Fade>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Feedback Category</FormLabel>
          <RadioGroup
            row
            name="feedback-category"
            value={category}
            onChange={handleCategoryChange}
          >
            <FormControlLabel 
              value="accuracy" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Accuracy</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="suggestion" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Suggestion</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="error" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BugReportIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Error</Typography>
                </Box>
              } 
            />
            <FormControlLabel 
              value="info" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Information</Typography>
                </Box>
              } 
            />
          </RadioGroup>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Feedback Type</FormLabel>
          <RadioGroup
            row
            name="feedback-type"
            value={fieldType}
            onChange={handleFieldTypeChange}
          >
            <FormControlLabel value="general" control={<Radio />} label="General Feedback" />
            <FormControlLabel value="specific" control={<Radio />} label="Field-Specific Feedback" />
          </RadioGroup>
        </FormControl>
      </Box>
      
      {fieldType === 'specific' && (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <FormLabel component="legend" sx={{ mb: 1 }}>Select Field</FormLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {fields.map((field) => (
                <Chip
                  key={field.id}
                  label={field.name}
                  onClick={() => handleFieldSelection(field.id)}
                  variant={selectedFieldId === field.id ? 'filled' : 'outlined'}
                  color={selectedFieldId === field.id ? 'primary' : 'default'}
                  sx={{ 
                    mb: 1,
                    '& .MuiChip-label': {
                      overflow: 'visible'
                    }
                  }}
                />
              ))}
              
              {fields.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No fields available for feedback
                </Typography>
              )}
            </Box>
          </FormControl>
        </Box>
      )}
      
      {fieldType === 'specific' && selectedField && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Field Value
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {selectedField.currentValue || '(empty)'}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <FormControl fullWidth variant="outlined">
            <FormLabel component="legend">Suggested Correction</FormLabel>
            <TextField
              value={suggestedValue}
              onChange={handleSuggestedValueChange}
              fullWidth
              placeholder="Enter suggested value"
              multiline
              maxRows={3}
              margin="normal"
              variant="outlined"
              size="small"
            />
          </FormControl>
        </Box>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormLabel component="legend">Feedback</FormLabel>
        <TextField
          value={comment}
          onChange={handleCommentChange}
          fullWidth
          placeholder="Provide detailed feedback"
          multiline
          minRows={3}
          maxRows={6}
          margin="normal"
          variant="outlined"
          required
          error={submitStatus === 'error' && !comment.trim()}
        />
      </Box>
      
      {showSuggestionChips && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            Suggested feedback (click to add):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestionsByCategory[category].map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                size="small"
                onClick={() => handleSuggestionChipClick(suggestion)}
                sx={{ mb: 0.5 }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FeedbackForm;
