import express from 'express';
import TaxRecord from '../models/TaxRecord.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Calculate tax for both old and new regimes (Protected Route)
router.post('/calculate', auth, async (req, res) => {
  try {
    const { userName, income, taxRegime = 'new', deductions = 0 } = req.body;

    // Validation
    if (!userName || !income) {
      return res.status(400).json({ 
        error: 'User name and income are required' 
      });
    }

    if (income < 0) {
      return res.status(400).json({ 
        error: 'Income cannot be negative' 
      });
    }

    if (deductions < 0) {
      return res.status(400).json({ 
        error: 'Deductions cannot be negative' 
      });
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, income - deductions);

    let taxAmount, effectiveTaxRate, calculationDetails;

    if (taxRegime === 'new') {
      // New Tax Regime (2023-24)
      const result = calculateNewTaxRegime(taxableIncome);
      taxAmount = result.taxAmount;
      effectiveTaxRate = result.effectiveTaxRate;
      calculationDetails = result.details;
    } else {
      // Old Tax Regime
      const result = calculateOldTaxRegime(taxableIncome, deductions);
      taxAmount = result.taxAmount;
      effectiveTaxRate = result.effectiveTaxRate;
      calculationDetails = result.details;
    }

    // Create and save tax record
    const taxRecord = new TaxRecord({
      user: req.user._id,
      userName,
      income,
      taxRegime,
      deductions,
      taxableIncome,
      taxAmount,
      effectiveTaxRate,
      calculationDetails
    });

    await taxRecord.save();

    res.status(201).json({
      success: true,
      data: {
        userName,
        income,
        taxRegime,
        deductions,
        taxableIncome,
        taxAmount,
        effectiveTaxRate,
        calculationDetails
      },
      record: taxRecord
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate tax',
      message: error.message 
    });
  }
});

// Get tax calculation history (Protected Route - User's own records only)
router.get('/history', auth, async (req, res) => {
  try {
    const { userName, taxRegime, limit = 50, page = 1 } = req.query;
    
    const query = { user: req.user._id };
    if (userName) query.userName = { $regex: userName, $options: 'i' };
    if (taxRegime) query.taxRegime = taxRegime;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const records = await TaxRecord.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await TaxRecord.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        recordsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      message: error.message 
    });
  }
});

// Get tax statistics (Protected Route - User's own stats only)
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await TaxRecord.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalIncome: { $sum: '$income' },
          totalTax: { $sum: '$taxAmount' },
          avgTaxRate: { $avg: '$effectiveTaxRate' },
          avgIncome: { $avg: '$income' }
        }
      }
    ]);

    const regimeStats = await TaxRecord.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$taxRegime',
          count: { $sum: 1 },
          avgTaxRate: { $avg: '$effectiveTaxRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {},
        byRegime: regimeStats
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// Delete a tax record (Protected Route - User can only delete their own records)
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await TaxRecord.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    res.json({ 
      success: true, 
      message: 'Record deleted successfully' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete record',
      message: error.message 
    });
  }
});

// Tax calculation functions
function calculateNewTaxRegime(taxableIncome) {
  let taxAmount = 0;
  const details = {};

  if (taxableIncome <= 300000) {
    taxAmount = 0;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
  } else if (taxableIncome <= 600000) {
    taxAmount = (taxableIncome - 300000) * 0.05;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '3,00,001 - 6,00,000', rate: '5%', tax: taxAmount };
  } else if (taxableIncome <= 900000) {
    taxAmount = 15000 + (taxableIncome - 600000) * 0.10;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '3,00,001 - 6,00,000', rate: '5%', tax: 15000 };
    details.slab3 = { range: '6,00,001 - 9,00,000', rate: '10%', tax: (taxableIncome - 600000) * 0.10 };
  } else if (taxableIncome <= 1200000) {
    taxAmount = 45000 + (taxableIncome - 900000) * 0.15;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '3,00,001 - 6,00,000', rate: '5%', tax: 15000 };
    details.slab3 = { range: '6,00,001 - 9,00,000', rate: '10%', tax: 30000 };
    details.slab4 = { range: '9,00,001 - 12,00,000', rate: '15%', tax: (taxableIncome - 900000) * 0.15 };
  } else if (taxableIncome <= 1500000) {
    taxAmount = 90000 + (taxableIncome - 1200000) * 0.20;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '3,00,001 - 6,00,000', rate: '5%', tax: 15000 };
    details.slab3 = { range: '6,00,001 - 9,00,000', rate: '10%', tax: 30000 };
    details.slab4 = { range: '9,00,001 - 12,00,000', rate: '15%', tax: 45000 };
    details.slab5 = { range: '12,00,001 - 15,00,000', rate: '20%', tax: (taxableIncome - 1200000) * 0.20 };
  } else {
    taxAmount = 150000 + (taxableIncome - 1500000) * 0.30;
    details.slab1 = { range: '0 - 3,00,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '3,00,001 - 6,00,000', rate: '5%', tax: 15000 };
    details.slab3 = { range: '6,00,001 - 9,00,000', rate: '10%', tax: 30000 };
    details.slab4 = { range: '9,00,001 - 12,00,000', rate: '15%', tax: 45000 };
    details.slab5 = { range: '12,00,001 - 15,00,000', rate: '20%', tax: 60000 };
    details.slab6 = { range: 'Above 15,00,000', rate: '30%', tax: (taxableIncome - 1500000) * 0.30 };
  }

  const effectiveTaxRate = taxableIncome > 0 ? (taxAmount / taxableIncome) * 100 : 0;

  return {
    taxAmount: Math.round(taxAmount),
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    details
  };
}

function calculateOldTaxRegime(taxableIncome, deductions) {
  let taxAmount = 0;
  const details = {};

  // Standard deduction of 50,000
  const standardDeduction = 50000;
  const finalTaxableIncome = Math.max(0, taxableIncome - standardDeduction);

  if (finalTaxableIncome <= 250000) {
    taxAmount = 0;
    details.slab1 = { range: '0 - 2,50,000', rate: '0%', tax: 0 };
  } else if (finalTaxableIncome <= 500000) {
    taxAmount = (finalTaxableIncome - 250000) * 0.05;
    details.slab1 = { range: '0 - 2,50,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '2,50,001 - 5,00,000', rate: '5%', tax: taxAmount };
  } else if (finalTaxableIncome <= 1000000) {
    taxAmount = 12500 + (finalTaxableIncome - 500000) * 0.20;
    details.slab1 = { range: '0 - 2,50,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '2,50,001 - 5,00,000', rate: '5%', tax: 12500 };
    details.slab3 = { range: '5,00,001 - 10,00,000', rate: '20%', tax: (finalTaxableIncome - 500000) * 0.20 };
  } else {
    taxAmount = 112500 + (finalTaxableIncome - 1000000) * 0.30;
    details.slab1 = { range: '0 - 2,50,000', rate: '0%', tax: 0 };
    details.slab2 = { range: '2,50,001 - 5,00,000', rate: '5%', tax: 12500 };
    details.slab3 = { range: '5,00,001 - 10,00,000', rate: '20%', tax: 100000 };
    details.slab4 = { range: 'Above 10,00,000', rate: '30%', tax: (finalTaxableIncome - 1000000) * 0.30 };
  }

  // Add 4% Health and Education Cess
  const cess = taxAmount * 0.04;
  taxAmount += cess;
  details.cess = { description: 'Health and Education Cess', rate: '4%', amount: cess };

  const effectiveTaxRate = finalTaxableIncome > 0 ? (taxAmount / finalTaxableIncome) * 100 : 0;

  return {
    taxAmount: Math.round(taxAmount),
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    details: {
      ...details,
      standardDeduction: { amount: standardDeduction, description: 'Standard Deduction' }
    }
  };
}

export default router;
