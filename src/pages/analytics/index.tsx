import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Stack,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  DataUsage as DataUsageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { mockRecords, RecordStatus, ConfidenceLevel } from '@/mock-data/records';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  ChartTooltip, 
  Legend
);

// Mock AI performance data for trend charts
const mockAIPerformanceData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  accuracy: [76, 78, 82, 84, 87, 91],
  errorRate: [24, 22, 18, 16, 13, 9],
  processingTime: [850, 820, 780, 760, 720, 680]
};

// Time period options
enum TimePeriod {
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time'
}

// Analytics tab values
enum TabValue {
  OVERVIEW = 'overview',
  ACCURACY = 'accuracy',
  PERFORMANCE = 'performance',
  FEEDBACK = 'feedback'
}

const AnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.LAST_6_MONTHS);
  const [tabValue, setTabValue] = useState<TabValue>(TabValue.OVERVIEW);
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics overview stats
  const [stats, setStats] = useState({
    totalRecords: 0,
    approvedRecords: 0,
    rejectedRecords: 0,
    pendingRecords: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    averageAccuracy: 0,
    processingTime: 0,
    improvementRate: 0,
  });
  
  // Load data on mount
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      calculateStats();
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate stats from mock data
  const calculateStats = () => {
    const totalRecords = mockRecords.length;
    const approvedRecords = mockRecords.filter(r => r.status === RecordStatus.APPROVED).length;
    const rejectedRecords = mockRecords.filter(r => r.status === RecordStatus.REJECTED).length;
    const pendingRecords = mockRecords.filter(r => r.status === RecordStatus.PENDING).length;
    
    const highConfidence = mockRecords.filter(r => r.aiConfidence.overall === ConfidenceLevel.HIGH).length;
    const mediumConfidence = mockRecords.filter(r => r.aiConfidence.overall === ConfidenceLevel.MEDIUM).length;
    const lowConfidence = mockRecords.filter(r => r.aiConfidence.overall === ConfidenceLevel.LOW).length;
    
    // Calculate mock accuracy (based on confidence and status)
    let accuracySum = 0;
    mockRecords.forEach(record => {
      if (record.aiConfidence.overall === ConfidenceLevel.HIGH) {
        accuracySum += 0.95;
      } else if (record.aiConfidence.overall === ConfidenceLevel.MEDIUM) {
        accuracySum += 0.75;
      } else {
        accuracySum += 0.55;
      }
    });
    
    const averageAccuracy = (accuracySum / totalRecords) * 100;
    
    // Mock processing time (milliseconds)
    const processingTime = 750;
    
    // Mock improvement rate (percentage points)
    const improvementRate = 15;
    
    setStats({
      totalRecords,
      approvedRecords,
      rejectedRecords,
      pendingRecords,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      averageAccuracy,
      processingTime,
      improvementRate
    });
  };
  
  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value as TimePeriod);
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setTabValue(newValue);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate refresh
    setTimeout(() => {
      calculateStats();
      setRefreshing(false);
    }, 1000);
  };
  
  // Create chart data for confidence distribution
  const confidenceDistributionData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [stats.highConfidence, stats.mediumConfidence, stats.lowConfidence],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Create chart data for record status distribution
  const statusDistributionData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [stats.approvedRecords, stats.rejectedRecords, stats.pendingRecords],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Create chart data for accuracy trend
  const accuracyTrendData = {
    labels: mockAIPerformanceData.months,
    datasets: [
      {
        label: 'Accuracy (%)',
        data: mockAIPerformanceData.accuracy,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Error Rate (%)',
        data: mockAIPerformanceData.errorRate,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ],
  };
  
  // Create chart data for processing time trend
  const processingTimeTrendData = {
    labels: mockAIPerformanceData.months,
    datasets: [
      {
        label: 'Processing Time (ms)',
        data: mockAIPerformanceData.processingTime,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ],
  };
  
  // Create chart data for confidence by field
  const confidenceByFieldData = {
    labels: ['Customer Name', 'Email', 'Phone', 'Order Date', 'Address', 'Payment'],
    datasets: [
      {
        label: 'High Confidence (%)',
        data: [92, 88, 75, 95, 80, 85],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Medium Confidence (%)',
        data: [6, 10, 15, 3, 12, 10],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
      },
      {
        label: 'Low Confidence (%)',
        data: [2, 2, 10, 2, 8, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ],
  };
  
  // Chart options
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        stacked: true,
      },
      x: {
        stacked: true,
      }
    },
  };
  
  // Time period options
  const timePeriodOptions = [
    { value: TimePeriod.LAST_30_DAYS, label: 'Last 30 Days' },
    { value: TimePeriod.LAST_90_DAYS, label: 'Last 90 Days' },
    { value: TimePeriod.LAST_6_MONTHS, label: 'Last 6 Months' },
    { value: TimePeriod.LAST_YEAR, label: 'Last Year' },
    { value: TimePeriod.ALL_TIME, label: 'All Time' },
  ];
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Performance Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="time-period-select-label">Time Period</InputLabel>
            <Select
              labelId="time-period-select-label"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
            >
              {timePeriodOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <Button 
              variant="outlined" 
              startIcon={refreshing ? <LinearProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 2,
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    AI Accuracy
                  </Typography>
                  <Typography variant="h4">{stats.averageAccuracy.toFixed(1)}%</Typography>
                </Box>
                <Box sx={{ backgroundColor: 'primary.light', p: 1, borderRadius: 1 }}>
                  <DataUsageIcon fontSize="large" sx={{ color: 'primary.dark' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  +{stats.improvementRate}% improvement
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 2,
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Processing Time
                  </Typography>
                  <Typography variant="h4">{stats.processingTime} ms</Typography>
                </Box>
                <Box sx={{ backgroundColor: 'secondary.light', p: 1, borderRadius: 1 }}>
                  <SpeedIcon fontSize="large" sx={{ color: 'secondary.dark' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingDownIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  20% faster than last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 2,
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    High Confidence
                  </Typography>
                  <Typography variant="h4">{Math.round((stats.highConfidence / stats.totalRecords) * 100)}%</Typography>
                </Box>
                <Box sx={{ backgroundColor: 'success.light', p: 1, borderRadius: 1 }}>
                  <CheckCircleIcon fontSize="large" sx={{ color: 'success.dark' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  {stats.highConfidence} out of {stats.totalRecords} records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: 2,
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Low Confidence
                  </Typography>
                  <Typography variant="h4">{Math.round((stats.lowConfidence / stats.totalRecords) * 100)}%</Typography>
                </Box>
                <Box sx={{ backgroundColor: 'error.light', p: 1, borderRadius: 1 }}>
                  <ErrorOutlineIcon fontSize="large" sx={{ color: 'error.dark' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingDownIcon sx={{ color: 'success.main', mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2" color="success.main">
                  3% decrease from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Analytics Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<ShowChartIcon />}
            iconPosition="start"
            label="Overview"
            value={TabValue.OVERVIEW}
          />
          <Tab 
            icon={<DonutLargeIcon />}
            iconPosition="start"
            label="Accuracy Analysis"
            value={TabValue.ACCURACY}
          />
          <Tab 
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Performance Metrics"
            value={TabValue.PERFORMANCE}
          />
          <Tab 
            icon={<PieChartIcon />}
            iconPosition="start"
            label="Feedback Analytics"
            value={TabValue.FEEDBACK}
          />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      <Box>
        {/* Overview Tab */}
        {tabValue === TabValue.OVERVIEW && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  AI Accuracy Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={accuracyTrendData} 
                    options={{
                      ...lineChartOptions,
                      plugins: {
                        ...lineChartOptions.plugins,
                        title: {
                          ...lineChartOptions.plugins.title,
                          text: 'Accuracy vs Error Rate Over Time'
                        }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Processing Time Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={processingTimeTrendData}
                    options={{
                      ...lineChartOptions,
                      plugins: {
                        ...lineChartOptions.plugins,
                        title: {
                          ...lineChartOptions.plugins.title,
                          text: 'AI Processing Time (milliseconds)'
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  AI Confidence Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie data={confidenceDistributionData} options={pieChartOptions} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Record Status Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie data={statusDistributionData} options={pieChartOptions} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Confidence by Field
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar 
                    data={confidenceByFieldData} 
                    options={barChartOptions} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Accuracy Analysis Tab */}
        {tabValue === TabValue.ACCURACY && (
          <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
            Accuracy Analysis tab content would be implemented here.
          </Typography>
        )}
        
        {/* Performance Metrics Tab */}
        {tabValue === TabValue.PERFORMANCE && (
          <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
            Performance Metrics tab content would be implemented here.
          </Typography>
        )}
        
        {/* Feedback Analytics Tab */}
        {tabValue === TabValue.FEEDBACK && (
          <Typography variant="body1" sx={{ p: 4, textAlign: 'center' }}>
            Feedback Analytics tab content would be implemented here.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
