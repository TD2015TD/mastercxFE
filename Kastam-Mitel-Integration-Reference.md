# Replacing Ignite with a direct Mitel integration

Internal reference — kastam CRM

Everything extracted from IgniteCx's bundled code about how it talks to the Mitel backend —
agent/ACD state, OpenMedia conversations, real-time events, and the SIP softphone — organized
so it can be rebuilt inside kastam CRM without Ignite in the middle.

Status legend used throughout: **[confirmed]** seen directly in code · **[unverified]** inferred,
needs testing against a real server · **[config]** admin setup required, not a code question.

---

## 00. Overview

Ignite is only a client. The ACD engine, queueing, and routing all live on Mitel's backend
(MiVoice Business / MiContact Center Business) and don't care which client an agent uses to
answer. Ignite talks to that backend through three independent pieces — replacing Ignite means
kastam CRM has to speak the same three languages directly.

| Piece | What it does | Transport |
|---|---|---|
| **Auth** | `/AuthorizationServer` | OAuth-style bearer token, shared with kastam's existing login |
| **MiccSdk** | ACD agent state, OpenMedia & conversations, screen-pop data | REST + SignalR (WebSocket) |
| **Softphone** | Actual call audio | SIP (JsSIP) over WebSocket, WebRTC media |

---

## 01. Call flow

Routing happens at the switch, before either leg below is opened. When an agent is selected,
two independent legs fire at once — one carries audio, the other carries the screen-pop and
state.

```
External caller (PSTN / SIP trunk)
        │
        ▼
MiVoice Business / MiContact Center — ACD routing engine
        │
        ├── Audio leg ─── SIP INVITE → JsSIP UA (softphone) → WebRTC media (mic/speaker)
        │
        └── Data leg ──── SignalR push → agentHub / queueHub → kastam CRM UI
                           (caller ID, history, accept button)
```

> If agents keep answering on a physical desk phone or SIP hardphone registered to MiVB, the
> audio leg is unnecessary — kastam only needs the data leg (MiccSdk) for screen-pop and state.
> Building the softphone leg is only required for in-browser calling.

---

## 02. Authorization server

Already implemented in `Scripts/micc.auth.js` — kastam's existing login reuses this as-is,
nothing new to build here.

| Item | Value |
|---|---|
| Token validate | `GET {authServerUrl}/api/account` |
| Header | `Authorization: Bearer <access_token>` |
| Default auth host | `{origin}/authorizationserver` |
| localStorage keys | `ls.access_token`, `ls.refresh_token`, `ls.token_expires_in`, `ls.username` |
| Mirror cookie | `CCMWebEmployeePortalToken` (7-day expiry, same value as access token) |

---

## 03. Base service URLs

| Prefix | Purpose |
|---|---|
| `/MiccSdk/api/v1{path}` | Agent state, conversations, queues — the main surface kastam needs |
| `/MiccConfig/api/v1{path}` | Configuration/admin data |
| `/CloudlinkProxy/api/v1{path}` | Token exchange: `/authorization/token/{id}/{type}` |
| `/AuthorizationServer{path}` | Login/token |
| `wss://.../MiccSdk/signalr` | Real-time hub connection (negotiate at `.../signalr/negotiate`) |

---

## 04. Agent / ACD state

Logging into the queue, going not-ready, clearing wrap-up — all one resource.

| Method | Path | Notes |
|---|---|---|
| `PUT` | `/agents/{deviceId}/state` | Body: `{ state, availableReason }` |
| `PUT` | `/agents/state` | Batch variant — array of `{ deviceId, ... }` |
| `GET` | `/agents/{id}/state` | Read current state |
| `GET` | `/agents/states` | Read all agents |

**Observed `state` values** — `[confirmed]` literals seen in actual PUT calls: `"Login"`,
`"Available"`, `"Offline"`, `"ClearWorkTimer"`.

Full state vocabulary (from Ignite's UI labels, i18n keys `res_AcdState_*`) — map your own
`availableReason` values against these:

| State | Meaning |
|---|---|
| `Acd` / `AcdHold` | On an ACD call / on hold |
| `NonAcd` / `NonAcdHold` | On a direct (non-queued) call / on hold |
| `Outbound` / `OutboundHold` | Outbound call / on hold |
| `Incoming` | Ringing |
| `CampOn` | Camped on a busy destination |
| `WorkTimer` | Post-call wrap-up |
| `MakeBusy` / `SystemMakeBusy` | Agent-set / system-forced not-ready |
| `DoNotDisturb` | DND |
| `Idle` / `OffHook` | Available / handset off-hook |
| `LoggedOut` / `LoggedInNotPresent` | Logged out / logged in but away |

---

## 05. OpenMedia & conversations

> **Key finding:** OpenMedia is not a separate API. It's one value of a shared `mediaType`
> field (alongside `Voice`, `Chat`, `Email`, `Sms`) on the same generic `conversations`
> resource every media type uses.

| Method | Path | Notes |
|---|---|---|
| `POST` | `/employees/me/conversations` | Offer a conversation to the logged-in agent |
| `POST` | `/agents/{agentId}/conversations` | Push a conversation to a specific agent — this is the one kastam calls to hand off an OpenMedia interaction |
| `PUT` | `/conversations/{conversationId}` | Update state — accept / reject / transfer / close |
| `GET` | `/queues/{id}/conversations` | List conversations sitting in a queue |

**Requirements before an agent can receive OpenMedia** — agents are filtered with the OData
clause `isEnabledForOpenMedia eq true` against `/employees` — confirm the capability flag is
turned on for each agent in MiCC admin before testing, otherwise pushes will silently fail or
be rejected. `[config]`

`[unverified]` exact payload shape for `POST /agents/{id}/conversations` beyond the `mediaType`
field — capture a real Ignite OpenMedia payload from the Network tab to fill in
customer/subject/source fields correctly.

---

## 06. Real-time (SignalR)

Classic ASP.NET SignalR 2.4 (same version already vendored in
`Scripts/jquery.signalR-2.4.2.js`) — not SignalR Core. Hub at `/MiccSdk/signalr`.

**Hubs:** `employeeHub` · `agentHub` · `queueHub` · `callbackHub` · `endpointHub` ·
`extensionHub` · `statusHub`

**Events worth subscribing to:**

| Hub | Event | Fires when |
|---|---|---|
| `agentHub` | `onAgentStateChanged` | Any agent's ACD state changes |
| `queueHub` | `queueStateChanged` | Queue-level stats change (waiting count, longest wait...) |
| `queueHub` | `queueConversationChanged` | A conversation in a monitored queue is added/updated — this is the OpenMedia/call arrival signal |
| `queueHub` | `queueConversationRemoved` | Conversation leaves the queue (answered elsewhere, abandoned) |
| `employeeHub` | `employeeConversationChanged` | A specific agent's own conversation list changes |

Before subscribing you register interest with methods like `addStateMonitor`,
`addConversationMonitor`, `addGroupConversationMonitor` — pattern is `add*Monitor` to start,
matching `remove*Monitor` to stop.

`[unverified]` hub authentication — Ignite likely passes the bearer token as a query-string
parameter on connect (typical for SignalR 2.x), but the exact parameter name wasn't confirmed.
Check the `negotiate` request's query string in DevTools.

---

## 07. Softphone (SIP)

`unify-phone-sdk.js` actually bundles **two unrelated systems**. Only one of them carries ACD
calls.

| System | What it is | Use for ACD calls? |
|---|---|---|
| **Circuit / UnifyPhone** | Proprietary WebSocket + OAuth, connects to Mitel's Circuit cloud (`*.circuit.com` and similar) | **Skip** — separate UC channel, not the call path |
| **JsSIP** | Standard open-source SIP library, bundled unminified inside `chunk-RWRBDO2X.js` | **Use this** — real SIP REGISTER + digest auth to Mitel's gateway |

> Because the real call path is stock JsSIP, kastam doesn't need to reverse-engineer any
> signaling logic — just the two provisioning calls below, then a normal JsSIP setup exactly
> as documented at jssip.net.

**Provisioning**

| Method | Path | Returns |
|---|---|---|
| `POST` | `/agents/{agentId}/integratedSoftphone/account` | `accountId`, `gatewayMediaServerDomain`, `gatewayMediaServerPort`, `integratedSoftphonePassword` |
| `GET` | `/agents/{agentId}/integratedSoftphone/turn?server={domain}` | `urls`, `username`, `credential`, `ttl` |

**UA configuration**

```js
sockets:          [new JsSIP.WebSocketInterface(
                    "wss://" + gatewayMediaServerDomain + ":" + gatewayMediaServerPort)]
uri:              "sip:" + accountId + "@" + gatewayMediaServerDomain
registrar_server: gatewayMediaServerDomain
register:         true
register_expires: 300

// password arrives either as a plain string, or pre-hashed as "md5a1: <32-hex>"
password:         integratedSoftphonePassword          // plain form
ha1:              integratedSoftphonePassword.slice(7) // "md5a1: " form -- set realm too
realm:            gatewayMediaServerDomain
```

Custom SIP headers Mitel's gateway expects on REGISTER:

```
X-WebRTC-Client-Id: {accountId}
X-WebRTC-Supported: keepalive
```

`[unverified]` a third header, `X-Aastra-Id`, also appears near this logic — value/format not
confirmed. Add it if registration is rejected without it.

---

## 08. Call control

| Action | JsSIP session method |
|---|---|
| Answer | `session.answer({ mediaConstraints: { audio: true, video: false } })` |
| Hang up | `session.terminate()` |
| Hold / unhold | `session.hold()` / `session.unhold()` |
| Send DTMF | `session.sendDTMF(tone)` |
| Transfer | `session.refer(target)` |

---

## 09. Code skeletons in this project

Starting points already in `Scripts/` — every one needs the `[unverified]` items above
confirmed against a real environment before it's production-ready.

| File | Status | Covers |
|---|---|---|
| `Scripts/micc.auth.js` | existing | Token cache, validate, logout — unchanged |
| `Scripts/micc.acd.js` | skeleton | Agent state (login/logout/setAvailable/clearWorkTimer), conversations, SignalR connect |
| `Scripts/micc.softphone.js` | skeleton | Provisioning + JsSIP registration + call control. Requires `JsSIP` loaded globally (jssip.net) |

---

## 10. Open questions before production

Everything below was inferred from minified code, not confirmed against a live server response.
Capture real traffic (DevTools Network + WS frames) while using Ignite to close each of these
out.

- [ ] **Exact base path prefix** — confirm `/MiccSdk/api/v1` is complete and not missing a tenant/site segment.
- [ ] **Full conversation payload** — fields beyond `mediaType` for `POST /agents/{id}/conversations`: customer id, subject, source, priority.
- [ ] **SignalR auth** — confirm how the bearer token is passed on hub connect (query string vs header).
- [ ] **X-Aastra-Id header** — confirm whether it's required and what value the gateway expects.
- [ ] **isEnabledForOpenMedia** `[config]` — must be turned on per-agent in MiCC admin before any OpenMedia push will succeed.
- [ ] **Password format** — confirm whether your tenant returns plain password or the `md5a1:` pre-hashed form.

---

## 11. Licensing

Reverse-engineering Ignite's bundled code to build this equivalent integration was confirmed as
permitted by Telediant (the Mitel reseller/integrator) before this work started.

---

*Compiled from static analysis of the IgniteCx bundle — treat every endpoint here as a starting
point to verify, not a documented contract.*
