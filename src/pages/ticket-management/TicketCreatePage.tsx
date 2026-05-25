import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TicketCreateForm from './components/TicketCreateForm';

const TicketCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showScriptTab, setShowScriptTab] = useState(false);

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
      <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
        {/* Always Visible Button */}
        <button
          type="button"
          onClick={() => setShowScriptTab((prev) => !prev)}
          className="absolute right-0 top-1/2 z-[60] -translate-y-1/2 rounded-l-lg bg-blue-600 px-3 py-4 text-xs font-semibold text-white shadow-lg hover:bg-blue-700"
          style={{ writingMode: 'vertical-rl' }}
        >
          {showScriptTab ? 'Hide Script' : 'Show Script'}
        </button>

        {/* Sliding Panel */}
        <div
          className={`w-[520px] rounded-l-xl border border-gray-200 bg-white pr-10 shadow-xl transition-transform duration-300 ${
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
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Skrip {channelLabels[selectedChannel]}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Gunakan skrip ini sebagai panduan semasa melayan pelanggan.
                  </p>
                </div>

                {/* <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {callScripts[selectedChannel]?.length || 0} Cards
                </span> */}
              </div>

              <div className="space-y-4">
                {(callScripts[selectedChannel] || callScripts.phone).map(
                  (script, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {scriptTitles[selectedChannel]?.[index] || `Skrip ${index + 1}`}
                          </h4>
                          {/* <p className="text-xs text-gray-500">
                            Skrip layanan pelanggan
                          </p> */}
                        </div>
                      </div>

                      <div className="px-4 py-4">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {script}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
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