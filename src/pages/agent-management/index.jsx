import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { agentService } from '../../services/agentService';
import AgentForm from './components/AgentForm';
import AgentShifts from './components/AgentShifts';
import AgentPerformance from './components/AgentPerformance';
import AgentCallStats from './components/AgentCallStats';
import AgentMitelControl from './components/AgentMitelControl';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchParams] = useSearchParams();
  const autoOpenDone = useRef(false);

  useEffect(() => {
    fetchAgents();
  }, [page, departmentFilter, statusFilter, availabilityFilter]);

  useEffect(() => {
    if (autoOpenDone.current) return;
    const agentId = searchParams.get('agentId');
    if (agentId && agents.length > 0) {
      const agent = agents.find(a => String(a.id) === String(agentId));
      if (agent) {
        autoOpenDone.current = true;
        handleViewDetails(agent);
      }
    }
  }, [agents, searchParams]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentService.getAgents({
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
        availability: availabilityFilter,
        per_page: perPage,
        page,
      });
      
      if (response.success) {
        setAgents(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAgents();
  };

  const handleCreate = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  const handleEdit = (agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleDelete = (agent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (agent) => {
    setSelectedAgent(agent);
    setDetailTab(0);
    setDetailDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await agentService.deleteAgent(selectedAgent.id);
      if (response.success) {
        setSuccess('Agent deleted successfully');
        setDeleteDialogOpen(false);
        fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete agent');
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      let response;
      if (selectedAgent) {
        response = await agentService.updateAgent(selectedAgent.id, data);
      } else {
        response = await agentService.createAgent(data);
      }
      
      if (response.success) {
        setSuccess(selectedAgent ? 'Agent updated successfully' : 'Agent created successfully');
        setDialogOpen(false);
        fetchAgents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save agent');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
    };
    return colors[status] || 'default';
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      available: 'success',
      busy: 'warning',
      away: 'info',
      offline: 'default',
    };
    return colors[availability] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Agent Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleCreate}
        >
          Add Agent
        </Button>
      </Box>

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

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Name, email, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Support">Support</MenuItem>
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Billing">Billing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Availability</InputLabel>
              <Select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                label="Availability"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="away">Away</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAgents}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Agents Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Mitel</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No agents found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((agent) => (
                  <TableRow key={agent.id} hover>
                    <TableCell>{agent.agent_code}</TableCell>
                    <TableCell>{agent.user?.name || '-'}</TableCell>
                    <TableCell>{agent.user?.email || '-'}</TableCell>
                    <TableCell>{agent.department}</TableCell>
                    <TableCell>
                      <Chip
                        label={agent.status}
                        color={getStatusColor(agent.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={agent.availability}
                        color={getAvailabilityColor(agent.availability)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {agent.mitel_agent_id ? (
                        <Chip
                          icon={<PhoneIcon />}
                          label={agent.mitel_extension || 'Enabled'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewDetails(agent)}
                        title="View Details"
                      >
                        <AssessmentIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(agent)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(agent)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Agent Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAgent ? 'Edit Agent' : 'Create New Agent'}
        </DialogTitle>
        <DialogContent>
          <AgentForm
            agent={selectedAgent}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete agent <strong>{selectedAgent?.user?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agent Details Dialog with Tabs */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Agent Details - {selectedAgent?.user?.name}
          <Typography variant="caption" display="block" color="textSecondary">
            {selectedAgent?.agent_code}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Tabs value={detailTab} onChange={(e, newValue) => setDetailTab(newValue)}>
            <Tab icon={<PhoneIcon />} label="Mitel Control" />
            <Tab icon={<CalendarIcon />} label="Shifts" />
            <Tab icon={<AssessmentIcon />} label="Performance" />
            <Tab icon={<PhoneIcon />} label="Call Statistics" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {detailTab === 0 && selectedAgent && (
              <AgentMitelControl agent={selectedAgent} />
            )}
            {detailTab === 1 && selectedAgent && (
              <AgentShifts agentId={selectedAgent.id} />
            )}
            {detailTab === 2 && selectedAgent && (
              <AgentPerformance agentId={selectedAgent.id} />
            )}
            {detailTab === 3 && selectedAgent && (
              <AgentCallStats agentId={selectedAgent.id} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentManagement;
