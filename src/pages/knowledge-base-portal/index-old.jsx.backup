import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import ArticleCard from './components/ArticleCard';
import ArticleEditor from './components/ArticleEditor';
import SearchAndFilters from './components/SearchAndFilters';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DirectorySearchTab from './components/DirectorySearchTab';

const KnowledgeBasePortal = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('articles');
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    department: '',
    sort: 'relevance'
  });

  // Mock user role - in real app, this would come from authentication context
  const userRole = 'editor'; // Can be: 'editor', 'approver', 'admin', 'viewer'

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    // Mock articles data
    const mockArticles = [
      {
        id: 1,
        title: 'Complete Guide to Import Duty Calculation',
        description: 'Comprehensive guide covering all aspects of import duty calculation including GST, customs duties, and exemptions for various product categories.',
        content: `This comprehensive guide will walk you through the process of calculating import duties for goods entering Malaysia.\n\n## Understanding Import Duties\n\nImport duties are taxes imposed on goods when they cross international borders. In Malaysia, these duties are administered by the Royal Malaysian Customs Department (JKDM).\n\n### Key Components:\n1. Customs Duty\n2. Sales and Service Tax (SST)\n3. Excise Duty (where applicable)\n\n### Calculation Formula:\nTotal Import Duty = (CIF Value × Duty Rate) + SST + Excise Duty\n\nWhere CIF = Cost + Insurance + Freight\n\n## Step-by-Step Calculation Process\n\n### Step 1: Determine CIF Value\nThe CIF value includes:\n- Invoice value of goods\n- Insurance costs\n- Freight charges to Malaysian port\n\n### Step 2: Identify Tariff Classification\nUse the Malaysian Harmonized System (HS) codes to classify your goods and determine the applicable duty rate.\n\n### Step 3: Apply Duty Rates\nDuty rates vary by product category and country of origin. Check for:\n- Most Favoured Nation (MFN) rates\n- Preferential rates under trade agreements\n- ASEAN Common Effective Preferential Tariff (CEPT)\n\n### Step 4: Calculate Additional Taxes\n- SST: Generally 6% or 10% depending on goods type\n- Excise duty: Applicable to specific items like tobacco, alcohol\n\n## Practical Examples\n\n### Example 1: Electronics Import\n- Product: Laptop computers\n- HS Code: 8471.30.10\n- CIF Value: RM 5,000\n- Duty Rate: 0% (under CEPT)\n- SST: 6%\n\nCalculation:\n- Customs Duty: RM 5,000 × 0% = RM 0\n- SST: RM 5,000 × 6% = RM 300\n- Total: RM 300\n\n### Example 2: Textile Import\n- Product: Cotton shirts\n- HS Code: 6205.20.00\n- CIF Value: RM 10,000\n- Duty Rate: 20%\n- SST: 6%\n\nCalculation:\n- Customs Duty: RM 10,000 × 20% = RM 2,000\n- Dutiable Value: RM 10,000 + RM 2,000 = RM 12,000\n- SST: RM 12,000 × 6% = RM 720\n- Total: RM 2,720\n\n## Common Exemptions and Reliefs\n\n### Temporary Importation\n- Goods for exhibition, demonstration, or repair\n- Conditional exemption with guarantee\n\n### Manufacturing Warehouse Scheme\n- Raw materials for export-oriented manufacturing\n- Duty suspension until local sale\n\n### Free Trade Zone Benefits\n- No duty on goods within FTZ\n- Duty applies only on entry to domestic market\n\n## Required Documentation\n\n1. **Commercial Invoice**\n   - Detailed description of goods\n   - Unit prices and total value\n   - Terms of sale (FOB, CIF, etc.)\n\n2. **Bill of Lading/Airway Bill**\n   - Proof of shipment\n   - Freight charges details\n\n3. **Packing List**\n   - Detailed contents of each package\n   - Weights and dimensions\n\n4. **Certificate of Origin**\n   - Required for preferential duty rates\n   - Must be from recognized issuing authority\n\n5. **Import License/Permit**\n   - For controlled or restricted items\n   - Obtained from relevant authorities\n\n## Online Tools and Resources\n\n### JKDM Official Portals\n- **MySST Portal**: SST registration and filing\n- **uCustoms**: Online customs declaration\n- **Tariff Schedule**: Current duty rates lookup\n\n### Calculation Tools\n- Duty calculator on JKDM website\n- HS code lookup system\n- Currency conversion tools\n\n## Common Mistakes to Avoid\n\n1. **Incorrect Valuation**\n   - Undervaluing goods to reduce duty\n   - Not including all CIF components\n\n2. **Wrong Classification**\n   - Using incorrect HS codes\n   - Not checking for updates to tariff schedule\n\n3. **Missing Documentation**\n   - Incomplete commercial invoices\n   - Invalid certificates of origin\n\n4. **Preferential Rate Errors**\n   - Not claiming eligible preferences\n   - Using expired certificates\n\n## Compliance and Penalties\n\n### Audit Requirements\n- Maintain records for 7 years\n- Provide supporting documents upon request\n- Cooperate with customs audits\n\n### Penalty Structure\n- Undervaluation: Up to 20 times duty shortfall\n- False declaration: Criminal prosecution\n- Late payment: Interest charges apply\n\n## Getting Help\n\n### JKDM Customer Service\n- Hotline: 03-8882 3000\n- Email: aduan@customs.gov.my\n- Walk-in centers at major ports\n\n### Licensed Customs Agents\n- Professional declaration services\n- Compliance advisory\n- Representation in disputes\n\n### Trade Associations\n- Industry-specific guidance\n- Bulk consultation services\n- Training programs\n\n## Conclusion\n\nAccurate import duty calculation is crucial for compliance and cost management. Always verify current rates, maintain proper documentation, and seek professional advice for complex transactions.\n\nFor the most up-to-date information, always refer to the official JKDM website and consult with licensed customs agents when needed.`,
        author: 'Sarah Ahmad',
        category: 'Tax & Duties',
        department: 'Assessment & Valuation',
        status: 'live',
        lastModified: new Date('2024-10-25'),
        viewCount: 15420,
        rating: 4.8,
        tags: ['import duty', 'calculation', 'GST', 'customs'],
        visibility: 'public',
        attachments: [
          {
            id: 1,
            name: 'Import_Duty_Calculator.xlsx',
            size: 245760,
            type: 'application/vnd.ms-excel',
            url: '#'
          }
        ]
      },
      {
        id: 2,
        title: 'Export Permit Application Process',
        description: 'Step-by-step guide for applying export permits including required documents, processing times, and common approval criteria.',
        content: `This guide provides detailed instructions for applying for export permits through the Malaysian customs system.\n\n## Overview\n\nExport permits are required for certain controlled goods to ensure compliance with international trade regulations and national security requirements.\n\n## When Export Permits Are Required\n\n### Controlled Items\n- Strategic goods and technology\n- Dual-use items\n- Cultural artifacts and antiques\n- Endangered species (CITES)\n- Precious metals and stones\n\n### Restricted Destinations\n- Countries under international sanctions\n- Conflict zones\n- Non-cooperative jurisdictions\n\n## Application Process\n\n### Step 1: Determine Permit Requirements\n1. Check the Strategic Trade Act 2010\n2. Verify item classification\n3. Confirm destination country status\n4. Review end-user requirements\n\n### Step 2: Prepare Documentation\n\n#### Required Documents\n1. **Export Permit Application Form (JKDM-STA-01)**\n   - Complete all sections accurately\n   - Ensure authorized signatory signs\n\n2. **Commercial Invoice**\n   - Detailed item descriptions\n   - Technical specifications\n   - Unit and total values\n\n3. **End-User Certificate**\n   - From ultimate consignee\n   - Government-issued preferred\n   - Must specify intended use\n\n4. **Technical Specifications**\n   - Manufacturer's data sheets\n   - Performance parameters\n   - Control list classification\n\n5. **Company Registration Documents**\n   - SSM certificate\n   - Business license\n   - Export license (if applicable)\n\n### Step 3: Submit Application\n\n#### Online Submission (Preferred)\n- Access JKDM Strategic Trade Portal\n- Upload all required documents\n- Pay application fees online\n- Receive acknowledgment receipt\n\n#### Manual Submission\n- Submit to nearest JKDM office\n- Bring original documents for verification\n- Pay fees via bank draft or cash\n\n### Step 4: Application Review\n\n#### Initial Assessment (5-7 working days)\n- Document completeness check\n- Basic eligibility verification\n- Request for additional information if needed\n\n#### Technical Evaluation (10-15 working days)\n- Item classification verification\n- End-use assessment\n- Security risk evaluation\n- Inter-agency consultation if required\n\n#### Final Decision (3-5 working days)\n- Permit approval or rejection\n- Notification to applicant\n- Permit issuance if approved\n\n## Processing Times\n\n### Standard Applications\n- Simple items: 15-20 working days\n- Complex items: 25-30 working days\n- First-time applicants: Add 5-10 days\n\n### Expedited Processing\n- Available for urgent shipments\n- Additional fees apply\n- 50% reduction in processing time\n- Subject to approval criteria\n\n## Fees Structure\n\n### Application Fees\n- Standard permit: RM 200\n- Expedited processing: RM 500\n- Amendment fee: RM 100\n- Renewal fee: RM 150\n\n### Payment Methods\n- Online banking\n- Credit/debit cards\n- Bank draft\n- Cash (counter payments only)\n\n## Permit Conditions\n\n### Standard Conditions\n1. **Validity Period**\n   - Maximum 12 months from issue date\n   - Single or multiple shipments as specified\n   - No extensions beyond validity\n\n2. **Shipment Requirements**\n   - Must match permit specifications exactly\n   - Quantity variations not exceeding 10%\n   - Destination changes require amendment\n\n3. **Reporting Obligations**\n   - Submit shipment reports within 30 days\n   - Provide delivery confirmation\n   - Report any permit violations immediately\n\n### Special Conditions\n- May be imposed based on item sensitivity\n- Could include additional documentation\n- Might require pre-shipment inspection\n- May mandate specific shipping routes\n\n## Common Rejection Reasons\n\n### Documentation Issues\n- Incomplete application forms\n- Missing supporting documents\n- Invalid end-user certificates\n- Insufficient technical specifications\n\n### Compliance Concerns\n- Prohibited destination countries\n- Sanctioned end-users\n- Dual-use concerns\n- Previous violation history\n\n### Technical Problems\n- Incorrect item classification\n- Controlled technology transfer\n- Inadequate end-use justification\n- Security risk assessment failure\n\n## Appeal Process\n\n### Grounds for Appeal\n- Procedural errors in assessment\n- New information availability\n- Changed circumstances\n- Misinterpretation of regulations\n\n### Appeal Procedure\n1. Submit written appeal within 30 days\n2. Provide supporting evidence\n3. Pay appeal processing fee (RM 300)\n4. Await review committee decision\n5. Final decision within 45 days\n\n## Compliance and Monitoring\n\n### Record Keeping\n- Maintain all permit documents for 7 years\n- Keep shipment and delivery records\n- Document any permit amendments\n- Store correspondence with authorities\n\n### Audit Requirements\n- Cooperate with compliance audits\n- Provide access to relevant records\n- Explain any discrepancies found\n- Implement corrective measures if required\n\n### Violation Consequences\n- Warning letters for minor infractions\n- Permit suspension for serious violations\n- Criminal prosecution for willful breaches\n- Company blacklisting for repeat offenders\n\n## Best Practices\n\n### Application Preparation\n1. **Early Planning**\n   - Start application process early\n   - Allow sufficient processing time\n   - Consider potential delays\n\n2. **Documentation Quality**\n   - Ensure all documents are complete\n   - Use clear, legible copies\n   - Translate foreign documents\n\n3. **Professional Assistance**\n   - Engage licensed customs agents\n   - Consult trade compliance experts\n   - Join industry associations\n\n### Ongoing Compliance\n1. **Stay Updated**\n   - Monitor regulatory changes\n   - Subscribe to JKDM updates\n   - Attend training programs\n\n2. **Internal Controls**\n   - Establish compliance procedures\n   - Train relevant staff\n   - Conduct regular reviews\n\n## Contact Information\n\n### JKDM Strategic Trade Division\n- **Address**: Level 3-7, Block A, Kompleks Kementerian Kewangan, No. 5, Persiaran Perdana, Presint 2, 62596 Putrajaya\n- **Phone**: 03-8882 3000\n- **Email**: sta@customs.gov.my\n- **Website**: www.customs.gov.my\n\n### Regional Offices\n- **Johor**: 07-221 4322\n- **Penang**: 04-261 5555\n- **Sabah**: 088-450 400\n- **Sarawak**: 082-472 888\n\n### Emergency Contact\n- **24/7 Hotline**: 03-8882 3999\n- **WhatsApp**: +60 12-345 6789\n- **Email**: emergency@customs.gov.my\n\n## Conclusion\n\nSuccessful export permit applications require careful preparation, complete documentation, and adherence to all regulatory requirements. Plan ahead, maintain compliance, and seek professional assistance when needed.\n\nFor the most current information and forms, always refer to the official JKDM website and consult with authorized representatives.`,
        author: 'Ahmad Razak',category: 'Import/Export',department: 'Enforcement',status: 'live',
        lastModified: new Date('2024-10-24'),
        viewCount: 9870,
        rating: 4.7,
        tags: ['export permit', 'application', 'documentation'],
        visibility: 'public',
        attachments: []
      },
      {
        id: 3,
        title: 'GST Calculation for Imported Goods - Draft',description: 'Detailed explanation of GST calculation methods for various types of imported goods including exemptions and special cases.',content: 'Draft content for GST calculation guide...',author: 'Fatimah Hassan',category: 'Tax & Duties',department: 'Assessment & Valuation',status: 'draft',
        lastModified: new Date('2024-10-26'),
        viewCount: 0,
        rating: null,
        tags: ['GST', 'import', 'calculation', 'tax'],
        visibility: 'internal',
        attachments: []
      },
      {
        id: 4,
        title: 'Customs Declaration Form Guidelines',description: 'Comprehensive guide on filling out customs declaration forms correctly to avoid delays and penalties.',content: 'Pending approval content...',author: 'Raj Kumar',category: 'Documentation',department: 'Customs Operations',status: 'pending',
        lastModified: new Date('2024-10-23'),
        viewCount: 0,
        rating: null,
        tags: ['customs declaration', 'forms', 'guidelines'],
        visibility: 'public',
        attachments: [],
        submittedAt: new Date('2024-10-23'),priority: 'high'
      },
      {
        id: 5,
        title: 'Prohibited Items Import List 2023',description: 'Complete list of items prohibited from import into Malaysia with legal references and penalty information.',content: 'Archived content from 2023...',author: 'Lim Wei Ming',category: 'Compliance',department: 'Legal',status: 'archived',
        lastModified: new Date('2024-01-15'),
        viewCount: 7650,
        rating: 4.9,
        tags: ['prohibited items', 'import', 'compliance'],
        visibility: 'public',
        attachments: []
      }
    ];

    setArticles(mockArticles);
    setFilteredArticles(mockArticles);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterArticles(query, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    filterArticles(searchQuery, newFilters);
  };

  const filterArticles = (query, currentFilters) => {
    let filtered = [...articles];

    // Text search
    if (query) {
      filtered = filtered?.filter(article =>
        article?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.description?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.content?.toLowerCase()?.includes(query?.toLowerCase()) ||
        article?.tags?.some(tag => tag?.toLowerCase()?.includes(query?.toLowerCase()))
      );
    }

    // Category filter
    if (currentFilters?.category) {
      filtered = filtered?.filter(article => article?.category === currentFilters?.category);
    }

    // Status filter
    if (currentFilters?.status) {
      filtered = filtered?.filter(article => article?.status === currentFilters?.status);
    }

    // Department filter
    if (currentFilters?.department) {
      filtered = filtered?.filter(article => article?.department === currentFilters?.department);
    }

    // Sort
    switch (currentFilters?.sort) {
      case 'newest':
        filtered?.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        break;
      case 'oldest':
        filtered?.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
        break;
      case 'title':
        filtered?.sort((a, b) => a?.title?.localeCompare(b?.title));
        break;
      case 'views':
        filtered?.sort((a, b) => b?.viewCount - a?.viewCount);
        break;
      case 'rating':
        filtered?.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        break;
      default:
        // Keep current order for relevance
        break;
    }

    setFilteredArticles(filtered);
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowEditor(true);
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleSaveArticle = (articleData) => {
    if (editingArticle) {
      // Update existing article
      const updatedArticles = articles?.map(article =>
        article?.id === editingArticle?.id
          ? { ...article, ...articleData, id: editingArticle?.id }
          : article
      );
      setArticles(updatedArticles);
    } else {
      // Create new article
      const newArticle = {
        ...articleData,
        id: Date.now(),
        viewCount: 0,
        rating: null
      };
      setArticles([newArticle, ...articles]);
    }
    
    setShowEditor(false);
    setEditingArticle(null);
    filterArticles(searchQuery, filters);
  };

  const handleApproveArticle = (articleId, comment) => {
    const updatedArticles = articles?.map(article =>
      article?.id === articleId
        ? { ...article, status: 'live', approvedAt: new Date(), approverComment: comment }
        : article
    );
    setArticles(updatedArticles);
    filterArticles(searchQuery, filters);
  };

  const handleRejectArticle = (articleId, comment) => {
    const updatedArticles = articles?.map(article =>
      article?.id === articleId
        ? { ...article, status: 'draft', rejectedAt: new Date(), rejectionReason: comment }
        : article
    );
    setArticles(updatedArticles);
    filterArticles(searchQuery, filters);
  };

  const handleArchiveArticle = (article) => {
    const updatedArticles = articles?.map(a =>
      a?.id === article?.id
        ? { ...a, status: 'archived', archivedAt: new Date() }
        : a
    );
    setArticles(updatedArticles);
    filterArticles(searchQuery, filters);
  };

  const handleViewArticle = (article) => {
    // In a real app, this would navigate to a detailed view
    console.log('Viewing article:', article?.title);
  };

  const pendingArticles = articles?.filter(article => article?.status === 'pending');

  const tabs = [
    { id: 'articles', label: 'Articles', icon: 'FileText', count: filteredArticles?.length },
    { id: 'directory', label: 'Directory Search', icon: 'Users', count: null },
    { id: 'approval', label: 'Approval Queue', icon: 'Clock', count: pendingArticles?.length },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3', count: null }
  ];

  if (showEditor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <BreadcrumbNavigation 
            customBreadcrumbs={[
              { label: 'Knowledge Base', path: '/knowledge-base-portal', isActive: false },
              { label: editingArticle ? 'Edit Article' : 'Create Article', path: null, isActive: true }
            ]}
          />
          
          <ArticleEditor
            article={editingArticle}
            onSave={handleSaveArticle}
            onCancel={() => {
              setShowEditor(false);
              setEditingArticle(null);
            }}
            userRole={userRole}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <BreadcrumbNavigation 
          customBreadcrumbs={activeTab === 'directory' ? [
            { label: 'Dashboard', path: '/agent-dashboard', isActive: false },
            { label: 'Knowledge Base', path: '/knowledge-base-portal', isActive: false },
            { label: 'Directory Search', path: null, isActive: true }
          ] : undefined}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Knowledge Base Portal
            </h1>
            <p className="text-muted-foreground">
              Comprehensive article management with collaborative publishing workflow
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {(userRole === 'editor' || userRole === 'admin') && activeTab === 'articles' && (
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={handleCreateArticle}
              >
                Create Article
              </Button>
            )}
            
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
            >
              Export Data
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
                {tab?.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab?.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'articles' && (
          <div>
            <SearchAndFilters
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filters={filters}
              userRole={userRole}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredArticles?.length} of {articles?.length} articles
                </p>
                {searchQuery && (
                  <p className="text-sm text-foreground">
                    Search results for: <span className="font-medium">"{searchQuery}"</span>
                  </p>
                )}
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles?.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No articles found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                {(userRole === 'editor' || userRole === 'admin') && (
                  <Button
                    variant="outline"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={handleCreateArticle}
                  >
                    Create First Article
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredArticles?.map((article) => (
                  <ArticleCard
                    key={article?.id}
                    article={article}
                    onEdit={handleEditArticle}
                    onView={handleViewArticle}
                    onApprove={handleApproveArticle}
                    onArchive={handleArchiveArticle}
                    userRole={userRole}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'directory' && (
          <DirectorySearchTab />
        )}

        {activeTab === 'approval' && (
          <ApprovalWorkflow
            pendingArticles={pendingArticles}
            onApprove={handleApproveArticle}
            onReject={handleRejectArticle}
            userRole={userRole}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard articles={articles} />
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePortal;