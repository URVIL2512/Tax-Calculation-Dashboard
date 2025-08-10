import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface TaxCalculation {
  userName: string;
  income: number;
  taxRegime: 'old' | 'new';
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveTaxRate: number;
  calculationDetails: any;
}

const TaxCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    income: '',
    taxRegime: 'new' as 'old' | 'new',
    deductions: '0',
  });

  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCalculate = async () => {
    if (!formData.userName.trim() || !formData.income) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.income) <= 0) {
      setError('Income must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/tax/calculate', {
        userName: formData.userName.trim(),
        income: parseFloat(formData.income),
        taxRegime: formData.taxRegime,
        deductions: parseFloat(formData.deductions) || 0,
      });

      setCalculation(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      userName: '',
      income: '',
      taxRegime: 'new',
      deductions: '0',
    });
    setCalculation(null);
    setError('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Tax Calculator
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter your full name"
                />

                <TextField
                  label="Annual Income (₹)"
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter your annual income"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Tax Regime</InputLabel>
                  <Select
                    value={formData.taxRegime}
                    label="Tax Regime"
                    onChange={(e) => handleInputChange('taxRegime', e.target.value)}
                  >
                    <MenuItem value="new">New Tax Regime (2023-24)</MenuItem>
                    <MenuItem value="old">Old Tax Regime</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Deductions (₹)"
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => handleInputChange('deductions', e.target.value)}
                  fullWidth
                  placeholder="Enter total deductions (if any)"
                  InputProps={{
                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  helperText={formData.taxRegime === 'old' ? 'Standard deduction of ₹50,000 will be applied automatically' : 'No deductions in new regime'}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                    onClick={handleCalculate}
                    disabled={loading}
                    fullWidth
                    size="large"
                  >
                    {loading ? 'Calculating...' : 'Calculate Tax'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                    disabled={loading}
                    size="large"
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {calculation ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tax Calculation Results
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'primary.50' }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Tax Regime: {calculation.taxRegime === 'new' ? 'New (2023-24)' : 'Old'}
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(calculation.taxAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Effective Tax Rate: {formatPercentage(calculation.effectiveTaxRate)}
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Gross Income:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(calculation.income)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Deductions:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(calculation.deductions)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight="medium">Taxable Income:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(calculation.taxableIncome)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Typography variant="subtitle2" gutterBottom>
                    Tax Slab Details:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(calculation.calculationDetails).map(([key, detail]: [string, any]) => {
                      if (key === 'standardDeduction' || key === 'cess') {
                        return (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              {detail.description}:
                            </Typography>
                            <Chip 
                              label={formatCurrency(detail.amount || detail.tax)} 
                              size="small" 
                              color="secondary" 
                            />
                          </Box>
                        );
                      }
                      
                      if (detail.tax > 0) {
                        return (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              {detail.range} ({detail.rate}):
                            </Typography>
                            <Chip 
                              label={formatCurrency(detail.tax)} 
                              size="small" 
                              color="primary" 
                            />
                          </Box>
                        );
                      }
                      
                      return null;
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 4,
                  color: 'text.secondary'
                }}>
                  <AccountBalanceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Ready to Calculate
                  </Typography>
                  <Typography variant="body2" textAlign="center">
                    Enter your income details and click "Calculate Tax" to see the results
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxCalculator;
