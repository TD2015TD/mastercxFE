import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApprovalWorkflow = ({ pendingArticles = [], onApprove, onReject, userRole }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = (article) => {
    onApprove(article?.id, reviewComment);
    setSelectedArticle(null);
    setReviewComment('');
  };

  const handleReject = (article) => {
    onReject(article?.id, reviewComment);
    setSelectedArticle(null);
    setReviewComment('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (userRole !== 'approver' && userRole !== 'admin') {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Clock" size={20} className="text-accent" />
          <h2 className="text-xl font-semibold text-foreground">
            Pending Approvals
          </h2>
          {pendingArticles?.length > 0 && (
            <span className="px-2 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
              {pendingArticles?.length}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {pendingArticles?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Pending Approvals
            </h3>
            <p className="text-muted-foreground">
              All articles have been reviewed and processed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingArticles?.map((article) => (
              <div key={article?.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-foreground truncate">
                        {article?.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(article?.priority)}`}>
                        {article?.priority} priority
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <Icon name="User" size={14} className="mr-1" />
                        {article?.author}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Calendar" size={14} className="mr-1" />
                        Submitted {formatDate(article?.submittedAt)}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Folder" size={14} className="mr-1" />
                        {article?.category}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Eye"
                      iconPosition="left"
                      onClick={() => setSelectedArticle(article)}
                    >
                      Review
                    </Button>
                    
                    <Button
                      variant="success"
                      size="sm"
                      iconName="CheckCircle"
                      iconPosition="left"
                      onClick={() => handleApprove(article)}
                    >
                      Approve
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      iconName="XCircle"
                      iconPosition="left"
                      onClick={() => handleReject(article)}
                    >
                      Reject
                    </Button>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="Clock" size={14} className="mr-1" />
                    {Math.ceil((new Date() - new Date(article.submittedAt)) / (1000 * 60 * 60 * 24))} days pending
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Review Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">
                Review Article: {selectedArticle?.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={() => setSelectedArticle(null)}
              />
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedArticle?.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Content Preview</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedArticle?.content || 'No content available for preview.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Category</h4>
                    <p className="text-muted-foreground">{selectedArticle?.category}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Department</h4>
                    <p className="text-muted-foreground">{selectedArticle?.department}</p>
                  </div>
                </div>

                {selectedArticle?.tags && selectedArticle?.tags?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle?.tags?.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded text-sm text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Review Comments
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e?.target?.value)}
                    placeholder="Add your review comments here..."
                    className="w-full h-24 p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 p-6 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                iconName="X"
                iconPosition="left"
                onClick={() => setSelectedArticle(null)}
              >
                Cancel
              </Button>
              
              <Button
                variant="destructive"
                iconName="XCircle"
                iconPosition="left"
                onClick={() => handleReject(selectedArticle)}
              >
                Reject
              </Button>
              
              <Button
                variant="success"
                iconName="CheckCircle"
                iconPosition="left"
                onClick={() => handleApprove(selectedArticle)}
              >
                Approve & Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;