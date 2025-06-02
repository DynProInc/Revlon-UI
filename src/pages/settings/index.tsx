import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  IconButton,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Badge,
  Stack,
  Fade,
  Collapse,
  Chip,
  InputAdornment,
  Skeleton,
  useMediaQuery,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Backdrop
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Api as ApiIcon,
  Person as PersonIcon,
  DataUsage as DataUsageIcon,
  Sync as SyncIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ColorLens as ColorLensIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  BrightnessAuto as BrightnessAutoIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import { ThemeContext } from '@/context/ThemeContext';

// Settings tab types
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addNotification } = useNotification();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for settings
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User profile settings
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatar || '',
    notificationsEnabled: true
  });
  
  // API settings
  const [apiSettings, setApiSettings] = useState({
    apiEndpoint: 'https://api.example.com/v1',
    apiKey: 'sk_************************************',
    timeout: '30000',
    maxRetries: '3'
  });
  
  // Application settings
  const [appSettings, setAppSettings] = useState({
    defaultPageSize: '20',
    autoRefreshInterval: '0',
    enableDetailedLogs: false,
    enableAutoSave: true
  });
  
  // Data settings
  const [dataSettings, setDataSettings] = useState({
    confidenceThreshold: '0.75',
    autoApproveHighConfidence: false,
    maxExportSize: '1000',
    exportDefaultFormat: 'JSON'
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: darkMode,
    primaryColor: '#0ea5e9',
    secondaryColor: '#8b5cf6'
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle user profile change
  const handleUserProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: name === 'notificationsEnabled' ? checked : value
    });
  };
  
  // Handle API settings change
  const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiSettings({
      ...apiSettings,
      [name]: value
    });
  };
  
  // Handle app settings change
  const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setAppSettings({
      ...appSettings,
      [name]: name === 'enableDetailedLogs' || name === 'enableAutoSave' ? checked : value
    });
  };
  
  // Handle data settings change
  const handleDataSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setDataSettings({
      ...dataSettings,
      [name]: name === 'autoApproveHighConfidence' ? checked : value
    });
  };
  
  // Handle theme settings change
  const handleThemeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'darkMode') {
      toggleTheme();
      setThemeSettings({
        ...themeSettings,
        darkMode: checked
      });
    } else {
      setThemeSettings({
        ...themeSettings,
        [name]: value
      });
    }
  };
  
  // Handle save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would call an API to save the settings
      console.log('Saving settings:', {
        userProfile,
        apiSettings,
        appSettings,
        dataSettings,
        themeSettings
      });
      
      setSaveSuccess(true);
      addNotification({
        type: NotificationType.SUCCESS,
        message: 'Your settings have been saved successfully',
        title: 'Settings Saved'
      });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification({
        type: NotificationType.ERROR,
        message: 'Failed to save settings. Please try again.',
        title: 'Error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle API test
  const handleTestApiConnection = async () => {
    setIsTestingApi(true);
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would make a test request to the API
      addNotification({
        type: NotificationType.SUCCESS,
        message: 'Successfully connected to the API',
        title: 'API Connection'
      });
    } catch (error) {
      console.error('Error testing API connection:', error);
      addNotification({
        type: NotificationType.ERROR,
        message: 'Failed to connect to the API. Please check your settings.',
        title: 'API Connection Error'
      });
    } finally {
      setIsTestingApi(false);
    }
  };
  
  // Add loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Memoized tab content for better performance
  const tabItems = [
    { 
      icon: <PersonIcon />, 
      label: 'User Profile',
      disabled: false,
      description: 'Manage your personal information and notification preferences'
    },
    { 
      icon: <PaletteIcon />, 
      label: 'Appearance',
      disabled: false,
      description: 'Customize the application appearance and theme'
    },
    { 
      icon: <ApiIcon />, 
      label: 'API Configuration',
      disabled: !hasPermission(UserRole.ADMIN),
      description: 'Configure API endpoints and authentication settings'
    },
    { 
      icon: <DataUsageIcon />, 
      label: 'Data Settings',
      disabled: !hasPermission([UserRole.ADMIN, UserRole.DATA_STEWARD]),
      description: 'Manage data processing and validation settings'
    },
    { 
      icon: <SyncIcon />, 
      label: 'Application Settings',
      disabled: false,
      description: 'Configure general application behavior and preferences'
    },
  ];
  
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your account and application preferences
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={isSaving}
          sx={{ 
            borderRadius: '8px',
            px: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          {isSaving ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </Box>
      
      {/* Save success notification */}
      <Collapse in={saveSuccess}>
        <Alert 
          severity="success"
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: 1,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
          icon={<CheckIcon fontSize="inherit" />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSaveSuccess(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="body2" fontWeight="medium">
            Settings saved successfully!
          </Typography>
        </Alert>
      </Collapse>
      
      <Grid container spacing={3}>
        {/* Sidebar for desktop, tabs for mobile */}
        {isMobile ? (
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="settings tabs"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                }}
              >
                {tabItems.map((item, index) => (
                  <Tab 
                    key={index}
                    icon={item.icon} 
                    iconPosition="start" 
                    label={item.label} 
                    disabled={item.disabled}
                    sx={{ 
                      textTransform: 'none',
                      minHeight: 48,
                      fontWeight: activeTab === index ? 'bold' : 'normal',
                    }}
                  />
                ))}
              </Tabs>
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12} md={3}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '100%',
                overflow: 'hidden'
              }}
            >
              <List 
                component="nav" 
                sx={{ 
                  p: 0,
                  '& .MuiListItem-root': {
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                  },
                  '& .MuiListItem-root.Mui-selected': {
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                  '& .MuiListItem-root:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }
                }}
              >
                {tabItems.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    selected={activeTab === index}
                    onClick={(e) => handleTabChange(e, index)}
                    disabled={item.disabled}
                    sx={{ py: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          bgcolor: activeTab === index ? 
                            alpha(theme.palette.primary.main, 0.1) : 
                            alpha(theme.palette.grey[500], 0.1),
                          color: activeTab === index ? 
                            theme.palette.primary.main : 
                            theme.palette.text.secondary,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight={activeTab === index ? 'medium' : 'normal'}
                          color={activeTab === index ? 'primary.main' : 'text.primary'}
                        >
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12} md={9}>
          <Card 
            elevation={0} 
            sx={{ 
              p: 0, 
              minHeight: 600,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            {isLoading ? (
              <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rectangular" height={40} width="30%" sx={{ borderRadius: 1 }} />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <>
            {/* User Profile Tab */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>
                User Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage your personal information and notification preferences.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={userProfile.name}
                    onChange={handleUserProfileChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={userProfile.email}
                    onChange={handleUserProfileChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Avatar URL"
                    name="avatarUrl"
                    value={userProfile.avatarUrl}
                    onChange={handleUserProfileChange}
                    margin="normal"
                    helperText="Enter the URL of your profile image"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userProfile.notificationsEnabled}
                        onChange={handleUserProfileChange}
                        name="notificationsEnabled"
                        color="primary"
                      />
                    }
                    label="Enable Notifications"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Theme Settings Tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Customize the application appearance and theme.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Dark Mode" 
                    secondary="Switch between light and dark themes"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={themeSettings.darkMode}
                      onChange={handleThemeSettingsChange}
                      name="darkMode"
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Primary Color" 
                    secondary="Choose the main color for buttons and active elements"
                  />
                  <ListItemSecondaryAction>
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({
                        ...themeSettings,
                        primaryColor: e.target.value
                      })}
                      style={{ width: 40, height: 40, cursor: 'pointer', border: 'none' }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Secondary Color" 
                    secondary="Choose the secondary color for accents and highlights"
                  />
                  <ListItemSecondaryAction>
                    <input
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings({
                        ...themeSettings,
                        secondaryColor: e.target.value
                      })}
                      style={{ width: 40, height: 40, cursor: 'pointer', border: 'none' }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Alert severity="info" sx={{ mt: 3 }}>
                Some theme changes may require a page refresh to take full effect.
              </Alert>
            </TabPanel>
            
            {/* API Configuration Tab */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure API settings for data processing and integration.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Endpoint"
                    name="apiEndpoint"
                    value={apiSettings.apiEndpoint}
                    onChange={handleApiSettingsChange}
                    margin="normal"
                    helperText="The base URL of the API server"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Key"
                    name="apiKey"
                    value={apiSettings.apiKey}
                    onChange={handleApiSettingsChange}
                    margin="normal"
                    type="password"
                    helperText="Your API authentication key"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Timeout (ms)"
                    name="timeout"
                    value={apiSettings.timeout}
                    onChange={handleApiSettingsChange}
                    margin="normal"
                    type="number"
                    inputProps={{ min: 1000, step: 1000 }}
                    helperText="Request timeout in milliseconds"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Retries"
                    name="maxRetries"
                    value={apiSettings.maxRetries}
                    onChange={handleApiSettingsChange}
                    margin="normal"
                    type="number"
                    inputProps={{ min: 0, max: 10 }}
                    helperText="Maximum number of retry attempts"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={isTestingApi ? <CircularProgress size={20} /> : <RefreshIcon />}
                    onClick={handleTestApiConnection}
                    disabled={isTestingApi}
                    sx={{ mt: 1 }}
                  >
                    {isTestingApi ? 'Testing...' : 'Test API Connection'}
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Data Settings Tab */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h6" gutterBottom>
                Data Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure data processing and approval settings.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confidence Threshold"
                    name="confidenceThreshold"
                    value={dataSettings.confidenceThreshold}
                    onChange={handleDataSettingsChange}
                    margin="normal"
                    type="number"
                    inputProps={{ min: 0, max: 1, step: 0.05 }}
                    helperText="Minimum confidence score for high confidence classification (0-1)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Export Size"
                    name="maxExportSize"
                    value={dataSettings.maxExportSize}
                    onChange={handleDataSettingsChange}
                    margin="normal"
                    type="number"
                    inputProps={{ min: 1, step: 100 }}
                    helperText="Maximum number of records in exports"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSettings.autoApproveHighConfidence}
                        onChange={handleDataSettingsChange}
                        name="autoApproveHighConfidence"
                        color="primary"
                      />
                    }
                    label="Auto-approve records with high confidence"
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Application Settings Tab */}
            <TabPanel value={activeTab} index={4}>
              <Typography variant="h6" gutterBottom>
                Application Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure general application behavior and preferences.
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Default Page Size"
                    name="defaultPageSize"
                    value={appSettings.defaultPageSize}
                    onChange={handleAppSettingsChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">items</InputAdornment>,
                    }}
                    helperText="Number of items to show per page"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Auto-refresh Interval"
                    name="autoRefreshInterval"
                    value={appSettings.autoRefreshInterval}
                    onChange={handleAppSettingsChange}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">seconds</InputAdornment>,
                    }}
                    helperText="0 to disable auto-refresh"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appSettings.enableDetailedLogs}
                        onChange={handleAppSettingsChange}
                        name="enableDetailedLogs"
                        color="primary"
                      />
                    }
                    label="Enable detailed logs"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={appSettings.enableAutoSave}
                        onChange={handleAppSettingsChange}
                        name="enableAutoSave"
                        color="primary"
                      />
                    }
                    label="Enable auto-save for forms"
                  />
                </Grid>
              </Grid>
            </TabPanel>
              </>
            )}
          </Card>
          
          {/* Save button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveSettings}
              disabled={isSaving}
              size="large"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
