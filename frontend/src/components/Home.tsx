import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Divider,
  Fade,
  Slide,
  Grow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Verified as VerifiedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Timeline as TimelineIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const features = [
    {
      icon: <CalculateIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Dual Tax Regime Calculator',
      description: 'Calculate income tax for both Old and New tax regimes with detailed breakdowns and comparisons',
      color: '#2196F3'
    },
    {
      icon: <HistoryIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Calculation History',
      description: 'Save and track all your tax calculations with detailed reports and export options',
      color: '#4CAF50'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Analytics Dashboard',
      description: 'Visualize your tax data with interactive charts and year-over-year comparisons',
      color: '#FF9800'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely with user authentication',
      color: '#9C27B0'
    }
  ];

  const keyFeatures = [
    'Calculate tax for both Old and New regimes',
    'Detailed tax breakdown with slab-wise calculations',
    'Save and manage calculation history',
    'Interactive dashboard with tax analytics',
    'Secure user authentication system',
    'Real-time tax calculations'
  ];

  const taxRegimes = [
    {
      title: 'Old Tax Regime',
      description: 'Traditional tax structure with various deductions and exemptions',
      features: ['Standard deduction of ₹50,000', 'HRA, LTA, and other allowances', 'Section 80C deductions', 'Medical insurance premium']
    },
    {
      title: 'New Tax Regime',
      description: 'Simplified tax structure with lower rates but no major deductions',
      features: ['Lower tax rates', 'No major deductions', 'Simplified calculation', 'Optional choice for taxpayers']
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Fade in={animate} timeout={1000}>
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                lineHeight: 1.2
              }}
            >
              💰 Tax Calculation Dashboard
            </Typography>
            
            <Typography 
              variant="h5" 
              color="text.secondary" 
              paragraph 
              sx={{ 
                mb: 4, 
                maxWidth: '800px', 
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}
            >
              Professional income tax calculator for Indian taxpayers. 
              Compare Old vs New tax regimes and make informed decisions.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  px: 6, 
                  py: 2, 
                  fontSize: '1.2rem',
                  borderRadius: '50px',
                  boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(33, 150, 243, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Calculating
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  px: 6, 
                  py: 2, 
                  fontSize: '1.2rem',
                  borderRadius: '50px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Tax Regimes Section */}
        <Slide direction="up" in={animate} timeout={1200}>
          <Box sx={{ py: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              textAlign="center" 
              gutterBottom 
              sx={{ 
                mb: 6,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Compare Tax Regimes
            </Typography>
            
            <Grid container spacing={4}>
              {taxRegimes.map((regime, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Grow in={animate} timeout={1400 + index * 200}>
                    <Card
                      elevation={3}
                      sx={{
                        height: '100%',
                        p: 4,
                        borderRadius: '16px',
                        background: 'white',
                        '&:hover': {
                          elevation: 8,
                          transform: 'translateY(-8px)',
                          transition: 'all 0.4s ease-in-out',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                          {regime.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                          {regime.description}
                        </Typography>
                        <List dense>
                          {regime.features.map((feature, featureIndex) => (
                            <ListItem key={featureIndex} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Slide>

        {/* Features Section */}
        <Slide direction="up" in={animate} timeout={1600}>
          <Box sx={{ py: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              textAlign="center" 
              gutterBottom 
              sx={{ 
                mb: 6,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Key Features
            </Typography>
            
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Grow in={animate} timeout={1800 + index * 200}>
                    <Card
                      elevation={3}
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                        p: 3,
                        borderRadius: '16px',
                        background: 'white',
                        '&:hover': {
                          elevation: 8,
                          transform: 'translateY(-8px)',
                          transition: 'all 0.4s ease-in-out',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ 
                          mb: 3,
                          p: 2,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Slide>

        {/* Key Features List */}
        <Slide direction="up" in={animate} timeout={2000}>
          <Box sx={{ py: 6 }}>
            <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
              What You Can Do
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {keyFeatures.map((feature, index) => (
                <Grid item key={index}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={feature}
                    color="primary"
                    variant="outlined"
                    sx={{ m: 0.5, fontSize: '0.9rem' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Slide>

        {/* CTA Section */}
        <Slide direction="up" in={animate} timeout={2200}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Paper
              elevation={6}
              sx={{
                p: 6,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.3
                }
              }}
            >
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Ready to Calculate Your Taxes?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
                Get accurate tax calculations for both Old and New regimes. 
                Create your account and start planning your taxes today.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
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
                  Create Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/calculator')}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    borderColor: 'white',
                    color: 'white',
                    borderRadius: '50px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Try Calculator
                </Button>
              </Box>
            </Paper>
          </Box>
        </Slide>

        {/* Footer */}
        <Box sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Tax Calculation Dashboard. Built with ❤️ for Indian taxpayers.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
