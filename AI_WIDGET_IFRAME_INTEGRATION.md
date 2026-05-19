# JKDM Contact Centre — AI Chat Widget Integration Guide

**Platform:** Laravel 10 | React (Vite) | FastAPI ai-chat-service | NanoT5 EN↔MS  
**Compliance Deadline:** 14 May 2026

---

## System Overview

The chat system follows a strict **3-stage flow**. The customer always starts at Stage 1
and can only reach Stage 3 (live agent) after going through Stage 2 (Mitel queue).

```
STAGE 1 — FAQ Guided Chatbot        (citizen-portal)
    ↓  customer presses "Chat dengan Pegawai"
STAGE 2 — Mitel Escalation Queue    (Laravel → POST /api/v1/openmedia)
    ↓  agent accepts interaction, screen pop fires
STAGE 3 — Live Agent Chat           (ChatWidget.tsx + CustomerChat.tsx iframe)
              connected via ai-chat-service WebSocket
              EN↔MS auto-translation via NanoT5
```

---

## Stage 3 — Live Chat Components

Two React components handle the live chat:

| Component | Location | Mode | Language |
|---|---|---|---|
| `ChatWidget.tsx` | `frontend/src/components/ChatWidget/` | Agent (CRM) | English |
| `CustomerChat.tsx` (iframe) | Served from `ai-chat-service` host | Customer (portal) | Bahasa Melayu |

Both connect to the same WebSocket endpoint:
```
wss://chat.telediant.com.my/ws/agent-customer-chat
```

The **`sessionId`** is the Mitel interaction ID — this is what links the agent and customer
into the same conversation room. It is passed via Mitel `VariableData` during the screen pop.

---

## CRM Agent View Layout (Stage 3)

The CRM agent view is two columns. Both columns are visible simultaneously.

```
┌─────────────────────────────┬───────────────────────────────┐
│  LEFT: ChatWidget.tsx        │  RIGHT: Context + KBase +     │
│  (ai-chat-service WebSocket) │  Ticket Form                  │
│                              │                               │
│  Agent types in English      │  [Customer Context Panel]     │
│  → translated to Malay       │  Name, IC, FAQ path taken     │
│  for customer                │  (pre-filled from VariableData│
│                              │  screen pop)                  │
│  Customer types in Malay     │                               │
│  → translated to English     │  [KBase Document Panel]       │
│  for agent                   │  Searchable, draggable docs   │
│                              │                               │
│                              │  [Ticket Form]                │
│                              │  Auto-pops when interaction   │
│                              │  is offered. Pre-filled from  │
│                              │  VariableData.                │
└─────────────────────────────┴───────────────────────────────┘
```

---

## Embedding CustomerChat.tsx in the CRM (Agent Side)

The customer-facing chat widget is embedded as an iframe inside the CRM agent view.
The iframe `src` comes from `config('services.ai_chat.customer_widget_url')` in Laravel.

```html
<!-- resources/views/crm/agent.blade.php -->
<div class="panel panel-chat-widget">
  <div class="panel-header">
    <span class="indicator" id="chat-status"></span>
    <strong>Live Chat — ai-chat-service</strong>
  </div>
  <iframe
    id="chat-widget-frame"
    src="{{ config('services.ai_chat.customer_widget_url') }}"
    allow="microphone"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
  ></iframe>
</div>
```

In `.env` / `config/services.php`:
```php
// config/services.php
'ai_chat' => [
    'url'                  => env('AI_CHAT_SERVICE_URL', 'http://localhost:8000'),
    'ws_url'               => env('AI_CHAT_SERVICE_WS_URL', 'ws://localhost:8000'),
    'customer_widget_url'  => env('AI_CHAT_CUSTOMER_WIDGET_URL', 'http://localhost:3001'),
],
```

```ini
# api/.env
AI_CHAT_SERVICE_URL=http://localhost:8000
AI_CHAT_SERVICE_WS_URL=ws://localhost:8000
AI_CHAT_CUSTOMER_WIDGET_URL=https://chat.telediant.com.my/customer.html
```

---

## Embedding CustomerChat.tsx in the Citizen Portal (Customer Side)

The citizen portal embeds the customer widget as an iframe. The `sessionId` passed here
**must match** the Mitel interaction ID — this is what routes messages to the correct agent.

```tsx
// citizen-portal/src/pages/components/LiveChatPanel.tsx
const sessionId  = interaction?.mitelInteractionId;   // from Mitel escalation response
const citizenId  = citizen?.ic_number || citizen?.id;

const widgetUrl =
  `https://chat.telediant.com.my/customer.html` +
  `?sessionId=${encodeURIComponent(sessionId)}` +
  `&userId=${encodeURIComponent(citizenId)}` +
  `&aiChatServiceUrl=wss://chat.telediant.com.my`;

return (
  <iframe
    src={widgetUrl}
    style={{ width: '100%', height: '500px', border: 'none' }}
    title="Live Chat"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
  />
);
```

---

## How `sessionId` Links Customer ↔ Agent

```
Stage 2: Customer escalates
  → Laravel calls POST /api/v1/openmedia on Mitel
  → Mitel returns { Id: "MITEL-INTERACTION-123", PositionInQueue: 2 }
  → sessionId = "MITEL-INTERACTION-123"

Stage 3: Agent accepts in CRM
  → Mitel webhook fires → Laravel broadcasts MitelInteractionUpdated
  → CRM agent view loads CustomerChat iframe with sessionId="MITEL-INTERACTION-123"

Stage 3: Customer in portal
  → iframe loads with sessionId="MITEL-INTERACTION-123"

ai-chat-service sees both on same sessionId → routes messages + translates
```

> **Critical:** Never use ticket ID as `sessionId`. Use the **Mitel interaction ID** (`Id` from
> the `/api/v1/openmedia` response) so the ai-chat-service can correlate the session.

---

## Screen Pop — How Agent Gets Customer Context

When Mitel routes the interaction, a webhook event pushes to the CRM.
Laravel broadcasts it via Soketi/Pusher. The agent's browser listens and auto-fills
the context panel and ticket form.

```js
// resources/js/crm-agent.js
window.Echo.channel('mitel-events')
  .listen('MitelInteractionUpdated', (event) => {

    if (event.ConversationState === 'ACD') {
      const vars = event.Variables || {};

      // Fill customer context panel
      document.getElementById('customer-name').textContent = vars.Name || '';
      document.getElementById('faq-path').innerHTML =
        (vars.FaqPath || '').replace(/\n---\n/g, '<hr>').replace(/\n/g, '<br>');

      // Auto-pop and pre-fill ticket form
      document.getElementById('ticket-panel').style.display = 'block';
      document.getElementById('f-interaction-id').value = event.ConversationId;
      document.getElementById('f-name').value  = vars.Name  || '';
      document.getElementById('f-ic').value    = vars.IC    || '';
      document.getElementById('f-topic').value = vars.Topic || '';
      document.getElementById('f-faq-path').value = vars.FaqPath || '';

      // Load the customer chat iframe with the correct sessionId
      const iframe = document.getElementById('chat-widget-frame');
      iframe.src = `https://chat.telediant.com.my/customer.html`
        + `?sessionId=${encodeURIComponent(event.ConversationId)}`
        + `&aiChatServiceUrl=wss://chat.telediant.com.my`;
    }

    // Chat ended — prompt agent to complete resolution notes
    if (event.IsCleared === true) {
      document.getElementById('f-resolution').focus();
    }
  });
```

---

## Where `agent_code` Comes From (React / CRM Frontend)

After login, the JWT contains the full agent object. Use `authService.getCurrentUser()`:

```ts
// frontend/src/services/authService.ts
const user = authService.getCurrentUser();

user.agent.agent_code    // "AGT-001"   — the agent's unique code
user.agent.employee_id   // "EMP-0042"  — HR employee ID
user.agent.mitel_agent_id // links to Mitel agent identity
user.id                  // numeric DB id
```

Pass `agent_code` as the `userId` when constructing the agent-side iframe URL or
WebSocket connect message.

---

## ChatWidget.tsx — Agent WebSocket Connect Message

The existing [ChatWidget.tsx](src/components/ChatWidget/ChatWidget.tsx) already sends
the correct connect payload. The `session_id` must be the **Mitel interaction ID**:

```ts
ws.send(JSON.stringify({
  type: 'connect',
  sender: 'agent',
  session_id: mitelInteractionId,   // NOT a random ID — must be Mitel's ConversationId
  user_id: user?.agent?.agent_code, // e.g. "AGT-001"
}));
```

---

## Security Requirements (from Section 11 of JKDM TID)

### iframe / CORS
- The `ai-chat-service` host **must NOT** set `X-Frame-Options: DENY` — this would
  block the iframe from loading in the portal.
- The iframe `sandbox` attribute must include:
  `allow-same-origin allow-scripts allow-forms allow-popups`
- `ai-chat-service` CORS must whitelist both the CRM domain and the portal domain:
  ```
  https://cxsuite.telediant.com.my
  https://portal.telediant.com.my
  ```

### WebSocket
- In production, always use `wss://` (TLS), never `ws://`.
- The ai-chat-service must **not** be exposed to the public internet — restrict to
  internal network or VPN only.

### Document Sharing (KBase)
- Kbase documents are served via **time-limited Laravel signed URLs** (expire 24 hours).
- Documents are never publicly accessible via direct URL.
- Every share is logged to `kbase_share_logs` with `agent_id`, `interaction_id`,
  `document_id`, `shared_at`.

---

## Environment Variables Reference

### `api/.env`
```ini
# ai-chat-service
AI_CHAT_SERVICE_URL=http://localhost:8000
AI_CHAT_SERVICE_WS_URL=ws://localhost:8000
AI_CHAT_CUSTOMER_WIDGET_URL=https://chat.telediant.com.my/customer.html

# Mitel CX SDK
MITEL_SDK_URL=http://<mitel-server>/miccsdk
MITEL_API_TOKEN=<bearer-token>
MITEL_WEBHOOK_SECRET=<shared-secret>
MITEL_ESCALATION_QUEUE=ChatbotEscalation
MITEL_IGNITE_URL=https://<mitel-server>/ignite

# WebSocket broadcast (Soketi)
BROADCAST_DRIVER=pusher
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_APP_ID=jkdm-crm
PUSHER_APP_KEY=<key>
PUSHER_APP_SECRET=<secret>

# Cache
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
```

### `frontend/.env`
```ini
VITE_AI_CHAT_SERVICE_URL=wss://chat.telediant.com.my
```

### `chat-widget/.env`
```ini
VITE_AI_CHAT_SERVICE_URL=wss://chat.telediant.com.my
```

---

## Deployment

| App | Built output | Served at |
|---|---|---|
| `chat-widget` | `chat-widget/dist/` | `https://chat.telediant.com.my` |
| `frontend` (CRM) | `frontend/dist/` | `https://cxsuite.telediant.com.my` |
| `citizen-portal` | `citizen-portal/dist/` | `https://portal.telediant.com.my` |
| `ai-chat-service` | FastAPI (Python) | `https://chat.telediant.com.my` (backend) |

Rebuild chat-widget after any source change:
```bash
cd /var/www/cxsuite.telediant.com.my/chat-widget
npm run build
```

---

## Quick Reference

| What | Value |
|---|---|
| Agent widget | `ChatWidget.tsx` — already embedded in CRM frontend |
| Customer widget | `CustomerChat.tsx` — served from ai-chat-service, embedded via `<iframe>` |
| `sessionId` | Mitel `ConversationId` from `/api/v1/openmedia` response |
| Agent `userId` | `user.agent.agent_code` from `authService.getCurrentUser()` |
| Customer `userId` | Citizen IC number or user ID |
| WebSocket endpoint | `wss://chat.telediant.com.my/ws/agent-customer-chat` |
| iframe `sandbox` | `allow-same-origin allow-scripts allow-forms allow-popups` |
| Translation model | `mesolitica/nanot5-base-malaysian-translation-v2.1` (~500MB) |
