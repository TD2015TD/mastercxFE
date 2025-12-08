import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const KnowledgeBaseSearch = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [popularArticles, setPopularArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const content = {
    en: {
      title: 'Knowledge Base',
      subtitle: 'Find answers to common questions and procedures',
      searchPlaceholder: 'Search for help articles, procedures, or FAQs...',
      searchButton: 'Search',
      popularTitle: 'Popular Articles',
      noResults: 'No articles found',
      noResultsDesc: 'Try different keywords or browse popular articles below',
      backToSearch: 'Back to Search',
      helpful: 'Was this helpful?',
      yes: 'Yes',
      no: 'No',
      categories: {
        customs_procedures: 'Customs Procedures',
        import_export: 'Import/Export',
        tax_duties: 'Tax & Duties',
        documentation: 'Documentation',
        general: 'General Information'
      }
    },
    ms: {
      title: 'Pangkalan Pengetahuan',
      subtitle: 'Cari jawapan kepada soalan dan prosedur biasa',
      searchPlaceholder: 'Cari artikel bantuan, prosedur, atau FAQ...',
      searchButton: 'Cari',
      popularTitle: 'Artikel Popular',
      noResults: 'Tiada artikel dijumpai',
      noResultsDesc: 'Cuba kata kunci yang berbeza atau layari artikel popular di bawah',
      backToSearch: 'Kembali ke Carian',
      helpful: 'Adakah ini membantu?',
      yes: 'Ya',
      no: 'Tidak',
      categories: {
        customs_procedures: 'Prosedur Kastam',
        import_export: 'Import/Eksport',
        tax_duties: 'Cukai & Duti',
        documentation: 'Dokumentasi',
        general: 'Maklumat Am'
      }
    }
  };

  const t = content?.[language];

  // Load popular articles and categories on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch popular articles
        const popularResponse = await axios.get('/api/v1/public/knowledge-base/popular', {
          params: { limit: 5 }
        });
        setPopularArticles(popularResponse.data.data);

        // Fetch categories
        const categoriesResponse = await axios.get('/api/v1/public/knowledge-base/categories');
        setCategories([{ name: 'All', count: 0 }, ...categoriesResponse.data.data]);
      } catch (err) {
        console.error('Failed to load KB data:', err);
        setError('Failed to load knowledge base');
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery?.trim() && selectedCategory === 'all') return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await axios.get('/api/v1/public/knowledge-base/search', {
        params: {
          q: searchQuery,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 20
        }
      });
      setSearchResults(response.data.data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const viewArticle = async (articleId) => {
    try {
      const response = await axios.get(`/api/v1/public/knowledge-base/articles/${articleId}`);
      setSelectedArticle(response.data.data);
    } catch (err) {
      console.error('Failed to load article:', err);
      setError('Failed to load article');
    }
  };

  const submitFeedback = async (articleId, helpful) => {
    try {
      await axios.post(`/api/v1/public/knowledge-base/articles/${articleId}/feedback`, {
        helpful: helpful
      });
      // Show success notification (optional)
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  // Remove old mock articles definition
  const mockArticles_REMOVED = [
    {
      id: 'kb-001',
      title: language === 'en' ? 'How to Calculate Import Duties' : 'Cara Mengira Duti Import',
      category: 'tax_duties',
      content: language === 'en' 
        ? `Import duties are calculated based on the CIF (Cost, Insurance, and Freight) value of your goods.\n\nSteps to calculate:\n1. Determine the CIF value of your goods\n2. Check the applicable duty rate for your product category\n3. Apply the formula: Duty = CIF Value × Duty Rate\n4. Add any applicable taxes (GST/SST)\n\nExample:\nCIF Value: RM 10,000\nDuty Rate: 15%\nDuty Amount: RM 10,000 × 15% = RM 1,500\n\nFor specific duty rates, refer to the Malaysia Customs Tariff or contact our assessment department.`
        : `Duti import dikira berdasarkan nilai CIF (Kos, Insurans, dan Pengangkutan) barang anda.\n\nLangkah-langkah pengiraan:\n1. Tentukan nilai CIF barang anda\n2. Semak kadar duti yang berkenaan untuk kategori produk anda\n3. Gunakan formula: Duti = Nilai CIF × Kadar Duti\n4. Tambah sebarang cukai yang berkenaan (GST/SST)\n\nContoh:\nNilai CIF: RM 10,000\nKadar Duti: 15%\nJumlah Duti: RM 10,000 × 15% = RM 1,500\n\nUntuk kadar duti khusus, rujuk Tarif Kastam Malaysia atau hubungi jabatan taksiran kami.`,
      views: 1250,
      lastUpdated: new Date('2024-10-15'),
      helpful: 89
    },
    {
      id: 'kb-002',
      title: language === 'en' ? 'Required Documents for Import Declaration' : 'Dokumen Diperlukan untuk Pengisytiharan Import',
      category: 'documentation',
      content: language === 'en'
        ? `When submitting an import declaration, you must provide the following documents:\n\nMandatory Documents:\n• Commercial Invoice\n• Packing List\n• Bill of Lading or Airway Bill\n• Import License (if applicable)\n• Certificate of Origin (for preferential duty rates)\n\nAdditional Documents (when required):\n• Health Certificate (for food items)\n• Phytosanitary Certificate (for plant products)\n• SIRIM Certificate (for electrical items)\n• Halal Certificate (for halal products)\n\nAll documents must be:\n- Original or certified copies\n- In English or Bahasa Malaysia\n- Properly signed and stamped\n- Valid and not expired\n\nSubmit documents through the National Single Window (NSW) system or at the customs office.`
        : `Semasa menghantar pengisytiharan import, anda mesti menyediakan dokumen berikut:\n\nDokumen Mandatori:\n• Invois Komersial\n• Senarai Pembungkusan\n• Bil Muatan atau Bil Udara\n• Lesen Import (jika berkenaan)\n• Sijil Asal Usul (untuk kadar duti keutamaan)\n\nDokumen Tambahan (bila diperlukan):\n• Sijil Kesihatan (untuk barangan makanan)\n• Sijil Fitosanitari (untuk produk tumbuhan)\n• Sijil SIRIM (untuk barangan elektrik)\n• Sijil Halal (untuk produk halal)\n\nSemua dokumen mestilah:\n- Asal atau salinan yang disahkan\n- Dalam Bahasa Inggeris atau Bahasa Malaysia\n- Ditandatangani dan dicop dengan betul\n- Sah dan tidak tamat tempoh\n\nHantar dokumen melalui sistem National Single Window (NSW) atau di pejabat kastam.`,
      views: 980,
      lastUpdated: new Date('2024-10-20'),
      helpful: 92
    },
    {
      id: 'kb-003',
      title: language === 'en' ? 'Customs Clearance Process Timeline' : 'Garis Masa Proses Pelepasan Kastam',
      category: 'customs_procedures',
      content: language === 'en'
        ? `Understanding the customs clearance timeline helps you plan your import activities better.\n\nTypical Timeline:\n\nDay 1: Goods Arrival\n• Goods arrive at port/airport\n• Manifest submitted by carrier\n• Goods available for declaration\n\nDay 1-2: Declaration Submission\n• Import declaration submitted via NSW\n• Initial document verification\n• Risk assessment conducted\n\nDay 2-3: Processing\n• Detailed document review\n• Physical examination (if selected)\n• Duty assessment and calculation\n\nDay 3-5: Payment and Release\n• Duty payment processing\n• Final clearance approval\n• Goods released to importer\n\nFactors that may extend timeline:\n• Incomplete documentation\n• Physical examination requirements\n• Permit/license verification\n• Payment delays\n• Peak season congestion\n\nTo expedite clearance:\n- Ensure complete and accurate documentation\n- Use authorized agents\n- Pay duties promptly\n- Maintain good compliance record`
        : `Memahami garis masa pelepasan kastam membantu anda merancang aktiviti import dengan lebih baik.\n\nGaris Masa Biasa:\n\nHari 1: Ketibaan Barang\n• Barang tiba di pelabuhan/lapangan terbang\n• Manifes diserahkan oleh pengangkut\n• Barang tersedia untuk pengisytiharan\n\nHari 1-2: Penyerahan Pengisytiharan\n• Pengisytiharan import diserahkan melalui NSW\n• Pengesahan dokumen awal\n• Penilaian risiko dijalankan\n\nHari 2-3: Pemprosesan\n• Semakan dokumen terperinci\n• Pemeriksaan fizikal (jika dipilih)\n• Taksiran dan pengiraan duti\n\nHari 3-5: Pembayaran dan Pelepasan\n• Pemprosesan pembayaran duti\n• Kelulusan pelepasan akhir\n• Barang dilepaskan kepada pengimport\n\nFaktor yang mungkin memanjangkan masa:\n• Dokumentasi tidak lengkap\n• Keperluan pemeriksaan fizikal\n• Pengesahan permit/lesen\n• Kelewatan pembayaran\n• Kesesakan musim puncak\n\nUntuk mempercepatkan pelepasan:\n- Pastikan dokumentasi lengkap dan tepat\n- Gunakan ejen yang dibenarkan\n- Bayar duti dengan segera\n- Kekalkan rekod pematuhan yang baik`,
      views: 756,
      lastUpdated: new Date('2024-10-18'),
      helpful: 85
    }
  ]; // END OF MOCK DATA - REMOVED

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'ms' ? 'ms-MY' : 'en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })?.format(new Date(date));
  };

  const handleFeedback = (articleId, isHelpful) => {
    submitFeedback(articleId, isHelpful);
    // Show success notification
    console.log(`Article ${articleId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  if (selectedArticle) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        {/* Article Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                {t?.categories?.[selectedArticle?.category]}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedArticle?.views} {language === 'en' ? 'views' : 'tontonan'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{selectedArticle?.title}</h2>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Last updated' : 'Kemaskini terakhir'}: {formatDate(selectedArticle?.lastUpdated)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedArticle(null)}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            {t?.backToSearch}
          </Button>
        </div>
        {/* Article Content */}
        <div className="prose prose-sm max-w-none mb-8">
          <div className="bg-muted/50 rounded-lg p-6">
            {selectedArticle?.content?.split('\n')?.map((paragraph, index) => (
              <p key={index} className="text-sm text-foreground mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        {/* Feedback Section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{t?.helpful}</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(selectedArticle?.id, true)}
                iconName="ThumbsUp"
                iconPosition="left"
              >
                {t?.yes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(selectedArticle?.id, false)}
                iconName="ThumbsDown"
                iconPosition="left"
              >
                {t?.no}
              </Button>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {selectedArticle?.helpful}% {language === 'en' ? 'found this helpful' : 'mendapati ini membantu'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">{t?.title}</h2>
        <p className="text-sm text-muted-foreground">{t?.subtitle}</p>
      </div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t?.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-200"
            />
          </div>
          <Button
            onClick={handleSearch}
            loading={isSearching}
            disabled={!searchQuery?.trim()}
            iconName="Search"
            iconPosition="left"
          >
            {t?.searchButton}
          </Button>
        </div>
      </div>
      {/* Search Results */}
      {searchQuery && searchResults?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-foreground mb-4">
            {language === 'en' ? 'Search Results' : 'Hasil Carian'} ({searchResults?.length})
          </h3>
          <div className="space-y-4">
            {searchResults?.map((article) => (
              <div
                key={article?.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                onClick={() => viewArticle(article?.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{article?.title}</h4>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {article?.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {article?.excerpt || article?.content?.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{article?.views} {language === 'en' ? 'views' : 'tontonan'}</span>
                  <span>{article?.helpful_count} {language === 'en' ? 'helpful' : 'berguna'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* No Results */}
      {searchQuery && searchResults?.length === 0 && !isSearching && (
        <div className="text-center py-8 mb-8">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t?.noResults}</h3>
          <p className="text-sm text-muted-foreground">{t?.noResultsDesc}</p>
        </div>
      )}
      {/* Popular Articles */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">{t?.popularTitle}</h3>
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularArticles?.map((article) => (
            <div
              key={article?.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
              onClick={() => viewArticle(article?.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground text-sm">{article?.title}</h4>
                <Icon name="ExternalLink" size={16} className="text-muted-foreground flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded text-xs">
                  {article?.category}
                </span>
                <span>{article?.views} {language === 'en' ? 'views' : 'tontonan'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSearch;