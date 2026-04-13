# WhatsApp + AI Integration Guide

## Overview

This system integrates WhatsApp messaging, Claude AI for intelligent responses, Issabel PBX for calling, and AutoDialer automation into your CRM dashboard.

## Features

### 1. **WhatsApp Messaging**
- Receive incoming messages via webhook
- Store message history in database
- Send messages via WhatsApp Business API

### 2. **AI-Powered Responses**
- Claude 3.5 Sonnet generates professional customer responses
- Egyptian Arabic dialect support
- Context-aware replies about training programs

### 3. **Manual Review Panel**
- Review all AI-generated suggestions before sending
- Edit responses as needed
- Approve, reject, or modify suggestions

### 4. **Auto Follow-ups**
- Automatic sending of scheduled follow-up messages
- Integration with `follow_ups` database table
- Manual override to send immediately

### 5. **Issabel Integration**
- Connect to Issabel PBX system
- Sync CRM leads with Issabel
- Click-to-call functionality

### 6. **AutoDialer Integration**
- Automated outbound calling
- SIP-based integration
- Call status monitoring

## Setup Instructions

### Environment Variables

Add these to your `.env.local`:

```bash
# WhatsApp Cloud API
WHATSAPP_VERIFY_TOKEN=tavoc_whatsapp_webhook_2026
WHATSAPP_ACCESS_TOKEN=your_whatsapp_business_api_token
WHATSAPP_PHONE_NUMBER_ID=your_business_phone_number_id

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Issabel (optional)
ISSABEL_SERVER_URL=https://your-issabel-server.com
ISSABEL_API_KEY=your_issabel_api_key

# AutoDialer (optional)
AUTODIAL_SIP_SERVER=your-sip-server.com
AUTODIAL_SIP_PORT=5060
AUTODIAL_SIP_USER=your_sip_user
AUTODIAL_SIP_PASSWORD=your_sip_password
```

### WhatsApp Cloud API Setup

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a WhatsApp Business app
3. Get your Business Phone Number ID and Access Token
4. Set webhook URL to: `https://your-domain.com/api/webhooks/whatsapp`
5. Subscribe to `messages` event

### Database Schema

Add these tables to your database:

```sql
-- WhatsApp Messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  message_id TEXT UNIQUE,
  message_text TEXT,
  message_type TEXT, -- 'incoming' or 'outgoing'
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pending AI Review
CREATE TABLE whatsapp_pending_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  incoming_message TEXT,
  ai_suggestion TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Templates
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT,
  template_content TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### WhatsApp Webhook
**POST** `/api/webhooks/whatsapp`
- Receives incoming WhatsApp messages
- Automatically generates AI suggestions

### Send WhatsApp Message
**POST** `/api/whatsapp/messages`
- Sends a message via WhatsApp Business API
- Required: `phone_number`, `message_text`, `message_id`

### Generate AI Response
**POST** `/api/ai/generate-response`
- Generates response using Claude AI
- Required: `message`, `customer_name` (optional), `context` (optional)

### Issabel Integration
**POST** `/api/integrations/issabel`
- `action`: 'test' | 'sync' | 'dial'
- `config`: Issabel configuration
- `phone`: Phone number for dialing

### AutoDialer Integration
**POST** `/api/integrations/autodial`
- `action`: 'initiate' | 'status' | 'hangup'
- `config`: AutoDialer configuration
- `phone`: Phone number to dial

## Usage

### In Settings → WhatsApp Tab

**Configuration:**
- Add WhatsApp Business Phone Number
- Add WhatsApp API Key
- Save and verify

**Message Templates:**
- Pre-defined responses for common inquiries
- Quick replies for common questions
- Custom template management

**Pending Messages:**
- Review incoming customer messages
- See AI-generated suggestions
- Approve, edit, or reject before sending
- Track message history

**Auto Follow-ups:**
- View scheduled follow-up messages
- Send immediately if needed
- Track delivery status
- Retry failed messages

## Key Features Implementation

### Manual Review Workflow
1. Customer sends WhatsApp message
2. System receives and stores message
3. Claude AI generates professional response
4. Response queued for manual review
5. Agent reviews, edits, and approves
6. Message sent to customer via WhatsApp

### Auto Follow-up Workflow
1. Follow-up scheduled in `follow_ups` table
2. System checks for due follow-ups
3. Auto-generates relevant message
4. Sends automatically on scheduled date
5. Records delivery status

### Issabel Integration
1. Configure Issabel server and API key
2. Click "Test Connection" to verify
3. Sync leads to Issabel CRM
4. Use click-to-call from dashboard
5. Track call history

### AutoDialer Integration
1. Configure SIP settings
2. Select contact/lead
3. Click "Auto Dial"
4. System initiates call
5. Monitor call status

## Notes

- All messages are logged for compliance
- AI responses respect customer preferences
- Follow-ups respect time zones
- Integration requires active WhatsApp Business account
- Issabel and AutoDialer are optional but enhance functionality
- All API keys should be stored securely in environment variables

## Support

For issues or questions about specific integrations:
- WhatsApp: [Meta Developers](https://developers.facebook.com)
- Claude AI: [Anthropic Docs](https://docs.anthropic.com)
- Issabel: [Issabel Documentation](https://www.issabel.org)
