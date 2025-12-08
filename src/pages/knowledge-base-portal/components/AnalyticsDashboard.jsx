import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const AnalyticsDashboard = ({ analytics }) => {
  const viewsData = [
    { month: 'Jan', views: 2400, searches: 1800 },
    { month: 'Feb', views: 1398, searches: 1200 },
    { month: 'Mar', views: 9800, searches: 2400 },
    { month: 'Apr', views: 3908, searches: 1900 },
    { month: 'May', views: 4800, searches: 2100 },
    { month: 'Jun', views: 3800, searches: 1800 }
  ];

  const categoryData = [
    { name: 'Customs Procedures', value: 35, color: '#1E40AF' },
    { name: 'Import/Export', value: 25, color: '#B45309' },
    { name: 'Tax & Duties', value: 20, color: '#059669' },
    { name: 'Documentation', value: 12, color: '#DC2626' },
    { name: 'Others', value: 8, color: '#6B7280' }
  ];

  const topArticles = [
    {
      id: 1,
      title: 'How to Calculate Import Duties for Electronics',
      views: 15420,
      rating: 4.8,
      category: 'Tax & Duties'
    },
    {
      id: 2,
      title: 'Complete Guide to Customs Declaration Forms',
      views: 12350,
      rating: 4.6,
      category: 'Documentation'
    },
    {
      id: 3,
      title: 'Export Permit Application Process',
      views: 9870,
      rating: 4.7,
      category: 'Import/Export'
    },
    {
      id: 4,
      title: 'Understanding GST on Imported Goods',
      views: 8920,
      rating: 4.5,
      category: 'Tax & Duties'
    },
    {
      id: 5,
      title: 'Prohibited and Restricted Items List',
      views: 7650,
      rating: 4.9,
      category: 'Customs Procedures'
    }
  ];

  const searchQueries = [
    { query: 'import duty calculator', count: 1250 },
    { query: 'customs declaration form', count: 980 },
    { query: 'export permit requirements', count: 750 },
    { query: 'GST calculation import', count: 620 },
    { query: 'prohibited items list', count: 580 }
  ];

  const stats = [
    {
      label: 'Total Articles',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: 'FileText'
    },
    {
      label: 'Monthly Views',
      value: '45,230',
      change: '+8.2%',
      changeType: 'positive',
      icon: 'Eye'
    },
    {
      label: 'Average Rating',
      value: '4.6',
      change: '+0.3',
      changeType: 'positive',
      icon: 'Star'
    },
    {
      label: 'Search Queries',
      value: '8,940',
      change: '-2.1%',
      changeType: 'negative',
      icon: 'Search'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat?.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
                <p className={`text-sm ${
                  stat?.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  {stat?.change} from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={stat?.icon} size={24} className="text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views and Searches Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Views & Searches Trend
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#1E40AF" 
                  strokeWidth={2}
                  name="Article Views"
                />
                <Line 
                  type="monotone" 
                  dataKey="searches" 
                  stroke="#B45309" 
                  strokeWidth={2}
                  name="Search Queries"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Content by Category
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData?.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category?.color }}
                  ></div>
                  <span className="text-sm text-foreground">{category?.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{category?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Articles */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Top Performing Articles
          </h3>
          <div className="space-y-4">
            {topArticles?.map((article, index) => (
              <div key={article?.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {article?.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Icon name="Eye" size={12} className="mr-1" />
                      {article?.views?.toLocaleString()} views
                    </span>
                    <span className="flex items-center">
                      <Icon name="Star" size={12} className="mr-1" />
                      {article?.rating}/5
                    </span>
                    <span>{article?.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Search Queries */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Popular Search Queries
          </h3>
          <div className="space-y-4">
            {searchQueries?.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-medium text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {query?.query}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {query?.count} searches
                  </span>
                  <Icon name="TrendingUp" size={16} className="text-success" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="Lightbulb" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Knowledge Gap Identified</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Consider creating articles for high-search, low-result queries to improve user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;