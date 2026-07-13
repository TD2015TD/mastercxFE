import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TicketCreateForm from './components/TicketCreateForm';

interface EmailTemplate {
  id: number;
  title: string;
  lang: 'BI' | 'BM';
  content: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 1,
    title: 'General',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Referring to your inquiry,




Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 2,
    title: 'General',
    lang: 'BM',
    content: `Kepada pelanggan yang dihormati,

Terima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.

Merujuk kepada pertanyaan tuan/puan,




Sekian, terima kasih.

Pusat Panggilan Kastam
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Laman Web: Jabatan Kastam Diraja Malaysia

Penafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.

---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----`,
  },
  {
    id: 3,
    title: 'Amend SST Registration Details',
    lang: 'BM',
    content: `Kepada pelanggan yang dihormati,

Terima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.

Merujuk kepada pertanyaan tuan/puan, adalah dimaklumkan bahawa sistem MySST tidak membenarkan mengemas kini dalam talian bagi butiran berikut :-
- E-mel & Kata Laluan
- Nama & Jenis Perniagaan
- Alamat & Nombor Telefon Syarikat
- Nama Pengarah
- Tahun Kewangan Berakhir (Financial Year End)

Bagi membuat sebarang pindaan di atas, pihak syarikat perlu mengemukakan permohonan bertulis. Permohonan tersebut mesti diserahkan secara manual (serahan tangan) ke kaunter stesen kawalan di pejabat [ nama stesen pengawal ].

[ nama & alamat stesen pengawal ]

Sila sediakan dokumen-dokumen berikut untuk tindakan pegawai :
- Surat Permohonan Rasmi
- Dokumen SSM / Dokumen Sokongan (yang menyatakan nama syarikat semasa)
- Borang pindaan maklumat SST seperti dilampirkan

**Sekiranya individu yang menyerahkan permohonan tersebut bukanlah salah seorang Pengarah yang berdaftar dalam MySST, beliau wajib membawa Surat Perwakilan Kuasa.
**Surat ini diperlukan sebagai bukti bahawa wakil tersebut telah diberi kebenaran untuk bertindak bagi pihak syarikat.

Dilampirkan Borang Pindaan Maklumat SST untuk tindakan pihak tuan/puan selanjutnya.

Sekian, terima kasih.

Pusat Panggilan Kastam
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Laman Web: Jabatan Kastam Diraja Malaysia

Penafian: Sila ambil maklum, segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.

---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----`,
  },
  {
    id: 4,
    title: 'Apply HS Code',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Referring to your inquiry, please be advised to refer to the Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik, Jabatan Kastam Diraja Malaysia at the nearest location.

The classification of goods can be done precisely at Customs by completing the required form and attaching supporting documents for assessment by a Customs Officer.

CLASSIFICATION ADVISORY SERVICES AND HS CODE APPLICATION

Advisory services are available at any Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik, Jabatan Kastam Diraja Malaysia in each state.

This application must be hand-delivered to the Cawangan Klasifikasi, Bahagian Perkhidmatan Teknik Counter.

Each application must be accompanied by the following documents/information:
- Official Letter (Request for Nasihat Penjenisan) with the Person In charge Contact Details.
- Product Sample
- Product Brochure
- Product Catalog
- Colored Photographs

**Please refer to the document attached for application purposes.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 5,
    title: 'Apply HS Code',
    lang: 'BM',
    content: `Kepada pelanggan yang dihormati,

Terima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.

Merujuk kepada pertanyaan tuan/puan, sila tuan dapatkan HS Code / Kod Tarif yang telah disahkan oleh Pegawai Kastam (Pegawai Klasifikasi di Bahagian Perkhidmatan Teknik, Cawangan Klasifikasi).

Sekiranya tuan/puan telah menerima maklumat HS code / Kod Tarif daripada Pegawai Kastam, sila lawati laman web rasmi, JKDM HS EXPLORER, untuk mendapatkan maklumat berkaitan duti / cukai serta permit yang diperlukan bagi urusan import dan eksport.

Sila rujuk langkah-langkah berikut :

1. Tariff Type : PDK 2022 : Perintah Duti Kastam 2022
2. Search Criteria: HS CODE
3. Masukkan 4 digit pertama HS Code / Tariff Code di ruangan KEYWORD dan tekan butang FIND.
4. Cari HS Code / Tariff Code yang lengkap (Rujuk HS Code / Tariff Code yang diberikan oleh pegawai) dan klik pada Description.
5. Rujuk kepada Import / Eksport dan Related Prohibition Schedule yang dipaparkan dan sila hubungi agensi berkaitan bagi tujuan Permit Import / Eksport.

Sekian, terima kasih.

Pusat Panggilan Kastam
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Laman Web: Jabatan Kastam Diraja Malaysia

Penafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.

---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----`,
  },
  {
    id: 6,
    title: 'MyCIEDS',
    lang: 'BM',
    content: `Kepada Pasukan MyCIEDS [ negeri ],
Dimajukan emel pertanyaan daripada pelanggan ini untuk perhatian dan maklum balas pihak tuan/puan selanjutnya.

Kepada Pelanggan,
Terima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.

Merujuk kepada pertanyaan tuan/puan, untuk makluman kelulusan borang Kastam adalah di bawah tanggungjawab pihak MyCIEDS [ negeri ].
Oleh yang demikian, pihak kami menyarankan agar tuan/puan dapat mengemukakan pertanyaan tersebut secara terus kepada MyCIEDS [ negeri ] melalui alamat e-mel rasmi mycieds.[negeri]@customs.gov.my untuk tindakan dan maklum balas lanjut supaya tindakan boleh diambil dengan lebih cepat dan pantas.

Walau bagaimanapun, Pusat Panggilan Kastam masih menerima pertanyaan berkaitan MyCIEDS selain daripada kelulusan borang kastam. Segala kesulitan amat dikesali.

Sekian, terima kasih.

Pusat Panggilan Kastam
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Laman Web: Jabatan Kastam Diraja Malaysia

Penafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.

---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan -----`,
  },
  {
    id: 7,
    title: 'Log In SST',
    lang: 'BM',
    content: `Kepada pelanggan yang dihormati,

Terima kasih kerana menggunakan perkhidmatan Pusat Panggilan Kastam.

Merujuk kepada pertanyaan tuan/puan, sila masukkan Nombor Pendaftaran SST dan klik Save sebelum memasukkan ID Pengguna dan Kata Laluan.

Tuan/Puan boleh merujuk kepada Surat Kelulusan Pendaftaran yang dihantar oleh pihak Kastam melalui e-mel yang telah didaftarkan, bersama-sama dengan ID Pengguna dan Kata Laluan.
Pada bahagian atas kanan surat tersebut, terdapat No. Daftar CP (Cukai Perkhidmatan) / No. Daftar CJ (Cukai Jualan) yang merupakan Nombor Pendaftaran SST.

Turut dilampirkan manual Online Payment and Return Submission sebagai rujukan pihak tuan selanjutnya.

Sila rujuk laman web rasmi MySST pada bahagian Panduan Industri : Versi English and Malay untuk maklumat lanjut berkaitan SST.

Sekian, terima kasih.

Pusat Panggilan Kastam
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Laman Web: Jabatan Kastam Diraja Malaysia

Penafian: Sila ambil maklum bahawa segala usaha telah dibuat untuk memastikan maklumat ini adalah selaras dengan peruntukan perundangan, polisi dan prosedur sedia ada. Sekiranya terdapat apa-apa perubahan perundangan, polisi dan prosedur, JKDM berhak untuk meminda atau menarik balik maklumat ini pada bila-bila masa tanpa sebarang notis.

---- E-mel ini dijana oleh sistem. Tandatangan tidak diperlukan ----`,
  },
  {
    id: 8,
    title: 'Courier',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Kindly contact your appointed courier service provider directly for an update on your parcel's status. It is your contracted provider's responsibility to ensure the shipment's continuity and to advise their customers immediately if any issues occur during transit.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 9,
    title: 'Taxability of a Service',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

To determine whether a service is taxable, our officer will need to review the service's contract. It is essential to understand the service structure and how it is delivered to your client to ensure accuracy and prevent errors caused by overlooking specific details.

If you require assistance in interpreting your service, you are welcome to visit the Consultation Unit at your nearest Customs station. Our officers are available to review the service details. This service is provided free of charge, and no prior appointment is necessary. You may visit us at any time during official business hours.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 10,
    title: 'Tariff Code',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Regarding your inquiry, please complete the attached form and submit it in person to the Classification Unit at your nearest Customs station to obtain a formal tariff code confirmation.

Kindly ensure all supporting documents required by the form are included. We also recommend sending a representative who is familiar with the technical specifications of the item, as our officers may require further clarification during the submission.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 11,
    title: 'Application Follow-up',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Please note that status updates are unavailable through the Call Centre due to the lack of a centralized online tracing system. Should you have the contact details or the name of the officer in charge of your submission, please provide them so we may redirect your correspondence accordingly.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
  {
    id: 12,
    title: 'Technical Question',
    lang: 'BI',
    content: `Dear Valued Customer,

Thank you for using the Customs Call Centre service.

Regarding your inquiry, please be advised that providing technical confirmations is outside the scope of the Customs Call Centre. To obtain formal confirmation, you may email our technical team directly at gerak.dasarcp@customs.gov.my or visit the Consultation Unit at your nearest Customs station. We recommend bringing all relevant documentation to assist our officers in reviewing your case thoroughly.

Thank you.

Customs Call Centre
Tel: 03-78067200
E-mail: ccc@customs.gov.my
Website: Royal Malaysian Customs Department

Disclaimer: Please be advised that all efforts have been made to ensure that this information is in line with existing legislation, policies, and procedures. In the event of any legal, policy, or procedure changes, RMCD reserves the right to amend or withdraw this information at any time without prior notice.

---- This is a system-generated e-mail.  Signature is not required  ----`,
  },
];

const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showScriptTab, setShowScriptTab] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);

  const handleCopyEmail = async (template: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedEmailId(template.id);
      setTimeout(() => setCopiedEmailId(null), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  // Extract query parameters that can be passed from MiTel
  const callId = searchParams.get('call_id') || searchParams.get('callId');

  // MiCC sends CaseID exact case, also support legacy variants
  const caseId =
    searchParams.get('CaseID') ||
    searchParams.get('case_id') ||
    searchParams.get('caseId') ||
    searchParams.get('ID_Number');

  const phoneNumber = searchParams.get('Phone_Number');

  const initialChannel = searchParams.get('channel') || 'phone';
  const [selectedChannel, setSelectedChannel] = useState(initialChannel);

  const channelLabels: Record<string, string> = {
    phone: 'Phone',
    email: 'Email',
    livechat: 'Live Chat',
  };

  const callScripts: Record<string, string[]> = {
    phone: [
      'Selamat pagi / petang. Terima kasih kerana menghubungi Jabatan Kastam Diraja Malaysia. Nama saya [Nama Agent]. Bagaimana saya boleh bantu tuan / puan hari ini?',
      'Baik tuan / puan. Untuk tujuan rekod, boleh saya dapatkan maklumat berikut: nama penuh, nombor telefon, emel, nama syarikat / individu, nombor kad pengenalan / pasport / nombor syarikat, dan nombor rujukan jika ada?',
      'Boleh saya tahu pertanyaan atau isu tuan / puan berkaitan perkara berikut: import, eksport, cukai, duti, bayaran, pendaftaran, atau lain-lain?',
      'Baik, boleh tuan / puan terangkan isu atau pertanyaan tersebut dengan lebih lanjut?',
      'Saya ulang semula untuk pengesahan. Isu tuan / puan adalah berkaitan [ringkasan isu]. Betul ya?',
      'Baik, saya akan wujudkan satu tiket laporan untuk semakan dan tindakan lanjut pihak Jabatan Kastam Diraja Malaysia.',
      'Tiket tuan / puan telah berjaya diwujudkan. Nombor rujukan tiket ialah [Nombor Tiket].',
      'Sila simpan nombor rujukan ini untuk semakan status atau rujukan pada masa akan datang.',
      'Ada apa-apa lagi yang boleh saya bantu?',
      'Terima kasih kerana menghubungi Jabatan Kastam Diraja Malaysia. Selamat hari.',
    ],

    email: [
      'Tuan / Puan yang dihormati,',
      'Terima kasih kerana menghubungi Jabatan Kastam Diraja Malaysia.',
      'Kami telah menerima emel tuan / puan berkaitan [ringkasan isu].',
      'Untuk makluman, pihak kami akan membuat semakan berdasarkan maklumat yang telah diberikan.',
      'Satu tiket laporan telah diwujudkan untuk rujukan dan pemantauan tindakan lanjut.',
      'Nombor rujukan tiket tuan / puan ialah [Nombor Tiket].',
      'Sekiranya terdapat maklumat tambahan, tuan / puan boleh membalas emel ini dengan menyertakan nombor rujukan tiket tersebut.',
      'Terima kasih atas kerjasama tuan / puan.',
      'Sekian, terima kasih.',
      'Yang benar, [Nama Agent], Jabatan Kastam Diraja Malaysia',
    ],

    livechat: [
      'Selamat pagi / petang. Terima kasih kerana menghubungi Jabatan Kastam Diraja Malaysia melalui Live Chat. Nama saya [Nama Agent]. Bagaimana saya boleh bantu tuan / puan hari ini?',
      'Baik, boleh tuan / puan terangkan isu atau pertanyaan berkaitan Kastam yang ingin dilaporkan?',
      'Saya ulang semula untuk pengesahan. Isu tuan / puan adalah berkaitan [ringkasan isu]. Betul ya?',
      'Baik, saya akan wujudkan satu tiket laporan untuk semakan dan tindakan lanjut pihak Jabatan Kastam Diraja Malaysia.',
      'Nombor rujukan tiket tuan / puan ialah [Nombor Tiket].',
      'Sila simpan nombor rujukan ini untuk semakan status atau rujukan pada masa akan datang.',
      'Terima kasih kerana menggunakan perkhidmatan Live Chat Jabatan Kastam Diraja Malaysia.',
    ],
  };

  const scriptTitles: Record<string, string[]> = {
  phone: [
    'Pembukaan',
    'Maklumat Pelanggan',
    'Jenis Pertanyaan',
    'Penerangan Isu',
    'Pengesahan Ringkasan',
    'Cipta Tiket',
    'Maklum Nombor Tiket',
    'Peringatan Rujukan',
    'Bantuan Tambahan',
    'Penutup',
  ],

  email: [
    'Salam Pembuka',
    'Ucapan Terima Kasih',
    'Pengesahan Emel Diterima',
    'Makluman Semakan',
    'Cipta Tiket',
    'Maklum Nombor Tiket',
    'Maklumat Tambahan',
    'Penghargaan',
    'Penutup',
    'Tandatangan',
    'Nama Agent',
    'Organisasi',
  ],

  livechat: [
    'Pembukaan Live Chat',
    'Penerangan Isu',
    'Pengesahan Ringkasan',
    'Cipta Tiket',
    'Maklum Nombor Tiket',
    'Peringatan Rujukan',
    'Penutup Live Chat',
  ],
};

  const queryParams = {
    customerId: searchParams.get('customer_id') || searchParams.get('customerId'),
    customerName: searchParams.get('customer_name') || searchParams.get('customerName'),
    customerPhone:
      phoneNumber ||
      searchParams.get('customer_phone') ||
      searchParams.get('customerPhone') ||
      callId,
    customerEmail:
      searchParams.get('customer_email') || searchParams.get('customerEmail'),
    channel: selectedChannel,
    callId: callId,
    caseId: caseId,
    conversationId:
      searchParams.get('conversation_id') || searchParams.get('conversationId'),
    agentId: searchParams.get('agent_id') || searchParams.get('agentId'),
    queueId: searchParams.get('queue_id') || searchParams.get('queueId'),
    subject: searchParams.get('subject'),
    priority: searchParams.get('priority'),
    category: searchParams.get('category'),
  };

  const handleTicketCreated = (ticketId: number) => {
    navigate(`/ticket-management/${ticketId}`);
  };

  const handleCancel = () => {
    navigate('/ticket-management');
  };

  return (
    <>
      <Helmet>
        <title>Create New Ticket - CRM</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Ticket Management
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">
                Create New Ticket
              </h1>

              {queryParams.callId && (
                <p className="mt-1 text-sm text-gray-600">
                  Call ID: {queryParams.callId}
                </p>
              )}

              {queryParams.caseId && (
                <p className="mt-1 text-sm text-gray-600">
                  Case ID: {queryParams.caseId}
                </p>
              )}

              <p className="mt-1 text-sm text-gray-600">
                Channel: {channelLabels[selectedChannel] || selectedChannel}
              </p>
            </div>

            <div className="p-6">
              <TicketCreateForm
                onSuccess={handleTicketCreated}
                onCancel={handleCancel}
                initialData={queryParams}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Script Tab */}
      <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2 pointer-events-none">
        {/* Always Visible Button */}
        <button
          type="button"
          onClick={() => setShowScriptTab((prev) => !prev)}
          className="pointer-events-auto absolute right-0 top-1/2 z-[60] -translate-y-1/2 rounded-l-lg bg-blue-600 px-3 py-4 text-xs font-semibold text-white shadow-lg hover:bg-blue-700"
          style={{ writingMode: 'vertical-rl' }}
        >
          {showScriptTab ? 'Hide Script' : 'Show Script'}
        </button>

        {/* Sliding Panel */}
        <div
          className={`pointer-events-auto w-[520px] rounded-l-xl border border-gray-200 bg-white pr-10 shadow-xl transition-transform duration-300 ${
            showScriptTab ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Skrip Perkhidmatan JKDM
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Pilih saluran tiket untuk melihat skrip layanan pelanggan.
            </p>
          </div>

          <div className="max-h-[75vh] overflow-y-auto p-5">
            {/* Channel Selector */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ticket Channel
              </p>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(channelLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedChannel(key)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedChannel === key
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Card Section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Skrip {channelLabels[selectedChannel]}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Gunakan skrip ini sebagai panduan semasa melayan pelanggan.
                </p>
              </div>

              {selectedChannel === 'email' ? (
                /* Email: template cards */
                <div className="space-y-3">
                  {EMAIL_TEMPLATES.map((tpl) => (
                    <div key={tpl.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{tpl.title}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tpl.lang === 'BI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {tpl.lang}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(tpl)}
                          className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {copiedEmailId === tpl.id ? (
                            <>
                              <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="px-4 py-3">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700 font-sans">{tpl.content}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Phone / Live Chat: numbered step cards */
                <div className="space-y-4">
                  {(callScripts[selectedChannel] || callScripts.phone).map((script, index) => (
                    <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {index + 1}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {scriptTitles[selectedChannel]?.[index] || `Skrip ${index + 1}`}
                        </h4>
                      </div>
                      <div className="px-4 py-4">
                        <p className="text-sm leading-relaxed text-gray-700">{script}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-md bg-yellow-50 p-3 text-xs leading-relaxed text-yellow-800">
              Skrip ini adalah untuk panduan agent. Sila
              selaraskan kandungan mengikut SOP sebenar Jabatan Kastam Diraja
              Malaysia sebelum digunakan dalam production.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketCreatePage;