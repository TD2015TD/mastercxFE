import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import api from '../../services/api';
import { acceptConversation } from '../../services/mitelService';
import AgentScriptAssistant from '../../components/AgentScriptAssistant';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
];

function ColorBtn({ icon, title, onSelect, activeColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={title}
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground flex flex-col items-center"
      >
        <Icon name={icon} size={14} />
        <span
          className="block w-3.5 h-[3px] rounded-sm mt-0.5"
          style={{ backgroundColor: activeColor || 'transparent' }}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-lg shadow-lg p-2 grid grid-cols-9 gap-1 w-max">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => { onSelect(c); setOpen(false); }}
              className="w-4 h-4 rounded-sm border border-black/10 hover:scale-110 transition-transform relative"
              style={{ backgroundColor: c }}
            >
              {c === activeColor && (
                <Icon name="Check" size={10} className="absolute inset-0 m-auto text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-MY', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmtDuration = (sec) => {
  if (!sec || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const initials = (name = '?') => name.charAt(0).toUpperCase();

const TERMINAL = ['Closed', 'Resolved', 'Cancelled'];

// ─── Resolution Timer ─────────────────────────────────────────────────────────

const ResolutionTimer = ({ ticket }) => {
  const done = TERMINAL.includes(ticket.status);

  const getFinalSec = () => {
    if (ticket.resolution_time_minutes != null) return ticket.resolution_time_minutes * 60;
    const end = ticket.resolved_at || ticket.closed_at;
    if (end) return Math.max(0, Math.floor((new Date(end) - new Date(ticket.created_at)) / 1000));
    return Math.floor((Date.now() - new Date(ticket.created_at)) / 1000);
  };

  const [elapsed, setElapsed] = useState(
    done ? getFinalSec() : Math.floor((Date.now() - new Date(ticket.created_at)) / 1000)
  );

  useEffect(() => {
    if (done) return;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - new Date(ticket.created_at)) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [done, ticket.created_at]);

  const breached = ticket.sla_breached;
  const color = done ? 'text-green-700 bg-green-50 border-green-200'
    : breached ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-blue-700 bg-blue-50 border-blue-200';
  const iconName = done ? 'CheckCircle2' : 'Clock';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${color}`}>
      <Icon name={iconName} size={12} />
      {done ? 'Resolved in ' : 'Open for '}
      <span className="font-mono font-bold">{fmtDuration(elapsed)}</span>
      {!done && breached && <span className="ml-1 opacity-70">· SLA breached</span>}
    </span>
  );
};

// ─── Single Email Message ─────────────────────────────────────────────────────

// Replace any unresolved cid: image srcs with the stored attachment URL.
// Resolution order: (1) content_id match, (2) alt-text filename match, (3) positional fallback.
const resolveCidImages = (html, attachments = []) => {
  if (!html) return html;

  const cidMap = {};
  const imageAtts = [];

  attachments.forEach(att => {
    if (att.content_id) {
      cidMap[att.content_id] = att.url;
      const local = att.content_id.includes('@') ? att.content_id.split('@')[0] : null;
      if (local) cidMap[local] = att.url;
    }
    const fname = att.filename || att.name || '';
    if (fname) cidMap[fname] = att.url;
    const mime = (att.mime_type || '').toLowerCase();
    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(fname)) {
      imageAtts.push(att);
    }
  });

  let fallbackIdx = 0;
  // Match full <img ...> tags so we can read the alt attribute for fallback
  return html.replace(/<img([^>]*?)src=["']cid:([^"'>\s]+)["']([^>]*?)>/gi, (match, before, cid, after) => {
    // 1. CID / filename match
    const url = cidMap[cid] || cidMap[cid.split('@')[0]] || null;
    if (url) return `<img${before}src="${url}"${after}>`;

    // 2. Alt-text → filename match (Gmail sets alt="filename.ext")
    const attrs = before + after;
    const altM = attrs.match(/alt=["']([^"']+)["']/i);
    if (altM) {
      const byAlt = attachments.find(a => (a.filename || a.name) === altM[1]);
      if (byAlt?.url) return `<img${before}src="${byAlt.url}"${after}>`;
    }

    // 3. Positional fallback: nth unresolved CID → nth image attachment
    if (imageAtts[fallbackIdx]?.url) {
      return `<img${before}src="${imageAtts[fallbackIdx++].url}"${after}>`;
    }

    return `<img${before}src="" alt="[Image unavailable]" style="display:inline-block;padding:2px 6px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:3px;font-size:11px;color:#6b7280"${after}>`;
  });
};

// Remove quoted-reply blocks from email HTML (Gmail, Outlook, Apple Mail).
// Returns the cleaned HTML and a flag indicating if quotes were found.
const stripEmailQuotes = (html) => {
  if (!html) return { clean: html, hasQuotes: false };
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const selectors = [
      '.gmail_quote',                // Gmail
      '.gmail_attr',                 // Gmail "On date, person wrote:" line
      '#divRepliedMessage',          // Outlook Web
      '#OLK_SRC_BODY_SECTION',      // Outlook desktop
      '.OutlookMessageHeader',
      'blockquote[type="cite"]',     // Apple Mail / Thunderbird
      'div[style*="border-left"]',   // generic blockquote style used by many clients
    ];
    let found = false;
    selectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => { el.remove(); found = true; });
    });
    // Also strip trailing <br> / whitespace-only nodes left after removal
    const body = doc.body;
    while (body.lastChild) {
      const n = body.lastChild;
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) { n.remove(); continue; }
      if (n.nodeName === 'BR') { n.remove(); continue; }
      break;
    }
    return { clean: body.innerHTML, hasQuotes: found };
  } catch {
    return { clean: html, hasQuotes: false };
  }
};

const EmailMessage = ({ msg, defaultExpanded }) => {
  const [open, setOpen]         = useState(defaultExpanded);
  const [viewHtml, setViewHtml] = useState(!!msg.body_html);
  const [showQuotes, setShowQuotes] = useState(false);
  const outbound = msg.direction === 'outbound';
  const sender   = msg.from_name || msg.from_email || '?';
  const hasBody  = msg.body_text || msg.body_html;

  const cleanHtml = useMemo(
    () => resolveCidImages(msg.body_html, msg.attachments),
    [msg.body_html, msg.attachments]
  );

  // Strip quoted thread from inbound messages so the thread view shows only
  // the new content. Outbound messages never contain quoted text from the DB.
  const { clean: htmlNoQuotes, hasQuotes } = useMemo(
    () => outbound ? { clean: cleanHtml, hasQuotes: false } : stripEmailQuotes(cleanHtml),
    [cleanHtml, outbound]
  );

  const displayHtml = showQuotes ? cleanHtml : htmlNoQuotes;

  const snippet = (msg.body_text || msg.body_html?.replace(/<[^>]+>/g, '') || '').slice(0, 100);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full text-left px-6 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          outbound ? 'bg-primary/20 text-primary' : 'bg-purple-100 text-purple-700'
        }`}>
          {initials(sender)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-foreground truncate">
              {outbound ? `${msg.from_name || msg.from_email}` : sender}
            </span>
            {outbound && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">Sent</span>
            )}
            {msg.attachments?.length > 0 && (
              <Icon name="Paperclip" size={12} className="text-muted-foreground shrink-0" />
            )}
          </div>
          {!open && (
            <p className="text-xs text-muted-foreground truncate">{snippet || '(no content)'}</p>
          )}
          {open && (
            <p className="text-xs text-muted-foreground">
              to: <span className="text-foreground">{msg.to_email || '—'}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(msg.received_at)}</span>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-muted-foreground" />
        </div>
      </button>

      {open && (
        <div className="px-6 pb-5">
          {msg.body_html && msg.body_text && (
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setViewHtml(false)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  !viewHtml ? 'bg-muted border-border text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >Plain text</button>
              <button
                onClick={() => setViewHtml(true)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  viewHtml ? 'bg-muted border-border text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >HTML</button>
            </div>
          )}
          <div className="text-sm text-foreground leading-relaxed">
            {!hasBody ? (
              <p className="text-muted-foreground italic text-xs">(no content)</p>
            ) : viewHtml && displayHtml ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: displayHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">
                {msg.body_text || msg.body_html?.replace(/<[^>]+>/g, '')}
              </pre>
            )}
            {hasQuotes && (
              <button
                onClick={() => setShowQuotes(v => !v)}
                className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showQuotes ? 'ChevronUp' : 'ChevronDown'} size={12} />
                {showQuotes ? 'Hide quoted text' : 'Show quoted text'}
              </button>
            )}
          </div>
          {msg.attachments?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2">
              {msg.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs border border-border rounded-md px-2.5 py-1.5 bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Icon name="Paperclip" size={12} />
                  {att.filename || att.name || `Attachment ${i + 1}`}
                  {att.size && <span className="text-muted-foreground">({(att.size / 1024).toFixed(0)} KB)</span>}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Toolbar button ───────────────────────────────────────────────────────────

const ToolBtn = ({ icon, title, onClick, isActive = false }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-primary/15 text-primary'
        : 'hover:bg-muted text-muted-foreground'
    }`}
  >
    <Icon name={icon} size={14} />
  </button>
);

// ─── Compose Box ─────────────────────────────────────────────────────────────

const ComposeBox = ({ ticket, customerEmail, onSent, onError, mitelToken, ticketEmbedToken }) => {
  const editorRef    = useRef(null);
  const fileInputRef = useRef(null);
  const lastRangeRef = useRef(null); // cursor position saved before file-picker steals focus
  const scriptAssistantRef = useRef(null);
  const [files, setFiles]         = useState([]);
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [sendError, setSendError] = useState(null);
  const [activeFormats, setActiveFormats] = useState({});

  const updateFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold:               document.queryCommandState('bold'),
        italic:             document.queryCommandState('italic'),
        underline:          document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList:  document.queryCommandState('insertOrderedList'),
        justifyLeft:        document.queryCommandState('justifyLeft'),
        justifyCenter:      document.queryCommandState('justifyCenter'),
        justifyRight:       document.queryCommandState('justifyRight'),
      });
    } catch { /* execCommand state queries may throw in some contexts */ }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateFormats);
    return () => document.removeEventListener('selectionchange', updateFormats);
  }, [updateFormats]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = `<p><br></p>`;
      const range = document.createRange();
      const sel   = window.getSelection();
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateFormats();
  }, [updateFormats]);

  // Custom list toggle — execCommand insertUnorderedList/insertOrderedList is unreliable
  // inside <p> tags in Chrome/Edge; we wrap/unwrap manually instead.
  const toggleList = useCallback((listType) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) container = container.parentNode;

    // Walk up to see if cursor is already inside this list type
    const tag = listType === 'ul' ? 'UL' : 'OL';
    let existingList = null;
    let node = container;
    while (node && node !== editorRef.current) {
      if (node.nodeName === tag) { existingList = node; break; }
      node = node.parentNode;
    }

    if (existingList) {
      // Remove list — convert each <li> back to <p>
      const frag = document.createDocumentFragment();
      Array.from(existingList.children).forEach(li => {
        const p = document.createElement('p');
        p.innerHTML = li.innerHTML || '<br>';
        frag.appendChild(p);
      });
      existingList.parentNode.replaceChild(frag, existingList);
    } else {
      // Find nearest block element containing the selection
      let block = container;
      while (block && block !== editorRef.current &&
             !['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(block.nodeName)) {
        block = block.parentNode;
      }

      const list = document.createElement(listType);
      // Inline styles needed: Tailwind preflight resets list-style, and email clients have no CSS
      list.style.cssText = listType === 'ul'
        ? 'list-style-type:disc;padding-left:1.5rem;margin:4px 0;'
        : 'list-style-type:decimal;padding-left:1.5rem;margin:4px 0;';

      const li = document.createElement('li');
      li.style.cssText = 'margin:2px 0;';

      if (!block || block === editorRef.current) {
        li.innerHTML = '<br>';
        list.appendChild(li);
        editorRef.current.appendChild(list);
      } else {
        li.innerHTML = block.innerHTML || '<br>';
        list.appendChild(li);
        block.parentNode.replaceChild(list, block);
      }

      // Place cursor at start of the new list item
      const r = document.createRange();
      r.setStart(li, 0);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    updateFormats();
  }, [updateFormats]);

  const handleLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  // Insert an <img> node at the saved cursor position (or append to editor).
  // Using direct DOM manipulation instead of execCommand('insertImage') because
  // execCommand is unreliable in iframe contexts and after focus is restored.
  const insertImageNode = useCallback((src) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width:100%;height:auto;display:inline-block;';

    const range = lastRangeRef.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      range.deleteContents();
      range.insertNode(img);
      // Place cursor right after the inserted image
      const after = document.createRange();
      after.setStartAfter(img);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      lastRangeRef.current = after;
    } else {
      editor.appendChild(img);
    }
  }, []);

  // Insert a canned script's text at the saved cursor position (or append to editor).
  const insertScriptText = useCallback((content) => {
    const editor = editorRef.current;
    if (!editor || !content) return;
    editor.focus();

    const html = content
      .split('\n')
      .map((line) => `<p>${line || '<br>'}</p>`)
      .join('');

    const range = lastRangeRef.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      const end = document.createRange();
      end.selectNodeContents(editor);
      end.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(end);
    }
    document.execCommand('insertHTML', false, html);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    try {
      const form = new FormData();
      form.append('image', file);
      const uploadUrl = ticketEmbedToken ? '/public/email/upload-inline-image' : '/email/upload-inline-image';
      if (ticketEmbedToken) form.append('token', ticketEmbedToken);
      const res = await api.post(uploadUrl, form);
      if (res.data?.url) {
        insertImageNode(res.data.url);
      }
    } catch (err) {
      console.error('[ImageUpload] Upload failed, falling back to data URI:', err);
      const reader = new FileReader();
      reader.onload = (ev) => insertImageNode(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    setFiles(f => [...f, ...picked]);
    e.target.value = '';
  };

  const removeFile = (i) => setFiles(f => f.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    const html = editorRef.current?.innerHTML || '';
    const hasText  = !!html.replace(/<[^>]+>/g, '').trim();
    const hasImage = /<img[^>]+>/i.test(html);
    if (!hasText && !hasImage && files.length === 0) return;

    setSending(true);
    setSendError(null);
    try {
      const form = new FormData();
      form.append('body', html);
      files.forEach(f => form.append('attachments[]', f));
      if (ticketEmbedToken) form.append('token', ticketEmbedToken);

      const replyUrl = ticketEmbedToken
        ? `/public/tickets/${ticket.ticket_number}/reply-email`
        : `/tickets/${ticket.ticket_number}/reply-email`;
      await api.post(replyUrl, form);

      // Tell Mitel the agent-side conversation is done so Ignite shows "Handled"
      if (ticket.mitel_interaction_id && mitelToken) {
        const endUrl = ticketEmbedToken
          ? `/public/tickets/${ticket.id}/mitel-end-conversation?token=${encodeURIComponent(ticketEmbedToken)}`
          : `/tickets/${ticket.id}/mitel-end-conversation`;
        api.post(endUrl, { mitel_token: mitelToken }).catch(() => {});
      }

      setSent(true);
      setFiles([]);
      editorRef.current.innerHTML = `<p><br></p>`;
      setTimeout(() => { setSent(false); onSent(); }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reply.';
      setSendError(msg);
      onError(msg);
    } finally {
      setSending(false);
    }
  };

  const [bgColor, setBgColor] = useState(null);
  const [textColor, setTextColor] = useState(null);

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {sent && (
        <div className="px-5 py-2 bg-green-50 border-b border-green-100 text-xs text-green-700 flex items-center gap-1.5">
          <Icon name="CheckCircle" size={13} /> Reply sent successfully!
        </div>
      )}
      {sendError && (
        <div className="px-5 py-2 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5"><Icon name="AlertCircle" size={13} /> {sendError}</span>
          <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-600"><Icon name="X" size={12} /></button>
        </div>
      )}

      <div className="px-5 pt-3 pb-1 text-xs text-muted-foreground space-y-0.5">
        <div>
          <span className="font-medium text-foreground w-8 inline-block">To:</span>
          <span className="text-foreground">{customerEmail}</span>
        </div>
        <div>
          <span className="font-medium text-foreground w-8 inline-block">From:</span>
          <span>{import.meta.env.VITE_MAIL_FROM || 'appsdev@tde.com.my'}</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5 px-5 py-1.5 border-y border-border bg-muted/30">
        <ToolBtn icon="Bold"      title="Bold"      isActive={activeFormats.bold}      onClick={() => exec('bold')} />
        <ToolBtn icon="Italic"    title="Italic"    isActive={activeFormats.italic}    onClick={() => exec('italic')} />
        <ToolBtn icon="Underline" title="Underline" isActive={activeFormats.underline} onClick={() => exec('underline')} />
        <span className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon="List"        title="Bullet list"   isActive={activeFormats.insertUnorderedList} onClick={() => toggleList('ul')} />
        <ToolBtn icon="ListOrdered" title="Numbered list" isActive={activeFormats.insertOrderedList}  onClick={() => toggleList('ol')} />
        <span className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon="Link"  title="Insert link"  onClick={handleLink} />
        <label title="Insert image" className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground cursor-pointer">
          <Icon name="Image" size={14} />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
        <span className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon="AlignLeft"   title="Align left"   isActive={activeFormats.justifyLeft}   onClick={() => exec('justifyLeft')} />
        <ToolBtn icon="AlignCenter" title="Align center" isActive={activeFormats.justifyCenter} onClick={() => exec('justifyCenter')} />
        <ToolBtn icon="AlignRight"  title="Align right"  isActive={activeFormats.justifyRight}  onClick={() => exec('justifyRight')} />
        <span className="w-px h-4 bg-border mx-1" />
        <ToolBtn icon="MessageSquare" title="Email scripts" onClick={() => scriptAssistantRef.current?.toggle()} />
          <span className="w-px h-4 bg-border mx-1" />
        <ColorBtn icon="Highlighter" title="Background colour"  onSelect={(c) => { exec('backColor', c); setBgColor(c); }} />
        <ColorBtn icon="Baseline"    title="Text colour"        onSelect={(c) => { exec('foreColor', c); setTextColor(c); }} />
      </div>

      <AgentScriptAssistant
        ref={scriptAssistantRef}
        hideTrigger
        currentChannel="email"
        currentTicket={ticket}
        onInsertScript={insertScriptText}
      />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="px-5 py-3 min-h-[100px] max-h-[220px] overflow-y-auto text-sm text-foreground focus:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
        }}
        onKeyUp={() => {
          const sel = window.getSelection();
          if (sel?.rangeCount) lastRangeRef.current = sel.getRangeAt(0).cloneRange();
        }}
        onMouseUp={() => {
          const sel = window.getSelection();
          if (sel?.rangeCount) lastRangeRef.current = sel.getRangeAt(0).cloneRange();
        }}
      />

      {files.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-md px-2.5 py-1.5">
              <Icon name="Paperclip" size={12} className="text-muted-foreground" />
              <span className="max-w-[160px] truncate">{f.name}</span>
              <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
              <button onClick={() => removeFile(i)} className="ml-1 text-muted-foreground hover:text-red-500">
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/20">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <Icon name="Paperclip" size={14} />
          Attach files
          <input type="file" multiple className="hidden" onChange={handleFiles} ref={fileInputRef} />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Ctrl+Enter to send</span>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name={sending ? 'Loader2' : 'SendHorizontal'} size={15} className={sending ? 'animate-spin' : ''} />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EmailInteractionPage = () => {
  const [searchParams] = useSearchParams();
  const pendingParam   = searchParams.get('pending'); // email_message_id — no Ticket exists yet
  const [createdTicketNumber, setCreatedTicketNumber] = useState(null);
  const ticketParam   = searchParams.get('ticket') || searchParams.get('conversationId') || createdTicketNumber;
  const refParam      = searchParams.get('ref'); // previous closed ticket number for context
  // agent_id in URL takes priority (set by TicketObserver when interaction is pre-assigned)
  const urlAgentId    = searchParams.get('agent_id');
  // Present when embedded in Mitel Ignite's OpenMedia iframe — that browsing context can't
  // see the agent's normal localStorage login, so these requests use token auth instead
  // (see EmbedTokenService on the backend) via the /public/pending-emails/* routes.
  const embedToken    = searchParams.get('embed_token');
  // Ticket-scoped embed token — carries the same token-auth forward once a Ticket
  // exists (either it already existed, or triage just created one), so the rest of
  // this page (thread view, reply, close, hangup polling) never has to fall back to
  // the normal JWT-authenticated /tickets/* routes inside the embedded iframe.
  const [ticketEmbedToken, setTicketEmbedToken] = useState(() =>
    ticketParam ? searchParams.get('embed_token') : null
  );

  // ── Pending-email triage (no Ticket yet — agent must pick department/category) ──
  const [pendingEmail, setPendingEmail]   = useState(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError]   = useState(null);
  const [triageDept, setTriageDept]       = useState('Customer Service');
  const [triageCategory, setTriageCategory] = useState('general');
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    if (!pendingParam || ticketParam) return; // already resolved to a real ticket
    setPendingLoading(true);

    const request = embedToken
      ? api.get(`/public/pending-emails/${pendingParam}`, { params: { token: embedToken } })
      : api.get(`/tickets/pending-email/${pendingParam}`);

    request
      .then(res => {
        if (!res.data.success) { setPendingError(res.data.message || 'Failed to load email.'); return; }
        const payload = res.data.data;
        if (payload.ticket_number || payload.already_ticketed) {
          // Race: a ticket already exists for this email — switch straight to it.
          setCreatedTicketNumber(payload.ticket_number || payload.ticket_id);
          if (payload.embed_token) setTicketEmbedToken(payload.embed_token);
        } else {
          setPendingEmail(payload);
        }
      })
      .catch(err => setPendingError(err?.response?.data?.message || 'Unable to load email.'))
      .finally(() => setPendingLoading(false));
  }, [pendingParam, ticketParam, embedToken]);

  const handleCreateTicket = async () => {
    setCreatingTicket(true);
    setPendingError(null);
    try {
      const res = embedToken
        ? await api.post('/public/pending-emails/create-ticket', {
            token: embedToken,
            department: triageDept,
            category: triageCategory,
          })
        : await api.post('/tickets/from-email', {
            email_message_id: pendingParam,
            department: triageDept,
            category: triageCategory,
          });
      if (res.data.success) {
        setCreatedTicketNumber(res.data.data.ticket_number || res.data.data.ticket_id);
        if (res.data.data.embed_token) setTicketEmbedToken(res.data.data.embed_token);
      } else {
        setPendingError(res.data.message || 'Failed to create ticket.');
      }
    } catch (err) {
      setPendingError(err?.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [closing, setClosing]   = useState(false);
  const [mitelToken, setMitelToken] = useState(() => {
    const t = localStorage.getItem('mitel_token');
    return (t && t !== 'undefined' && t !== 'null') ? t : null;
  });
  const bottomRef               = useRef(null);
  const autoAssignedRef         = useRef(false);
  const dataRef                 = useRef(null); // always holds latest data for unload handlers
  const handleCloseRef          = useRef(null); // stable ref for SignalR/postMessage handlers

  const load = useCallback(async () => {
    if (!ticketParam) {
      if (!pendingParam) setError('No ticket specified.');
      setLoading(false);
      return;
    }
    try {
      // Only show the full-page loading spinner on the very first fetch.
      // Background refreshes (auto-assign, onSent, MCX poll) must NOT set
      // loading=true because that unmounts all EmailMessage components and
      // resets every individual expand/collapse state back to its default.
      if (!dataRef.current) setLoading(true);
      setError(null);
      const base = ticketEmbedToken
        ? `/public/tickets/${ticketParam}/email-thread`
        : `/tickets/${ticketParam}/email-thread`;
      const qs = new URLSearchParams();
      if (refParam) qs.set('ref', refParam);
      if (ticketEmbedToken) qs.set('token', ticketEmbedToken);
      const url = qs.toString() ? `${base}?${qs}` : base;
      const res = await api.get(url);
      if (res.data.success) setData(res.data.data);
      else setError(res.data.message || 'Failed to load email thread.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load ticket.');
    } finally {
      setLoading(false);
    }
  }, [ticketParam, pendingParam, ticketEmbedToken]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { dataRef.current = data; }, [data]);

  // ── Confirm department/category on every accept ──────────────────────────────
  // Re-shown every time a ticket is opened here (new or already-existing) so
  // triage stays a deliberate per-acceptance step, not something baked in once
  // at ticket creation and never revisited.
  const [triageConfirmed, setTriageConfirmed] = useState(false);
  const [confirmDept, setConfirmDept]         = useState('Customer Service');
  const [confirmCategory, setConfirmCategory] = useState('general');
  const [confirmSaving, setConfirmSaving]     = useState(false);
  const [confirmError, setConfirmError]       = useState(null);
  const confirmInitRef = useRef(null); // ticket id already initialized — avoids resetting on poll refreshes

  useEffect(() => {
    if (!data?.ticket?.id) return;
    if (confirmInitRef.current === data.ticket.id) return;
    confirmInitRef.current = data.ticket.id;
    setConfirmDept(data.ticket.department || 'Customer Service');
    setConfirmCategory(data.ticket.category || 'general');
    setTriageConfirmed(false);
    setConfirmError(null);
  }, [data?.ticket?.id]);

  const handleConfirmTriage = async () => {
    setConfirmSaving(true);
    setConfirmError(null);
    try {
      const res = ticketEmbedToken
        ? await api.post(`/public/tickets/${data.ticket.ticket_number}/triage`, {
            token: ticketEmbedToken,
            department: confirmDept,
            category: confirmCategory,
          })
        : await api.put(`/tickets/${data.ticket.id}`, {
            department: confirmDept,
            category: confirmCategory,
          });
      if (res.data.success === false) {
        setConfirmError(res.data.message || 'Failed to save.');
        return;
      }
      setTriageConfirmed(true);
      load();
    } catch (err) {
      setConfirmError(err?.response?.data?.message || 'Failed to save.');
    } finally {
      setConfirmSaving(false);
    }
  };

  // Accept the Mitel interaction as soon as the email is opened so Ignite
  // doesn't time it out and mark it "Abandoned" before the agent responds.
  const acceptedRef = useRef(false);
  useEffect(() => {
    if (!data?.ticket?.mitel_interaction_id) return;
    if (TERMINAL.includes(data?.ticket?.status)) return;
    if (acceptedRef.current) return;
    acceptedRef.current = true;
    acceptConversation(data.ticket.mitel_interaction_id).catch(() => {
      // Silently ignore — the interaction may already be accepted or in wrong state
    });
  }, [data?.ticket?.mitel_interaction_id, data?.ticket?.status]);

  // Capture mitel_token from Mitel Ignite and store it so SignalR can use it.
  // Mitel may pass it via: (1) URL query param, (2) postMessage on load.
  useEffect(() => {
    // Check URL params first — Mitel Ignite appends ignite_token to the targetUri
    const tokenFromUrl = searchParams.get('ignite_token') || searchParams.get('sessionid')
      || searchParams.get('token') || searchParams.get('accessToken') || searchParams.get('mitelToken');
    if (tokenFromUrl && tokenFromUrl !== 'undefined' && tokenFromUrl !== 'null') {
      localStorage.setItem('mitel_token', tokenFromUrl);
      setMitelToken(tokenFromUrl);
    }

    // Listen for postMessage from Mitel Ignite parent that carries auth info
    const handleTokenMessage = (event) => {
      const d = event.data;
      if (!d || typeof d !== 'object') return;

      // Extract token from whatever field Mitel uses
      const token = d.sessionid ?? d.sessionId ?? d.token ?? d.accessToken
        ?? d.mitelToken ?? d.bearerToken ?? d.jwt ?? d.authToken ?? null;

      if (token && typeof token === 'string' && token !== 'undefined' && token !== 'null') {
        // Strip "Bearer " prefix if Mitel includes it
        const clean = token.replace(/^Bearer\s+/i, '');
        if (clean) {
          console.log('[Email Ignite] mitel_token received via postMessage — storing');
          localStorage.setItem('mitel_token', clean);
          setMitelToken(clean);
        }
      }
    };

    window.addEventListener('message', handleTokenMessage);
    return () => window.removeEventListener('message', handleTokenMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (data) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [data]);

  // A) Mitel Ignite postMessage — fires when the parent Ignite frame sends a state event.
  // No mitelId guard — this iframe only receives postMessages for its own interaction.
  useEffect(() => {
    if (!data) return;
    const mitelId = data.ticket?.mitel_interaction_id;

    const handleIgniteMessage = (event) => {
      const d = event.data;
      if (!d || typeof d !== 'object') return;

      // Debug: log all postMessages from parent so we can see what Mitel Ignite sends
      console.log('[Email postMessage] received:', JSON.stringify(d).slice(0, 200));

      const state = (d.conversationState ?? d.state ?? d.interactionState ?? '').toString().toLowerCase();
      const id    = (d.interactionId ?? d.conversationId ?? d.id ?? '').toString();

      // If Mitel sends an id, filter by it; otherwise act on any terminal state
      if (mitelId && id && id !== mitelId) return;

      const endStates = ['ended', 'abandoned', 'handled', '6', '7'];
      if (endStates.includes(state)) {
        console.log('[Email Ignite] Hangup detected via postMessage — closing ticket');
        handleCloseRef.current?.();
      }
    };

    window.addEventListener('message', handleIgniteMessage);
    return () => window.removeEventListener('message', handleIgniteMessage);
  }, [data?.ticket?.mitel_interaction_id, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // D) New-message polling — checks for customer replies every 20 s.
  // When a customer replies via Gmail/Outlook the IMAP processor links the reply to the
  // ticket within ~60 s. This poll detects that and auto-refreshes the thread so the
  // agent sees the reply without having to click the refresh button manually.
  useEffect(() => {
    if (!data?.ticket?.id) return;
    if (TERMINAL.includes(data?.ticket?.status)) return;

    const knownCount = data.messages?.length ?? 0;

    const poll = async () => {
      try {
        const base = ticketEmbedToken
          ? `/public/tickets/${data.ticket.ticket_number}/email-thread`
          : `/tickets/${data.ticket.ticket_number}/email-thread`;
        const url = ticketEmbedToken ? `${base}?token=${encodeURIComponent(ticketEmbedToken)}` : base;
        const res = await api.get(url);
        if (res.data?.success) {
          const newCount = res.data.data?.messages?.length ?? 0;
          if (newCount > knownCount) {
            await load();
          }
        }
      } catch { /* silently ignore */ }
    };

    const timer = setInterval(poll, 20000);
    return () => clearInterval(timer);
  }, [data?.ticket?.id, data?.ticket?.status, data?.messages?.length, load, ticketEmbedToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // C) MCX polling — checks Mitel interaction state every 5 s via CRM backend.
  // Works without mitel_token or SignalR. When the interaction is gone (agent hung up),
  // the backend closes the ticket and returns {closed: true} → we refresh immediately.
  // This is the primary hangup detection mechanism — no beforeunload/pagehide needed.
  useEffect(() => {
    if (!data?.ticket?.id || !data?.ticket?.mitel_interaction_id) return;
    if (TERMINAL.includes(data?.ticket?.status)) return;

    const poll = async () => {
      try {
        const url = ticketEmbedToken
          ? `/public/tickets/${data.ticket.id}/mitel-ping?token=${encodeURIComponent(ticketEmbedToken)}`
          : `/tickets/${data.ticket.id}/mitel-ping`;
        const res = await api.post(url);
        if (res.data?.closed) {
          console.log('[Email MCX poll] Interaction ended — refreshing ticket');
          await load();
        }
      } catch { /* silently ignore poll errors */ }
    };

    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [data?.ticket?.id, data?.ticket?.mitel_interaction_id, data?.ticket?.status, load, ticketEmbedToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // B) Mitel SignalR — real-time hangup detection via employeeHub.
  // Connects once mitelToken is available (either from localStorage or postMessage from Ignite).
  useEffect(() => {
    if (!data) return;
    if (!mitelToken) return; // wait until token arrives via postMessage or URL param
    const mitelId = data.ticket?.mitel_interaction_id;

    let connection = null;
    let mounted = true;

    const connectSignalR = async () => {
      try {

        const configRes = await fetch('/api/v1/mitel-config');
        const config = await configRes.json();
        const signalrUrl = config?.data?.MITEL_SIGNALR_URL;
        if (!signalrUrl) return;

        const signalR = await import('signalr-no-jquery');
        connection = signalR.hubConnection(signalrUrl, { useDefaultPath: false });
        connection.qs = { sessionid: `Bearer ${mitelToken}` };
        connection.logging = false;

        const hub = connection.createHubProxy('employeeHub');
        const endStates = ['disconnected', 'ended', 'completed', 'handled', 'abandoned'];

        hub.on('employeeConversationChanged', (conversations) => {
          if (!mounted) return;
          const conv = Array.isArray(conversations) ? conversations[0] : conversations;
          if (!conv) return;
          const convId = String(conv.conversationId ?? conv.id ?? '');
          if (convId && convId !== mitelId) return;
          const state = String(conv.conversationState ?? conv.state ?? '').toLowerCase();
          console.log('[Email SignalR] employeeConversationChanged:', state, convId);
          if (endStates.includes(state)) {
            console.log('[Email SignalR] Hangup detected — closing ticket');
            handleCloseRef.current?.();
          }
        });

        hub.on('employeeConversationRemoved', (d) => {
          if (!mounted) return;
          const convId = String(d?.conversationId ?? d?.id ?? '');
          if (convId && convId !== mitelId) return;
          console.log('[Email SignalR] employeeConversationRemoved — closing ticket');
          handleCloseRef.current?.();
        });

        await new Promise((resolve, reject) => {
          connection.start({ transport: ['webSockets', 'serverSentEvents', 'longPolling'] })
            .done(resolve)
            .fail(reject);
        });

        console.log('[Email SignalR] Connected — real-time hangup detection active for', mitelId);
      } catch (err) {
        console.warn('[Email SignalR] Connection failed — MCX polling will handle hangup', err);
      }
    };

    connectSignalR();
    return () => {
      mounted = false;
      try { connection?.stop(); } catch {}
    };
  }, [data?.ticket?.mitel_interaction_id, mitelToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-assign: always assign to whoever is currently attending the ticket.
  // Skip only if already assigned to this user to avoid redundant API calls.
  useEffect(() => {
    if (!data || autoAssignedRef.current) return;
    const { ticket } = data;
    if (TERMINAL.includes(ticket.status)) return;
    if (!ticket.id) return;

    // Get the logged-in user's agent id
    let agentId = null;
    try {
      const session = JSON.parse(localStorage.getItem('user-session') || 'null');
      agentId = session?.agent?.id ?? null;
    } catch { /* localStorage unavailable */ }

    if (!agentId) return;

    // Already assigned to this user — no need to reassign
    if (ticket.assigned_to === agentId) return;

    autoAssignedRef.current = true;
    api.put(`/tickets/${ticket.id}/assign`, { agent_id: agentId })
      .then(() => load())
      .catch(err => {
        console.warn('[CRM] Auto-assign failed:', err?.response?.data || err.message);
        autoAssignedRef.current = false;
      });
  }, [data?.ticket?.id, data?.ticket?.assigned_to, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = async () => {
    if (!data?.ticket?.id) return;
    if (TERMINAL.includes(data?.ticket?.status)) return;
    setClosing(true);
    try {
      const closeUrl = ticketEmbedToken
        ? `/public/tickets/${data.ticket.id}/close?token=${encodeURIComponent(ticketEmbedToken)}`
        : `/tickets/${data.ticket.id}/close`;
      await api.post(closeUrl);
      // Tell Mitel the agent-side conversation is done so Ignite shows "Handled"
      if (data.ticket.mitel_interaction_id && mitelToken) {
        const endUrl = ticketEmbedToken
          ? `/public/tickets/${data.ticket.id}/mitel-end-conversation?token=${encodeURIComponent(ticketEmbedToken)}`
          : `/tickets/${data.ticket.id}/mitel-end-conversation`;
        try { await api.post(endUrl, { mitel_token: mitelToken }); } catch { /* ignore */ }
      }
      await load();
    } catch {
      setError('Failed to close ticket.');
    } finally {
      setClosing(false);
    }
  };

  // Keep ref in sync so SignalR/postMessage handlers always call the latest version
  useEffect(() => { handleCloseRef.current = handleClose; });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Icon name="Mail" size={40} className="text-muted-foreground mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading email thread…</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-sm">
        <Icon name="AlertCircle" size={40} className="text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={load} className="mt-4 text-sm text-primary underline">Retry</button>
      </div>
    </div>
  );

  // ── Triage screen: email arrived but no Ticket exists yet. Agent must pick a
  // department + category and confirm before a Ticket is created and they can reply. ──
  if (pendingParam && !ticketParam) {
    if (pendingLoading) return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Icon name="Mail" size={40} className="text-muted-foreground mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading email…</p>
        </div>
      </div>
    );

    if (!pendingEmail) return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-sm">
          <Icon name="AlertCircle" size={40} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600">{pendingError || 'Email not found.'}</p>
        </div>
      </div>
    );

    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="w-full max-w-lg bg-card border border-border rounded-lg shadow-lg p-6">
          <h2 className="text-base font-semibold mb-1">New Email — Create Ticket</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Choose a department and category before a ticket is created. You can't reply until this is done.
          </p>

          <div className="bg-muted/50 rounded-md p-3 mb-4 text-sm">
            <p><span className="text-muted-foreground">From:</span> {pendingEmail.from_name || pendingEmail.from_email} &lt;{pendingEmail.from_email}&gt;</p>
            <p className="mt-1"><span className="text-muted-foreground">Subject:</span> {pendingEmail.subject || '(no subject)'}</p>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Department</label>
            <select
              value={triageDept}
              onChange={(e) => setTriageDept(e.target.value)}
              className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
            >
              <option value="Customer Service">Customer Service</option>
              <option value="Customs Operations">Customs Operations</option>
              <option value="Trade Compliance">Trade Compliance</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Category</label>
            <select
              value={triageCategory}
              onChange={(e) => setTriageCategory(e.target.value)}
              className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
            >
              <option value="permit">Permit Inquiry</option>
              <option value="declaration">Customs Declaration</option>
              <option value="enforcement">Enforcement Matter</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>

          {pendingError && <p className="text-xs text-red-600 mb-3">{pendingError}</p>}

          <button
            onClick={handleCreateTicket}
            disabled={creatingTicket}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {creatingTicket ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    );
  }

  // ── Confirm department/category before showing the conversation — every accept ──
  if (!triageConfirmed) {
    const t = data.ticket;
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <div className="w-full max-w-lg bg-card border border-border rounded-lg shadow-lg p-6">
          <h2 className="text-base font-semibold mb-1">Confirm Department &amp; Category</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Confirm or change the department and category for this ticket before continuing.
          </p>

          <div className="bg-muted/50 rounded-md p-3 mb-4 text-sm">
            <p><span className="text-muted-foreground">Ticket:</span> {t.ticket_number}</p>
            <p className="mt-1"><span className="text-muted-foreground">Subject:</span> {t.subject || '(no subject)'}</p>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Department</label>
            <select
              value={confirmDept}
              onChange={(e) => setConfirmDept(e.target.value)}
              className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
            >
              <option value="Customer Service">Customer Service</option>
              <option value="Customs Operations">Customs Operations</option>
              <option value="Trade Compliance">Trade Compliance</option>
              {!['Customer Service', 'Customs Operations', 'Trade Compliance'].includes(confirmDept) && (
                <option value={confirmDept}>{confirmDept}</option>
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-1">Category</label>
            <select
              value={confirmCategory}
              onChange={(e) => setConfirmCategory(e.target.value)}
              className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background"
            >
              <option value="permit">Permit Inquiry</option>
              <option value="declaration">Customs Declaration</option>
              <option value="enforcement">Enforcement Matter</option>
              <option value="general">General Inquiry</option>
              {!['permit', 'declaration', 'enforcement', 'general'].includes(confirmCategory) && (
                <option value={confirmCategory}>{confirmCategory}</option>
              )}
            </select>
          </div>

          {confirmError && <p className="text-xs text-red-600 mb-3">{confirmError}</p>}

          <button
            onClick={handleConfirmTriage}
            disabled={confirmSaving}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {confirmSaving ? 'Saving…' : 'Confirm & Open Ticket'}
          </button>
        </div>
      </div>
    );
  }

  const { ticket, messages } = data;
  const isClosed = TERMINAL.includes(ticket.status);
  const customerEmail = ticket.customer?.email
    ?? messages.find(m => m.direction === 'inbound')?.from_email
    ?? '—';

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-card border-b border-border shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
            {initials(ticket.customer?.name || customerEmail)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground truncate">
              {ticket.customer?.name || 'Unknown'} &lt;{customerEmail}&gt;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            ticket.status === 'Open' ? 'bg-blue-100 text-blue-700'
            : ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700'
            : ticket.status === 'Resolved' ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
          }`}>{ticket.status}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{ticket.ticket_number}</span>
          {!isClosed && (
            <button
              onClick={handleClose}
              disabled={closing}
              title="Close ticket"
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Icon name={closing ? 'Loader2' : 'XCircle'} size={13} className={closing ? 'animate-spin' : ''} />
              {closing ? 'Closing…' : 'Close Ticket'}
            </button>
          )}
          <button onClick={load} title="Refresh" className="p-1.5 rounded hover:bg-muted transition-colors">
            <Icon name="RefreshCw" size={14} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* ── Meta strip ── */}
      <div className="flex items-center gap-3 px-5 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground shrink-0 flex-wrap">
        <span><span className="font-medium text-foreground">Assigned:</span> {ticket.assigned_agent || 'Unassigned'}</span>
        <span><span className="font-medium text-foreground">Priority:</span> {ticket.priority || '—'}</span>
        <span><span className="font-medium text-foreground">Opened:</span> {fmtDate(ticket.created_at)}</span>
        {ticket.mitel_interaction_id && (
          <span className="text-purple-600 flex items-center gap-1">
            <Icon name="Link" size={11} />
            {ticket.mitel_interaction_id.slice(0, 15)}…
          </span>
        )}
        <ResolutionTimer ticket={ticket} />
      </div>

      {/* ── Thread ── */}
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Previous (closed) ticket conversation shown as context */}
        {data.previous_ticket && data.previous_messages?.length > 0 && (
          <div className="border-b-2 border-amber-200">
            <div className="px-5 py-2 bg-amber-50 flex items-center gap-2 text-xs text-amber-800 font-medium sticky top-0 z-10">
              <Icon name="History" size={13} />
              Previous conversation — {data.previous_ticket.ticket_number}
              <span className="font-normal text-amber-600">({data.previous_ticket.status})</span>
            </div>
            <div className="divide-y divide-border opacity-80">
              {data.previous_messages.map((msg) => (
                <EmailMessage key={`prev-${msg.id}`} msg={msg} defaultExpanded={false} />
              ))}
            </div>
          </div>
        )}

        {/* Current ticket messages */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <Icon name="MailOpen" size={40} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((msg, i) => (
              <EmailMessage key={msg.id} msg={msg} defaultExpanded={i === messages.length - 1} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Compose / closed notice ── */}
      {isClosed ? (
        <div className="shrink-0 border-t border-border bg-muted/40 px-5 py-3 text-center text-sm text-muted-foreground">
          <Icon name="Lock" size={14} className="inline mr-1.5" />
          This ticket is <strong>{ticket.status}</strong>. Reopen it to send a reply.
        </div>
      ) : (
        <ComposeBox
          ticket={ticket}
          customerEmail={customerEmail}
          onSent={load}
          onError={setError}
          mitelToken={mitelToken}
          ticketEmbedToken={ticketEmbedToken}
        />
      )}
    </div>
  );
};

export default EmailInteractionPage;
