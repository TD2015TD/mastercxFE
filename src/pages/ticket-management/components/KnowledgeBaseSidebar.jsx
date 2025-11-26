import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const KnowledgeBaseSidebar = ({ ticket, onCopyToNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const mockArticles = [
    {
      id: 'KB-001',
      title: 'Import Declaration Processing Guidelines',
      summary: 'Step-by-step guide for processing import declarations including required documents and validation checks.',
      category: 'Import Declaration',
      views: 1247,
      rating: 4.8,
      lastUpdated: new Date('2024-10-15'),
      content: `**Import Declaration Processing Steps:**\n\n1. Verify all required documents are attached\n2. Check commodity codes against tariff schedule\n3. Validate declared values against market prices\n4. Review duty calculations\n5. Process payment if applicable\n\n**Common Issues:**\n- Missing commercial invoice\n- Incorrect HS codes\n- Undervaluation concerns`
    },
    {
      id: 'KB-002',
      title: 'Duty Payment Methods and Procedures',
      summary: 'Complete guide to available duty payment methods including online payments, bank transfers, and payment deferrals.',
      category: 'Duty Payment',
      views: 892,
      rating: 4.6,
      lastUpdated: new Date('2024-10-20'),
      content: `**Available Payment Methods:**\n\n1. Online Payment Portal\n2. Bank Transfer (FPX)\n3. Credit/Debit Card\n4. Deferred Payment (Approved traders only)\n\n**Payment Processing Time:**\n- Online: Immediate\n- Bank Transfer: 1-2 hours\n- Card Payment: Immediate\n\n**Troubleshooting:**\n- Payment failed: Check account balance\n- Transaction not reflected: Wait 2 hours before retry`
    },
    {
      id: 'KB-003',
      title: 'System Error Resolution Guide',
      summary: 'Common system errors and their solutions for the JKDM online portal.',
      category: 'System Issue',
      views: 654,
      rating: 4.4,
      lastUpdated: new Date('2024-10-25'),
      content: `**Common Error Codes:**\n\nERR_001: Session Timeout\n- Solution: Re-login to the system\n\nERR_002: File Upload Failed\n- Solution: Check file size (&lt;5MB) and format (PDF/JPG)\n\nERR_003: Payment Gateway Error\n- Solution: Try alternative payment method\n\n**Browser Requirements:**\n- Chrome 90+, Firefox 88+, Safari 14+\n- Enable JavaScript and cookies`
    }
  ];

  useEffect(() => {
    // Auto-suggest articles based on ticket category and keywords
    const categoryMatch = mockArticles?.filter(article => 
      article?.category?.toLowerCase() === ticket?.category?.toLowerCase()
    );
    
    const keywordMatch = mockArticles?.filter(article =>
      ticket?.subject?.toLowerCase()?.split(' ')?.some(word =>
        article?.title?.toLowerCase()?.includes(word) ||
        article?.summary?.toLowerCase()?.includes(word)
      )
    );
    
    const suggested = [...new Set([...categoryMatch, ...keywordMatch])]?.slice(0, 3);
    setSuggestedArticles(suggested);
  }, [ticket]);

  const handleSearch = async () => {
    if (!searchQuery?.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = mockArticles?.filter(article =>
        article?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        article?.summary?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        article?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleCopyToNote = (article) => {
    const noteContent = `**Knowledge Base Reference: ${article?.id}**\n\n${article?.title}\n\n${article?.content}`;
    onCopyToNote(noteContent);
  };

  const formatRating = (rating) => {
    return '★'?.repeat(Math.floor(rating)) + '☆'?.repeat(5 - Math.floor(rating));
  };

  const ArticleCard = ({ article, showCopyButton = true }) => (
    <div className="bg-muted rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">{article?.title}</h4>
        <span className="text-xs text-muted-foreground ml-2">{article?.id}</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{article?.summary}</p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{formatRating(article?.rating)} ({article?.views} views)</span>
        <span>{article?.lastUpdated?.toLocaleDateString('en-GB')}</span>
      </div>
      
      {showCopyButton && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="xs"
            iconName="Copy"
            iconPosition="left"
            onClick={() => handleCopyToNote(article)}
            className="flex-1"
          >
            Copy to Note
          </Button>
          <Button
            variant="ghost"
            size="xs"
            iconName="ExternalLink"
            onClick={() => window.open(`/knowledge-base-portal?article=${article?.id}`, '_blank')}
          >
            View
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Knowledge Base</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="ExternalLink"
          onClick={() => window.open('/knowledge-base-portal', '_blank')}
        >
          Open KB
        </Button>
      </div>
      {/* Search */}
      <div className="mb-4">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="default"
            iconName="Search"
            loading={isSearching}
            onClick={handleSearch}
          />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchResults?.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Search Results ({searchResults?.length})
            </h4>
            {searchResults?.map(article => (
              <ArticleCard key={article?.id} article={article} />
            ))}
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Suggested Articles
            </h4>
            {suggestedArticles?.length > 0 ? (
              suggestedArticles?.map(article => (
                <ArticleCard key={article?.id} article={article} />
              ))
            ) : (
              <div className="text-center py-8">
                <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No suggested articles</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for specific topics</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={() => window.open('/knowledge-base-portal?action=create', '_blank')}
          >
            Create Article
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="MessageSquare"
            iconPosition="left"
            onClick={() => window.open('/knowledge-base-portal?action=feedback', '_blank')}
          >
            Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSidebar;