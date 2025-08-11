import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { api } from '../lib/api';

interface TaxRecord {
  _id: string;
  userName: string;
  income: number;
  taxRegime: 'old' | 'new';
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveTaxRate: number;
  calculationDetails: any;
  date: string;
  formattedDate: string;
}

const TaxHistory: React.FC = () => {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    userName: '',
    taxRegime: '',
  });
  const [selectedRecord, setSelectedRecord] = useState<TaxRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [page, rowsPerPage, filters]);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      if (filters.userName) params.append('userName', filters.userName);
      if (filters.taxRegime) params.append('taxRegime', filters.taxRegime);

      const response = await api.get(`/api/tax/history?${params}`);
      
      setRecords(response.data.data);
      setTotalRecords(response.data.pagination.totalRecords);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await api.delete(`/api/tax/${id}`);
      setRecords(prev => prev.filter(record => record._id !== id));
      setTotalRecords(prev => prev - 1);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const getRegimeColor = (regime: string) => {
    return regime === 'new' ? 'primary' : 'secondary';
  };

  const getRegimeLabel = (regime: string) => {
    return regime === 'new' ? 'New (2023-24)' : 'Old';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Tax Calculation History
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Search by Name"
              value={filters.userName}
              onChange={(e) => handleFilterChange('userName', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tax Regime</InputLabel>
              <Select
                value={filters.taxRegime}
                label="Tax Regime"
                onChange={(e) => handleFilterChange('taxRegime', e.target.value)}
              >
                <MenuItem value="">All Regimes</MenuItem>
                <MenuItem value="new">New Regime</MenuItem>
                <MenuItem value="old">Old Regime</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchRecords}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Records Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Income</TableCell>
                  <TableCell>Regime</TableCell>
                  <TableCell>Tax Amount</TableCell>
                  <TableCell>Tax Rate</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {record.userName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(record.income)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRegimeLabel(record.taxRegime)}
                          color={getRegimeColor(record.taxRegime)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(record.taxAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatPercentage(record.effectiveTaxRate)}
                      </TableCell>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRecord(record)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setRecordToDelete(record._id);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Record Details Dialog */}
      <Dialog
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecord && (
          <>
            <DialogTitle>
              Tax Calculation Details - {selectedRecord.userName}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tax Regime:</Typography>
                  <Chip
                    label={getRegimeLabel(selectedRecord.taxRegime)}
                    color={getRegimeColor(selectedRecord.taxRegime)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Gross Income:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(selectedRecord.income)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Deductions:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(selectedRecord.deductions)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Taxable Income:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatCurrency(selectedRecord.taxableIncome)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tax Amount:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {formatCurrency(selectedRecord.taxAmount)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Effective Tax Rate:</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatPercentage(selectedRecord.effectiveTaxRate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Calculation Date:</Typography>
                  <Typography variant="body2">
                    {new Date(selectedRecord.date).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedRecord(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this tax calculation record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => recordToDelete && handleDeleteRecord(recordToDelete)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxHistory;
