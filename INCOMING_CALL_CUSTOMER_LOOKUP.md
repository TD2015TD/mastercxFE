# Incoming Call Customer Lookup Flow

## Overview
When an incoming call arrives, the system now searches for matching customers in the interactions history using the phone number from the call. This allows agents to quickly identify repeat customers without requiring them to manually enter customer information.

## Implementation Details

### New Helper Function: `findCustomerByPhoneFromInteractions()`

**Location**: `/src/components/TelephonyBar.jsx`

**Purpose**: Searches the customer interactions table for phone calls matching the incoming caller's phone number.

**Flow**:
1. Takes the caller's phone number as input
2. Queries the customer interactions API with filters:
   - `interaction_type: 'call'` - Only phone call interactions
   - `channel: 'phone'` - Only phone channel
   - Returns up to 100 recent interactions
3. Filters results by matching phone numbers (normalized - removes non-digits)
4. If matches found:
   - Sorts by most recent interaction
   - Returns the customer info from the most recent matching interaction
5. Returns customer details: `customerId`, `customerName`, `customerEmail`, `phoneNumber`

**Key Features**:
- ✅ Phone number normalization (removes formatting to compare raw digits)
- ✅ Returns most recent interaction with that phone number
- ✅ Handles errors gracefully
- ✅ Filters to call interactions only (not emails, notes, etc.)

### Updated Function: `checkExistingTicketAndNavigate()`

**Logic Flow**:

1. **First Check**: Look for existing tickets by conversationId
   - If found (transferred call): Navigate to existing ticket
   - Display toast: "Transferred call - Ticket #XXX loaded"

2. **Second Check**: If no ticket found, search for customer by phone number in interactions
   - Call `findCustomerByPhoneFromInteractions(callerNumber)`
   - If customer found: Pre-fill customer details in ticket creation form
   - Display toast: "Customer [Name] identified from previous call"
   - Navigate to create ticket with pre-filled customer info

3. **Fallback**: If no customer found
   - This is a new caller
   - Navigate to create ticket form (empty customer section)
   - Agent can manually enter customer or identify them

## Incoming Call Handler

**Trigger**: When new SignalR event `employeeConversationChanged` is received with:
- `conversationState: 'Offered'` OR `'Ringing'` OR `'Alerting'`
- `direction: 'Incoming'`

**Actions**:
1. Extract caller info (name, number, queue)
2. Display ringing notification
3. Log initial interaction (without customer/ticket yet)
4. Call `checkExistingTicketAndNavigate()` with:
   - conversationId (for ticket lookup)
   - callerNumber (for customer history lookup)

## Parameters Passed to Ticket Creation Form

When navigating to ticket creation with identified customer:

```typescript
{
  callId: string;              // Caller's phone number
  source: 'call';              // Indicates this is from a phone call
  conversationId: string;      // Mitel conversation ID
  customerId?: number;         // Customer ID (if found in history)
  customerName?: string;       // Customer name (if found in history)
  customerEmail?: string;      // Customer email (if found in history)
  caseId?: number;            // Optional case ID
}
```

## Data Flow Diagram

```
Incoming Call (SignalR Event)
        ↓
Extract Caller Info (number, name, queue)
        ↓
Show Ringing Notification
        ↓
Log Interaction Async
        ↓
checkExistingTicketAndNavigate(conversationId, callerNumber)
        ↓
    ┌───┴───┐
    ↓       ↓
Check      No ticket
Ticket     found
Found      ↓
↓          findCustomerByPhoneFromInteractions(callerNumber)
Navigate   ↓
to         ┌─────────────────┐
Ticket     ↓                 ↓
Details    Customer Found    No Customer
           ↓                 ↓
    Pre-fill Customer   Empty Form
    Navigate to Create  Navigate to Create

```

## API Integration

### customerInteractionService.getInteractions()

**Endpoint**: `GET /api/customer-interactions`

**Query Parameters**:
- `interaction_type: 'call'` - Filter by interaction type
- `channel: 'phone'` - Filter by phone channel
- `per_page: 100` - Limit results
- Optional: `customer_id`, `agent_id`, `start_date`, `end_date`, `recent_days`

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "customer_id": 5,
        "phone_number": "+60123456789",
        "interaction_type": "call",
        "interaction_type_id": 3,
        "channel": "phone",
        "subject": "Support call",
        "interaction_at": "2026-02-14T10:30:00Z",
        "customer": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "current_page": 1,
    "per_page": 100,
    "total": 150
  }
}
```

## Matching Logic

**Phone Number Matching**:
```javascript
const normalized1 = "+60123456789".replace(/\D/g, ''); // "60123456789"
const normalized2 = "0123456789".replace(/\D/g, '');   // "0123456789"

// Both formats match the same number
if (normalized1 === normalized2) {
  // Match found
}
```

## Toast Notifications

1. **Transferred Call Identified**:
   ```
   "Transferred call - Ticket #TKT-12345 loaded"
   (autoClose: 3000ms)
   ```

2. **Customer Identified from History**:
   ```
   "Customer John Doe identified from previous call"
   (autoClose: 3000ms)
   ```

3. **No Match** - Silent (no toast, agent creates ticket normally)

## Error Handling

### findCustomerByPhoneFromInteractions() Errors:
- Invalid phone number: Logs warning, returns null
- API call failure: Logs error, returns null
- No matches: Returns null (handled gracefully)

### checkExistingTicketAndNavigate() Errors:
- Ticket lookup error: Falls back to create ticket form
- Customer lookup error: Continues to create unique form

## Use Cases

### Use Case 1: Repeat Customer
1. Customer calls for the second time with same number
2. System finds previous interaction with that phone
3. Customer name appears in ticket form
4. Agent can quickly verify it's the same customer

### Use Case 2: Transferred Call
1. Customer transferred between agents
2. Same conversationId exists in tickets table
3. System navigates directly to existing ticket
4. Agent continues uninterrupted conversation

### Use Case 3: Brand New Customer
1. Customer calls first time
2. No matching interactions found
3. Ticket creation form opens empty
4. Agent can manually enter or create new customer

## Performance Considerations

- **Pagination**: Limited to 100 recent interactions for performance
- **Async**: Customer lookup happens in parallel with UI updates
- **Caching**: Could be optimized with recent calls cache if needed
- **Normalization**: Phone number normalization is O(n) per digit, negligible impact

## Testing Checklist

- [ ] Incoming call with known phone number → Customer pre-filled
- [ ] Incoming call with new phone number → Empty form
- [ ] Transferred call (existing conversationId) → Navigates to ticket
- [ ] Phone number formatting variations → All match correctly
  - [ ] +60 12345 6789
  - [ ] 012345 6789
  - [ ] 6012345 6789
- [ ] Multiple interactions with same phone → Uses most recent
- [ ] API error during lookup → Gracefully fallback to empty form
- [ ] No interactions table → Handles empty response correctly

## Future Enhancements

1. **Recent Calls Cache**: Cache last 50 callers in memory for instant lookup
2. **Fuzzy Matching**: Match similar names if phone doesn't match
3. **Call Context**: Show last interaction type, date, and outcome
4. **Quick Callbacks**: Suggest callbacks to repeat customers
5. **DNR List**: Check if number is on Do Not Call list before offering options
6. **Analytics**: Track incoming call patterns by hour, day, phone number

## Configuration

Currently no configuration needed. The system:
- Automatically searches interactions on every incoming call
- Uses normalized phone number matching
- Returns most recent match
- All logic is in TelephonyBar component

To disable this feature temporarily:
1. Comment out the `findCustomerByPhoneFromInteractions()` call in `checkExistingTicketAndNavigate()`
2. Or modify the condition to always return `null`
