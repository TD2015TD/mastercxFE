import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import CustomerProfileHeader from './components/CustomerProfileHeader';
import InteractionTimeline from './components/InteractionTimeline';
import RelatedTicketsPanel from './components/RelatedTicketsPanel';
import CustomerMetrics from './components/CustomerMetrics';
import RelationshipMapping from './components/RelationshipMapping';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Customer360Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data
  const mockUser = {
    name: "Ahmad Rahman",
    email: "ahmad.rahman@jkdm.gov.my",
    role: "agent",
    department: "Customer Service",
    avatar: null
  };

  // Mock customer data
  const mockCustomer = {
    customerId: "CUS-2024-001234",
    name: "Siti Nurhaliza binti Abdullah",
    icNumber: "850123-14-5678",
    email: "siti.nurhaliza@email.com",
    phone: "+60 12-345 6789",
    address: "No. 123, Jalan Bukit Bintang, 55100 Kuala Lumpur, Malaysia",
    organization: "ABC Trading Sdn Bhd",
    status: "Active",
    customerSince: "15 Jan 2020",
    preferredLanguage: "Bahasa Malaysia",
    lastContact: "28 Oct 2024, 2:30 PM",
    avatar: "https://images.unsplash.com/photo-1551108909-9b56912cf6fd",
    avatarAlt: "Professional headshot of Malaysian woman with hijab in business attire smiling at camera"
  };

  // Mock interactions data
  const mockInteractions = [
  {
    id: 1,
    channel: "phone",
    subject: "Customs Declaration Inquiry",
    summary: "Customer called regarding customs declaration process for imported electronics. Provided guidance on required documentation and fees.",
    details: `Customer Siti Nurhaliza called at 2:30 PM regarding customs declaration for imported electronics worth RM 15,000.\n\nIssues discussed:\n- Required documentation for electronics import\n- Customs duty calculation\n- Processing timeline\n- Payment methods\n\nResolution provided:\n- Sent customs declaration form via email\n- Explained duty calculation (10% + 6% GST)\n- Advised on 3-5 working days processing time\n- Provided online payment portal link`,
    agent: "Ahmad Rahman",
    dateTime: new Date(2024, 9, 28, 14, 30),
    duration: "12 minutes",
    status: "completed",
    attachments: [
    { name: "customs_declaration_form.pdf", size: "245 KB" },
    { name: "duty_calculation_guide.pdf", size: "180 KB" }],

    resolution: "Customer satisfied with information provided. Follow-up scheduled for document submission confirmation."
  },
  {
    id: 2,
    channel: "email",
    subject: "Import License Application Status",
    summary: "Email inquiry about import license application status. Provided tracking information and next steps.",
    details: `Email received at 10:15 AM regarding import license application AL-2024-5678.\n\nCustomer concerns:\n- Application submitted 2 weeks ago\n- No status update received\n- Urgent shipment pending approval\n\nActions taken:\n- Checked application status in system\n- Found pending document verification\n- Contacted verification team\n- Expedited review process`,
    agent: "Farah Aisyah",
    dateTime: new Date(2024, 9, 27, 10, 15),
    duration: "Response time: 2 hours",
    status: "completed",
    attachments: [
    { name: "application_status_update.pdf", size: "156 KB" }],

    resolution: "Application approved and license issued. Customer notified via email with license number and validity period."
  },
  {
    id: 3,
    channel: "chat",
    subject: "GST Refund Process",
    summary: "Live chat session about GST refund process for overpaid customs duties. Guided through refund application.",
    details: `Live chat session initiated at 4:45 PM regarding GST refund for overpaid customs duties.\n\nRefund details:\n- Original payment: RM 2,400\n- Correct amount: RM 1,800\n- Refund due: RM 600\n\nProcess explained:\n- Online refund application form\n- Required supporting documents\n- Processing timeline (14-21 days)\n- Bank account verification`,
    agent: "Muhammad Hafiz",
    dateTime: new Date(2024, 9, 25, 16, 45),
    duration: "18 minutes",
    status: "completed",
    resolution: "Refund application submitted successfully. Reference number RF-2024-9876 provided for tracking."
  },
  {
    id: 4,
    channel: "in-person",
    subject: "Document Verification Visit",
    summary: "Customer visited office for document verification and license collection. All documents verified successfully.",
    details: `Customer visited Kuala Lumpur Customs Office at 11:00 AM for document verification.\n\nDocuments verified:\n- Import license application\n- Company registration certificate\n- Tax identification number\n- Bank guarantee letter\n\nServices provided:\n- Document authentication\n- License issuance\n- Payment processing\n- Compliance briefing`,
    agent: "Nurul Ain",
    dateTime: new Date(2024, 9, 23, 11, 0),
    duration: "45 minutes",
    status: "completed",
    resolution: "All documents verified and approved. Import license IL-2024-3456 issued with 12-month validity."
  },
  {
    id: 5,
    channel: "social",
    subject: "Facebook Inquiry - Export Procedures",
    summary: "Social media inquiry about export procedures for palm oil products. Provided comprehensive guidance.",
    details: `Facebook message received regarding export procedures for palm oil products to Singapore.\n\nInquiry details:\n- Export volume: 500 metric tons\n- Destination: Singapore\n- Product type: Refined palm oil\n- Timeline: Within 30 days\n\nGuidance provided:\n- Export license requirements\n- Quality certification needed\n- Customs documentation\n- Transit procedures`,
    agent: "Azman Ismail",
    dateTime: new Date(2024, 9, 20, 9, 20),
    duration: "Response time: 4 hours",
    status: "completed",
    resolution: "Comprehensive export guide sent via email. Customer scheduled for consultation appointment."
  }];


  // Mock tickets data
  const mockTickets = [
  {
    id: "TK-2024-1028",
    subject: "Urgent: Import License Renewal Required",
    status: "In Progress",
    priority: "P2",
    assignedAgent: "Ahmad Rahman",
    department: "Import Licensing",
    createdDate: "2024-10-28",
    slaPercentage: 75,
    categories: ["Import License", "Renewal", "Urgent"]
  },
  {
    id: "TK-2024-1025",
    subject: "GST Calculation Discrepancy",
    status: "Open",
    priority: "P3",
    assignedAgent: "Farah Aisyah",
    department: "Tax Assessment",
    createdDate: "2024-10-25",
    slaPercentage: 45,
    categories: ["GST", "Tax", "Calculation"]
  },
  {
    id: "TK-2024-1020",
    subject: "Export Documentation Review",
    status: "Resolved",
    priority: "P4",
    assignedAgent: "Muhammad Hafiz",
    department: "Export Control",
    createdDate: "2024-10-20",
    slaPercentage: 95,
    categories: ["Export", "Documentation", "Review"]
  },
  {
    id: "TK-2024-1015",
    subject: "Customs Duty Refund Request",
    status: "Closed",
    priority: "P3",
    assignedAgent: "Nurul Ain",
    department: "Refunds",
    createdDate: "2024-10-15",
    slaPercentage: 88,
    categories: ["Refund", "Customs Duty"]
  },
  {
    id: "TK-2024-1010",
    subject: "Import Permit Application",
    status: "Closed",
    priority: "P4",
    assignedAgent: "Azman Ismail",
    department: "Import Licensing",
    createdDate: "2024-10-10",
    slaPercentage: 92,
    categories: ["Import Permit", "Application"]
  }];


  // Mock metrics data
  const mockMetrics = {
    totalTickets: 47,
    avgResolutionTime: "2.3 days",
    satisfactionScore: 4.2,
    slaCompliance: 89,
    ticketsTrend: 12,
    resolutionTrend: -8,
    satisfactionTrend: 5,
    slaTrend: 3,
    mostActiveChannel: "Phone",
    preferredContactTime: "2:00 PM - 4:00 PM",
    escalationRate: 8,
    firstContactResolution: 76,
    repeatContactRate: 15,
    avgResponseTime: "1.2 hours"
  };

  // Mock relationships data
  const mockRelationships = [
  {
    id: 1,
    name: "ABC Trading Sdn Bhd",
    type: "organization",
    relationshipType: "Primary Organization",
    status: "Active",
    email: "info@abctrading.com.my",
    phone: "+60 3-2123 4567",
    department: "Import/Export",
    establishedDate: "Jan 2020",
    address: "Level 15, Menara ABC, Jalan Sultan Ismail, 50250 Kuala Lumpur",
    description: "Primary business entity for import/export operations. Main contact for all customs-related matters.",
    avatar: null,
    avatarAlt: ""
  },
  {
    id: 2,
    name: "Ahmad Abdullah",
    type: "family",
    relationshipType: "Spouse",
    status: "Active",
    phone: "+60 12-987 6543",
    establishedDate: "Personal",
    description: "Spouse listed as emergency contact and authorized representative for business matters.",
    avatar: "https://images.unsplash.com/photo-1581791796924-d919ecb8636d",
    avatarAlt: "Professional headshot of Malaysian man in business suit with friendly smile"
  },
  {
    id: 3,
    name: "XYZ Logistics Sdn Bhd",
    type: "business",
    relationshipType: "Service Provider",
    status: "Active",
    email: "operations@xyzlogistics.com.my",
    phone: "+60 3-8765 4321",
    department: "Freight Forwarding",
    establishedDate: "Mar 2021",
    description: "Preferred logistics partner for import/export shipments. Handles customs clearance and transportation.",
    avatar: null,
    avatarAlt: ""
  },
  {
    id: 4,
    name: "DEF Manufacturing Sdn Bhd",
    type: "subsidiary",
    relationshipType: "Subsidiary Company",
    status: "Active",
    email: "admin@defmanufacturing.com.my",
    phone: "+60 4-555 1234",
    department: "Manufacturing",
    establishedDate: "Jun 2022",
    address: "Industrial Area, Penang",
    description: "Manufacturing subsidiary specializing in electronics assembly for export markets.",
    avatar: null,
    avatarAlt: ""
  }];


  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEditCustomer = (updatedCustomer) => {
    console.log('Customer updated:', updatedCustomer);
    // In real app, this would update the customer data
  };

  const handleCreateTicket = () => {
    navigate('/ticket-management?action=create&customer=' + mockCustomer?.customerId);
  };

  const handleScheduleCallback = () => {
    console.log('Schedule callback for customer:', mockCustomer?.customerId);
    // In real app, this would open callback scheduling modal
  };

  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'interactions', label: 'Interactions', icon: 'MessageSquare' },
  { id: 'tickets', label: 'Tickets', icon: 'Ticket' },
  { id: 'relationships', label: 'Relationships', icon: 'Users' }];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={mockUser} onMenuToggle={() => {}} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customer profile...</p>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} onMenuToggle={() => {}} />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <BreadcrumbNavigation />
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer 360 Profile</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive customer information and interaction history
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              iconName="Search"
              iconPosition="left"
              onClick={() => navigate('/customer-360-profile')}>

              Search Customer
            </Button>
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left">

              Export Profile
            </Button>
          </div>
        </div>

        {/* Customer Profile Header */}
        <CustomerProfileHeader
          customer={mockCustomer}
          onEdit={handleEditCustomer}
          onCreateTicket={handleCreateTicket}
          onScheduleCallback={handleScheduleCallback} />


        {/* Customer Metrics */}
        <CustomerMetrics metrics={mockMetrics} />

        {/* Tab Navigation */}
        <div className="bg-card border border-border rounded-lg mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs?.map((tab) =>
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab?.id ?
                'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'}`
                }>

                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' &&
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <InteractionTimeline interactions={mockInteractions?.slice(0, 3)} />
                </div>
                <div className="space-y-6">
                  <RelatedTicketsPanel tickets={mockTickets?.slice(0, 3)} />
                </div>
              </div>
            }

            {activeTab === 'interactions' &&
            <InteractionTimeline interactions={mockInteractions} />
            }

            {activeTab === 'tickets' &&
            <RelatedTicketsPanel tickets={mockTickets} />
            }

            {activeTab === 'relationships' &&
            <RelationshipMapping relationships={mockRelationships} />
            }
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={handleCreateTicket}
              className="w-full justify-start">

              Create New Ticket
            </Button>
            <Button
              variant="outline"
              iconName="Calendar"
              iconPosition="left"
              onClick={handleScheduleCallback}
              className="w-full justify-start">

              Schedule Callback
            </Button>
            <Button
              variant="outline"
              iconName="FileText"
              iconPosition="left"
              className="w-full justify-start">

              Generate Report
            </Button>
            <Button
              variant="outline"
              iconName="Share"
              iconPosition="left"
              className="w-full justify-start">

              Share Profile
            </Button>
          </div>
        </div>
      </main>
    </div>);

};

export default Customer360Profile;