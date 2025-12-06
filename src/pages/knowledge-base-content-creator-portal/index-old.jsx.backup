import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import GlobalHeader from '../global-navigation-system/components/GlobalHeader';
import NavigationBreadcrumbs from '../global-navigation-system/components/NavigationBreadcrumbs';
import ArticleEditor from './components/ArticleEditor';
import ContentWorkflow from './components/ContentWorkflow';
import ArticleLibrary from './components/ArticleLibrary';
import DirectoryBrowser from './components/DirectoryBrowser';
import ReviewQueue from './components/ReviewQueue';
import ArticleAnalytics from './components/ArticleAnalytics';

const KnowledgeBaseContentCreatorPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('library');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@jkdm.gov.my',
    role: 'content_creator', // content_creator, approver, supervisor, admin
    department: 'Customer Service',
    avatar: null
  });

  // Custom breadcrumbs for KB Content Creator Portal
  const customBreadcrumbs = [
    { label: 'Dashboard', path: '/agent-dashboard', isActive: false },
    { label: 'Knowledge Base', path: '/knowledge-base-portal', isActive: false },
    { label: 'Content Creator Portal', path: '/knowledge-base-content-creator-portal', isActive: true }
  ];

  // Navigation tabs based on user role
  const getNavigationTabs = () => {
    const baseTabs = [
      { id: 'library', label: 'Article Library', roles: ['content_creator', 'approver', 'supervisor', 'admin'] },
      { id: 'browse', label: 'Directory Browse', roles: ['content_creator', 'approver', 'supervisor', 'admin'] },
      { id: 'create', label: 'Create Article', roles: ['content_creator', 'approver'] },
      { id: 'my-drafts', label: 'My Drafts', roles: ['content_creator'] },
      { id: 'review-queue', label: 'Review Queue', roles: ['approver'] },
      { id: 'analytics', label: 'Usage Analytics', roles: ['supervisor', 'admin'] },
      { id: 'settings', label: 'KB Settings', roles: ['approver', 'admin'] }
    ];

    return baseTabs?.filter(tab => tab?.roles?.includes(currentUser?.role));
  };

  const navigationTabs = getNavigationTabs();

  useEffect(() => {
    // Handle URL parameters for navigation
    const tab = searchParams?.get('tab');
    const articleId = searchParams?.get('article');
    
    if (tab && navigationTabs?.find(t => t?.id === tab)) {
      setActiveTab(tab);
    }
    
    if (articleId) {
      // Load article data
      setSelectedArticle({ id: articleId });
      setActiveTab('create'); // Switch to editor for viewing/editing
    }
  }, [searchParams, navigationTabs]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`${location?.pathname}?tab=${tabId}`);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    setActiveTab('create');
    navigate(`${location?.pathname}?tab=create&article=${article?.id}`);
  };

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setActiveTab('create');
    navigate(`${location?.pathname}?tab=create`);
  };

  const handleArticleSave = (article) => {
    console.log('Article saved:', article);
    // In real implementation, this would save to backend
    setActiveTab('my-drafts');
    navigate(`${location?.pathname}?tab=my-drafts`);
  };

  const handleWorkflowAction = (action, article) => {
    console.log('Workflow action:', action, article);
    // Handle workflow actions like submit for review, approve, publish, etc.
  };

  const handleGlobalNavigation = (path) => {
    navigate(path);
  };

  const handleShowCommandPalette = () => {
    console.log('Command palette triggered');
    // Implementation for command palette
  };

  const handleShowKeyboardShortcuts = () => {
    console.log('Keyboard shortcuts triggered');
    // Implementation for keyboard shortcuts
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'library':
        return (
          <ArticleLibrary
            userRole={currentUser?.role}
            onArticleSelect={handleArticleSelect}
            onNewArticle={handleNewArticle}
          />
        );
      
      case 'browse':
        return (
          <DirectoryBrowser
            userRole={currentUser?.role}
            onArticleSelect={handleArticleSelect}
          />
        );
      
      case 'create':
        return (
          <ArticleEditor
            article={selectedArticle}
            userRole={currentUser?.role}
            onSave={handleArticleSave}
            onWorkflowAction={handleWorkflowAction}
          />
        );
      
      case 'my-drafts':
        return (
          <ArticleLibrary
            userRole={currentUser?.role}
            filterBy="drafts"
            userId={currentUser?.email}
            onArticleSelect={handleArticleSelect}
            onNewArticle={handleNewArticle}
          />
        );
      
      case 'review-queue':
        return (
          <ReviewQueue
            userRole={currentUser?.role}
            onArticleSelect={handleArticleSelect}
            onWorkflowAction={handleWorkflowAction}
          />
        );
      
      case 'analytics':
        return (
          <ArticleAnalytics
            userRole={currentUser?.role}
          />
        );
      
      case 'settings':
        return (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Knowledge Base Settings</h2>
            <p className="text-muted-foreground">
              Manage categories, departments, visibility settings, and KB configuration.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader 
        user={currentUser}
        currentPath={location?.pathname}
        onNavigate={handleGlobalNavigation}
        onShowCommandPalette={handleShowCommandPalette}
        onShowKeyboardShortcuts={handleShowKeyboardShortcuts}
      />
      <main className="container mx-auto px-6 py-8">
        <NavigationBreadcrumbs 
          currentPath={location?.pathname}
          customBreadcrumbs={customBreadcrumbs}
        />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Knowledge Base Content Creator Portal
            </h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage knowledge articles through collaborative authoring workflow
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                currentUser?.role === 'content_creator' ? 'bg-blue-500' :
                currentUser?.role === 'approver' ? 'bg-green-500' :
                currentUser?.role === 'supervisor' ? 'bg-purple-500' : 'bg-orange-500'
              }`}></div>
              <span className="text-sm text-foreground capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
            
            {(currentUser?.role === 'content_creator' || currentUser?.role === 'approver') && (
              <button
                onClick={handleNewArticle}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>New Article</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {navigationTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => handleTabChange(tab?.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                {tab?.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Workflow Status */}
        <ContentWorkflow 
          userRole={currentUser?.role}
          activeTab={activeTab}
          selectedArticle={selectedArticle}
        />

        {/* Main Content */}
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default KnowledgeBaseContentCreatorPortal;