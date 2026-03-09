# Frontend Changes - Phone Number Migration to Interactions Table

## Overview
Migrated `phone_number` from the customer profile to the customer interactions table across the entire frontend application. Phone numbers are now tracked per interaction rather than being a single value on the customer record.

## Modified Files

### 1. **Customer Profile Pages**

#### `/src/pages/customer-360-profile/components/CustomerFormModal.jsx`
**Changes:**
- ✅ Removed `phone_number` field from form state initialization
- ✅ Removed `phone_number` from form data loading (useEffect)
- ✅ Removed phone_number validation from `validateForm()`
- ✅ Removed phone number input field from the form UI

**Impact:** Customer profile creation/editing no longer requires or accepts phone number. Phone numbers are now only associated with specific interactions.

#### `/src/pages/customer-360-profile/components/CustomerProfileHeader.jsx`
**Changes:**
- ✅ Removed phone_number display from contact details section
- ✅ Added note: "Phone numbers are tracked per interaction" with link to view in Interactions tab

**Impact:** Users can no longer see phone number in the customer header, directing them to the Interactions tab instead.

#### `/src/pages/customer-360-profile/CustomerDetailPage.jsx`
**Changes:**
- ✅ Updated `handleCreateTicket()` to remove `customerPhone` parameter
- ✅ Changed navigation to use `customerId` instead of `customerPhone`
- ✅ Phone number can now be entered when creating a ticket or interaction

**Impact:** Creating tickets from the customer detail page no longer tries to pass a non-existent phone_number.

#### `/src/pages/customer-360-profile/index.jsx`
**Changes:**
- ✅ Updated `handleCreateTicket()` to remove phone_number from parameters
- ✅ Updated table display to show "See interactions for phone" instead of displaying phone_number
- ✅ Phone column now directs users to check interactions for phone details

**Impact:** Customer listing page no longer displays or passes phone numbers from customer records.

### 2. **Ticket Management Pages**

#### `/src/pages/ticket-management/components/TicketCreateForm.tsx`
**Changes:**
- ✅ Updated customer search logic to filter by name/email instead of phone_number (lines 140-157)
- ✅ Removed `customer_phone` assignment when selecting customer (line 156)
- ✅ Updated phone result filtering to search by name/email (lines 310-320)
- ✅ Removed `customer_phone` assignment in `handleConfirmCustomerSelection()` (line 371)
- ✅ Removed phone_number display from customer search results dropdown (line 727)
- ✅ Removed phone_number from customer confirmation modal (line 1150)

**Impact:** 
- Customer search now uses name and email instead of phone
- The `customer_phone` field in the form remains for manual entry during ticket creation
- Phone numbers are no longer pre-filled from customer data

### 3. **Service Interfaces**

#### `/src/services/customerService.ts`
**Changes:**
- ✅ Removed `phone_number: string` from Customer interface
- ✅ Phone number is no longer a property of the Customer object

**Interface before:**
```typescript
export interface Customer {
  phone_number: string;  // ❌ REMOVED
  // ... other fields
}
```

**Interface after:**
```typescript
export interface Customer {
  // phone_number removed
  // ... other fields
}
```

#### `/src/services/customerInteractionService.ts`
**Changes:**
- ✅ Added `phone_number?: string` to main CustomerInteraction interface
- ✅ Added `interaction_type_id?: number` to CustomerInteraction interface
- ✅ Added `interactionTypeLookup` relationship object with bilingual names
- ✅ Removed `phone_number` from nested customer object (customer now only has id, name, email)

**Interface updates:**
```typescript
export interface CustomerInteraction {
  // New fields
  phone_number?: string;              // ✅ NEW
  interaction_type_id?: number;       // ✅ NEW
  
  // Updated relationships
  interactionTypeLookup?: {           // ✅ NEW
    id: number;
    type: string;
    code: string;
    name_en: string;
    name_ms: string;
    icon?: string;
  };
  
  // Updated customer object
  customer?: {
    id: number;
    name: string;
    email: string;
    // phone_number removed from here
  };
}
```

## Migration Impact

### What Changed for Users

1. **Customer Form**: No longer asks for phone number when creating/editing customer profiles
2. **Customer Profile**: Phone number is not displayed on the customer header
3. **Customer List**: Phone number column now shows "See interactions for phone"
4. **Ticket Creation**: Phone number must be entered during ticket creation (not pre-filled from customer)
5. **Customer Search**: Search from phone field now searches by customer name/email

### What Stayed the Same

1. **Ticket Form**: `customer_phone` field still exists for manual phone entry
2. **Interaction Timeline**: Still shows interaction details including phone number for each interaction
3. **Interaction Forms**: Can still capture phone_number per interaction

## API Integration

The frontend now correctly handles API responses where:

```json
{
  "id": 1,
  "customer_id": 1,
  "interaction_type": "call",
  "interaction_type_id": 5,
  "channel": "phone",
  "phone_number": "+60123456789",
  "subject": "Customer support call",
  "interactionTypeLookup": {
    "id": 5,
    "type": "interaction_type",
    "code": "call",
    "name_en": "Phone Call",
    "name_ms": "Panggilan Telefon",
    "icon": "phone"
  }
}
```

## Testing Recommendations

1. **Create Customer**: Verify form no longer has phone_number field
2. **View Customer**: Verify phone section shows "View in Interactions" message
3. **Create Ticket**: Verify can still enter phone_number and it's not pre-filled
4. **Customer Search**: Verify searching works with name/email, not phone
5. **Interactions**: Verify interactions display phone_number correctly with type lookup
6. **List Customers**: Verify table no longer shows customer phone_numbers

## Components That May Need Updates

The following components should be reviewed for any additional phone_number references:

- TicketDetails component (if displaying customer phone)
- InteractionTimeline component (verify phone display works correctly)
- Customer notes (if mentioning phone_number)
- Any custom reports or exports (if they reference customer.phone_number)

## Rollback Instructions

If needed, these changes can be reverted by:

1. Restoring the original Customer interface with phone_number
2. Re-adding phone_number field to CustomerFormModal
3. Re-adding phone display to CustomerProfileHeader
4. Reverting TicketCreateForm customer search logic

All changes are in frontend files only and don't affect the API contract beyond the new phone_number field on interactions.

## Notes for Development Team

- The `customer_phone` field in TicketCreateForm is separate from `customer.phone_number` and is used for manual entry
- Phone numbers on customer interactions are now optional (`phone_number?: string`)
- The `interaction_type_id` and `interactionTypeLookup` provide the many-to-one relationship with lookups table
- Bilingual support for interaction types is now available through `interactionTypeLookup`
