import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ticketService } from '../../../services/ticketService';
import lookupService from '../../../services/lookupService';
import { contactService } from '../../../services/contactService';
import { agentService } from '../../../services/agentService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../services/api';
import Icon from '../../../components/AppIcon';

// Strip Gmail/Outlook quoted-reply chains from HTML, returning the clean
// content and whether any quotes were found.
const stripEmailQuotes = (html) => {
  if (!html) return { clean: html, hasQuotes: false };
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const selectors = [
      '.gmail_quote', '.gmail_attr', '.gmail_quote_container',
      '#divRepliedMessage', '#OLK_SRC_BODY_SECTION', '.OutlookMessageHeader',
      'blockquote[type="cite"]', 'div[style*="border-left"]',
    ];
    let found = false;
    selectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => { el.remove(); found = true; });
    });
    // Trim trailing <br>/<p> whitespace
    const body = doc.body;
    while (body.lastElementChild) {
      const last = body.lastElementChild;
      if (['BR', 'P', 'DIV'].includes(last.tagName) && !last.textContent.trim() && !last.querySelector('img')) {
        last.remove();
      } else break;
    }
    return { clean: body.innerHTML, hasQuotes: found };
  } catch {
    return { clean: html, hasQuotes: false };
  }
};

const TicketDetails = ({ ticket, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [emailMessages, setEmailMessages] = useState([]);
  const [emailLoading, setEmailLoading] = useState(false);
  // Track which messages are collapsed (by index); default all expanded
  const [collapsedMsgs, setCollapsedMsgs] = useState(new Set());
  // Track which messages are showing their quoted text
  const [showQuotes, setShowQuotes] = useState(new Set());

  const toggleCollapse = (idx) => {
    setCollapsedMsgs(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleQuote = (idx) => {
    setShowQuotes(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  useEffect(() => {
    if (ticket?.channel !== 'email' || !ticket?.ticket_number) return;
    setEmailLoading(true);
    api.get(`/tickets/${ticket.ticket_number}/email-thread`)
      .then(res => {
        if (res.data.success) setEmailMessages(res.data.data.messages || []);
      })
      .catch(() => {})
      .finally(() => setEmailLoading(false));
  }, [ticket?.ticket_number, ticket?.channel]);
  const [customerContacts, setCustomerContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  
  const [editData, setEditData] = useState({
    priority: ticket?.priority,
    department: ticket?.department,
    assignedTo: ticket?.assigned_to,
    category: ticket?.category
  });

  // Load agents on mount for better performance
  React.useEffect(() => {
    loadAgents();
  }, []);

  // Load lookups when entering edit mode
  React.useEffect(() => {
    if (isEditing && departments.length === 0) {
      loadLookups();
    }
  }, [isEditing]);

  React.useEffect(() => {
    const loadCustomerContacts = async () => {
      if (!ticket?.customer?.id) {
        setCustomerContacts([]);
        return;
      }

      try {
        const response = await contactService.getCustomerContacts(ticket.customer.id, { per_page: 50 });
        setCustomerContacts(response?.data || []);
      } catch (error) {
        console.error('Error loading customer contacts:', error);
        setCustomerContacts([]);
      }
    };

    loadCustomerContacts();
  }, [ticket?.customer?.id]);

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await agentService.getAgents({
        status: 'active',
        per_page: 100
      });
      if (response.success) {
        const agentsList = response.data.data || response.data;
        setAgents(agentsList);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [deptData, prioData] = await Promise.all([
        lookupService.getDepartments(),
        lookupService.getPriorities()
      ]);

      setDepartments(deptData.map(d => ({ value: d.name, label: d.name })));
      setPriorities(prioData.map(p => ({ value: p.code, label: `${p.code} - ${p.name}` })));
    } catch (err) {
      console.error('Error loading lookups:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Call API to update ticket
      const response = await ticketService.updateTicket(ticket.id, {
        priority: editData.priority,
        department: editData.department,
        category: editData.category,
        assigned_to: editData.assignedTo
      });

      if (response.success) {
        // Update parent component
        if (onUpdate) {
          onUpdate(editData);
        }
        setIsEditing(false);
        toast.success('Ticket updated successfully');
      } else {
        toast.error('Failed to update ticket: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      priority: ticket?.priority,
      department: ticket?.department,
      assignedTo: ticket?.assigned_to,
      category: ticket?.category
    });
    setIsEditing(false);
  };

  const getImpactUrgencyMatrix = () => {
    const impact = ticket?.impact || 'Medium';
    const urgency = ticket?.urgency || 'Medium';
    
    const matrix = {
      'High-High': 'P1',
      'High-Medium': 'P2',
      'High-Low': 'P3',
      'Medium-High': 'P2',
      'Medium-Medium': 'P3',
      'Medium-Low': 'P4',
      'Low-High': 'P3',
      'Low-Medium': 'P4',
      'Low-Low': 'P5'
    };
    
    return matrix?.[`${impact}-${urgency}`] || 'P3';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Ticket Details</h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-3">Customer Information</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contacts</label>
              {customerContacts.length > 0 ? (
                <div className="mt-1 space-y-1">
                  {customerContacts.map((contact) => (
                    <p key={contact.id} className="text-sm text-foreground">
                      <span className="text-muted-foreground mr-2">
                        {contact.contactType?.name_en || contact.contactType?.name_ms || 'Contact'}:
                      </span>
                      {contact.value}
                      {contact.is_primary ? <span className="ml-2 text-xs text-primary">(Primary)</span> : null}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground mt-1">-</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <p className="text-sm text-foreground mt-1">{ticket?.customer?.company}</p>
            </div>
          </div>
        </div>

        {/* Ticket Classification */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-3">Classification</h4>

          {ticket?.case_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Case ID</label>
              <p className="text-sm font-mono text-foreground mt-1">{ticket.case_id}</p>
            </div>
          )}

          <div className="space-y-3">
            {isEditing ? (
              <>
                {/* Priority hidden — auto-closed tickets; kept for future use */}
                <div className="hidden">
                  <Select
                    label="Priority"
                    options={priorities.length > 0 ? priorities : [
                      { value: 'P1', label: 'P1 - Critical' },
                      { value: 'P2', label: 'P2 - High' },
                      { value: 'P3', label: 'P3 - Medium' },
                      { value: 'P4', label: 'P4 - Low' }
                    ]}
                    value={editData?.priority}
                    onChange={(value) => setEditData({...editData, priority: value})}
                  />
                </div>
                
                <Select
                  label="Department"
                  options={departments.length > 0 ? departments : [
                    { value: 'Customs Operations', label: 'Customs Operations' },
                    { value: 'Trade Facilitation', label: 'Trade Facilitation' }
                  ]}
                  value={editData?.department}
                  onChange={(value) => setEditData({...editData, department: value})}
                />
                
                <Input
                  label="Category"
                  type="text"
                  value={editData?.category}
                  onChange={(e) => setEditData({...editData, category: e?.target?.value})}
                />
                
                <Select
                  label="Assigned To"
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...agents.map(agent => ({
                      value: agent.id,
                      label: `${agent.user?.name || agent.agent_code} (${agent.department})`
                    }))
                  ]}
                  value={editData?.assignedTo || ''}
                  onChange={(value) => setEditData({...editData, assignedTo: value === '' ? null : parseInt(value)})}
                  disabled={isLoadingAgents}
                />
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Channel</label>
                  <p className="text-sm text-foreground mt-1 capitalize">{ticket?.channel?.replace('-', ' ') || '-'}</p>
                </div>

                {/* Priority hidden — auto-closed tickets; kept for future use */}
                <div className="hidden">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="text-sm text-foreground mt-1">{ticket?.priority}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.department}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.category}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  <p className="text-sm text-foreground mt-1">{ticket?.assigned_agent?.user?.name || 'Unassigned'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Priority Matrix — hidden; kept for future use */}
      <div className="hidden mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-foreground mb-3">Priority Matrix (Impact × Urgency)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Impact: </span>
            <span className="text-foreground font-medium">{ticket?.impact || 'Medium'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Urgency: </span>
            <span className="text-foreground font-medium">{ticket?.urgency || 'Medium'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Calculated Priority: </span>
            <span className="text-foreground font-medium">{getImpactUrgencyMatrix()}</span>
          </div>
        </div>
      </div>
      {/* Issue Description */}
      <div className="mt-6">
        <h4 className="font-medium text-foreground mb-3">Issue Description</h4>
        {ticket?.channel === 'email' ? (
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {emailLoading ? (
              <div className="p-4 text-xs text-muted-foreground">Loading email thread…</div>
            ) : emailMessages.length === 0 ? (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{ticket?.description || '(no content)'}</p>
              </div>
            ) : (
              emailMessages.map((msg, i) => {
                const outbound = msg.direction === 'outbound';
                const sender = msg.from_name || msg.from_email || '?';
                const isCollapsed = collapsedMsgs.has(i);
                const quoteVisible = showQuotes.has(i);

                // Resolve cid: image refs → stored URLs
                const resolveCids = (html) => {
                  if (!html) return null;
                  const atts = msg.attachments || [];
                  const cidMap = {};
                  const imageAtts = [];
                  atts.forEach(att => {
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
                  return html.replace(/<img([^>]*?)src=["']cid:([^"'>\s]+)["']([^>]*?)>/gi, (m, before, cid, after) => {
                    const url = cidMap[cid] || cidMap[cid.split('@')[0]] || null;
                    if (url) return `<img${before}src="${url}"${after}>`;
                    const attrs = before + after;
                    const altM = attrs.match(/alt=["']([^"']+)["']/i);
                    if (altM) {
                      const byAlt = atts.find(a => (a.filename || a.name) === altM[1]);
                      if (byAlt?.url) return `<img${before}src="${byAlt.url}"${after}>`;
                    }
                    if (imageAtts[fallbackIdx]?.url) return `<img${before}src="${imageAtts[fallbackIdx++].url}"${after}>`;
                    return `<img${before}src="" alt="[Image unavailable]" style="display:inline-block;padding:2px 6px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:3px;font-size:11px;color:#6b7280"${after}>`;
                  });
                };

                // Strip quoted reply chains; keep originals for toggle
                const { clean: cleanHtml, hasQuotes } = stripEmailQuotes(msg.body_html);
                const displayHtml = resolveCids(quoteVisible ? msg.body_html : cleanHtml);
                const plainText = msg.body_text || '(no content)';

                return (
                  <div key={msg.id} className={`${outbound ? 'bg-primary/5' : 'bg-background'}`}>
                    {/* Clickable header — toggles collapse */}
                    <button
                      onClick={() => toggleCollapse(i)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${outbound ? 'bg-primary/20 text-primary' : 'bg-purple-100 text-purple-700'}`}>
                          {sender.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{sender}</span>
                        {outbound
                          ? <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Sent</span>
                          : <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Received</span>
                        }
                        {isCollapsed && (
                          <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                            {(cleanHtml
                              ? new DOMParser().parseFromString(cleanHtml, 'text/html').body.textContent
                              : plainText
                            ).trim().slice(0, 60) || '…'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {msg.received_at ? new Date(msg.received_at).toLocaleString('en-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        <Icon name={isCollapsed ? 'ChevronDown' : 'ChevronUp'} size={14} className="text-muted-foreground" />
                      </div>
                    </button>

                    {/* Body — hidden when collapsed */}
                    {!isCollapsed && (
                      <div className="px-4 pb-4">
                        {displayHtml ? (
                          <div
                            className="text-sm text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_p]:mb-1 [&_img]:max-w-full [&_img]:rounded"
                            dangerouslySetInnerHTML={{ __html: displayHtml }}
                          />
                        ) : (
                          <p className="text-sm text-foreground leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                            {plainText}
                          </p>
                        )}

                        {/* Show/hide quoted text toggle */}
                        {hasQuotes && (
                          <button
                            onClick={() => toggleQuote(i)}
                            className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Icon name={quoteVisible ? 'ChevronUp' : 'ChevronDown'} size={12} />
                            {quoteVisible ? 'Hide quoted text' : 'Show quoted text'}
                          </button>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border flex flex-wrap gap-2">
                            {msg.attachments.map((att, j) => (
                              <a
                                key={j}
                                href={att.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs border border-border rounded-md px-2.5 py-1.5 bg-muted hover:bg-muted/80 transition-colors"
                              >
                                <Icon name="Paperclip" size={12} />
                                <span className="max-w-[180px] truncate">{att.filename || att.name || `Attachment ${j + 1}`}</span>
                                {att.size && <span className="text-muted-foreground">({(att.size / 1024).toFixed(0)} KB)</span>}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-foreground leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{ticket?.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;