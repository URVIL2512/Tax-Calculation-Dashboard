import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Calculator, Download, LogOut, PieChart as PieChartIcon, TrendingUp, DollarSign, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface UserType {
  id: number;
  email: string;
  password: string;
  name: string;
}

interface TaxResults {
  totalIncome: number;
  taxableIncome: number;
  hraExemption: number;
  totalDeductions: number;
  oldRegime: {
    taxableIncome: number;
    tax: number;
    totalPayable: number;
  };
  newRegime: {
    taxableIncome: number;
    tax: number;
    totalPayable: number;
  };
}

interface Suggestion {
  type: string;
  description: string;
  potentialSaving: number | string;
}

const TaxCalculatorApp = () => {
  const [currentStep, setCurrentStep] = useState('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('taxDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Profile settings form
  const [profileForm, setProfileForm] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    basicSalary: '',
    houseRentAllowance: '',
    leaveTravelAllowance: '',
    otherAllowance: '',
    isMetroCity: false
  });

  const [deductionForm, setDeductionForm] = useState({
    section80C: '',
    section80D: '',
    section80TTA: '',
    rentPaid: '',
    standardDeduction: 50000
  });

  const [taxResults, setTaxResults] = useState<TaxResults | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);

  const [users, setUsers] = useState<UserType[]>(() => {
    const stored = localStorage.getItem('taxUsers');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem(`taxHistory_${user.email}`);
      if (storedHistory) {
        setReportHistory(JSON.parse(storedHistory));
      }
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
      document.documentElement.style.backgroundColor = '#1f2937';
      document.documentElement.style.color = '#f9fafb';
      document.documentElement.style.setProperty('--bg-color', '#1f2937');
      document.documentElement.style.setProperty('--text-color', '#f9fafb');
    } else {
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#1f2937';
      document.documentElement.style.backgroundColor = '#f9fafb';
      document.documentElement.style.color = '#1f2937';
      document.documentElement.style.setProperty('--bg-color', '#f9fafb');
      document.documentElement.style.setProperty('--text-color', '#1f2937');
    }
  }, [isDarkMode]);

  const getIncomeDistributionData = (): { name: string; value: number }[] => {
    const basicSalary = parseFloat(incomeForm.basicSalary || '0');
    const hra = parseFloat(incomeForm.houseRentAllowance || '0');
    const lta = parseFloat(incomeForm.leaveTravelAllowance || '0');
    const otherAllowance = parseFloat(incomeForm.otherAllowance || '0');
    
    return [
      { name: 'Basic Salary', value: basicSalary },
      { name: 'HRA', value: hra },
      { name: 'LTA', value: lta },
      { name: 'Other Allowances', value: otherAllowance }
    ].filter(item => item.value > 0);
  };

  const getTaxComparisonData = (): { regime: string; tax: number }[] => {
    if (!taxResults) return [];
    
    return [
      { regime: 'Old Regime', tax: Math.round(taxResults.oldRegime.totalPayable) },
      { regime: 'New Regime', tax: Math.round(taxResults.newRegime.totalPayable) }
    ];
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: { 
    cx?: number; 
    cy?: number; 
    midAngle?: number; 
    innerRadius?: number; 
    outerRadius?: number; 
    percent?: number; 
    index?: number; 
    name?: string;
  }) => {
    if (!cx || !cy || !midAngle || !outerRadius || !percent || percent <= 0 || !name) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = 30 + outerRadius;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={isDarkMode ? '#f9fafb' : '#1f2937'}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        fontSize={12}
        fontWeight="600"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const existingUser = users.find(u => u.email === authForm.email && u.password === authForm.password);
      if (existingUser) {
        setUser(existingUser);
        setCurrentStep('dashboard');
        const userData = JSON.parse(localStorage.getItem(`taxData_${existingUser.email}`) || '{}');
        if (userData.income) setIncomeForm(userData.income);
        if (userData.deductions) setDeductionForm(userData.deductions);
        if (userData.results) setTaxResults(userData.results);
      } else {
        alert('Invalid credentials');
      }
    } else {
      if (users.some(u => u.email === authForm.email)) {
        alert('User already exists');
        return;
      }
      const newUser = { 
        id: Date.now(), 
        email: authForm.email, 
        password: authForm.password, 
        name: authForm.name 
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('taxUsers', JSON.stringify(updatedUsers));
      setUser(newUser);
      setCurrentStep('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep('auth');
    setAuthForm({ email: '', password: '', name: '' });
  };

  const handleNewCalculation = () => {
    setIncomeForm({
      basicSalary: '',
      houseRentAllowance: '',
      leaveTravelAllowance: '',
      otherAllowance: '',
      isMetroCity: false
    });
    setDeductionForm({
      section80C: '',
      section80D: '',
      section80TTA: '',
      rentPaid: '',
      standardDeduction: 50000
    });
    setTaxResults(null);
    setSuggestions([]);
    setShowCharts(false);
    setCurrentStep('income');
  };

  const handleEditReport = (report: any) => {
    setEditingReport(report);
    setIncomeForm(report.income);
    setDeductionForm(report.deductions);
    setTaxResults(report.results);
    setSuggestions(report.suggestions || []);
    setShowCharts(true);
    setCurrentStep('results');
  };

  const handleDeleteReport = (reportId: string) => {
    const updatedHistory = reportHistory.filter(report => report.id !== reportId);
    setReportHistory(updatedHistory);
    if (user) {
      localStorage.setItem(`taxHistory_${user.email}`, JSON.stringify(updatedHistory));
    }
  };

  const handleUpdateReport = () => {
    if (!editingReport) return;
    
    const updatedReport = {
      ...editingReport,
      income: incomeForm,
      deductions: deductionForm,
      results: taxResults,
      suggestions: suggestions,
      timestamp: Date.now()
    };

    const updatedHistory = reportHistory.map(report => 
      report.id === editingReport.id ? updatedReport : report
    );
    
    setReportHistory(updatedHistory);
    setEditingReport(null);
    
    if (user) {
      localStorage.setItem(`taxHistory_${user.email}`, JSON.stringify(updatedHistory));
    }
  };

  // Profile management functions
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = { ...user };
    let hasChanges = false;

    // Update email if changed
    if (profileForm.email && profileForm.email !== user.email) {
      // Check if email already exists
      if (users.some(u => u.email === profileForm.email && u.id !== user.id)) {
        alert('Email already exists');
        return;
      }
      updatedUser.email = profileForm.email;
      hasChanges = true;
    }

    // Update password if provided
    if (profileForm.newPassword) {
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (profileForm.password !== user.password) {
        alert('Current password is incorrect');
        return;
      }
      updatedUser.password = profileForm.newPassword;
      hasChanges = true;
    }

    if (hasChanges) {
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      setUser(updatedUser);
      localStorage.setItem('taxUsers', JSON.stringify(updatedUsers));
      alert('Profile updated successfully');
      setProfileForm({ email: '', password: '', newPassword: '', confirmPassword: '' });
      setShowProfileModal(false);
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('taxDarkMode', JSON.stringify(newDarkMode));
  };

  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        email: user.email,
        password: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setShowProfileModal(true);
  };

  // Enhanced HRA Exemption Calculation
  const calculateHRAExemption = (basicSalary: number, hra: number, rentPaid: number, isMetro: boolean) => {
    const tenPercentRule = rentPaid - (0.10 * basicSalary);
    const actualHRAReceived = hra;
    const cityExemption = isMetro ? (0.50 * basicSalary) : (0.40 * basicSalary);
    
    return Math.max(0, Math.min(tenPercentRule, actualHRAReceived, cityExemption));
  };

  const calculateTax = () => {
    const basicSalary = parseFloat(incomeForm.basicSalary || '0');
    const hra = parseFloat(incomeForm.houseRentAllowance || '0');
    const lta = parseFloat(incomeForm.leaveTravelAllowance || '0');
    const otherAllowance = parseFloat(incomeForm.otherAllowance || '0');
    const rentPaid = parseFloat(deductionForm.rentPaid || '0');
    
    // Calculate HRA Exemption
    const hraExemption = calculateHRAExemption(basicSalary, hra, rentPaid, incomeForm.isMetroCity);
    
    // Total Income with HRA Exemption
    const totalIncome = basicSalary + hra + lta + otherAllowance;
    const taxableIncome = totalIncome - hraExemption;

    const totalDeductions = parseFloat(deductionForm.section80C || '0') + 
                           parseFloat(deductionForm.section80D || '0') + 
                           parseFloat(deductionForm.section80TTA || '0') + 
                           parseFloat(deductionForm.standardDeduction.toString() || '0');

    const oldTaxableIncome = Math.max(0, taxableIncome - totalDeductions);
    const oldTax = calculateOldRegimeTax(oldTaxableIncome);

    const newTaxableIncome = Math.max(0, taxableIncome - 50000);
    const newTax = calculateNewRegimeTax(newTaxableIncome);

    const results = {
      totalIncome,
      taxableIncome,
      hraExemption,
      totalDeductions,
      oldRegime: {
        taxableIncome: oldTaxableIncome,
        tax: oldTax,
        totalPayable: oldTax
      },
      newRegime: {
        taxableIncome: newTaxableIncome,
        tax: newTax,
        totalPayable: newTax
      }
    };

    setTaxResults(results);
    generateSuggestions(taxableIncome, totalDeductions);
    setShowCharts(true);
    
    // Save to report history
    const reportEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      results,
      income: incomeForm,
      deductions: deductionForm,
      suggestions: suggestions,
      user: user?.name || 'Guest'
    };
    
    setReportHistory(prev => [reportEntry, ...prev.slice(0, 9)]); // Keep last 10 reports
    
    if (user) {
      const userData = { income: incomeForm, deductions: deductionForm, results };
      localStorage.setItem(`taxData_${user.email}`, JSON.stringify(userData));
      localStorage.setItem(`taxHistory_${user.email}`, JSON.stringify([reportEntry, ...reportHistory]));
    }
    
    setCurrentStep('results');
  };

  const calculateOldRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
    else tax = 112500 + (taxableIncome - 1000000) * 0.30;
    
    return tax * 1.04;
  };

  const calculateNewRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
    else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
    else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
    else tax = 150000 + (taxableIncome - 1500000) * 0.30;
    
    return tax * 1.04;
  };

  const generateSuggestions = (income: number, deductions: number) => {
    const suggestions: Suggestion[] = [];
    const section80C = parseFloat(deductionForm.section80C || '0');
    const section80D = parseFloat(deductionForm.section80D || '0');
    const rentPaid = parseFloat(deductionForm.rentPaid || '0');
    
    // Enhanced ELSS suggestion with dynamic calculation
    if (income > 500000 && section80C < 150000) {
      const remaining80C = 150000 - section80C;
      const potentialSaving = Math.min(remaining80C * 0.3, 46800);
      suggestions.push({
        type: 'ELSS Investment',
        description: `Invest ₹${remaining80C.toLocaleString()} in ELSS to save ₹${potentialSaving.toLocaleString()} in taxes`,
        potentialSaving: potentialSaving
      });
    }

    // Enhanced Health Insurance suggestion
    if (income > 300000 && section80D < 25000) {
      const remaining80D = 25000 - section80D;
      const potentialSaving = Math.min(remaining80D * 0.3, 7500);
      suggestions.push({
        type: 'Health Insurance',
        description: `Get health insurance for ₹${remaining80D.toLocaleString()} to save ₹${potentialSaving.toLocaleString()}`,
        potentialSaving: potentialSaving
      });
    }

    // NPS suggestion for high earners
    if (income > 1000000) {
      suggestions.push({
        type: 'NPS Investment',
        description: 'Invest ₹50,000 in NPS for additional tax deduction under 80CCD(1B)',
        potentialSaving: 15000
      });
    }

    // HRA optimization suggestion
    if (rentPaid === 0 && parseFloat(incomeForm.houseRentAllowance || '0') > 0) {
      suggestions.push({
        type: 'HRA Optimization',
        description: 'Consider paying rent to maximize HRA exemption benefits',
        potentialSaving: 'Up to 50% of basic salary'
      });
    }

    // Complete tax planning for no deductions
    if (deductions === 0 && income > 300000) {
      suggestions.push({
        type: 'Complete Tax Planning',
        description: 'Start with ₹1.5L in 80C, ₹25K in 80D, and ₹10K in 80TTA',
        potentialSaving: 55500
      });
    }

    setSuggestions(suggestions);
  };

  const exportToPDF = () => {
    if (!taxResults) return;
    
    const incomeData = getIncomeDistributionData();
    const taxData = getTaxComparisonData();
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font and colors
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    
    // Title
    doc.text('TAX CALCULATION REPORT', 105, 20, { align: 'center' });
    
    // Date and user info
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`User: ${user?.name || 'Guest'}`, 20, 42);
    
    // Income Details Section
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('INCOME DETAILS', 20, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Basic Salary: ₹${parseFloat(incomeForm.basicSalary || '0').toLocaleString()}`, 20, 75);
    doc.text(`House Rent Allowance: ₹${parseFloat(incomeForm.houseRentAllowance || '0').toLocaleString()}`, 20, 82);
    doc.text(`Leave Travel Allowance: ₹${parseFloat(incomeForm.leaveTravelAllowance || '0').toLocaleString()}`, 20, 89);
    doc.text(`Other Allowance: ₹${parseFloat(incomeForm.otherAllowance || '0').toLocaleString()}`, 20, 96);
    
    doc.setFontSize(12);
    doc.setTextColor(39, 174, 96);
    doc.text(`Total Income: ₹${taxResults.totalIncome.toLocaleString()}`, 20, 105);
    
    // Deduction Details Section
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('DEDUCTION DETAILS', 20, 125);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Section 80C: ₹${parseFloat(deductionForm.section80C || '0').toLocaleString()}`, 20, 140);
    doc.text(`Section 80D: ₹${parseFloat(deductionForm.section80D || '0').toLocaleString()}`, 20, 147);
    doc.text(`Section 80TTA: ₹${parseFloat(deductionForm.section80TTA || '0').toLocaleString()}`, 20, 154);
    doc.text(`Rent Paid: ₹${parseFloat(deductionForm.rentPaid || '0').toLocaleString()}`, 20, 161);
    doc.text(`Standard Deduction: ₹${parseFloat(deductionForm.standardDeduction.toString() || '0').toLocaleString()}`, 20, 168);
    
    doc.setFontSize(12);
    doc.setTextColor(39, 174, 96);
    doc.text(`Total Deductions: ₹${taxResults.totalDeductions.toLocaleString()}`, 20, 177);
    
    // Tax Comparison Section
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('TAX COMPARISON', 20, 200);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text(`Old Regime - Taxable Income: ₹${taxResults.oldRegime.taxableIncome.toLocaleString()}`, 20, 215);
    doc.text(`Old Regime - Tax: ₹${taxResults.oldRegime.tax.toLocaleString()}`, 20, 222);
    doc.text(`New Regime - Taxable Income: ₹${taxResults.newRegime.taxableIncome.toLocaleString()}`, 20, 229);
    doc.text(`New Regime - Tax: ₹${taxResults.newRegime.tax.toLocaleString()}`, 20, 236);
    
    // Recommendation
    const betterRegime = taxResults.oldRegime.tax < taxResults.newRegime.tax ? 'Old Regime' : 'New Regime';
    const savings = Math.abs(taxResults.oldRegime.tax - taxResults.newRegime.tax);
    
    doc.setFontSize(12);
    doc.setTextColor(230, 126, 34);
    doc.text(`RECOMMENDATION: ${betterRegime} is better`, 20, 250);
    doc.text(`Savings: ₹${savings.toLocaleString()}`, 20, 257);
    
    // Chart Data Summary
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text('CHART DATA SUMMARY', 20, 275);
    
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('Income Distribution:', 20, 290);
    incomeData.forEach((item, index) => {
      doc.text(`${item.name}: ₹${item.value.toLocaleString()}`, 30, 297 + (index * 7));
    });
    
    doc.text('Tax Comparison:', 20, 320);
    taxData.forEach((item, index) => {
      doc.text(`${item.regime}: ₹${item.tax.toLocaleString()}`, 30, 327 + (index * 7));
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(149, 165, 166);
    doc.text('Generated by Tax Calculator App', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`tax_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    if (!taxResults) return;
    
    const incomeData = getIncomeDistributionData();
    const taxData = getTaxComparisonData();
    
    const csvData = `Category,Description,Amount
Income,Basic Salary,${incomeForm.basicSalary || 0}
Income,House Rent Allowance,${incomeForm.houseRentAllowance || 0}
Income,Leave Travel Allowance,${incomeForm.leaveTravelAllowance || 0}
Income,Other Allowance,${incomeForm.otherAllowance || 0}
Income,Total Income,${taxResults.totalIncome.toFixed(2)}
Deductions,Section 80C,${deductionForm.section80C || 0}
Deductions,Section 80D,${deductionForm.section80D || 0}
Deductions,Section 80TTA,${deductionForm.section80TTA || 0}
Deductions,Rent Paid,${deductionForm.rentPaid || 0}
Deductions,Standard Deduction,${deductionForm.standardDeduction || 0}
Deductions,Total Deductions,${taxResults.totalDeductions.toFixed(2)}
Tax,Old Regime Taxable Income,${taxResults.oldRegime.taxableIncome.toFixed(2)}
Tax,Old Regime Tax,${taxResults.oldRegime.tax.toFixed(2)}
Tax,New Regime Taxable Income,${taxResults.newRegime.taxableIncome.toFixed(2)}
Tax,New Regime Tax,${taxResults.newRegime.tax.toFixed(2)}
Chart Data,Income Distribution,,
${incomeData.map(item => `Chart Data,${item.name},${item.value}`).join('\n')}
Chart Data,Tax Comparison,,
${taxData.map(item => `Chart Data,${item.regime},${item.tax}`).join('\n')}`;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getChartData = () => {
    if (!taxResults) return { pie: [], bar: [], line: [] };

    const pieData = [
      { name: 'Basic Salary', value: parseFloat(incomeForm.basicSalary || '0'), fill: '#8884d8' },
      { name: 'HRA', value: parseFloat(incomeForm.houseRentAllowance || '0'), fill: '#82ca9d' },
      { name: 'LTA', value: parseFloat(incomeForm.leaveTravelAllowance || '0'), fill: '#ffc658' },
      { name: 'Other', value: parseFloat(incomeForm.otherAllowance || '0'), fill: '#ff7c7c' }
    ].filter(item => item.value > 0);

    const barData = [
      {
        regime: 'Old Regime',
        taxableIncome: taxResults.oldRegime.taxableIncome,
        tax: taxResults.oldRegime.tax
      },
      {
        regime: 'New Regime',
        taxableIncome: taxResults.newRegime.taxableIncome,
        tax: taxResults.newRegime.tax
      }
    ];

    // Dynamic chart data calculation
    const lineData: { income: number; oldTax: number; newTax: number }[] = [];
    const incomeLevels = [300000, 500000, 750000, 1000000, 1500000, 2000000];
    
    incomeLevels.forEach(income => {
      const oldTax = calculateOldRegimeTax(Math.max(0, income - 50000));
      const newTax = calculateNewRegimeTax(Math.max(0, income - 50000));
      lineData.push({ income, oldTax, newTax });
    });

    return { pie: pieData, bar: barData, line: lineData };
  };

  const chartData = getChartData();

  const renderAuth = () => (
    <div style={{ 
      minHeight: '100vh', 
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' 
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f3e8ff 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem' 
    }}>
      <div style={{ 
        background: isDarkMode ? '#374151' : 'white', 
        borderRadius: '1rem', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
        padding: '2rem', 
        width: '100%', 
        maxWidth: '500px' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Calculator style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: isDarkMode ? '#f9fafb' : '#1f2937', marginBottom: '0.5rem' }}>Tax Calculator</h2>
          <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>Smart tax planning made simple</p>
        </div>

        <div style={{ display: 'flex', background: isDarkMode ? '#4b5563' : '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              background: isLogin ? (isDarkMode ? '#6b7280' : 'white') : 'transparent',
              color: isLogin ? '#2563eb' : (isDarkMode ? '#d1d5db' : '#6b7280'),
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              background: !isLogin ? (isDarkMode ? '#6b7280' : 'white') : 'transparent',
              color: !isLogin ? '#2563eb' : (isDarkMode ? '#d1d5db' : '#6b7280'),
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#374151', marginBottom: '0.5rem' }}>Full Name</label>
              <input
                type="text"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.5rem', 
                  fontSize: '1rem',
                  backgroundColor: isDarkMode ? '#4b5563' : 'white',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#374151', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                fontSize: '1rem',
                backgroundColor: isDarkMode ? '#4b5563' : 'white',
                color: isDarkMode ? '#f9fafb' : '#1f2937'
              }}
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: isDarkMode ? '#f3f4f6' : '#374151', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '0.5rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.375rem', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: isDarkMode ? '#4b5563' : 'white',
                color: isDarkMode ? '#f9fafb' : '#1f2937'
              }}
              placeholder="Enter your password"
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ minHeight: '100vh', background: isDarkMode ? '#1f2937' : '#f9fafb' }}>
      <nav style={{ 
        background: isDarkMode ? '#374151' : 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Calculator style={{ width: '2rem', height: '2rem', color: '#2563eb', marginRight: '0.75rem' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDarkMode ? '#f9fafb' : '#1f2937' }}>Tax Calculator</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={handleNewCalculation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#059669',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Calculator style={{ width: '1rem', height: '1rem' }} />
                               <span>New Calculation</span>
             </button>
             
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
                 onClick={openProfileModal}
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: '2.75rem',
                   height: '2.75rem',
                   borderRadius: '50%',
                   background: isDarkMode ? '#1e40af' : '#2563eb',
                   color: 'white',
                   border: `2px solid ${isDarkMode ? '#3b82f6' : '#dbeafe'}`,
                   cursor: 'pointer',
                   fontSize: '1.1rem',
                   fontWeight: '700',
                   transition: 'all 0.2s',
                   boxShadow: isDarkMode ? '0 2px 8px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(37, 99, 235, 0.2)'
                 }}
                 title={`${user?.name}'s Profile Settings`}
                 onMouseOver={(e) => {
                   e.currentTarget.style.background = isDarkMode ? '#1d4ed8' : '#1d4ed8';
                   e.currentTarget.style.transform = 'scale(1.05)';
                 }}
                 onMouseOut={(e) => {
                   e.currentTarget.style.background = isDarkMode ? '#1e40af' : '#2563eb';
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               >
                 {user?.name?.charAt(0)?.toUpperCase() || 'U'}
               </button>
             </div>
              <button
                onClick={handleDarkModeToggle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: isDarkMode ? '#1f2937' : '#f3f4f6',
                  color: isDarkMode ? 'white' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: isDarkMode ? '#d1d5db' : '#6b7280', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                <LogOut style={{ width: '1rem', height: '1rem' }} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCurrentStep('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: currentStep === 'dashboard' ? '#2563eb' : (isDarkMode ? '#374151' : 'white'),
              color: currentStep === 'dashboard' ? 'white' : (isDarkMode ? '#d1d5db' : '#6b7280'),
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <PieChartIcon style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentStep('income')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: currentStep === 'income' ? '#2563eb' : (isDarkMode ? '#374151' : 'white'),
              color: currentStep === 'income' ? 'white' : (isDarkMode ? '#d1d5db' : '#6b7280'),
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <DollarSign style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Income
          </button>
          <button
            onClick={() => setCurrentStep('deductions')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: currentStep === 'deductions' ? '#2563eb' : 'white',
              color: currentStep === 'deductions' ? 'white' : '#6b7280',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FileText style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Deductions
          </button>
          <button
            onClick={() => setCurrentStep('results')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: currentStep === 'results' ? '#2563eb' : 'white',
              color: currentStep === 'results' ? 'white' : '#6b7280',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <TrendingUp style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Results
          </button>
        </div>

        {currentStep === 'dashboard' && renderDashboardContent()}
        {currentStep === 'income' && renderIncomeForm()}
        {currentStep === 'deductions' && renderDeductionForm()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    // Dynamic colors based on dark mode
    const backgroundColor = isDarkMode ? '#374151' : 'white';
    const textColor = isDarkMode ? '#f9fafb' : '#1f2937';
    const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
    const secondaryTextColor = isDarkMode ? '#d1d5db' : '#6b7280';
    const cardBackground = isDarkMode ? '#4b5563' : '#f3f4f6';
    const highlightBackground = isDarkMode ? '#1e40af' : '#f0f9ff';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Charts Section - Only show when charts are available */}
        {(showCharts && getIncomeDistributionData().length > 0) || (showCharts && getTaxComparisonData().length > 0) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {showCharts && getIncomeDistributionData().length > 0 && (
              <div style={{ 
                background: backgroundColor, 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: `1px solid ${borderColor}`
              }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: textColor, 
                  marginBottom: '1rem' 
                }}>Income Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                                                         <Pie
          data={getIncomeDistributionData()}
          cx="50%"
          cy="50%"
          outerRadius={160}
          fill="#8884d8"
          label={renderCustomLabel}
          labelLine={false}
        >
                      {getIncomeDistributionData().map((entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : 'white',
                        border: `1px solid ${borderColor}`,
                        color: textColor
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      align="center"
                      layout="horizontal"
                      wrapperStyle={{
                        color: textColor,
                        marginTop: 20
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {showCharts && getTaxComparisonData().length > 0 && (
              <div style={{ 
                background: backgroundColor, 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: `1px solid ${borderColor}`
              }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: textColor, 
                  marginBottom: '1rem' 
                }}>Tax Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTaxComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                    <XAxis 
                      dataKey="regime" 
                      tick={{ fill: textColor }}
                      axisLine={{ stroke: borderColor }}
                    />
                    <YAxis 
                      tick={{ fill: textColor }}
                      axisLine={{ stroke: borderColor }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : 'white',
                        border: `1px solid ${borderColor}`,
                        color: textColor
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: textColor
                      }}
                    />
                    <Bar dataKey="tax" name="Tax (₹)">
                      {getTaxComparisonData().map((entry: { regime: string; tax: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#8884d8" : "#82ca9d"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            background: backgroundColor, 
            padding: '2rem', 
            borderRadius: '0.75rem', 
            boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            textAlign: 'center',
            border: `2px solid ${borderColor}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #059669, #dc2626)',
              borderRadius: '0.75rem 0.75rem 0 0'
            }}></div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: textColor, 
              marginBottom: '0.75rem',
              textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
            }}>Welcome to Tax Calculator</h3>
            <p style={{ 
              color: isDarkMode ? '#e5e7eb' : secondaryTextColor, 
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>Start by entering your income details to see your tax calculations and visualizations.</p>
            <button
              onClick={() => setCurrentStep('income')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Start New Calculation
            </button>
          </div>
        )}

        {/* Recent Reports Section */}
        {reportHistory.length > 0 && (
          <div style={{ 
            background: backgroundColor, 
            padding: '1.5rem', 
            borderRadius: '0.75rem', 
            boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: `2px solid ${borderColor}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '3px',
              background: 'linear-gradient(90deg, #2563eb, #059669)',
              borderRadius: '0.75rem 0.75rem 0 0'
            }}></div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: textColor, 
              marginBottom: '1rem',
              textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
            }}>Recent Reports</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
              {reportHistory.slice(0, 6).map((report, index) => (
                <div key={report.id} style={{ 
                  border: `2px solid ${borderColor}`, 
                  borderRadius: '0.75rem', 
                  padding: '1.25rem',
                  background: index === 0 ? highlightBackground : backgroundColor,
                  transition: 'all 0.2s ease',
                  boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '2px',
                    background: index === 0 ? '#2563eb' : '#10b981',
                    borderRadius: '0.75rem 0.75rem 0 0'
                  }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: index === 0 ? '#2563eb' : '#10b981' 
                      }}></div>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '0.875rem',
                        color: textColor,
                        textShadow: isDarkMode ? '0 1px 1px rgba(0, 0, 0, 0.3)' : 'none'
                      }}>
                        {new Date(report.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: secondaryTextColor,
                      background: cardBackground,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      #{reportHistory.length - index}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: isDarkMode ? '#d1d5db' : secondaryTextColor, fontWeight: '500' }}>Income:</span>
                      <span style={{ fontWeight: '600', color: textColor, textShadow: isDarkMode ? '0 1px 1px rgba(0, 0, 0, 0.3)' : 'none' }}>₹{report.results.totalIncome.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: isDarkMode ? '#d1d5db' : secondaryTextColor, fontWeight: '500' }}>Tax:</span>
                      <span style={{ fontWeight: '600', color: textColor, textShadow: isDarkMode ? '0 1px 1px rgba(0, 0, 0, 0.3)' : 'none' }}>₹{Math.min(report.results.oldRegime.tax, report.results.newRegime.tax).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: isDarkMode ? '#d1d5db' : secondaryTextColor, fontWeight: '500' }}>Better Regime:</span>
                      <span style={{ 
                        fontWeight: '600',
                        color: report.results.oldRegime.tax < report.results.newRegime.tax ? '#059669' : '#dc2626',
                        textShadow: isDarkMode ? '0 1px 1px rgba(0, 0, 0, 0.3)' : 'none'
                      }}>
                        {report.results.oldRegime.tax < report.results.newRegime.tax ? 'Old' : 'New'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleEditReport(report)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#2563eb',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#dc2626',
                        color: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIncomeForm = () => (
    <div style={{ 
      background: isDarkMode ? '#374151' : 'white', 
      borderRadius: '0.75rem', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      padding: '1.5rem' 
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: isDarkMode ? '#f9fafb' : '#1f2937', 
        marginBottom: '1.5rem' 
      }}>Income Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>Basic Salary *</label>
          <input
            type="number"
            value={incomeForm.basicSalary}
            onChange={(e) => setIncomeForm({...incomeForm, basicSalary: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Enter basic salary"
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>House Rent Allowance</label>
          <input
            type="number"
            value={incomeForm.houseRentAllowance}
            onChange={(e) => setIncomeForm({...incomeForm, houseRentAllowance: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Enter HRA"
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>Leave Travel Allowance</label>
          <input
            type="number"
            value={incomeForm.leaveTravelAllowance}
            onChange={(e) => setIncomeForm({...incomeForm, leaveTravelAllowance: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Enter LTA"
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>Other Allowances</label>
          <input
            type="number"
            value={incomeForm.otherAllowance}
            onChange={(e) => setIncomeForm({...incomeForm, otherAllowance: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Enter other allowances"
          />
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={incomeForm.isMetroCity}
            onChange={(e) => setIncomeForm({...incomeForm, isMetroCity: e.target.checked})}
            style={{ marginRight: '0.5rem' }}
          />
          <span style={{ 
            fontSize: '0.875rem', 
            color: isDarkMode ? '#d1d5db' : '#374151' 
          }}>Do you live in a metro city?</span>
        </label>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCurrentStep('dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => setCurrentStep('deductions')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Next: Deductions
        </button>
      </div>
    </div>
  );

  const renderDeductionForm = () => (
    <div style={{ 
      background: isDarkMode ? '#374151' : 'white', 
      borderRadius: '0.75rem', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      padding: '1.5rem' 
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: isDarkMode ? '#f9fafb' : '#1f2937', 
        marginBottom: '1.5rem' 
      }}>Deduction Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>
            Section 80C <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>(Max: ₹150,000)</span>
          </label>
          <input
            type="number"
            max="150000"
            value={deductionForm.section80C}
            onChange={(e) => setDeductionForm({...deductionForm, section80C: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="PPF, ELSS, etc."
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>
            Section 80D <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>(Max: ₹25,000)</span>
          </label>
          <input
            type="number"
            max="25000"
            value={deductionForm.section80D}
            onChange={(e) => setDeductionForm({...deductionForm, section80D: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Health Insurance"
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>
            Section 80TTA <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>(Max: ₹10,000)</span>
          </label>
          <input
            type="number"
            max="10000"
            value={deductionForm.section80TTA}
            onChange={(e) => setDeductionForm({...deductionForm, section80TTA: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Savings Account Interest"
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isDarkMode ? '#d1d5db' : '#374151', 
            marginBottom: '0.5rem' 
          }}>Rent Paid</label>
          <input
            type="number"
            value={deductionForm.rentPaid}
            onChange={(e) => setDeductionForm({...deductionForm, rentPaid: e.target.value})}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem', 
              fontSize: '1rem',
              backgroundColor: isDarkMode ? '#4b5563' : 'white',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            placeholder="Enter rent paid"
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCurrentStep('income')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back: Income
        </button>
        <button
          onClick={() => {
            calculateTax();
            setCurrentStep('results');
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Calculate Tax
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div style={{ 
      background: isDarkMode ? '#374151' : 'white', 
      borderRadius: '0.75rem', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      padding: '1.5rem' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: isDarkMode ? '#f9fafb' : '#1f2937' 
        }}>Tax Calculation Results</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={exportToPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#16a34a',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {taxResults ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            background: isDarkMode ? '#1e3a8a' : '#eff6ff', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: isDarkMode ? '#93c5fd' : '#1e40af', 
              marginBottom: '1rem' 
            }}>Income Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Basic Salary:</span>
                <span style={{ fontWeight: '500' }}>₹{incomeForm.basicSalary || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>HRA:</span>
                <span style={{ fontWeight: '500' }}>₹{incomeForm.houseRentAllowance || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>LTA:</span>
                <span style={{ fontWeight: '500' }}>₹{incomeForm.leaveTravelAllowance || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Other Allowances:</span>
                <span style={{ fontWeight: '500' }}>₹{incomeForm.otherAllowance || 0}</span>
              </div>
              <div style={{ 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, 
                paddingTop: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold',
                color: isDarkMode ? '#f9fafb' : '#374151'
              }}>
                <span>Total Income:</span>
                <span>₹{taxResults.totalIncome.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>HRA Exemption:</span>
                <span style={{ fontWeight: '500' }}>₹{taxResults.hraExemption.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: isDarkMode ? '#93c5fd' : '#1e40af' }}>
                <span>Taxable Income:</span>
                <span>₹{taxResults.taxableIncome.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ 
            background: isDarkMode ? '#14532d' : '#f0fdf4', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: isDarkMode ? '#86efac' : '#166534', 
              marginBottom: '1rem' 
            }}>Deductions Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Section 80C:</span>
                <span style={{ fontWeight: '500' }}>₹{deductionForm.section80C || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Section 80D:</span>
                <span style={{ fontWeight: '500' }}>₹{deductionForm.section80D || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Section 80TTA:</span>
                <span style={{ fontWeight: '500' }}>₹{deductionForm.section80TTA || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Rent Paid:</span>
                <span style={{ fontWeight: '500' }}>₹{deductionForm.rentPaid || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Standard Deduction:</span>
                <span style={{ fontWeight: '500' }}>₹{deductionForm.standardDeduction || 0}</span>
              </div>
              <div style={{ 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, 
                paddingTop: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold',
                color: isDarkMode ? '#f9fafb' : '#374151'
              }}>
                <span>Total Deductions:</span>
                <span>₹{taxResults.totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ 
            background: isDarkMode ? '#1e1b4b' : '#faf5ff', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: isDarkMode ? '#c4b5fd' : '#7c3aed', 
              marginBottom: '1rem' 
            }}>Old Tax Regime</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Taxable Income:</span>
                <span style={{ fontWeight: '500' }}>₹{taxResults.oldRegime.taxableIncome.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Tax Amount:</span>
                <span style={{ fontWeight: '500' }}>₹{taxResults.oldRegime.tax.toFixed(2)}</span>
              </div>
              <div style={{ 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, 
                paddingTop: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold',
                color: isDarkMode ? '#f9fafb' : '#374151'
              }}>
                <span>Total Payable:</span>
                <span>₹{taxResults.oldRegime.totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ 
            background: isDarkMode ? '#451a03' : '#fff7ed', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: isDarkMode ? '#fdba74' : '#ea580c', 
              marginBottom: '1rem' 
            }}>New Tax Regime</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Taxable Income:</span>
                <span style={{ fontWeight: '500' }}>₹{taxResults.newRegime.taxableIncome.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                <span>Tax Amount:</span>
                <span style={{ fontWeight: '500' }}>₹{taxResults.newRegime.tax.toFixed(2)}</span>
              </div>
              <div style={{ 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, 
                paddingTop: '0.5rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold',
                color: isDarkMode ? '#f9fafb' : '#374151'
              }}>
                <span>Total Payable:</span>
                <span>₹{taxResults.newRegime.totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ 
            background: isDarkMode ? '#422006' : '#fefce8', 
            padding: '1.5rem', 
            borderRadius: '0.5rem', 
            gridColumn: '1 / -1' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: isDarkMode ? '#fbbf24' : '#a16207', 
              marginBottom: '1rem' 
            }}>Recommendation</h3>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: isDarkMode ? '#f9fafb' : '#374151'
              }}>
                {taxResults.oldRegime.tax < taxResults.newRegime.tax ? 'Old Regime' : 'New Regime'}
              </div>
              <p style={{ 
                fontSize: '0.875rem', 
                color: isDarkMode ? '#9ca3af' : '#6b7280', 
                marginBottom: '0.5rem' 
              }}>is better for you</p>
              <div style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: isDarkMode ? '#4ade80' : '#16a34a' 
              }}>
                Savings: ₹{Math.abs(taxResults.oldRegime.tax - taxResults.newRegime.tax).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Calculator style={{ width: '4rem', height: '4rem', color: isDarkMode ? '#6b7280' : '#9ca3af', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: isDarkMode ? '#d1d5db' : '#6b7280', marginBottom: '0.5rem' }}>No calculation results</h3>
          <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Please fill in your income and deduction details to see the results.</p>
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setCurrentStep('deductions')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6b7280',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back: Deductions
        </button>
        {editingReport && (
          <button
            onClick={handleUpdateReport}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#059669',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Update Report
          </button>
        )}
        <button
          onClick={() => setCurrentStep('dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );

  // Profile Settings Modal
  const renderProfileModal = () => {
    if (!showProfileModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Profile Settings</h2>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter new email"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Current Password
              </label>
              <input
                type="password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter current password"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <input
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                placeholder="Confirm new password"
              />
            </div>



            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#6b7280',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      transition: 'all 0.3s ease'
    }}>
      {currentStep === 'auth' ? renderAuth() : renderDashboard()}
      {renderProfileModal()}
    </div>
  );
};

export default TaxCalculatorApp; 