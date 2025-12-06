import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';

const AgentForm = ({ agent, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    employee_id: '',
    department: '',
    designation: '',
    mitel_agent_id: '',
    mitel_extension: '',
    mitel_queue_ids: [],
    status: 'active',
    availability: 'offline',
    skills: [],
    languages: [],
    max_concurrent_tickets: 5,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (agent) {
      setFormData({
        user_id: agent.user_id || '',
        employee_id: agent.employee_id || '',
        department: agent.department || '',
        designation: agent.designation || '',
        mitel_agent_id: agent.mitel_agent_id || '',
        mitel_extension: agent.mitel_extension || '',
        mitel_queue_ids: agent.mitel_queue_ids || [],
        status: agent.status || 'active',
        availability: agent.availability || 'offline',
        skills: agent.skills || [],
        languages: agent.languages || [],
        max_concurrent_tickets: agent.max_concurrent_tickets || 5,
        notes: agent.notes || '',
      });
    }
  }, [agent]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleArrayChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.user_id) {
      newErrors.user_id = 'User ID is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (formData.max_concurrent_tickets < 1) {
      newErrors.max_concurrent_tickets = 'Must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="User ID"
            value={formData.user_id}
            onChange={handleChange('user_id')}
            error={!!errors.user_id}
            helperText={errors.user_id || 'Link to existing user'}
            required
            type="number"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Employee ID"
            value={formData.employee_id}
            onChange={handleChange('employee_id')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.department}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              onChange={handleChange('department')}
              label="Department"
            >
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Support">Support</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Customer Service">Customer Service</MenuItem>
            </Select>
            {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Designation"
            value={formData.designation}
            onChange={handleChange('designation')}
          />
        </Grid>

        {/* Mitel Integration */}
        <Grid item xs={12}>
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 1 }}>
            <InputLabel sx={{ mb: 1, fontWeight: 'bold' }}>Mitel Telephony</InputLabel>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Mitel Agent ID"
            value={formData.mitel_agent_id}
            onChange={handleChange('mitel_agent_id')}
            helperText="Leave empty to disable"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Extension"
            value={formData.mitel_extension}
            onChange={handleChange('mitel_extension')}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Queue IDs</InputLabel>
            <Select
              multiple
              value={formData.mitel_queue_ids}
              onChange={handleArrayChange('mitel_queue_ids')}
              input={<OutlinedInput label="Queue IDs" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="1001">Queue 1001</MenuItem>
              <MenuItem value="1002">Queue 1002</MenuItem>
              <MenuItem value="1003">Queue 1003</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Status and Availability */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleChange('status')}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Availability</InputLabel>
            <Select
              value={formData.availability}
              onChange={handleChange('availability')}
              label="Availability"
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="busy">Busy</MenuItem>
              <MenuItem value="away">Away</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Skills and Languages */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Skills</InputLabel>
            <Select
              multiple
              value={formData.skills}
              onChange={handleArrayChange('skills')}
              input={<OutlinedInput label="Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Technical Support">Technical Support</MenuItem>
              <MenuItem value="Billing">Billing</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Customer Service">Customer Service</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Languages</InputLabel>
            <Select
              multiple
              value={formData.languages}
              onChange={handleArrayChange('languages')}
              input={<OutlinedInput label="Languages" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ms">Bahasa Melayu</MenuItem>
              <MenuItem value="zh">中文</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Settings */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Max Concurrent Tickets"
            value={formData.max_concurrent_tickets}
            onChange={handleChange('max_concurrent_tickets')}
            error={!!errors.max_concurrent_tickets}
            helperText={errors.max_concurrent_tickets}
            inputProps={{ min: 1, max: 20 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
          />
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">
              {agent ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentForm;
