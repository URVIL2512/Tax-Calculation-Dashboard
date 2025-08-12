import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calculate as CalculateIcon,
  History as HistoryIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Savings as SavingsIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  EmojiEvents as EmojiEventsIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [hasCalculations, setHasCalculations] = useState(false);

  // Mock data - in real app, this would come from API
  const [dashboardData, setDashboardData] = useState<any>({
    totalCalculations: 0,
    totalTaxPaid: 0,
    averageTaxRate: 0,
    savingsThisYear: 0,
    recentCalculations: [],
    monthlyData: [],
    taxBreakdown: [],
    regimeComparison: []
  });

  // Check if user has calculations (mock - in real app, fetch from API)
  useEffect(() => {
    // Simulate API call to check if user has calculations
    const checkUserCalculations = async () => {
      setLoading(true);
      try {
        // In real app, this would be an API call
        // const response = await fetch('/api/tax/history?limit=1');
        // const data = await response.json();
        // setHasCalculations(data.calculations.length > 0);
        
        // Check if user actually has calculations from the API
        // For now, default to false so new users see the welcome screen
        setHasCalculations(false);
        
        // TODO: Uncomment this when you want to fetch real data from API
        // if (hasCalculations) {
        //   // Fetch real dashboard data from /api/tax/stats endpoint
        //   try {
        //     const response = await api.get('/api/tax/stats');
        //     setDashboardData(response.data.data);
        //   } catch (error) {
        //     console.error('Error fetching dashboard data:', error);
        //   }
        // }
      } catch (error) {
        console.error('Error checking user calculations:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserCalculations();
  }, [hasCalculations]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            {icon}
          </Avatar>
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${Math.abs(trend)}%`}
              size="small"
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, action, color }: any) => (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        borderRadius: 2, 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '& .action-icon': {
            transform: 'scale(1.1)'
          }
        }
      }}
      onClick={action}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Avatar 
          sx={{ 
            bgcolor: `${color}20`, 
            color: color, 
            width: 60, 
            height: 60, 
            mx: 'auto', 
            mb: 2,
            '& .action-icon': {
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <Box className="action-icon">
            {icon}
          </Box>
        </Avatar>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const WelcomeCard = ({ title, description, icon, color }: any) => (
    <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ textAlign: 'center', p: 4 }}>
        <Avatar 
          sx={{ 
            bgcolor: `${color}20`, 
            color: color, 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  // New User Welcome Screen
  if (!hasCalculations && !loading) {
  return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            🎉 Welcome to Tax Dashboard!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Get started with your first tax calculation and unlock powerful analytics to optimize your tax planning.
      </Typography>
        </Box>

        {/* Quick Start Action */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Paper
            elevation={6}
            sx={{
              p: 6,
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Ready to Calculate Your Taxes?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Start with your first calculation and see how our dashboard helps you make informed tax decisions.
      </Typography>
        <Button 
          variant="contained" 
              size="large"
          onClick={() => navigate('/calculator')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                backgroundColor: 'white',
                color: 'primary.main',
                borderRadius: '50px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Your First Calculation
        </Button>
          </Paper>
        </Box>

        {/* Features Overview */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <WelcomeCard
              title="Smart Calculator"
              description="Calculate taxes for both Old and New regimes with detailed breakdowns"
              icon={<CalculateIcon />}
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WelcomeCard
              title="Save & Track"
              description="Keep all your calculations organized and track your tax history"
              icon={<HistoryIcon />}
              color="#4CAF50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WelcomeCard
              title="Analytics Dashboard"
              description="Get insights and visualizations after your first calculation"
              icon={<TrendingUpIcon />}
              color="#FF9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WelcomeCard
              title="Secure & Private"
              description="Your financial data is encrypted and stored securely"
              icon={<SecurityIcon />}
              color="#9C27B0"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Learn About Tax Regimes"
              description="Understand the difference between Old and New tax regimes"
              icon={<SchoolIcon />}
              action={() => navigate('/')}
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="View Sample Calculations"
              description="See examples of how the calculator works"
              icon={<VisibilityIcon />}
              action={() => navigate('/calculator')}
              color="#4CAF50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="Get Started"
              description="Begin your first tax calculation now"
              icon={<EmojiEventsIcon />}
              action={() => navigate('/calculator')}
              color="#FF9800"
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Full Analytics Dashboard (for users with calculations)
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            📊 Analytics Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => setLoading(true)} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Report">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Comprehensive overview of your tax calculations and financial insights
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="New Calculation"
            description="Calculate tax for both Old and New regimes"
            icon={<CalculateIcon />}
            action={() => navigate('/calculator')}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View History"
            description="Browse all your previous calculations"
            icon={<HistoryIcon />}
            action={() => navigate('/history')}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Tax Reports"
            description="Generate detailed tax reports"
            icon={<ReceiptIcon />}
            action={() => navigate('/history')}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Savings Analysis"
            description="Compare tax savings between regimes"
            icon={<SavingsIcon />}
            action={() => navigate('/calculator')}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Calculations"
            value={dashboardData.totalCalculations}
            subtitle="This financial year"
            icon={<CalculateIcon />}
            color="#2196F3"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tax Amount"
            value={`₹${(dashboardData.totalTaxPaid / 1000).toFixed(0)}K`}
            subtitle="Combined tax liability"
            icon={<AccountBalanceIcon />}
            color="#4CAF50"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Tax Rate"
            value={`${dashboardData.averageTaxRate}%`}
            subtitle="Effective tax rate"
            icon={<TrendingUpIcon />}
            color="#FF9800"
            trend={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tax Savings"
            value={`₹${(dashboardData.savingsThisYear / 1000).toFixed(0)}K`}
            subtitle="Through deductions"
            icon={<SavingsIcon />}
            color="#9C27B0"
            trend={8}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Tax Trend */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Tax Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => [`₹${value}`, 'Tax Amount']} />
                  <Line type="monotone" dataKey="oldRegime" stroke="#2196F3" strokeWidth={3} name="Old Regime" />
                  <Line type="monotone" dataKey="newRegime" stroke="#4CAF50" strokeWidth={3} name="New Regime" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tax Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Tax Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.taxBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.taxBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {dashboardData.taxBreakdown.map((item: any, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">{item.name}: {item.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Regime Comparison */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Old vs New Regime Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.regimeComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="regime" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number, name: string) => [
                    name === 'taxAmount' ? `₹${(value / 1000).toFixed(0)}K` : `${value}%`,
                    name === 'taxAmount' ? 'Tax Amount' : 'Effective Rate'
                  ]} />
                  <Bar dataKey="taxAmount" fill="#2196F3" name="Tax Amount" />
                  <Bar dataKey="effectiveRate" fill="#4CAF50" name="Effective Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Calculations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Calculations
                </Typography>
        <Button 
                  variant="text" 
                  endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/history')}
        >
                  View All
        </Button>
      </Box>
              <List>
                {dashboardData.recentCalculations.map((calc: any, index: number) => (
                  <React.Fragment key={calc.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: calc.regime === 'Old' ? '#2196F3' : '#4CAF50' }}>
                          <CalculateIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`₹${(calc.income / 1000).toFixed(0)}K Income - ₹${(calc.taxAmount / 1000).toFixed(0)}K Tax`}
                        secondary={`${calc.date} • ${calc.regime} Regime`}
                      />
                      <Chip 
                        label={calc.status} 
                        color="success" 
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    </ListItem>
                    {index < (dashboardData.recentCalculations as any[]).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                💡 Insights
      </Typography>
                             <List dense>
                 <ListItem>
                   <ListItemIcon>
                     <InfoIcon color="info" />
                   </ListItemIcon>
                   <ListItemText 
                     primary="Old Regime Advantage"
                     secondary="You save ₹87K with Old Regime"
                   />
                 </ListItem>
                 <ListItem>
                   <ListItemIcon>
                     <CheckCircleIcon color="success" />
                   </ListItemIcon>
                   <ListItemText 
                     primary="Deductions Working"
                     secondary="₹1.5L deductions reducing tax"
                   />
                 </ListItem>
                 <ListItem>
                   <ListItemIcon>
                     <WarningIcon color="warning" />
                   </ListItemIcon>
                   <ListItemText 
                     primary="Tax Planning"
                     secondary="Consider advance tax payments"
                   />
                 </ListItem>
               </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
