import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ComplianceDashboard = () => {
  const [selectedCertification, setSelectedCertification] = useState(null);

  const complianceMetrics = [
    {
      id: 1,
      title: "Government ICT Standards",
      status: "Compliant",
      score: 98,
      lastAssessment: "2024-10-15",
      nextReview: "2025-01-15",
      requirements: 45,
      compliant: 44,
      nonCompliant: 1,
      icon: "Shield"
    },
    {
      id: 2,
      title: "Data Protection Act 2010",
      status: "Compliant",
      score: 95,
      lastAssessment: "2024-09-20",
      nextReview: "2024-12-20",
      requirements: 32,
      compliant: 30,
      nonCompliant: 2,
      icon: "Lock"
    },
    {
      id: 3,
      title: "ISO 27001:2013",
      status: "Partial",
      score: 87,
      lastAssessment: "2024-10-01",
      nextReview: "2024-11-01",
      requirements: 114,
      compliant: 99,
      nonCompliant: 15,
      icon: "Award"
    },
    {
      id: 4,
      title: "ISMS Framework",
      status: "Compliant",
      score: 92,
      lastAssessment: "2024-09-30",
      nextReview: "2024-12-30",
      requirements: 28,
      compliant: 26,
      nonCompliant: 2,
      icon: "FileCheck"
    }
  ];

  const certifications = [
    {
      id: 1,
      name: "MSC Malaysia Certification",
      type: "Government Certification",
      status: "Active",
      issueDate: "2023-06-15",
      expiryDate: "2025-06-15",
      renewalDue: "2025-04-15",
      authority: "Malaysia Digital Economy Corporation",
      certificateNumber: "MSC-2023-JKDM-001",
      documents: ["Certificate.pdf", "Compliance_Report.pdf"]
    },
    {
      id: 2,
      name: "ISO 27001:2013",
      type: "International Standard",
      status: "Renewal Required",
      issueDate: "2022-03-20",
      expiryDate: "2025-03-20",
      renewalDue: "2024-12-20",
      authority: "SIRIM QAS International",
      certificateNumber: "ISO27001-2022-JKDM",
      documents: ["ISO_Certificate.pdf", "Audit_Report.pdf"]
    },
    {
      id: 3,
      name: "Government Cloud Security",
      type: "Security Certification",
      status: "Active",
      issueDate: "2024-01-10",
      expiryDate: "2026-01-10",
      renewalDue: "2025-10-10",
      authority: "CyberSecurity Malaysia",
      certificateNumber: "GCS-2024-JKDM-SEC",
      documents: ["Security_Certificate.pdf", "Assessment_Report.pdf"]
    }
  ];

  const securityPosture = [
    {
      category: "Access Control",
      score: 95,
      status: "Excellent",
      lastUpdate: "2024-10-28",
      issues: 2,
      recommendations: 3
    },
    {
      category: "Data Encryption",
      score: 98,
      status: "Excellent",
      lastUpdate: "2024-10-27",
      issues: 0,
      recommendations: 1
    },
    {
      category: "Network Security",
      score: 89,
      status: "Good",
      lastUpdate: "2024-10-26",
      issues: 5,
      recommendations: 8
    },
    {
      category: "Incident Response",
      score: 92,
      status: "Excellent",
      lastUpdate: "2024-10-25",
      issues: 1,
      recommendations: 2
    },
    {
      category: "Backup & Recovery",
      score: 87,
      status: "Good",
      lastUpdate: "2024-10-24",
      issues: 3,
      recommendations: 5
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Compliant': 'bg-success/10 text-success',
      'Partial': 'bg-warning/10 text-warning',
      'Non-Compliant': 'bg-error/10 text-error',
      'Active': 'bg-success/10 text-success',
      'Renewal Required': 'bg-warning/10 text-warning',
      'Expired': 'bg-error/10 text-error',
      'Excellent': 'bg-success/10 text-success',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-warning/10 text-warning',
      'Poor': 'bg-error/10 text-error'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.[status]}`}>
        {status}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-success';
    if (score >= 85) return 'text-blue-600';
    if (score >= 75) return 'text-warning';
    return 'text-error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Compliance Dashboard</h3>
            <p className="text-sm text-muted-foreground">Government ICT standards and certification monitoring</p>
          </div>
          <Button variant="default" iconName="Download" iconPosition="left">
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {complianceMetrics?.map((metric) => (
            <div key={metric?.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={metric?.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{metric?.title}</h4>
                    {getStatusBadge(metric?.status)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{metric?.score}%</span>
                  <span className={`text-sm font-medium ${getScoreColor(metric?.score)}`}>
                    {metric?.compliant}/{metric?.requirements}
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(metric?.score) === 'text-success' ? 'bg-success' : 
                      getScoreColor(metric?.score) === 'text-blue-600' ? 'bg-blue-600' :
                      getScoreColor(metric?.score) === 'text-warning' ? 'bg-warning' : 'bg-error'}`}
                    style={{ width: `${metric?.score}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Last: {formatDate(metric?.lastAssessment)}</p>
                  <p>Next: {formatDate(metric?.nextReview)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Certifications */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Certifications & Documentation</h3>
            <p className="text-sm text-muted-foreground">Track certification status and renewal requirements</p>
          </div>
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Add Certification
          </Button>
        </div>

        <div className="space-y-4">
          {certifications?.map((cert) => (
            <div key={cert?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-md font-medium text-foreground">{cert?.name}</h4>
                    {getStatusBadge(cert?.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{cert?.type} • {cert?.authority}</p>
                  <p className="text-xs text-muted-foreground font-mono">{cert?.certificateNumber}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-foreground">
                    Expires: {formatDate(cert?.expiryDate)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getDaysUntilExpiry(cert?.expiryDate)} days remaining
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="text-sm text-foreground">{formatDate(cert?.issueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renewal Due</p>
                  <p className="text-sm text-foreground">{formatDate(cert?.renewalDue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <div className="flex items-center space-x-2">
                    {cert?.documents?.map((doc, index) => (
                      <Button key={index} variant="ghost" size="sm" iconName="FileText">
                        {doc}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Download">
                  Download
                </Button>
                <Button variant="outline" size="sm" iconName="RefreshCw">
                  Renew
                </Button>
                <Button variant="ghost" size="sm" iconName="Edit">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Posture */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Security Posture Assessment</h3>
            <p className="text-sm text-muted-foreground">Real-time security monitoring and recommendations</p>
          </div>
          <Button variant="outline" iconName="RefreshCw" iconPosition="left">
            Refresh Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {securityPosture?.map((item, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">{item?.category}</h4>
                {getStatusBadge(item?.status)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{item?.score}%</span>
                  <span className={`text-sm font-medium ${getScoreColor(item?.score)}`}>
                    {item?.status}
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(item?.score) === 'text-success' ? 'bg-success' : 
                      getScoreColor(item?.score) === 'text-blue-600' ? 'bg-blue-600' :
                      getScoreColor(item?.score) === 'text-warning' ? 'bg-warning' : 'bg-error'}`}
                    style={{ width: `${item?.score}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item?.issues} issues</span>
                  <span>{item?.recommendations} recommendations</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Updated: {formatDate(item?.lastUpdate)}
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" iconName="Eye" fullWidth>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;