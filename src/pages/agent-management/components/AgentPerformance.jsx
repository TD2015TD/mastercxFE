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
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { agentService } from '../../../services/agentService';
import { format, subDays } from 'date-fns';

const AgentPerformance = ({ agentId }) => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (agentId) {
      fetchPerformance();
    }
  }, [agentId, startDate, endDate]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentService.getPerformance(agentId, {
        start_date: startDate,
        end_date: endDate,
      });
      
      if (response.success) {
        setPerformance(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (field) => {
    if (performance.length === 0) return 0;
    const sum = performance.reduce((acc, p) => {
      // Navigate nested structure
      if (field.includes('.')) {
        const [category, key] = field.split('.');
        return acc + (p[category]?.[key] || 0);
      }
      return acc + (p[field] || 0);
    }, 0);
    return (sum / performance.length).toFixed(2);
  };

  const getLatestMetric = (field) => {
    if (performance.length === 0) return 0;
    const latest = performance[0];
    if (field.includes('.')) {
      const [category, key] = field.split('.');
      return latest[category]?.[key] || 0;
    }
    return latest[field] || 0;
  };

  const renderMetricCard = (title, value, unit = '', target = null) => {
    const progress = target ? (value / target) * 100 : null;
    const color = progress ? (progress >= 100 ? 'success' : progress >= 80 ? 'warning' : 'error') : 'primary';
    
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}{unit}
          </Typography>
          {target && (
            <>
              <Typography variant="caption" color="textSecondary">
                Target: {target}{unit}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(progress, 100)}
                color={color}
                sx={{ mt: 1 }}
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && performance.length === 0) {
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
          {renderMetricCard(
            'Tickets Resolved',
            getLatestMetric('tickets.resolved'),
            '',
            getLatestMetric('tickets.daily_target')
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'SLA Compliance',
            getLatestMetric('quality.sla_compliance_rate'),
            '%'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Customer Satisfaction',
            getLatestMetric('quality.customer_satisfaction_score'),
            '/5'
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Avg Resolution Time',
            getLatestMetric('response_times.avg_resolution_time'),
            ' min'
          )}
        </Grid>
      </Grid>

      {/* Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance History
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Resolved</TableCell>
                  <TableCell align="right">Target</TableCell>
                  <TableCell align="right">Achievement</TableCell>
                  <TableCell align="right">Avg Response</TableCell>
                  <TableCell align="right">SLA %</TableCell>
                  <TableCell align="right">CSAT</TableCell>
                  <TableCell align="right">FCR %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No performance data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  performance.map((p) => {
                    const achievement = p.tickets?.target_achievement_rate || 0;
                    const achievementColor = achievement >= 100 ? 'success' : achievement >= 80 ? 'warning' : 'error';
                    
                    return (
                      <TableRow key={p.date}>
                        <TableCell>{format(new Date(p.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell align="right">{p.tickets?.resolved || 0}</TableCell>
                        <TableCell align="right">{p.tickets?.daily_target || 0}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${achievement.toFixed(0)}%`}
                            color={achievementColor}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {p.response_times?.avg_response_time || 0} min
                        </TableCell>
                        <TableCell align="right">
                          {p.quality?.sla_compliance_rate || 0}%
                        </TableCell>
                        <TableCell align="right">
                          {p.quality?.customer_satisfaction_score || 0}/5
                        </TableCell>
                        <TableCell align="right">
                          {p.quality?.first_contact_resolution_rate || 0}%
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Averages Summary */}
      {performance.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Period Averages
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Avg Resolved/Day
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('tickets.resolved')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Avg SLA Compliance
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('quality.sla_compliance_rate')}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Avg CSAT Score
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('quality.customer_satisfaction_score')}/5
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Avg FCR Rate
                </Typography>
                <Typography variant="h6">
                  {calculateAverage('quality.first_contact_resolution_rate')}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AgentPerformance;
