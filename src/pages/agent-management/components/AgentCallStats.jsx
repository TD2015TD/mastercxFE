import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { agentService } from '../../../services/agentService';
import { format, subDays } from 'date-fns';

const AgentCallStats = ({ agentId }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (agentId) {
      fetchStats();
    }
  }, [agentId, startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentService.getCallStatistics(agentId, {
        start_date: startDate,
        end_date: endDate,
      });
      
      if (response.success) {
        setStats(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load call statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (field) => {
    if (stats.length === 0) return 0;
    return stats.reduce((acc, s) => {
      if (field.includes('.')) {
        const [category, key] = field.split('.');
        return acc + (s[category]?.[key] || 0);
      }
      return acc + (s[field] || 0);
    }, 0);
  };

  const calculateAverage = (field) => {
    if (stats.length === 0) return 0;
    const sum = stats.reduce((acc, s) => {
      if (field.includes('.')) {
        const [category, key] = field.split('.');
        return acc + (s[category]?.[key] || 0);
      }
      return acc + (s[field] || 0);
    }, 0);
    return (sum / stats.length).toFixed(2);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const renderStatCard = (title, value, unit = '') => (
    <Card>
      <CardContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}{unit}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading && stats.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard('Total Calls', calculateTotal('call_volume.total_calls'))}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard('Answered', calculateTotal('call_volume.answered_calls'))}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard('Answer Rate', calculateAverage('performance.answer_rate'), '%')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderStatCard('Avg Call Duration', calculateAverage('duration.avg_call_duration'), 's')}
        </Grid>
      </Grid>

      {/* Call Volume Table */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Call Volume Statistics
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Answered</TableCell>
                  <TableCell align="right">Missed</TableCell>
                  <TableCell align="right">Transferred</TableCell>
                  <TableCell align="right">Outbound</TableCell>
                  <TableCell align="right">Answer Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No call statistics available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((s) => (
                    <TableRow key={s.date}>
                      <TableCell>{format(new Date(s.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">{s.call_volume?.total_calls || 0}</TableCell>
                      <TableCell align="right">{s.call_volume?.answered_calls || 0}</TableCell>
                      <TableCell align="right">{s.call_volume?.missed_calls || 0}</TableCell>
                      <TableCell align="right">{s.call_volume?.transferred_calls || 0}</TableCell>
                      <TableCell align="right">{s.call_volume?.outbound_calls || 0}</TableCell>
                      <TableCell align="right">
                        {s.performance?.answer_rate?.toFixed(1) || 0}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Duration Stats Table */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Call Duration Statistics
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Talk Time</TableCell>
                  <TableCell align="right">Avg Duration</TableCell>
                  <TableCell align="right">Longest Call</TableCell>
                  <TableCell align="right">Shortest Call</TableCell>
                  <TableCell align="right">ACW Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No duration data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((s) => (
                    <TableRow key={s.date}>
                      <TableCell>{format(new Date(s.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        {formatDuration(s.duration?.total_talk_time || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {s.duration?.avg_call_duration || 0}s
                      </TableCell>
                      <TableCell align="right">
                        {s.duration?.longest_call_duration || 0}s
                      </TableCell>
                      <TableCell align="right">
                        {s.duration?.shortest_call_duration || 0}s
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(s.after_call_work?.total_acw_time || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Availability Stats Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Availability Statistics
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Logged In</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Busy</TableCell>
                  <TableCell align="right">Away</TableCell>
                  <TableCell align="right">Occupancy</TableCell>
                  <TableCell align="right">Utilization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No availability data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((s) => (
                    <TableRow key={s.date}>
                      <TableCell>{format(new Date(s.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        {formatDuration(s.availability?.logged_in_time || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(s.availability?.available_time || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(s.availability?.busy_time || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(s.availability?.away_time || 0)}
                      </TableCell>
                      <TableCell align="right">
                        {s.performance?.occupancy_rate?.toFixed(1) || 0}%
                      </TableCell>
                      <TableCell align="right">
                        {s.performance?.utilization_rate?.toFixed(1) || 0}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Period Totals */}
      {stats.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Period Totals & Averages
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Total Calls
                </Typography>
                <Typography variant="h6">
                  {calculateTotal('call_volume.total_calls')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Answered
                </Typography>
                <Typography variant="h6">
                  {calculateTotal('call_volume.answered_calls')}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Avg Answer Rate
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('performance.answer_rate')}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Avg Occupancy
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('performance.occupancy_rate')}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Avg Utilization
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('performance.utilization_rate')}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="body2" color="textSecondary">
                  Total Talk Time
                </Typography>
                <Typography variant="h6">
                  {formatDuration(calculateTotal('duration.total_talk_time'))}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AgentCallStats;
