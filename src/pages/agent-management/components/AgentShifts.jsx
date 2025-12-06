import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { agentService } from '../../../services/agentService';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

const AgentShifts = ({ agentId }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  
  const [formData, setFormData] = useState({
    shift_date: format(new Date(), 'yyyy-MM-dd'),
    shift_start: '09:00',
    shift_end: '17:00',
    shift_type: 'morning',
    break_duration: 60,
    is_off_day: false,
    notes: '',
  });

  const [startDate, setStartDate] = useState(format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date()), 'yyyy-MM-dd'));

  useEffect(() => {
    if (agentId) {
      fetchShifts();
    }
  }, [agentId, startDate, endDate]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentService.getShifts(agentId, {
        start_date: startDate,
        end_date: endDate,
      });
      
      if (response.success) {
        setShifts(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedShift(null);
    setFormData({
      shift_date: format(new Date(), 'yyyy-MM-dd'),
      shift_start: '09:00',
      shift_end: '17:00',
      shift_type: 'morning',
      break_duration: 60,
      is_off_day: false,
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setFormData({
      shift_date: shift.date,
      shift_start: shift.start,
      shift_end: shift.end,
      shift_type: shift.type,
      break_duration: shift.break_minutes || 60,
      is_off_day: shift.is_off_day || false,
      notes: shift.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await agentService.createOrUpdateShift(agentId, formData);
      
      if (response.success) {
        setSuccess('Shift saved successfully');
        setDialogOpen(false);
        fetchShifts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save shift');
    }
  };

  const loadCurrentWeek = () => {
    const now = new Date();
    setStartDate(format(startOfWeek(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(now), 'yyyy-MM-dd'));
  };

  const loadNextWeek = () => {
    const nextStart = addDays(new Date(startDate), 7);
    const nextEnd = addDays(new Date(endDate), 7);
    setStartDate(format(nextStart, 'yyyy-MM-dd'));
    setEndDate(format(nextEnd, 'yyyy-MM-dd'));
  };

  const loadPreviousWeek = () => {
    const prevStart = addDays(new Date(startDate), -7);
    const prevEnd = addDays(new Date(endDate), -7);
    setStartDate(format(prevStart, 'yyyy-MM-dd'));
    setEndDate(format(prevEnd, 'yyyy-MM-dd'));
  };

  const getShiftTypeColor = (type) => {
    const colors = {
      morning: 'info',
      afternoon: 'warning',
      evening: 'secondary',
      night: 'default',
    };
    return colors[type] || 'default';
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={loadPreviousWeek}>
            Previous Week
          </Button>
          <Button size="small" variant="outlined" onClick={loadCurrentWeek}>
            Current Week
          </Button>
          <Button size="small" variant="outlined" onClick={loadNextWeek}>
            Next Week
          </Button>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleCreate}>
          Add Shift
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shift Schedule ({format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd')})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Break (min)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No shifts scheduled
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shifts.map((shift) => (
                      <TableRow key={shift.date}>
                        <TableCell>{format(new Date(shift.date), 'EEE, MMM dd')}</TableCell>
                        <TableCell>
                          <Chip
                            label={shift.type}
                            color={getShiftTypeColor(shift.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{shift.start}</TableCell>
                        <TableCell>{shift.end}</TableCell>
                        <TableCell>{shift.duration_hours}h</TableCell>
                        <TableCell>{shift.break_minutes}</TableCell>
                        <TableCell>
                          {shift.is_off_day ? (
                            <Chip label="Off Day" size="small" color="default" />
                          ) : shift.is_active ? (
                            <Chip label="Active" size="small" color="success" />
                          ) : (
                            <Chip label="Scheduled" size="small" color="info" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEdit(shift)}>
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Shift Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedShift ? 'Edit Shift' : 'Add New Shift'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Shift Date"
                value={formData.shift_date}
                onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={formData.shift_start}
                onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={formData.is_off_day}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={formData.shift_end}
                onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                InputLabelProps={{ shrink: true }}
                disabled={formData.is_off_day}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Shift Type</InputLabel>
                <Select
                  value={formData.shift_type}
                  onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                  label="Shift Type"
                  disabled={formData.is_off_day}
                >
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                  <MenuItem value="night">Night</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Break Duration (min)"
                value={formData.break_duration}
                onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                InputProps={{ inputProps: { min: 0, max: 120 } }}
                disabled={formData.is_off_day}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_off_day}
                    onChange={(e) => setFormData({ ...formData, is_off_day: e.target.checked })}
                  />
                  {' '}Mark as Off Day
                </label>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentShifts;
