# JKDM Contact Centre — Interaction Storyboard

**3-Stage Customer Journey: FAQ Chatbot → Queue → Live Agent Chat**

---

## STAGE 1 — FAQ Guided Chatbot (Citizen Portal)

Customer visits the JKDM portal. A floating chatbot button appears at the bottom-right.

```
┌─────────────────────────────────────────────────────────────┐
│  JKDM PORTAL                                    [EN] [BM]   │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│   Selamat datang ke Portal Kastam Malaysia                  │
│   Kemukakan aduan, semak status atau cari maklumat          │
│                                                             │
│   [Kemukakan Aduan]  [Semak Status]  [Pangkalan Ilmu]       │
│                                                             │
│                                              ┌──────────┐  │
│                                              │    💬    │  │
│                                              └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 1A — Customer Opens Chatbot

Customer clicks the 💬 button. A chat panel opens — no text input, only menu buttons.

```
┌─────────────────────────────────────────────────────────────┐
│  JKDM PORTAL                                                │
│                                              ┌───────────┐  │
│                                              │ 🤖 Kastam │  │
│                                              │ Chatbot   │  │
│                                              │───────────│  │
│                                              │ Selamat   │  │
│                                              │ datang!   │  │
│                                              │ Pilih     │  │
│                                              │ topik:    │  │
│                                              │           │  │
│                                              │ ┌───────┐ │  │
│                                              │ │Permit │ │  │
│                                              │ │Import/│ │  │
│                                              │ │Eksport│ │  │
│                                              │ └───────┘ │  │
│                                              │ ┌───────┐ │  │
│                                              │ │Pengis-│ │  │
│                                              │ │ytihara│ │  │
│                                              │ │n      │ │  │
│                                              │ └───────┘ │  │
│                                              │ ┌───────┐ │  │
│                                              │ │Pengu- │ │  │
│                                              │ │atkuas-│ │  │
│                                              │ │aan    │ │  │
│                                              │ └───────┘ │  │
│                                              └───────────┘  │
└─────────────────────────────────────────────────────────────┘
  ↑ NO free-text input field. Buttons only.
```

---

### 1B — Customer Selects Category → Sub-items Appear

Customer taps **"Permit Import/Eksport"**. Sub-questions load.

```
                                              ┌───────────┐
                                              │ 🤖 Kastam │
                                              │ Chatbot   │
                                              │───────────│
                                              │ [Kembali] │
                                              │           │
                                              │ Permit    │
                                              │ Import/   │
                                              │ Eksport:  │
                                              │           │
                                              │ ┌───────┐ │
                                              │ │Cara   │ │
                                              │ │memohon│ │
                                              │ │permit?│ │
                                              │ └───────┘ │
                                              │ ┌───────┐ │
                                              │ │Status │ │
                                              │ │permoh-│ │
                                              │ │onan?  │ │
                                              │ └───────┘ │
                                              │ ┌───────┐ │
                                              │ │Dokumen│ │
                                              │ │diperk-│ │
                                              │ │lukan? │ │
                                              │ └───────┘ │
                                              └───────────┘
```

---

### 1C — Customer Gets Answer + Document Link

Customer taps **"Cara memohon permit?"**. Answer appears with a linked KBase document.

```
                                              ┌───────────┐
                                              │ 🤖 Kastam │
                                              │ Chatbot   │
                                              │───────────│
                                              │ ✅ Cara   │
                                              │ memohon   │
                                              │ permit:   │
                                              │           │
                                              │ Permohonan│
                                              │ boleh     │
                                              │ dibuat    │
                                              │ melalui   │
                                              │ sistem    │
                                              │ uCustoms..│
                                              │           │
                                              │ 📎 Panduan│
                                              │ Permohonan│
                                              │ Permit.pdf│
                                              │ [Muat     │
                                              │  Turun]   │
                                              │───────────│
                                              │ Tidak     │
                                              │ berpuas   │
                                              │ hati?     │
                                              │ ┌───────┐ │
                                              │ │Chat   │ │
                                              │ │dengan │ │
                                              │ │Pegawai│ │
                                              │ └───────┘ │
                                              └───────────┘
  ↑ "Chat dengan Pegawai" button always
    appears below every FAQ answer.
```

---

## STAGE 2 — Escalation to Queue

Customer presses **"Chat dengan Pegawai"**. Laravel calls Mitel, interaction is created.

---

### 2A — Queue Position Shown

```
                                              ┌───────────┐
                                              │ 🤖 Kastam │
                                              │ Chatbot   │
                                              │───────────│
                                              │           │
                                              │  ⏳       │
                                              │           │
                                              │ Sedang    │
                                              │ menyambun-│
                                              │ gkan anda │
                                              │ dengan    │
                                              │ pegawai.. │
                                              │           │
                                              │ ┌───────┐ │
                                              │ │ #2    │ │
                                              │ │dalam  │ │
                                              │ │giliran│ │
                                              │ └───────┘ │
                                              │           │
                                              │ Anggaran  │
                                              │ masa:     │
                                              │ ~5 minit  │
                                              │           │
                                              └───────────┘
```

---

### 2A (alt) — No Agents Available

```
                                              ┌───────────┐
                                              │ 🤖 Kastam │
                                              │───────────│
                                              │ Tiada     │
                                              │ pegawai   │
                                              │ tersedia  │
                                              │ sekarang. │
                                              │           │
                                              │ ┌───────┐ │
                                              │ │Tunggu │ │
                                              │ │dalam  │ │
                                              │ │giliran│ │
                                              │ └───────┘ │
                                              │ ┌───────┐ │
                                              │ │Tingg- │ │
                                              │ │alkan  │ │
                                              │ │mesej  │ │
                                              │ └───────┘ │
                                              │ ┌───────┐ │
                                              │ │Cuba   │ │
                                              │ │semula │ │
                                              │ │kemudian│ │
                                              │ └───────┘ │
                                              └───────────┘
```

---

## STAGE 3 — Live Agent Chat

Agent accepts the interaction in the CRM. Two things happen simultaneously:
- **CRM:** Screen pop fires, context panel + ticket form auto-fill, CustomerChat iframe loads
- **Portal:** Customer's chatbot panel transitions to live chat widget

---

### 3A — CRM Agent View (Two-Column Layout)

```
┌─────────────────────────────────────────────────────────────────────┐
│  JKDM CRM                          [Agent: Ahmad | AGT-001] [🟢]   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌───────────────────────────┐  ┌──────────────────────────────┐   │
│  │ 🟢 Live Chat              │  │ 👤 Customer Context          │   │
│  │ ai-chat-service           │  │──────────────────────────────│   │
│  │───────────────────────────│  │ Nama : Ali bin Ahmad         │   │
│  │                           │  │ IC   : 880101-14-1234        │   │
│  │  [Customer, 10:32]        │  │ Topik: Permit Import/Eksport │   │
│  │  ┌─────────────────────┐  │  │──────────────────────────────│   │
│  │  │ I have a problem    │  │  │ FAQ Path:                    │   │
│  │  │ with my import      │  │  │ Permit Import/Eksport        │   │
│  │  │ permit application  │  │  │  → Cara memohon permit?      │   │
│  │  └─────────────────────┘  │  │  ✅ Answer shown             │   │
│  │  [italic: Saya ada        │  │  📎 Panduan Permit.pdf shown │   │
│  │   masalah dengan...]      │  └──────────────────────────────┘   │
│  │                           │                                     │
│  │          [Agent, 10:33]   │  ┌──────────────────────────────┐   │
│  │  ┌─────────────────────┐  │  │ 📚 Knowledge Base            │   │
│  │  │ I understand, let   │  │  │──────────────────────────────│   │
│  │  │ me check your       │  │  │ 🔍 [Search documents...    ] │   │
│  │  │ application status. │  │  │──────────────────────────────│   │
│  │  └─────────────────────┘  │  │ ☰ Panduan Permit Import.pdf  │   │
│  │  [italic: Saya faham,     │  │   PDF • 245kb  [drag to send]│   │
│  │   biar saya semak...]     │  │                              │   │
│  │                           │  │ ☰ Borang K1 - Import.pdf     │   │
│  │───────────────────────────│  │   PDF • 180kb  [drag to send]│   │
│  │ [Type reply in English..] │  │                              │   │
│  │                  [Send]   │  │ ☰ Panduan uCustoms.pdf       │   │
│  │───────────────────────────│  │   PDF • 320kb  [drag to send]│   │
│  │                           │  └──────────────────────────────┘   │
│  │  ⤓ Drop document here     │                                     │
│  │    to send to customer    │  ┌──────────────────────────────┐   │
│  │                           │  │ 🎫 Ticket (Auto-Pop)         │   │
│  └───────────────────────────┘  │──────────────────────────────│   │
│                                 │ Nama    [Ali bin Ahmad      ] │   │
│                                 │ IC      [880101-14-1234     ] │   │
│                                 │ Topik   [Permit Import      ] │   │
│                                 │ Kategori[Permit Inquiry    ▼] │   │
│                                 │ FAQ Path[auto-filled...     ] │   │
│                                 │ Resolusi[                   ] │   │
│                                 │                    [Hantar]   │   │
│                                 └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

  LEFT COLUMN                          RIGHT COLUMN
  • CustomerChat.tsx iframe            • Context panel (from Mitel VariableData)
  • Agent types in English             • KBase panel (draggable document cards)
  • Customer sees Bahasa Melayu        • Ticket form (auto-popped, auto-filled)
  • Drop zone for document sharing
```

---

### 3B — Customer View in Portal (Stage 3 Transition)

The chatbot panel transitions to a live chat widget. Customer now types freely.

```
┌─────────────────────────────────────────────────────────────┐
│  JKDM PORTAL                                                │
│                                              ┌───────────┐  │
│                                              │ 👨‍💼 Pegawai│  │
│                                              │ Kastam    │  │
│                                              │ [🟢 Dalam │  │
│                                              │  talian]  │  │
│                                              │───────────│  │
│                                              │ [Sys,10:32│  │
│                                              │ Pegawai   │  │
│                                              │ Ahmad     │  │
│                                              │ telah     │  │
│                                              │ menyambung│  │
│                                              │ ─────     │  │
│                                              │ [Agt,10:33│  │
│                                              │ ┌───────┐ │  │
│                                              │ │Saya   │ │  │
│                                              │ │faham, │ │  │
│                                              │ │biar   │ │  │
│                                              │ │saya   │ │  │
│                                              │ │semak..│ │  │
│                                              │ └───────┘ │  │
│                                              │ [italic:  │  │
│                                              │ I underst.│  │
│                                              │ let me    │  │
│                                              │ check...] │  │
│                                              │───────────│  │
│                                              │[Taip mese]│  │
│                                              │       [➤] │  │
│                                              └───────────┘  │
└─────────────────────────────────────────────────────────────┘
  ↑ Customer types in Malay
    Agent sees English translation
    Both parties see original + translated text
```

---

### 3C — Agent Shares a Document (Drag and Drop)

Agent drags **"Borang K1 - Import.pdf"** from the KBase panel and drops it on the drop zone.

```
  KBase Panel                    Drop Zone (below chat iframe)
  ┌──────────────────┐
  │ ☰ Borang K1.pdf  │ ─────drag────►  ┌─────────────────────┐
  │   [drag to send] │                  │ 📂 DRAG ACTIVE      │
  └──────────────────┘                  │ Drop to send to     │
                                        │ customer            │
                                        └─────────────────────┘
                                                 │ drop
                                                 ▼
                                        ┌─────────────────────┐
                                        │ ✓ Sent: Borang K1   │
                                        └─────────────────────┘
                                          (resets after 3 sec)
```

Customer instantly sees in their chat:

```
                                              │ [Agt,10:35]       │
                                              │ ┌───────────────┐ │
                                              │ │ 📎 Borang K1  │ │
                                              │ │ - Import.pdf  │ │
                                              │ │ PDF • 180kb   │ │
                                              │ │ [Muat Turun]  │ │
                                              │ └───────────────┘ │
```

---

### 3D — Chat Ends / Ticket Submission

Agent or customer ends the chat. Ticket form's resolution notes field auto-focuses.

```
┌───────────────────────────────────────────────────────────────┐
│  CRM — Ticket Form                                            │
│  ─────────────────────────────────────────────────────────   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ 🎫 Ticket #TKT-2026-0042           [🔴 Sesi Tamat]   │   │
│  │───────────────────────────────────────────────────────│   │
│  │ Nama     Ali bin Ahmad                                │   │
│  │ IC       880101-14-1234                               │   │
│  │ Topik    Permit Import                                │   │
│  │ Kategori Permit Inquiry                               │   │
│  │ FAQ Path Permit Import/Eksport → Cara memohon permit? │   │
│  │          ✅ Answer shown | 📎 Panduan Permit.pdf shown │   │
│  │                                                       │   │
│  │ Nota Resolusi:                                        │   │
│  │ ┌─────────────────────────────────────────────────┐  │   │
│  │ │ ▌ (cursor auto-focused here when chat ends)     │  │   │
│  │ │                                                 │  │   │
│  │ └─────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │                                          [Hantar]    │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Complete Flow Summary

```
CITIZEN PORTAL                 LARAVEL (API)              CRM (AGENT)
──────────────                 ─────────────              ───────────
[1] Opens chatbot
[1] Selects FAQ category
[1] Selects FAQ question
[1] Gets KBase answer
[1] Presses "Chat dengan       →  POST /api/chatbot/
    Pegawai"                      escalate
                               →  MitelService::
                                  escalateToAgent()
                               →  POST /api/v1/
                                  openmedia (Mitel)
[2] Sees queue position  ←    ←  returns {Id, Position}

... agent accepts in Ignite ...

                               ←  Mitel webhook fires
                               ←  MitelWebhookController
                               ←  broadcast(
                                  MitelInteractionUpdated)
                                                           [3] Echo listener fires
                                                           [3] Context panel fills
                                                               (Name, IC, FaqPath)
                                                           [3] Ticket form auto-pops
                                                           [3] CustomerChat iframe
                                                               loads with sessionId=
                                                               ConversationId

[3] Chatbot transitions to
    live chat (CustomerChat
    iframe)
[3] Customer sends message →  ai-chat-service WS    →  [3] Agent receives
    (Malay)                   translates: MS→EN          in English
                                                      [3] Agent replies (English)
[3] Customer receives    ←    ai-chat-service WS    ←  
    in Malay                  translates: EN→MS

[3] Agent drags KBase doc                            →  POST /api/kbase/send
    to drop zone                                     →  Laravel generates
                                                        signed URL
                                                     →  ai-chat-service WS
                                                        sends link message
[3] Customer sees PDF    ←
    download link

... chat ends ...
                               ←  Mitel webhook IsCleared
                                                      [3] Resolution notes
                                                          field auto-focuses
                                                      [3] Agent completes
                                                          + submits ticket
```
