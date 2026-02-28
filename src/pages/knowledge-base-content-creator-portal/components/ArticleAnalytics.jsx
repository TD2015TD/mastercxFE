import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { exportToCsv } from '../../../utils/exportCsv';

const ArticleAnalytics = ({ userRole }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  // Mock analytics data
  const analyticsData = {
    summary: {
      totalArticles: 68,
      totalViews: 15240,
      avgHelpfulRating: 91,
      topPerformingCategory: 'GST & Tax Procedures',
      mostActiveAuthor: 'Ahmad Rahman',
      publishedThisMonth: 12
    },
    topArticles: [
      {
        id: 'art-001',
        title: 'GST Calculation Guidelines for Imported Electronics',
        category: 'GST & Tax Procedures',
        views: 1560,
        helpfulVotes: 89,
        helpfulPercentage: 94,
        avgRating: 4.7,
        author: 'Ahmad Rahman',
        publishedDate: '2024-10-25'
      },
      {
        id: 'art-004',
        title: 'System Troubleshooting: Portal Login Issues',
        category: 'System & Technical',
        views: 890,
        helpfulVotes: 67,
        helpfulPercentage: 91,
        avgRating: 4.5,
        author: 'Tech Support Team',
        publishedDate: '2024-10-20'
      },
      {
        id: 'art-007',
        title: 'Customs Declaration Best Practices',
        category: 'Customs & Import/Export',
        views: 720,
        helpfulVotes: 52,
        helpfulPercentage: 88,
        avgRating: 4.3,
        author: 'Sarah Ahmad',
        publishedDate: '2024-10-18'
      },
      {
        id: 'art-012',
        title: 'License Renewal Process Guide',
        category: 'Licensing & Permits',
        views: 650,
        helpfulVotes: 45,
        helpfulPercentage: 85,
        avgRating: 4.2,
        author: 'Raj Kumar',
        publishedDate: '2024-10-15'
      },
      {
        id: 'art-003',
        title: 'Duty Exemption Certificate Requirements',
        category: 'Licensing & Permits',
        views: 580,
        helpfulVotes: 38,
        helpfulPercentage: 82,
        avgRating: 4.0,
        author: 'Ahmad Rahman',
        publishedDate: '2024-10-12'
      }
    ],
    categoryPerformance: [
      {
        category: 'GST & Tax Procedures',
        articleCount: 23,
        totalViews: 5240,
        avgHelpfulRating: 92,
        topArticle: 'GST Calculation Guidelines',
        growth: 15
      },
      {
        category: 'Customs & Import/Export',
        articleCount: 18,
        totalViews: 3890,
        avgHelpfulRating: 89,
        topArticle: 'Customs Declaration Best Practices',
        growth: 8
      },
      {
        category: 'System & Technical',
        articleCount: 12,
        totalViews: 2650,
        avgHelpfulRating: 88,
        topArticle: 'Portal Login Troubleshooting',
        growth: 22
      },
      {
        category: 'Licensing & Permits',
        articleCount: 15,
        totalViews: 2460,
        avgHelpfulRating: 85,
        topArticle: 'License Renewal Guide',
        growth: -3
      }
    ],
    authorPerformance: [
      {
        name: 'Ahmad Rahman',
        department: 'Customer Service',
        articlesPublished: 15,
        totalViews: 4520,
        avgHelpfulRating: 93,
        topArticle: 'GST Calculation Guidelines'
      },
      {
        name: 'Sarah Ahmad',
        department: 'Tax Assessment',
        articlesPublished: 12,
        totalViews: 3240,
        avgHelpfulRating: 89,
        topArticle: 'Customs Declaration Best Practices'
      },
      {
        name: 'Tech Support Team',
        department: 'IT Support',
        articlesPublished: 8,
        totalViews: 2180,
        avgHelpfulRating: 87,
        topArticle: 'System Troubleshooting Guide'
      },
      {
        name: 'Raj Kumar',
        department: 'Licensing Division',
        articlesPublished: 10,
        totalViews: 1950,
        avgHelpfulRating: 84,
        topArticle: 'License Renewal Process'
      }
    ],
    usagePatterns: {
      peakHours: ['9:00 AM', '2:00 PM', '4:00 PM'],
      mostSearchedTerms: ['GST calculation', 'customs declaration', 'license renewal', 'tax exemption', 'import duty'],
      departmentUsage: [
        { department: 'Customer Service', percentage: 45 },
        { department: 'Tax Assessment', percentage: 28 },
        { department: 'Customs Operations', percentage: 18 },
        { department: 'IT Support', percentage: 9 }
      ]
    }
  };

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last 12 months' }
  ];

  const metrics = [
    { value: 'views', label: 'Views', icon: 'Eye' },
    { value: 'helpful', label: 'Helpful Rating', icon: 'ThumbsUp' },
    { value: 'rating', label: 'User Rating', icon: 'Star' },
    { value: 'engagement', label: 'Engagement', icon: 'Activity' }
  ];

  const handleExportReport = () => {
    const rows = [
      ['Article ID', 'Title', 'Category', 'Views', 'Helpful %', 'Avg Rating', 'Author', 'Published Date'],
      ...analyticsData.topArticles.map(a => [
        a.id, a.title, a.category, a.views, `${a.helpfulPercentage}%`, a.avgRating, a.author, a.publishedDate
      ])
    ];
    exportToCsv(rows, `article-analytics-${selectedPeriod}`);
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars?.push(<Icon key={i} name="Star" size={12} className="text-yellow-500 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars?.push(<Icon key="half" name="Star" size={12} className="text-yellow-500 fill-current opacity-50" />);
    }
    
    return stars;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Usage Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Knowledge base performance and usage insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e?.target?.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {periods?.map(period => (
              <option key={period?.value} value={period?.value}>
                {period?.label}
              </option>
            ))}
          </select>
          
          <button onClick={handleExportReport} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-2">
            <Icon name="Download" size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.summary?.totalArticles}
              </div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Eye" size={24} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.summary?.totalViews?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="ThumbsUp" size={24} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.summary?.avgHelpfulRating}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Helpful Rating</div>
            </div>
          </div>
        </div>
      </div>
      {/* Performance Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">Top Performing Articles</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData?.topArticles?.map((article, index) => (
                <div key={article?.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
                      {article?.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{article?.category}</span>
                      <span>by {article?.author}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{article?.views}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Icon name="ThumbsUp" size={12} className="text-green-500" />
                      <span className="font-semibold text-foreground text-sm">{article?.helpfulPercentage}%</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {getRatingStars(article?.avgRating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">Category Performance</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData?.categoryPerformance?.map((category) => (
                <div key={category?.category} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm">
                      {category?.category}
                    </h4>
                    <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(category?.growth)}`}>
                      <Icon name={category?.growth > 0 ? "TrendingUp" : category?.growth < 0 ? "TrendingDown" : "Minus"} size={14} />
                      <span>{Math.abs(category?.growth)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>
                      <div className="font-semibold text-foreground">{category?.articleCount}</div>
                      <div>Articles</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{category?.totalViews?.toLocaleString()}</div>
                      <div>Views</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{category?.avgHelpfulRating}%</div>
                      <div>Helpful</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Top: {category?.topArticle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Author Performance & Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Author Performance */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">Author Performance</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {analyticsData?.authorPerformance?.map((author, index) => (
                <div key={author?.name} className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {author?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{author?.name}</div>
                    <div className="text-xs text-muted-foreground">{author?.department}</div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="font-semibold text-foreground">{author?.articlesPublished}</div>
                    <div className="text-xs text-muted-foreground">articles</div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="font-semibold text-foreground">{author?.totalViews?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="font-semibold text-foreground">{author?.avgHelpfulRating}%</div>
                    <div className="text-xs text-muted-foreground">helpful</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Patterns */}
        <div className="bg-card border border-border rounded-lg">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">Usage Patterns</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Peak Hours */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Peak Usage Hours</h4>
              <div className="flex flex-wrap gap-2">
                {analyticsData?.usagePatterns?.peakHours?.map((hour) => (
                  <span
                    key={hour}
                    className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            {/* Most Searched Terms */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Top Search Terms</h4>
              <div className="space-y-2">
                {analyticsData?.usagePatterns?.mostSearchedTerms?.map((term, index) => (
                  <div key={term} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{term}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${100 - (index * 15)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {100 - (index * 15)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Usage */}
            <div>
              <h4 className="font-medium text-foreground mb-3">Department Usage</h4>
              <div className="space-y-2">
                {analyticsData?.usagePatterns?.departmentUsage?.map((dept) => (
                  <div key={dept?.department} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{dept?.department}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${dept?.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {dept?.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleAnalytics;