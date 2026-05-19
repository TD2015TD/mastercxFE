import { useEffect } from 'react';
import Routes from './Routes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ASSIGN_KEY = 'cx_assign_pending';

interface AssignPending { interactionId: string; apiBaseUrl: string; }

function showAssignToast(data: AssignPending) {
  const openPopup = () => {
    const base = data.apiBaseUrl.replace(/\/api(\/v\d+)?$/, '');
    const url = `${base}/widget/agent.html?mode=assign&interactionId=${encodeURIComponent(data.interactionId)}&apiBaseUrl=${encodeURIComponent(data.apiBaseUrl)}`;
    window.open(url, 'cx_assign_ticket', 'popup=yes,width=480,height=440,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no');
    localStorage.removeItem(ASSIGN_KEY);
    toast.dismiss('assign-ticket');
  };

  toast(
    <div>
      <div style={{ fontWeight: 600, marginBottom: 5 }}>🎫 Sesi sembang berakhir</div>
      <div style={{ fontSize: 13, color: '#374151', marginBottom: 10 }}>Tetapkan tiket kepada akaun anda?</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={openPopup}
          style={{ padding: '6px 14px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          Tetapkan Tiket
        </button>
        <button
          onClick={() => { localStorage.removeItem(ASSIGN_KEY); toast.dismiss('assign-ticket'); }}
          style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#6b7280' }}
        >
          Langkau
        </button>
      </div>
    </div>,
    { toastId: 'assign-ticket', autoClose: false, closeOnClick: false, closeButton: false, draggable: false }
  );
}

function App() {
  useEffect(() => {
    // Show notification if there's a pending assignment from before page load
    const existing = localStorage.getItem(ASSIGN_KEY);
    if (existing) {
      try { showAssignToast(JSON.parse(existing)); } catch {}
    }

    // Listen for the iframe writing cx_assign_pending (fires in other same-origin tabs/windows)
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== ASSIGN_KEY || !e.newValue) return;
      try { showAssignToast(JSON.parse(e.newValue)); } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      <Routes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={true}
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

