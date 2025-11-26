import React from 'react';
import Icon from '../../../components/AppIcon';

const ContentWorkflow = ({ userRole, activeTab, selectedArticle }) => {
  const getWorkflowSteps = () => {
    return [
      {
        id: 'draft',
        label: 'Draft',
        description: 'Content creation and editing',
        icon: 'Edit3',
        roles: ['content_creator', 'approver']
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Submission for approval',
        icon: 'Eye',
        roles: ['content_creator', 'approver']
      },
      {
        id: 'approval',
        label: 'Approval',
        description: 'Content review and approval',
        icon: 'CheckCircle',
        roles: ['approver']
      },
      {
        id: 'published',
        label: 'Published',
        description: 'Live and accessible to agents',
        icon: 'Globe',
        roles: ['approver', 'supervisor', 'admin']
      }
    ];
  };

  const getCurrentStep = () => {
    if (!selectedArticle) {
      return activeTab === 'create' ? 'draft' : null;
    }
    
    switch (selectedArticle?.status) {
      case 'draft':
        return 'draft';
      case 'in_review':
        return 'review';
      case 'published':
        return 'published';
      case 'archived':
        return 'published';
      default:
        return 'draft';
    }
  };

  const getStepStatus = (stepId) => {
    const currentStep = getCurrentStep();
    const steps = ['draft', 'review', 'approval', 'published'];
    const currentIndex = steps?.indexOf(currentStep);
    const stepIndex = steps?.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getWorkflowStats = () => {
    // Mock workflow statistics
    return {
      drafts: 8,
      inReview: 3,
      published: 45,
      archived: 12
    };
  };

  const getRoleSpecificActions = () => {
    switch (userRole) {
      case 'content_creator':
        return [
          { label: 'Create Article', action: 'create', icon: 'Plus' },
          { label: 'View My Drafts', action: 'drafts', icon: 'FileText' },
          { label: 'Submit for Review', action: 'submit', icon: 'Send' }
        ];
      case 'approver':
        return [
          { label: 'Review Queue', action: 'review_queue', icon: 'Clock' },
          { label: 'Approve Articles', action: 'approve', icon: 'CheckCircle' },
          { label: 'Manage Categories', action: 'categories', icon: 'Folder' }
        ];
      case 'supervisor':
        return [
          { label: 'View Analytics', action: 'analytics', icon: 'BarChart' },
          { label: 'Usage Reports', action: 'reports', icon: 'FileBarChart' },
          { label: 'Top Articles', action: 'top_articles', icon: 'TrendingUp' }
        ];
      default:
        return [];
    }
  };

  const workflowSteps = getWorkflowSteps();
  const stats = getWorkflowStats();
  const roleActions = getRoleSpecificActions();
  const showWorkflow = activeTab === 'create' || selectedArticle;

  if (!showWorkflow) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Progress */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="GitBranch" size={20} />
            <span>Content Workflow</span>
          </h3>
          
          <div className="flex items-center justify-between">
            {workflowSteps?.map((step, index) => {
              const status = getStepStatus(step?.id);
              const isVisible = step?.roles?.includes(userRole);
              
              if (!isVisible) return null;
              
              return (
                <React.Fragment key={step?.id}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
                      status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : status === 'active' ?'bg-primary border-primary text-primary-foreground' :'bg-background border-border text-muted-foreground'
                    }`}>
                      <Icon name={step?.icon} size={20} />
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        status === 'active' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {step?.label}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-24 leading-tight">
                        {step?.description}
                      </div>
                    </div>
                  </div>
                  {index < workflowSteps?.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      getStepStatus(workflowSteps?.[index + 1]?.id) === 'completed' 
                        ? 'bg-green-500' :'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="space-y-4">
          {/* Workflow Statistics */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Workflow Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-lg font-bold text-foreground">{stats?.drafts}</div>
                <div className="text-xs text-muted-foreground">Drafts</div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-lg font-bold text-foreground">{stats?.inReview}</div>
                <div className="text-xs text-muted-foreground">In Review</div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-lg font-bold text-foreground">{stats?.published}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <div className="text-lg font-bold text-foreground">{stats?.archived}</div>
                <div className="text-xs text-muted-foreground">Archived</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
            <div className="space-y-2">
              {roleActions?.map((action) => (
                <button
                  key={action?.action}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
                >
                  <Icon name={action?.icon} size={16} />
                  <span>{action?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Current Article Status */}
      {selectedArticle && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h4 className="font-medium text-foreground">Current Article Status</h4>
                <p className="text-sm text-muted-foreground">{selectedArticle?.title || 'Untitled Article'}</p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedArticle?.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                selectedArticle?.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                selectedArticle?.status === 'published'? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedArticle?.status?.replace('_', ' ')?.toUpperCase()}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date()?.toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentWorkflow;