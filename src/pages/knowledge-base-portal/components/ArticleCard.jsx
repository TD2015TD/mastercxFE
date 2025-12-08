import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ArticleCard = ({ article, onEdit, onView, onApprove, onArchive, userRole }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'text-warning bg-warning/10';
      case 'pending': return 'text-accent bg-accent/10';
      case 'live': return 'text-success bg-success/10';
      case 'archived': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return 'Edit';
      case 'pending': return 'Clock';
      case 'live': return 'CheckCircle';
      case 'archived': return 'Archive';
      default: return 'FileText';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {article?.title}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article?.status)}`}>
              <Icon name={getStatusIcon(article?.status)} size={12} className="mr-1" />
              {article?.status?.charAt(0)?.toUpperCase() + article?.status?.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center">
              <Icon name="User" size={14} className="mr-1" />
              {article?.author}
            </span>
            <span className="flex items-center">
              <Icon name="Calendar" size={14} className="mr-1" />
              {formatDate(article?.lastModified)}
            </span>
            <span className="flex items-center">
              <Icon name="Eye" size={14} className="mr-1" />
              {article?.viewCount} views
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article?.description}
          </p>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
              <Icon name="Folder" size={12} className="mr-1" />
              {article?.category}
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
              <Icon name="Building" size={12} className="mr-1" />
              {article?.department}
            </span>
            {article?.rating && (
              <span className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                <Icon name="Star" size={12} className="mr-1" />
                {article?.rating}/5
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            onClick={() => onView(article)}
          >
            View
          </Button>
          
          {(userRole === 'editor' || userRole === 'admin') && article?.status !== 'archived' && (
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => onEdit(article)}
            >
              Edit
            </Button>
          )}
          
          {userRole === 'approver' && article?.status === 'pending' && (
            <Button
              variant="default"
              size="sm"
              iconName="CheckCircle"
              iconPosition="left"
              onClick={() => onApprove(article)}
            >
              Approve
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {article?.status === 'live' && (userRole === 'admin' || userRole === 'approver') && (
            <Button
              variant="outline"
              size="sm"
              iconName="Archive"
              iconPosition="left"
              onClick={() => onArchive(article)}
            >
              Archive
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
          >
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;