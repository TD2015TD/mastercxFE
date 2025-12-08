import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  ButtonGroup,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { agentService } from '../../../services/agentService';

const AgentMitelControl = ({ agent }) => {
  const [mitelState, setMitelState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (agent?.id) {
      fetchMitelState();
    }
  }, [agent?.id]);

  const fetchMitelState = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentService.getMitelState(agent.id);
      
      if (response.success) {
        setMitelState(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Mitel state');
    } finally {
      setLoading(false);
    }
  };

  const updateState = async (newState) => {
    try {
      setUpdating(true);
      setError(null);
      const response = await agentService.updateMitelState(agent.id, {
        mitel_state: newState,
      });
      
      if (response.success) {
        setSuccess(`Agent state updated to ${newState}`);
        setMitelState(response.data);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update state');
    } finally {
      setUpdating(false);
    }
  };

  const getStateColor = (state) => {
    const colors = {
      available: 'success',
      busy: 'warning',
      'on-call': 'info',
      'after-call-work': 'secondary',
      away: 'default',
      offline: 'default',
    };
    return colors[state] || 'default';
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'available':
        return <PhoneIcon />;
      case 'busy':
      case 'on-call':
        return <PhoneIcon color="primary" />;
      case 'offline':
        return <PhoneDisabledIcon />;
      case 'away':
        return <PauseIcon />;
      default:
        return <PhoneIcon />;
    }
  };

  if (!agent.mitel_agent_id) {
    return (
      <Alert severity="info">
        This agent does not have Mitel telephony integration enabled.
      </Alert>
    );
  }

  if (loading && !mitelState) {
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Current State */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Current Mitel State
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchMitelState}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                State
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {getStateIcon(mitelState?.state)}
                <Chip
                  label={mitelState?.state || 'unknown'}
                  color={getStateColor(mitelState?.state)}
                  size="medium"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Logged In
              </Typography>
              <Typography variant="h6">
                {mitelState?.logged_in ? 'Yes' : 'No'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Extension
              </Typography>
              <Typography variant="h6">
                {agent.mitel_extension || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                Agent ID
              </Typography>
              <Typography variant="h6">
                {agent.mitel_agent_id}
              </Typography>
            </Grid>

            {mitelState?.current_call && (
              <>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Current Call
                  </Typography>
                  <Typography variant="body1">
                    {mitelState.current_call.phone_number || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Duration: {mitelState.current_call.duration || 0}s
                  </Typography>
                </Grid>
              </>
            )}

            {agent.mitel_queue_ids && agent.mitel_queue_ids.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Assigned Queues
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {agent.mitel_queue_ids.map((queueId) => (
                      <Chip key={queueId} label={queueId} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* State Controls */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Change State
              </Typography>
              <ButtonGroup variant="outlined" fullWidth disabled={updating}>
                <Button
                  onClick={() => updateState('available')}
                  color="success"
                  startIcon={<PlayArrowIcon />}
                >
                  Available
                </Button>
                <Button
                  onClick={() => updateState('away')}
                  color="warning"
                  startIcon={<PauseIcon />}
                >
                  Away
                </Button>
                <Button
                  onClick={() => updateState('offline')}
                  color="error"
                  startIcon={<PhoneDisabledIcon />}
                >
                  Offline
                </Button>
              </ButtonGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Set Custom State
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select State</InputLabel>
                <Select
                  value={mitelState?.state || ''}
                  onChange={(e) => updateState(e.target.value)}
                  label="Select State"
                  disabled={updating}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="busy">Busy</MenuItem>
                  <MenuItem value="on-call">On Call</MenuItem>
                  <MenuItem value="after-call-work">After Call Work</MenuItem>
                  <MenuItem value="away">Away</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {updating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* State History/Info */}
      {mitelState?.last_state_change && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              State Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Last State Change
                </Typography>
                <Typography variant="body1">
                  {new Date(mitelState.last_state_change).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  State Duration
                </Typography>
                <Typography variant="body1">
                  {Math.floor((Date.now() - new Date(mitelState.last_state_change)) / 1000 / 60)} minutes
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AgentMitelControl;
