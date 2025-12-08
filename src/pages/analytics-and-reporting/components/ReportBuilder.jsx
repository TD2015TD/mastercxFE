import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    dateRange: 'last_7_days',
    departments: [],
    agents: [],
    ticketStatus: [],
    priority: [],
    metrics: [],
    format: 'excel',
    schedule: 'none'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const departmentOptions = [
    { value: 'customs_declaration', label: 'Customs Declaration' },
    { value: 'tax_duties', label: 'Tax & Duties' },
    { value: 'import_export', label: 'Import/Export' },
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'technical_support', label: 'Technical Support' }
  ];

  const agentOptions = [
    { value: 'ahmad_rahman', label: 'Ahmad Rahman' },
    { value: 'siti_nurhaliza', label: 'Siti Nurhaliza' },
    { value: 'muhammad_ali', label: 'Muhammad Ali' },
    { value: 'fatimah_zahra', label: 'Fatimah Zahra' },
    { value: 'hassan_ibrahim', label: 'Hassan Ibrahim' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'p1', label: 'P1 - Critical' },
    { value: 'p2', label: 'P2 - High' },
    { value: 'p3', label: 'P3 - Medium' },
    { value: 'p4', label: 'P4 - Low' },
    { value: 'p5', label: 'P5 - Planning' }
  ];

  const metricsOptions = [
    { value: 'ticket_volume', label: 'Ticket Volume', description: 'Total number of tickets created and resolved' },
    { value: 'sla_performance', label: 'SLA Performance', description: 'SLA compliance rates and breach analysis' },
    { value: 'agent_productivity', label: 'Agent Productivity', description: 'Individual agent performance metrics' },
    { value: 'customer_satisfaction', label: 'Customer Satisfaction', description: 'CSAT scores and feedback analysis' },
    { value: 'resolution_time', label: 'Resolution Time', description: 'Average and median resolution times' },
    { value: 'escalation_rate', label: 'Escalation Rate', description: 'Percentage of tickets escalated' }
  ];

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'csv', label: 'CSV File' }
  ];

  const scheduleOptions = [
    { value: 'none', label: 'Generate Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const handleInputChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetricToggle = (metricValue) => {
    setReportConfig(prev => ({
      ...prev,
      metrics: prev?.metrics?.includes(metricValue)
        ? prev?.metrics?.filter(m => m !== metricValue)
        : [...prev?.metrics, metricValue]
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    
    // Show success message or download file
    alert('Report generated successfully! Download will begin shortly.');
  };

  const handleSaveTemplate = () => {
    const template = {
      ...reportConfig,
      id: Date.now(),
      createdAt: new Date()?.toISOString()
    };
    
    const savedTemplates = JSON.parse(localStorage.getItem('report-templates') || '[]');
    savedTemplates?.push(template);
    localStorage.setItem('report-templates', JSON.stringify(savedTemplates));
    
    alert('Report template saved successfully!');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Custom Report Builder</h3>
          <p className="text-sm text-muted-foreground">Create tailored reports with specific filters and metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Save"
            iconPosition="left"
            onClick={handleSaveTemplate}
            disabled={!reportConfig?.name || reportConfig?.metrics?.length === 0}
          >
            Save Template
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            loading={isGenerating}
            onClick={handleGenerateReport}
            disabled={reportConfig?.metrics?.length === 0}
          >
            Generate Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Configuration */}
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Report Configuration</h4>
            
            <div className="space-y-4">
              <Input
                label="Report Name"
                type="text"
                placeholder="Enter report name"
                value={reportConfig?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                required
              />
              
              <Input
                label="Description"
                type="text"
                placeholder="Brief description of the report"
                value={reportConfig?.description}
                onChange={(e) => handleInputChange('description', e?.target?.value)}
              />
              
              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={reportConfig?.dateRange}
                onChange={(value) => handleInputChange('dateRange', value)}
              />
              
              <Select
                label="Export Format"
                options={formatOptions}
                value={reportConfig?.format}
                onChange={(value) => handleInputChange('format', value)}
              />
              
              <Select
                label="Schedule"
                description="Set up automatic report generation"
                options={scheduleOptions}
                value={reportConfig?.schedule}
                onChange={(value) => handleInputChange('schedule', value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-4">Filters</h4>
            
            <div className="space-y-4">
              <Select
                label="Departments"
                description="Select specific departments to include"
                options={departmentOptions}
                value={reportConfig?.departments}
                onChange={(value) => handleInputChange('departments', value)}
                multiple
                searchable
                clearable
              />
              
              <Select
                label="Agents"
                description="Filter by specific agents"
                options={agentOptions}
                value={reportConfig?.agents}
                onChange={(value) => handleInputChange('agents', value)}
                multiple
                searchable
                clearable
              />
              
              <Select
                label="Ticket Status"
                options={statusOptions}
                value={reportConfig?.ticketStatus}
                onChange={(value) => handleInputChange('ticketStatus', value)}
                multiple
                clearable
              />
              
              <Select
                label="Priority Levels"
                options={priorityOptions}
                value={reportConfig?.priority}
                onChange={(value) => handleInputChange('priority', value)}
                multiple
                clearable
              />
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        <div>
          <h4 className="text-md font-medium text-foreground mb-4">Select Metrics</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the metrics and data points to include in your report
          </p>
          
          <div className="space-y-3">
            {metricsOptions?.map((metric) => (
              <div key={metric?.value} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200">
                <Checkbox
                  label={metric?.label}
                  description={metric?.description}
                  checked={reportConfig?.metrics?.includes(metric?.value)}
                  onChange={() => handleMetricToggle(metric?.value)}
                />
              </div>
            ))}
          </div>

          {/* Report Preview */}
          {reportConfig?.metrics?.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h5 className="font-medium text-foreground mb-2">Report Preview</h5>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Name:</strong> {reportConfig?.name || 'Untitled Report'}</p>
                <p><strong>Date Range:</strong> {dateRangeOptions?.find(d => d?.value === reportConfig?.dateRange)?.label}</p>
                <p><strong>Metrics:</strong> {reportConfig?.metrics?.length} selected</p>
                <p><strong>Format:</strong> {formatOptions?.find(f => f?.value === reportConfig?.format)?.label}</p>
                {reportConfig?.departments?.length > 0 && (
                  <p><strong>Departments:</strong> {reportConfig?.departments?.length} selected</p>
                )}
                {reportConfig?.agents?.length > 0 && (
                  <p><strong>Agents:</strong> {reportConfig?.agents?.length} selected</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;