import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import type { SupersetDashboard } from '../../../types/superset';
import { useSupersetDashboards } from '../../../hooks/useSupersetDashboards';
import SupersetDashboardModal from '../../../components/SupersetDashboardModal';

const SupersetDashboardList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState<SupersetDashboard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    dashboards,
    loading,
    error,
    categories,
    refresh,
  } = useSupersetDashboards({
    search: searchQuery,
    category: selectedCategory,
    is_active: true,
  });

  const handleDashboardClick = (dashboard: SupersetDashboard) => {
    setSelectedDashboard(dashboard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDashboard(null);
  };

  const filteredDashboards = dashboards.filter(
    (dashboard) =>
      dashboard.is_active &&
      (searchQuery === '' ||
        dashboard.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group dashboards by category
  const groupedDashboards = filteredDashboards.reduce((acc, dashboard) => {
    const category = dashboard.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dashboard);
    return acc;
  }, {} as Record<string, SupersetDashboard[]>);

  // Sort dashboards within each category by order
  Object.keys(groupedDashboards).forEach((category) => {
    groupedDashboards[category].sort((a, b) => a.order - b.order);
  });

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error Loading Dashboards
        </h3>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={refresh} iconName="RefreshCw" iconPosition="left">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value as string)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map(category => ({
                    value: category,
                    label: category
                  }))
                ]}
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={refresh}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboards...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDashboards.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Dashboards Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory
                ? 'Try adjusting your filters to find more dashboards.'
                : 'No dashboards are available for your role.'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                iconName="X"
                iconPosition="left"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Dashboard Grid by Category */}
        {!loading && Object.keys(groupedDashboards).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedDashboards).map(([category, categoryDashboards]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center mb-4">
                  <Icon name="Folder" size={20} className="mr-2 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({categoryDashboards.length})
                  </span>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryDashboards.map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => handleDashboardClick(dashboard)}
                      className="bg-card rounded-lg border border-border p-6 text-left hover:border-primary hover:shadow-lg transition-all duration-200 group"
                    >
                      {/* Dashboard Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {dashboard.icon && (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon
                                name={dashboard.icon}
                                size={24}
                                className="text-primary"
                              />
                            </div>
                          )}
                        </div>
                        <Icon
                          name="ExternalLink"
                          size={16}
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>

                      {/* Dashboard Info */}
                      <div className="mb-4">
                        <h4 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {dashboard.title}
                        </h4>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {dashboard.description}
                          </p>
                        )}
                      </div>

                      {/* Dashboard Tags */}
                      {dashboard.tags && dashboard.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dashboard.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {dashboard.tags.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                              +{dashboard.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Dashboard Footer */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {dashboard.roles && dashboard.roles.length > 0 && (
                            <>
                              <Icon name="Users" size={12} />
                              <span>{dashboard.roles.length} role{dashboard.roles.length !== 1 ? 's' : ''}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-primary font-medium group-hover:underline">
                          View Dashboard →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Modal */}
      {selectedDashboard && (
        <SupersetDashboardModal
          dashboard={selectedDashboard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default SupersetDashboardList;
