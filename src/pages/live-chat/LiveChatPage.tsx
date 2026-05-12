import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { knowledgeBaseService, KnowledgeBaseArticle } from '../../services/knowledgeBaseService';
import { ticketService } from '../../services/ticketService';
import { ChatWidget } from '../../components/ChatWidget/ChatWidget';
import api from '../../services/api';
import Icon from '../../components/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerContext {
  name: string;
  ic: string;
  topic: string;
  faqPath: string;
}

interface TicketForm {
  name: string;
  ic: string;
  topic: string;
  category: string;
  faqPath: string;
  resolution: string;
}

const AI_CHAT_WIDGET_URL = import.meta.env.VITE_AI_CHAT_WIDGET_URL || 'https://chat.telediant.com.my/customer.html';
const AI_CHAT_WS_URL = import.meta.env.VITE_AI_CHAT_SERVICE_URL || 'wss://chat.telediant.com.my';

// ─── Component ────────────────────────────────────────────────────────────────

const LiveChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const resolutionRef = useRef<HTMLTextAreaElement>(null);

  // conversationId = Mitel interaction ID = sessionId for ai-chat-service
  const conversationId = searchParams.get('conversationId') || '';

  // Context pre-filled from URL params (set by ConversationNotification or SignalR event)
  const [ctx, setCtx] = useState<CustomerContext>({
    name:    searchParams.get('name')    || '',
    ic:      searchParams.get('ic')      || '',
    topic:   searchParams.get('topic')   || '',
    faqPath: searchParams.get('faqPath') || '',
  });

  const [chatEnded, setChatEnded] = useState(false);

  // KBase panel
  const [kbaseSearch, setKbaseSearch] = useState('');
  const [kbaseResults, setKbaseResults] = useState<KnowledgeBaseArticle[]>([]);
  const [kbaseLoading, setKbaseLoading] = useState(false);
  const [dropFeedback, setDropFeedback] = useState<string | null>(null);
  const [dragOverChat, setDragOverChat] = useState(false);

  // Ticket form
  const [ticket, setTicket] = useState<TicketForm>({
    name:       ctx.name,
    ic:         ctx.ic,
    topic:      ctx.topic,
    category:   '',
    faqPath:    ctx.faqPath,
    resolution: '',
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Sync ctx → ticket when ctx changes
  useEffect(() => {
    setTicket(t => ({ ...t, name: ctx.name, ic: ctx.ic, topic: ctx.topic, faqPath: ctx.faqPath }));
  }, [ctx]);

  // Focus resolution field when chat ends
  useEffect(() => {
    if (chatEnded) resolutionRef.current?.focus();
  }, [chatEnded]);

  // ─── KBase search ──────────────────────────────────────────────────────────
  const searchKbase = useCallback(async (query: string) => {
    if (!query.trim()) { setKbaseResults([]); return; }
    setKbaseLoading(true);
    try {
      const res = await knowledgeBaseService.getArticles({ search: query, per_page: 8 });
      setKbaseResults(res.data?.articles || res.data || []);
    } catch { /* silent */ } finally {
      setKbaseLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => searchKbase(kbaseSearch), 400);
    return () => clearTimeout(id);
  }, [kbaseSearch, searchKbase]);

  // Auto-load results matching the customer's topic on mount
  useEffect(() => {
    if (ctx.topic) setKbaseSearch(ctx.topic);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Drag-and-drop KBase doc → send to customer ───────────────────────────
  const handleDocDragStart = (e: React.DragEvent, article: KnowledgeBaseArticle) => {
    e.dataTransfer.setData('articleId', String(article.id));
    e.dataTransfer.setData('articleTitle', article.title);
  };

  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverChat(true);
  };

  const handleChatDragLeave = () => setDragOverChat(false);

  const handleChatDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverChat(false);
    const articleId = e.dataTransfer.getData('articleId');
    const articleTitle = e.dataTransfer.getData('articleTitle');
    if (!articleId) return;

    try {
      await api.post('/kbase/share', {
        article_id: articleId,
        interaction_id: conversationId,
      });
      setDropFeedback(`Sent: ${articleTitle}`);
    } catch {
      setDropFeedback('Failed to send document');
    }
    setTimeout(() => setDropFeedback(null), 3000);
  };

  // ─── Ticket submission ─────────────────────────────────────────────────────
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.resolution.trim()) { setTicketError('Resolution notes required'); return; }
    setTicketSubmitting(true);
    setTicketError(null);
    try {
      await ticketService.createTicket({
        subject: ticket.topic || 'Chat Interaction',
        description: ticket.faqPath,
        resolution_notes: ticket.resolution,
        channel: 'chat',
        conversation_id: conversationId,
        custom_fields: { name: ticket.name, ic: ticket.ic, category: ticket.category },
      } as Partial<Parameters<typeof ticketService.createTicket>[0]>);
      setTicketSubmitted(true);
    } catch {
      setTicketError('Failed to submit ticket. Please try again.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  // ─── Customer iframe URL ───────────────────────────────────────────────────
  const iframeSrc = conversationId
    ? `${AI_CHAT_WIDGET_URL}?sessionId=${encodeURIComponent(conversationId)}&aiChatServiceUrl=${encodeURIComponent(AI_CHAT_WS_URL)}`
    : '';

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-muted-foreground">
        <div className="text-center">
          <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No active chat session</p>
          <p className="text-sm mt-1">Accept a chat interaction from Mitel to begin.</p>
          <button
            onClick={() => navigate('/agent-dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* ── LEFT COLUMN — Chat ─────────────────────────────────────────────── */}
      <div className="flex flex-col w-1/2 border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-semibold text-sm text-foreground">Live Chat</span>
            <span className="text-xs text-muted-foreground font-mono">{conversationId}</span>
          </div>
          <div className="flex gap-2">
            {!chatEnded && (
              <button
                onClick={() => setChatEnded(true)}
                className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded-md"
              >
                End Chat
              </button>
            )}
            {chatEnded && (
              <span className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                Session Ended
              </span>
            )}
          </div>
        </div>

        {/* Agent chat widget (types in English → customer receives Malay) */}
        <div className="flex-1 relative overflow-hidden">
          <div className="h-full">
            <ChatWidget mitelInteractionId={conversationId} />
          </div>
        </div>

        {/* Customer view (iframe mirror — what the customer sees) */}
        {iframeSrc && (
          <div className="border-t border-border">
            <p className="text-xs text-muted-foreground px-3 py-1 bg-muted">
              Customer view (read-only)
            </p>
            <iframe
              id="chat-widget-frame"
              src={iframeSrc}
              title="Customer Chat View"
              className="w-full h-40 border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        )}

        {/* Drop zone for KBase documents */}
        <div
          onDragOver={handleChatDragOver}
          onDragLeave={handleChatDragLeave}
          onDrop={handleChatDrop}
          className={`px-4 py-3 text-center text-sm border-t border-dashed transition-colors ${
            dragOverChat
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-border text-muted-foreground'
          }`}
        >
          {dropFeedback
            ? <span className="text-green-600 font-medium">{dropFeedback}</span>
            : <span>Drop a KBase document here to send to customer</span>
          }
        </div>
      </div>

      {/* ── RIGHT COLUMN — Context + KBase + Ticket ───────────────────────── */}
      <div className="flex flex-col w-1/2 overflow-y-auto">

        {/* Customer Context Panel */}
        <div className="p-4 border-b border-border bg-card">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3 text-foreground">
            <Icon name="User" size={16} /> Customer Context
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="text-muted-foreground text-xs uppercase tracking-wide">Name</label>
              <input
                value={ctx.name}
                onChange={e => setCtx(c => ({ ...c, name: e.target.value }))}
                className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
                placeholder="—"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs uppercase tracking-wide">IC Number</label>
              <input
                value={ctx.ic}
                onChange={e => setCtx(c => ({ ...c, ic: e.target.value }))}
                className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
                placeholder="—"
              />
            </div>
            <div className="col-span-2">
              <label className="text-muted-foreground text-xs uppercase tracking-wide">Topic</label>
              <input
                value={ctx.topic}
                onChange={e => setCtx(c => ({ ...c, topic: e.target.value }))}
                className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
                placeholder="—"
              />
            </div>
            {ctx.faqPath && (
              <div className="col-span-2">
                <label className="text-muted-foreground text-xs uppercase tracking-wide">FAQ Path</label>
                <div
                  className="mt-1 px-2 py-1 rounded border border-border bg-muted text-xs text-foreground whitespace-pre-wrap max-h-24 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: ctx.faqPath.replace(/\n---\n/g, '<hr/>').replace(/\n/g, '<br/>') }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Base Panel */}
        <div className="p-4 border-b border-border bg-card">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3 text-foreground">
            <Icon name="BookOpen" size={16} /> Knowledge Base
          </h2>
          <input
            type="text"
            value={kbaseSearch}
            onChange={e => setKbaseSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3 py-2 text-sm rounded border border-border bg-background text-foreground mb-3"
          />
          {kbaseLoading && (
            <div className="text-xs text-muted-foreground text-center py-2">Searching...</div>
          )}
          {!kbaseLoading && kbaseResults.length === 0 && kbaseSearch && (
            <div className="text-xs text-muted-foreground text-center py-2">No documents found</div>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {kbaseResults.map(article => (
              <div
                key={article.id}
                draggable
                onDragStart={e => handleDocDragStart(e, article)}
                className="flex items-center justify-between px-3 py-2 rounded border border-border bg-background hover:bg-muted cursor-grab text-sm group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="FileText" size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="truncate text-foreground">{article.title}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  drag to send
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Form */}
        <div className="p-4 flex-1 bg-card">
          <h2 className="font-semibold text-sm flex items-center gap-2 mb-3 text-foreground">
            <Icon name="Ticket" size={16} /> Ticket
            {chatEnded && <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Session Ended</span>}
          </h2>

          {ticketSubmitted ? (
            <div className="text-center py-8">
              <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium text-foreground">Ticket submitted successfully</p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <input
                    value={ticket.name}
                    onChange={e => setTicket(t => ({ ...t, name: e.target.value }))}
                    className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">IC Number</label>
                  <input
                    value={ticket.ic}
                    onChange={e => setTicket(t => ({ ...t, ic: e.target.value }))}
                    className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Topic</label>
                <input
                  value={ticket.topic}
                  onChange={e => setTicket(t => ({ ...t, topic: e.target.value }))}
                  className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Category</label>
                <input
                  value={ticket.category}
                  onChange={e => setTicket(t => ({ ...t, category: e.target.value }))}
                  placeholder="e.g. Permit Inquiry"
                  className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Resolution Notes *</label>
                <textarea
                  ref={resolutionRef}
                  value={ticket.resolution}
                  onChange={e => setTicket(t => ({ ...t, resolution: e.target.value }))}
                  rows={4}
                  placeholder="Describe the resolution..."
                  className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm text-foreground resize-none"
                />
              </div>
              {ticketError && (
                <p className="text-xs text-destructive">{ticketError}</p>
              )}
              <button
                type="submit"
                disabled={ticketSubmitting}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
              >
                {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
