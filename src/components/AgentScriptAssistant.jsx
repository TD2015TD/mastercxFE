import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';

const AgentScriptAssistant = forwardRef(({
  currentTicket = null,
  currentChannel = null,
  onInsertScript = null,
  hideTrigger = false,
  className = ""
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentChannel || 'call');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [autoSuggestMode, setAutoSuggestMode] = useState(true);
  const panelRef = useRef(null);

  // Mock script data categorized by type
  const mockScripts = {
    call: [
      {
        id: 1,
        title: 'Greeting Script',
        content: 'Hi, this is Ahmad from JKDM Contact Centre. May I have your name and ID number, please?',
        tags: ['greeting', 'opening', 'identification'],
        category: 'General',
        favorites: 45
      },
      {
        id: 2,
        title: 'Complaint Script',
        content: 'Thank you for your report. Can you please provide the reference number for verification? I will investigate this matter immediately.',
        tags: ['complaint', 'reference', 'investigation'],
        category: 'Complaints',
        favorites: 32
      },
      {
        id: 3,
        title: 'Import Declaration Script',
        content: 'Regarding your import declaration issue, I can see that container MSKU123456 is pending. Let me check the HS code validation for you.',
        tags: ['import', 'declaration', 'container', 'hs code'],
        category: 'Import Declaration',
        favorites: 28
      },
      {
        id: 4,
        title: 'GST Calculation Script',
        content: 'For GST calculations, the standard rate is 6%. Based on your declared value of RM 45,000, the GST amount would be RM 2,700.',
        tags: ['gst', 'calculation', 'tax', 'rate'],
        category: 'Tax & Duties',
        favorites: 21
      },
      {
        id: 5,
        title: 'Follow-up Script',
        content: 'I\'m following up on your case regarding your import declaration. Have you received our update? Is there anything else I can assist you with?',
        tags: ['follow-up', 'update', 'assistance'],
        category: 'Follow-up',
        favorites: 18
      },
      {
        id: 6,
        title: 'Hold Script',
        content: 'I need to place you on a brief hold while I check with my supervisor regarding this matter. This will take approximately 2-3 minutes.',
        tags: ['hold', 'supervisor', 'escalation'],
        category: 'Call Management',
        favorites: 15
      }
    ],
    chat: [
      {
        id: 7,
        title: 'Live Chat Opening',
        content: 'Hello! Welcome to JKDM Customer Support. How may I assist you today?',
        tags: ['greeting', 'opening', 'chat'],
        category: 'General',
        favorites: 52
      },
      {
        id: 8,
        title: 'Chat Acknowledgment',
        content: 'I understand your concern. Let me check that for you right away. Please give me a moment.',
        tags: ['acknowledgment', 'checking', 'patience'],
        category: 'General',
        favorites: 38
      },
      {
        id: 9,
        title: 'Documentation Request',
        content: 'Could you please upload a copy of your commercial invoice and packing list? You can drag and drop the files here.',
        tags: ['documentation', 'upload', 'files'],
        category: 'Documentation',
        favorites: 29
      },
      {
        id: 10,
        title: 'Chat Closing',
        content: 'Is there anything else I can help you with today? If not, please feel free to contact us again if you need further assistance.',
        tags: ['closing', 'assistance', 'contact'],
        category: 'General',
        favorites: 41
      },
      {
        id: 11,
        title: 'Technical Issue Chat',
        content: 'I see you\'re experiencing a technical issue. I\'ve escalated this to our IT team. You should receive an update within 30 minutes.',
        tags: ['technical', 'escalation', 'timeline'],
        category: 'Technical Support',
        favorites: 25
      }
    ],
    email: [
      {
        id: 101,
        title: 'Default Template General (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nReferring to your inquiry, \n\n\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['general', 'greeting', 'opening', 'bi'],
        category: 'General',
        favorites: 0
      },
      {
        id: 102,
        title: 'Default Template General (BM)',
        content: 'Kepada pelanggan yang dihormati,\n\nTerima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.\n\nMerujuk kepada pertanyaan tuan/puan,\n\n\n\n\nSekian, terima kasih.\n\nPusat Panggilan Kastam\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nLaman Web: Jabatan Kastam Diraja Malaysia\n\nPenafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.\n\n---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----',
        tags: ['general', 'greeting', 'opening', 'bm'],
        category: 'General',
        favorites: 0
      },
      {
        id: 103,
        title: 'Default Template Amend SST Registration Details (BM)',
        content: 'Kepada pelanggan yang dihormati,\n\nTerima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.\n\nMerujuk kepada pertanyaan tuan/puan, adalah dimaklumkan bahawa sistem MySST tidak membenarkan mengemas kini dalam talian bagi butiran berikut :-\nE-mel & Kata Laluan\nNama & Jenis Perniagaan\nAlamat & Nombor Telefon Syarikat\nNama Pengarah\nTahun Kewangan Berakhir (Financial Year End)\nBagi membuat sebarang pindaan di atas, pihak syarikat perlu mengemukakan permohonan bertulis. Permohonan tersebut mesti diserahkan secara manual (serahan tangan) ke kaunter stesen kawalan di pejabat [ nama stesen pengawal ].\n\n[ nama & alamat stesen pengawal ]\n\nSila sediakan dokumen-dokumen berikut untuk tindakan pegawai :\nSurat Permohonan Rasmi\nDokumen SSM / Dokumen Sokongan (yang menyatakan nama syarikat semasa)\nBorang pindaan maklumat SST seperti dilampirkan\n\n**Sekiranya individu yang menyerahkan permohonan tersebut bukanlah salah seorang Pengarah yang berdaftar dalam MySST, beliau wajib membawa Surat Perwakilan Kuasa.\n**Surat ini diperlukan sebagai bukti bahawa wakil tersebut telah diberi kebenaran untuk bertindak bagi pihak syarikat\n\nDilampirkan Borang Pindaan Maklumat SST untuk tindakan pihak tuan/puan selanjutnya.\n\nSekian, terima kasih.\n\nPusat Panggilan Kastam\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nLaman Web: Jabatan Kastam Diraja Malaysia\n\nPenafian: Sila ambil maklum, segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.\n\n---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----',
        tags: ['sst', 'registration', 'amend', 'bm'],
        category: 'SST',
        favorites: 0
      },
      {
        id: 104,
        title: 'Default Template Apply HS Code (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nReferring to your inquiry, please be advised to refer to the Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik, Jabatan Kastam Diraja Malaysia at the nearest location.\n\nThe classification of goods can be done precisely at Customs by completing the required form and attaching supporting documents for assessment by a Customs Officer.\n\nCLASSIFICATION ADVISORY SERVICES AND HS CODE APPLICATION\n\nAdvisory services are available at any Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik, Jabatan Kastam Diraja Malaysia in each state.\n\nThis application must be hand-delivered to the Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik Counter.\n\nEach application must be accompanied by the following documents/information: -\nOfficial Letter (Request for Nasihat Penjenisan) with the Person In charge Contact Details.\nProduct Sample\nProduct Brochure\nProduct Catalog\nColored Photographs\n**Please refer to the document attached for application purposes.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['hs code', 'classification', 'tariff', 'bi'],
        category: 'HS Code',
        favorites: 0
      },
      {
        id: 105,
        title: 'Default Template Apply HS Code (BM)',
        content: 'Kepada pelanggan yang dihormati,\n\nTerima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.\n\nMerujuk kepada pertanyaan tuan/puan, sila tuan dapatkan HS Code / Kod Tarif yang telah disahkan oleh Pegawai Kastam (Pegawai Klasifikasi di Bahagian Perkhidmatan Teknik, Cawangan Klasifikasi).\nSekiranya tuan/puan telah menerima maklumat HS code / Kod Tarif daripada Pegawai Kastam, sila lawati laman web rasmi, JKDM HS EXPLORER, untuk mendapatkan maklumat berkaitan duti / cukai serta permit yang diperlukan bagi urusan import dan eksport.\n\nSila rujuk langkah-langkah berikut :\n\n1.   Tariff Type : PDK 2022 : Perintah Duti Kastam 2022\n\n2.   Search Criteria: HS CODE\n\n3.   Masukkan 4 digit pertama HS Code / Tariff Code di ruangan KEYWORD dan tekan butang FIND.\n\n4.   Cari HS Code / Tariff Code yang lengkap (Rujuk HS Code / Tariff Code yang diberikan oleh pegawai) dan klik pada Description.\n\n5.   Rujuk kepada Import / Eksport dan Related Prohibition Schedule yang dipaparkan dan sila hubungi agensi berkaitan bagi tujuan Permit Import / Eksport.\n\nSekian, terima kasih.\n\nPusat Panggilan Kastam\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nLaman Web: Jabatan Kastam Diraja Malaysia\n\nPenafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.\n\n---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----',
        tags: ['hs code', 'kod tarif', 'classification', 'bm'],
        category: 'HS Code',
        favorites: 0
      },
      {
        id: 106,
        title: 'Default Template MYCIEDS (BM)',
        content: 'Kepada Pasukan MyCIEDS [ negeri ],\nDimajukan emel pertanyaan daripada pelanggan ini untuk perhatian dan maklum balas pihak tuan/puan selanjutnya.\n\nKepada Pelanggan,\nTerima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.\n\nMerujuk kepada pertanyaan tuan/puan, untuk makluman kelulusan borang Kastam adalah di bawah tanggungjawab pihak MyCIEDS  [ negeri ].\nOleh yang demikian, pihak kami menyarankan agar tuan/puan dapat mengemukakan pertanyaan tersebut secara terus kepada MyCIEDS  [ negeri ] melalui alamat e-mel rasmi mycieds.[negeri]@customs.gov.my untuk tindakan dan maklum balas lanjut supaya tindakan boleh diambil dengan lebih cepat dan pantas.\nWalau bagaimanapun, Pusat Panggilan Kastam masih menerima pertanyaan berkaitan MyCIEDS selain daripada kelulusan borang kastam. Segala kesulitan amat dikesali.\n\nSekian, terima kasih.\n\nPusat Panggilan Kastam\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nLaman Web: Jabatan Kastam Diraja Malaysia\n\nPenafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.\n\n---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan -----',
        tags: ['mycieds', 'bm'],
        category: 'MYCIEDS',
        favorites: 0
      },
      {
        id: 107,
        title: 'Default Template Log In SST (BM)',
        content: 'Kepada pelanggan yang dihormati,\n\nTerima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.\nMerujuk kepada pertanyaan tuan/puan, sila masukkan Nombor Pendaftaran SST dan klik Save sebelum memasukkan ID Pengguna dan Kata Laluan.\n\nTuan/Puan boleh merujuk kepada Surat Kelulusan Pendaftaran yang dihantar oleh pihak Kastam melalui e-mel yang telah didaftarkan, bersama-sama dengan ID Pengguna dan Kata Laluan.\nPada bahagian atas kanan surat tersebut, terdapat No. Daftar CP (Cukai Perkhidmatan) / No. Daftar CJ (Cukai Jualan) yang merupakan Nombor Pendaftaran SST. Sila rujuk gambar seperti di bawah : -\n\nTurut dilampirkan manual Online Payment and Return Submission sebagai rujukan pihak tuan selanjutnya.\nSila rujuk laman web rasmi MySST pada bahagian Panduan Industri  : Versi English and Malay untuk maklumat lanjut berkaitan SST.\n\nSekian, terima kasih.\n\nPusat Panggilan Kastam\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nLaman Web: Jabatan Kastam Diraja Malaysia\n\nPenafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.\n\n---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----',
        tags: ['sst', 'login', 'password', 'bm'],
        category: 'SST',
        favorites: 0
      },
      {
        id: 108,
        title: 'Default Template - Courier (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nKindly contact your appointed courier service provider directly for an update on your parcel\'s status. It is your contracted provider\'s responsibility to ensure the shipment\'s continuity and to advise their customers immediately if any issues occur during transit.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['courier', 'parcel', 'shipment', 'bi'],
        category: 'Courier',
        favorites: 0
      },
      {
        id: 109,
        title: 'Default Template - Taxability of a service (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nTo determine whether a service is taxable, our officer will need to review the service\'s contract. It is essential to understand the service structure and how it is delivered to your client to ensure accuracy and prevent errors caused by overlooking specific details.\n\nIf you require assistance in interpreting your service, you are welcome to visit the Consultation Unit at your nearest Customs station. Our officers are available to review the service details. This service is provided free of charge, and no prior appointment is necessary. You may visit us at any time during official business hours.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['tax', 'service', 'taxability', 'bi'],
        category: 'Tax & Duties',
        favorites: 0
      },
      {
        id: 110,
        title: 'Default Template - Tariff Code (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nRegarding your inquiry, please complete the attached form and submit it in person to the Classification Unit at your nearest Customs station to obtain a formal tariff code confirmation.\n\nKindly ensure all supporting documents required by the form are included. We also recommend sending a representative who is familiar with the technical specifications of the item, as our officers may require further clarification during the submission.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['tariff', 'classification', 'bi'],
        category: 'Tariff',
        favorites: 0
      },
      {
        id: 111,
        title: 'Default Template Application Follow-up (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nPlease note that status updates are unavailable through the Call Centre due to the lack of a centralized online tracing system. Should you have the contact details or the name of the officer in charge of your submission, please provide them so we may redirect your correspondence accordingly.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['follow-up', 'status', 'bi'],
        category: 'Follow-up',
        favorites: 0
      },
      {
        id: 112,
        title: 'Default Template - Technical Question (BI)',
        content: 'Dear Valued Customer,\n\nThank you for using the Customs Call Centre service.\n\nRegarding your inquiry, please be advised that providing technical confirmations is outside the scope of the Customs Call Centre. To obtain formal confirmation, you may email our technical team directly at gerak.dasarcp@customs.gov.my or visit the Consultation Unit at your nearest Customs station. We recommend bringing all relevant documentation to assist our officers in reviewing your case thoroughly.\n\nThank you.\n\nCustoms Call Centre\nTel: 03-78067200\nE-mail: ccc@customs.gov.my\nWebsite: Royal Malaysian Customs Department\n\nDisclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.\n\n---- This is a system-generated e-mail.  Signature is not required  ----',
        tags: ['technical', 'confirmation', 'bi'],
        category: 'Technical',
        favorites: 0
      }
    ]
  };

  // Initialize panel state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('script-assistant-state');
    if (savedState) {
      const { isOpen: savedIsOpen, activeTab: savedTab } = JSON.parse(savedState);
      if (!currentChannel) {
        setActiveTab(savedTab || 'call');
      }
      // Don't restore isOpen state - let user control visibility
    }
  }, []);

  // Save panel state to localStorage
  useEffect(() => {
    localStorage.setItem('script-assistant-state', JSON.stringify({ 
      isOpen, 
      activeTab 
    }));
  }, [isOpen, activeTab]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event?.ctrlKey && event?.shiftKey && event?.key === 'S') {
        event?.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Auto-suggest based on ticket/channel context
  useEffect(() => {
    if (autoSuggestMode && currentTicket && isOpen) {
      // Auto-filter based on ticket category or channel
      if (currentTicket?.category?.includes('Import')) {
        setSearchQuery('import');
      } else if (currentTicket?.category?.includes('GST')) {
        setSearchQuery('gst');
      } else if (currentChannel === 'chat') {
        setActiveTab('chat');
      } else if (currentChannel === 'email') {
        setActiveTab('email');
      }
    }
  }, [autoSuggestMode, currentTicket, currentChannel, isOpen]);

  // Filter scripts based on search query
  const filteredScripts = mockScripts?.[activeTab]?.filter(script => {
    if (!searchQuery) return true;
    
    const query = searchQuery?.toLowerCase();
    return (script?.title?.toLowerCase()?.includes(query) ||
    script?.content?.toLowerCase()?.includes(query) ||
    script?.tags?.some(tag => tag?.toLowerCase()?.includes(query)) || script?.category?.toLowerCase()?.includes(query));
  }) || [];

  const handleCopyScript = async (script) => {
    try {
      await navigator.clipboard?.writeText(script?.content);
      setCopiedId(script?.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleInsertScript = (script) => {
    if (onInsertScript && typeof onInsertScript === 'function') {
      onInsertScript(script?.content);
    }
    // Keep panel open for multiple insertions
  };

  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: togglePanel,
  }));

  return (
    <>
      {/* Floating Action Button */}
      {!hideTrigger && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <Button
            onClick={togglePanel}
            size="lg"
            className={`rounded-full shadow-lg transition-all duration-300 ${
              isOpen
                ? 'bg-primary/90 hover:bg-primary scale-110' :'bg-primary hover:bg-primary/90'
            }`}
            title="Script Assistant (Ctrl+Shift+S)"
          >
            <div className="flex items-center gap-2">
              <Icon name="MessageSquare" size={20} />
              <span className="hidden sm:inline text-sm font-medium">Scripts</span>
            </div>
          </Button>
        </div>
      )}
      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div 
            ref={panelRef}
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            } lg:max-w-lg`}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={20} className="text-primary" />
                <h3 className="font-semibold text-foreground">Script Assistant</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Auto-suggest toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoSuggestMode(!autoSuggestMode)}
                  className={`text-xs ${autoSuggestMode ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  Auto
                </Button>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search scripts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-muted/20">
              {[
                { id: 'call', label: 'Call Scripts', icon: 'Phone' },
                { id: 'chat', label: 'Chat Scripts', icon: 'MessageCircle' },
                { id: 'email', label: 'Email', icon: 'Mail' }
              ]?.filter((tab) => !currentChannel || tab?.id === currentChannel)?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="hidden sm:inline">{tab?.label}</span>
                </button>
              ))}
            </div>

            {/* Scripts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredScripts?.length > 0 ? (
                <div className="p-3 grid grid-cols-2 gap-2">
                  {filteredScripts?.map((script) => (
                    <div
                      key={script?.id}
                      className="p-4 bg-background border border-border rounded-lg hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-xs leading-snug line-clamp-2">
                            {script?.title}
                          </h4>
                          {/*<div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                              {script?.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon name="Heart" size={12} />
                              {script?.favorites}
                            </div>
                          </div>*/}
                        </div>
                      </div>
                      
                      {/*<p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {script?.content}
                      </p>*/}
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyScript(script)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Icon 
                            name={copiedId === script?.id ? "Check" : "Copy"} 
                            size={12} 
                          />
                          {copiedId === script?.id ? 'Copied!' : 'Copy'}
                        </Button>
                        
                        {onInsertScript && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleInsertScript(script)}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Icon name="Plus" size={12} />
                            Insert
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <Icon name="Search" size={48} className="text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Scripts Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ctrl + Shift + S to toggle</span>
                <span>{filteredScripts?.length} scripts</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default AgentScriptAssistant;