# System Architecture & Workflow Diagrams

## 1. Message Reception & AI Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WhatsApp Customer                            │
│                  Sends Message                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│               WhatsApp Business API                             │
│              Cloud Webhook Endpoint                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│         POST /api/webhooks/whatsapp                             │
│    - Verify webhook token                                       │
│    - Extract message & contact info                             │
│    - Store in whatsapp_messages table                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│        POST /api/ai/generate-response                           │
│    - Send to Claude AI API                                      │
│    - Include company context                                    │
│    - Request Arabic response                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│            Claude API (Anthropic)                               │
│    Return professional customer response                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│     Store in whatsapp_pending_reviews                           │
│    - Status: 'pending'                                          │
│    - AI Suggestion ready for review                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│          Dashboard Notification                                 │
│    Settings → واتساب → الرسائل                                 │
│    "3 messages pending review"                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Manual Review & Send Workflow

```
┌──────────────────────────────────────────────────────────┐
│   Agent Opens WhatsApp Review Panel                      │
│   Settings → واتساب → الرسائل                           │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │  Review Message Card        │
        │ ├─ Customer Name            │
        │ ├─ Phone Number             │
        │ ├─ Incoming Message         │
        │ ├─ AI Suggested Response    │
        │ └─ Action Buttons           │
        └─────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ↓            ↓            ↓
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │ Approve    │ │   Edit     │ │   Reject   │
    │ (Send as   │ │   (Modify  │ │   (Don't   │
    │  is)       │ │    text)   │ │    send)   │
    └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                          ↓
               ┌──────────────────────┐
               │ UPDATE Status        │
               │ From: 'pending'      │
               │ To: 'approved'       │
               └──────────┬───────────┘
                          │
                          ↓
            ┌──────────────────────────┐
            │ POST /api/whatsapp/      │
            │       messages           │
            │ - Phone number           │
            │ - Message text           │
            │ - Message ID             │
            └──────────┬───────────────┘
                       │
                       ↓
           ┌───────────────────────────┐
           │ WhatsApp Business API     │
           │ Send to customer          │
           └──────────┬────────────────┘
                      │
                      ↓
           ┌───────────────────────────┐
           │ Customer receives reply   │
           │ on WhatsApp               │
           └───────────────────────────┘
```

## 3. Auto Follow-up Workflow

```
┌────────────────────────────────────────────────────────┐
│    Scheduled Follow-up Date Arrives                    │
│    (from follow_ups table)                             │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │ System Checks Queue:         │
        │ - Current date = schedule?   │
        │ - Generate follow-up msg     │
        │ - Prepare AI context         │
        └──────────────────┬───────────┘
                           │
                           ↓
            ┌──────────────────────────┐
            │ POST /api/ai/generate-   │
            │       response           │
            │ (With follow-up context) │
            └──────────────┬───────────┘
                           │
                           ↓
                ┌──────────────────────┐
                │ Claude generates     │
                │ follow-up message    │
                └──────────┬───────────┘
                           │
                           ↓
           ┌───────────────────────────────┐
           │ Dashboard Shows Scheduled     │
           │ Settings → واتساب →          │
           │ المتابعات                    │
           │ ├─ Customer Name             │
           │ ├─ Scheduled Date            │
           │ ├─ Message Content           │
           │ ├─ Status: "قيد الانتظار"    │
           │ └─ Button: "إرسال الآن"      │
           └───────────┬───────────────────┘
                       │
    ┌──────────────────┴──────────────────┐
    │                                     │
    ↓                                     ↓
Auto-Send              Manual Send Now
    │                                     │
    ├─ Post to WhatsApp API              └─ Click "إرسال الآن"
    ├─ Track delivery                       │
    ├─ Update status to 'sent'              ↓
    └─ Log in database              Post to WhatsApp API
                                         │
                                         ↓
                               Customer receives message
```

## 4. Issabel Integration Flow

```
┌──────────────────────────────────────┐
│ Settings → التكاملات                 │
│ Enter Issabel Configuration          │
└────────────────┬─────────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Test Issabel Connection    │
    │ POST /api/integrations/    │
    │       issabel              │
    │ action: 'test'             │
    └────────────┬───────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Issabel API Server         │
    │ Verify credentials         │
    │ Check extension            │
    └────────────┬───────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Success ✓ or Fail ✗        │
    │ Display result on UI       │
    └────────────────────────────┘

Available Actions:
├─ test: Verify Issabel connection
├─ sync: Sync leads to Issabel CRM
└─ dial: Click-to-call from lead
```

## 5. AutoDialer Integration Flow

```
┌──────────────────────────────────────┐
│ Click Lead → Call Now                │
│ or Settings → AutoDialer Config      │
└────────────────┬─────────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ POST /api/integrations/    │
    │       autodial             │
    │ action: 'initiate'         │
    │ phone: [customer number]   │
    └────────────┬───────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ SIP Server / PBX           │
    │ Initiate outbound call     │
    │ Generate call ID           │
    └────────────┬───────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ Ring customer's phone      │
    │ Monitor call status        │
    │ Record call ID             │
    └────────────┬───────────────┘
                 │
                 ├─ Customer answers
                 │     │
                 │     ↓
                 │ Connected state
                 │ Display call timer
                 │ Show hang-up button
                 │
                 ├─ Customer doesn't answer
                 │     │
                 │     ↓
                 │ Call failed
                 │ Log attempt
                 │
                 └─ Voicemail
                       │
                       ↓
                    Leave message
```

## 6. Complete Integration Map

```
                        ┌─────────────────────────────┐
                        │   Your CRM Dashboard        │
                        └─────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
        WhatsApp    │         Issabel PBX    AutoDialer
        Messages    │        (Optional)      (Optional)
                    │
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ Webhooks │    │ Settings │    │ Quick    │
        │ Receiver │    │ Panel    │    │ Actions  │
        │          │    │          │    │          │
        └──────────┘    └──────────┘    └──────────┘
             │               │               │
             └───────────┬───┴───────────────┘
                         │
                ┌────────┴────────┐
                │                 │
         ┌──────▼──────┐  ┌───────▼───────┐
         │   Claude    │  │   Database    │
         │    AI       │  │  (PostgreSQL) │
         │  (Anthropic)│  │               │
         └──────┬──────┘  └───────┬───────┘
                │                 │
                └────────┬────────┘
                         │
                    ┌────▼────┐
                    │WhatsApp  │
                    │Response  │
                    │to User   │
                    └──────────┘
```

## Key Workflows Summary

| Workflow | Trigger | Steps | Outcome |
|----------|---------|-------|---------|
| **Receive Message** | Customer sends WhatsApp | Webhook → Store → AI Generate | Message in review queue |
| **Manual Review** | Agent clicks approve | Review → Edit/Approve → Send | Response sent to customer |
| **Auto Follow-up** | Scheduled date arrives | Queue check → Generate → Send | Customer receives message |
| **Issabel Sync** | Click sync button | Connect to API → Upload leads | Leads appear in Issabel |
| **Auto Dial** | Click "Call Now" | Send to SIP → Ring customer | Call initiated & monitored |

---

**This architecture ensures:**
- ✅ Manual control over customer responses (AI suggestions, human approval)
- ✅ Automated follow-ups on schedule (no manual intervention needed)
- ✅ Professional customer service flow
- ✅ Integration with existing PBX systems
- ✅ Scalable and maintainable code structure
