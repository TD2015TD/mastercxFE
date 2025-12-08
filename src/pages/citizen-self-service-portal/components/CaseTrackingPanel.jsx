import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CaseTrackingPanel = ({ language, citizenData }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const content = {
    en: {
      title: 'Track Your Cases',
      subtitle: 'Monitor the status and progress of your submitted complaints',
      trackingLabel: 'Tracking ID',
      trackingPlaceholder: 'Enter complaint tracking ID (e.g., CMP-1730085155001)',
      trackButton: 'Track Case',
      noComplaints: 'No complaints found',
      noComplaintsDesc: 'You haven\'t submitted any complaints yet.',
      submitFirst: 'Submit your first complaint',
      statusLabels: {
        submitted: 'Submitted',
        acknowledged: 'Acknowledged',
        in_progress: 'In Progress',
        pending_info: 'Pending Information',
        resolved: 'Resolved',
        closed: 'Closed'
      },
      priorityLabels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      viewDetails: 'View Details',
      backToList: 'Back to List',
      estimatedResolution: 'Estimated Resolution',
      assignedTo: 'Assigned Department',
      lastUpdate: 'Last Updated',
      communicationHistory: 'Communication History',
      rateService: 'Rate Service'
    },
    ms: {
      title: 'Jejak Kes Anda',
      subtitle: 'Pantau status dan kemajuan aduan yang telah dihantar',
      trackingLabel: 'ID Penjejakan',
      trackingPlaceholder: 'Masukkan ID penjejakan aduan (cth: CMP-1730085155001)',
      trackButton: 'Jejak Kes',
      noComplaints: 'Tiada aduan dijumpai',
      noComplaintsDesc: 'Anda belum menghantar sebarang aduan lagi.',
      submitFirst: 'Hantar aduan pertama anda',
      statusLabels: {
        submitted: 'Dihantar',
        acknowledged: 'Diakui',
        in_progress: 'Dalam Proses',
        pending_info: 'Menunggu Maklumat',
        resolved: 'Diselesaikan',
        closed: 'Ditutup'
      },
      priorityLabels: {
        low: 'Rendah',
        medium: 'Sederhana',
        high: 'Tinggi',
        critical: 'Kritikal'
      },
      viewDetails: 'Lihat Butiran',
      backToList: 'Kembali ke Senarai',
      estimatedResolution: 'Anggaran Penyelesaian',
      assignedTo: 'Jabatan Ditugaskan',
      lastUpdate: 'Kemaskini Terakhir',
      communicationHistory: 'Sejarah Komunikasi',
      rateService: 'Nilai Perkhidmatan'
    }
  };

  const t = content?.[language];

  // Mock complaints data
  const mockComplaints = [
    {
      id: 'CMP-1730085155001',
      subject: 'Delayed customs clearance for import shipment',
      category: 'customs_clearance',
      priority: 'high',
      status: 'in_progress',
      submittedAt: new Date('2024-10-25T10:30:00'),
      lastUpdated: new Date('2024-10-27T14:20:00'),
      estimatedResolution: '1-2 business days',
      assignedDepartment: 'Customs Operations Department',
      description: 'My import shipment has been stuck in customs for over a week without any updates. The tracking shows it arrived at KLIA on October 18th but no progress since then.',
      communications: [
        {
          id: 1,
          type: 'system',
          message: 'Complaint submitted and assigned to Customs Operations Department',
          timestamp: new Date('2024-10-25T10:30:00'),
          author: 'System'
        },
        {
          id: 2,
          type: 'agent',
          message: 'We have received your complaint and are investigating the delay. Our team is checking with the warehouse for your shipment status.',
          timestamp: new Date('2024-10-26T09:15:00'),
          author: 'Agent Sarah Lim'
        },
        {
          id: 3,
          type: 'agent',
          message: 'Update: Your shipment requires additional documentation. Please provide commercial invoice and packing list. We have sent the requirements to your registered email.',
          timestamp: new Date('2024-10-27T14:20:00'),
          author: 'Agent Sarah Lim'
        }
      ]
    },
    {
      id: 'CMP-1730085155002',
      subject: 'Incorrect duty calculation on electronics import',
      category: 'tax_duties',
      priority: 'medium',
      status: 'resolved',
      submittedAt: new Date('2024-10-20T15:45:00'),
      lastUpdated: new Date('2024-10-24T11:30:00'),
      estimatedResolution: '3-5 business days',
      assignedDepartment: 'Assessment & Collection Department',
      description: 'I believe there was an error in the duty calculation for my electronics import. The amount charged seems higher than the standard rate.',
      communications: [
        {
          id: 1,
          type: 'system',
          message: 'Complaint submitted and assigned to Assessment & Collection Department',
          timestamp: new Date('2024-10-20T15:45:00'),
          author: 'System'
        },
        {
          id: 2,
          type: 'agent',
          message: 'We have reviewed your case and found an error in the duty calculation. A refund of RM 450.00 has been processed and will reflect in your account within 3-5 business days.',
          timestamp: new Date('2024-10-24T11:30:00'),
          author: 'Agent Ahmad Rahman'
        }
      ]
    }
  ];

  // Removed mock data loading - will use API instead
  useEffect(() => {
    // No longer loading from localStorage
    // Complaints will be loaded via tracking ID search
  }, []);

  const trackComplaint = async (ticketNumber, email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/v1/public/tickets/track', {
        ticket_number: ticketNumber,
        email: email || citizenData?.email
      });

      const ticketData = response.data.data;
      
      // Transform API response to match component structure
      const formattedComplaint = {
        id: ticketData.ticket_number,
        ticket_id: ticketData.ticket_id,
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority?.toLowerCase(),
        status: ticketData.status?.toLowerCase(),
        submittedAt: new Date(ticketData.created_at),
        lastUpdated: new Date(ticketData.updated_at),
        estimatedResolution: ticketData.sla_breach_time ? 
          `Target: ${new Date(ticketData.sla_breach_time).toLocaleDateString()}` : 
          'Processing',
        assignedDepartment: ticketData.department || 'Not assigned',
        description: ticketData.description,
        communications: ticketData.communications?.map(comm => ({
          id: comm.id,
          type: comm.type || 'system',
          message: comm.message || comm.comment,
          timestamp: new Date(comm.timestamp || comm.created_at),
          author: comm.author || comm.created_by || 'System'
        })) || []
      };

      setSelectedComplaint(formattedComplaint);
      setComplaints([formattedComplaint]); // Store for potential future use
      
    } catch (err) {
      console.error('Track complaint failed:', err);
      setError(err.response?.data?.message || 'Failed to track complaint. Please check your tracking ID and email.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      acknowledged: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
      pending_info: 'bg-purple-100 text-purple-800 border-purple-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors?.[status] || colors?.submitted;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors?.[priority] || colors?.low;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'ms' ? 'ms-MY' : 'en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const handleTrackById = () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }
    trackComplaint(trackingId, citizenData?.email);
  };

  if (selectedComplaint) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{selectedComplaint?.subject}</h2>
            <p className="text-sm text-muted-foreground mt-1">ID: {selectedComplaint?.id}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedComplaint(null)}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            {t?.backToList}
          </Button>
        </div>
        {/* Status and Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedComplaint?.status)}`}>
                {t?.statusLabels?.[selectedComplaint?.status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t?.lastUpdate}: {formatDate(selectedComplaint?.lastUpdated)}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <span className="text-sm font-medium text-foreground block mb-2">{t?.assignedTo}</span>
            <p className="text-sm text-muted-foreground">{selectedComplaint?.assignedDepartment}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <span className="text-sm font-medium text-foreground block mb-2">{t?.estimatedResolution}</span>
            <p className="text-sm text-muted-foreground">{selectedComplaint?.estimatedResolution}</p>
          </div>
        </div>
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">
            {language === 'en' ? 'Complaint Description' : 'Penerangan Aduan'}
          </h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-foreground">{selectedComplaint?.description}</p>
          </div>
        </div>
        {/* Communication History */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4">{t?.communicationHistory}</h3>
          <div className="space-y-4">
            {selectedComplaint?.communications?.map((comm) => (
              <div key={comm?.id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    comm?.type === 'system' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <Icon 
                      name={comm?.type === 'system' ? 'Settings' : 'User'} 
                      size={16} 
                      className={comm?.type === 'system' ? 'text-blue-600' : 'text-green-600'}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{comm?.author}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comm?.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground">{comm?.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Actions */}
        {selectedComplaint?.status === 'resolved' && (
          <div className="mt-6 pt-6 border-t border-border">
            <Button variant="outline" iconName="Star" iconPosition="left">
              {t?.rateService}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">{t?.title}</h2>
        <p className="text-sm text-muted-foreground">{t?.subtitle}</p>
      </div>
      {/* Track by ID */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t?.trackingPlaceholder}
              value={trackingId}
              onChange={(e) => setTrackingId(e?.target?.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-200"
            />
          </div>
          <Button
            onClick={handleTrackById}
            loading={isLoading}
            disabled={!trackingId.trim()}
            iconName="Search"
            iconPosition="left"
            className="sm:w-auto"
          >
            {t?.trackButton}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Empty State or List */}
      {complaints?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t?.noComplaints}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t?.noComplaintsDesc}</p>
          <Button variant="outline">{t?.submitFirst}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints?.map((complaint) => (
            <div key={complaint?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">{complaint?.subject}</h3>
                  <p className="text-sm text-muted-foreground">ID: {complaint?.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint?.status)}`}>
                    {t?.statusLabels?.[complaint?.status]}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(complaint?.priority)}`}>
                    {t?.priorityLabels?.[complaint?.priority]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t?.assignedTo}:</span>
                  <p className="text-foreground">{complaint?.assignedDepartment}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t?.lastUpdate}:</span>
                  <p className="text-foreground">{formatDate(complaint?.lastUpdated)}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedComplaint(complaint)}
                  iconName="Eye"
                  iconPosition="left"
                >
                  {t?.viewDetails}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseTrackingPanel;