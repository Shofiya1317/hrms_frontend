# Sign Up Confirmation Flow - Implementation Guide

## Overview
After a user signs up, they receive a magic link email to confirm their account. This document explains the complete flow and implementation.

---

## Flow Diagram

```
1. User Signs Up
   ↓
2. Backend sends magic link email
   ↓
3. User clicks link: http://localhost:3000/confirm-account?token=xxx&slug=xxx
   ↓
4. Frontend verifies token
   ↓
5. User sets password & accepts terms
   ↓
6. Account confirmed → Redirect to login
```

---

## API Endpoints

### 1. Sign Up
**Endpoint:** `POST /api/auth/signup`

**Request:**
```json
{
  "name": "string",
  "account_name": "string",
  "slug": "string",
  "email": "string",
  "phone_number": "string",  // optional
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email."
}
```

---

### 2. Verify Token
**Endpoint:** `POST /auth/{token}/confirm`

**Headers:**
```
X-Tenant-Id: {slug}
```

**Response:**
```json
{
  "success": true
}
```

---

### 3. Accept Invitation (Confirm Account)
**Endpoint:** `POST /api/auth/acceptInvitation`

**Request:**
```json
{
  "token": "string",
  "password": "string",
  "confirm_password": "string",
  "accept_terms_and_conditions": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account confirmed successfully"
}
```

---

## Implementation Details

### Files Modified

#### 1. **Auth Service** (`lib/service/auth.ts`)

Added new function:
```typescript
export const acceptAccountInvitation = async (
  token: string,
  slug: string,
  params: {
    password: string,
    confirm_password: string,
    accept_terms_and_conditions: boolean
  },
) => post(
  '/api/auth/acceptInvitation',
  {
    token,
    password: params.password,
    confirm_password: params.confirm_password,
    accept_terms_and_conditions: params.accept_terms_and_conditions,
  },
  undefined,
  undefined,
  {
    isFetchToken: false,
  },
);
```

Updated function:
```typescript
export const tokenVerify = (
  token: string,
  slug?: string,  // Now accepts slug parameter
) => post(
  `/auth/${token}/confirm`,
  undefined,
  undefined,
  slug,
  {
    isFetchToken: false,
  },
);
```

---

#### 2. **Confirm Account Page** (`app/[subdomain]/(unauth)/confirm_account/page.tsx`)

Complete rewrite with:
- ✅ Token verification on page load
- ✅ Password setup form
- ✅ Confirm password validation
- ✅ Terms and conditions checkbox
- ✅ Loading states
- ✅ Error handling
- ✅ Auto-redirect after success

**Features:**
- Validates token before showing form
- Password strength validation (8-16 chars, uppercase, lowercase, number, special char)
- Password match validation
- Terms acceptance required
- Loading spinner during verification
- Success/error toast notifications
- Auto-redirect to sign in after confirmation

---

## Email Template

The email sent to users contains:

```
Subject: Confirm Your Account

Hi {user_name},

We've resent your invitation to join {company_name} organization.

Action Required:
Please confirm your account to complete the setup process.

[Confirm Account Button]

Or copy and paste this link:
http://localhost:3000/confirm-account?token={token}&slug={slug}
```

**Important:** The URL must include both `token` and `slug` parameters.

---

## Validation Rules

### Password Requirements:
- Minimum 8 characters
- Maximum 16 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### Confirm Password:
- Must match the password field exactly

### Terms and Conditions:
- Must be checked (true) to submit

---

## Error Scenarios

### 1. Invalid Token
- **Message:** "Invalid or expired token"
- **Action:** Redirect to sign up page after 2 seconds

### 2. Missing Parameters
- **Message:** "Invalid confirmation link"
- **Action:** Show error message, don't show form

### 3. Password Mismatch
- **Message:** "Passwords must match"
- **Action:** Show error on confirm_password field

### 4. API Error
- **Message:** Display error from API response
- **Action:** Keep user on form to retry

---

## User Experience Flow

### Step 1: User receives email
- Email contains confirmation link with token and slug
- Link is valid for a limited time (set by backend)

### Step 2: User clicks link
- Page shows loading spinner
- Token is verified in background
- If valid: Show password form
- If invalid: Show error and redirect

### Step 3: User sets password
- Form displays with:
  - Password field (with show/hide toggle)
  - Confirm password field (with show/hide toggle)
  - Terms and conditions checkbox
  - Submit button

### Step 4: Form submission
- Validates all fields
- Shows loading state on button
- Calls `/api/auth/acceptInvitation`
- On success: Toast message + redirect to login
- On error: Toast error message + stay on form

---

## Testing Checklist

### Happy Path:
- [ ] User signs up successfully
- [ ] Email is sent with correct link format
- [ ] Token verification succeeds
- [ ] Password form displays correctly
- [ ] Password validation works
- [ ] Confirm password validation works
- [ ] Terms checkbox validation works
- [ ] Account confirmation succeeds
- [ ] Redirect to login works

### Error Scenarios:
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Missing slug parameter shows error
- [ ] Password too short shows error
- [ ] Password too weak shows error
- [ ] Passwords don't match shows error
- [ ] Terms not checked shows error
- [ ] Network error shows error
- [ ] API error shows error message

---

## Common Issues & Solutions

### Issue 1: "Invalid confirmation link"
**Cause:** URL missing token or slug parameter
**Solution:** Ensure email template includes both parameters

### Issue 2: Token expired
**Cause:** User clicked old confirmation link
**Solution:** User must sign up again or request new confirmation email

### Issue 3: Password validation not working
**Cause:** Regex pattern mismatch
**Solution:** Check validation schema matches requirements

### Issue 4: Cannot submit form
**Cause:** Validation errors or terms not accepted
**Solution:** Check all fields are valid and terms checkbox is checked

---

## Integration with SignUp Form

The SignUpForm component already handles:
1. ✅ User registration with all required fields
2. ✅ Slug generation and verification
3. ✅ Success state showing "Check your mail"
4. ✅ Resend link functionality with cooldown timer

After successful signup, the user sees:
- "Check your mail for Magic link" message
- Resend link option (with 60s cooldown)

---

## Security Considerations

1. **Token Expiry:** Backend should set token expiration (recommended: 24 hours)
2. **Rate Limiting:** Limit resend attempts to prevent spam
3. **HTTPS:** Always use HTTPS in production
4. **Password Hashing:** Backend must hash passwords before storage
5. **Token Uniqueness:** Each token should be unique and single-use

---

## Environment Variables

No additional environment variables needed. Uses existing:
```env
NEXT_PUBLIC_BE=<backend_api_url>
```

---

## Next Steps

1. Test complete flow end-to-end
2. Verify email delivery
3. Test with expired tokens
4. Test password validation edge cases
5. Test on mobile devices
6. Add password strength meter (optional enhancement)
7. Add "Remember me" option on login (optional enhancement)

---

**Status:** Complete ✅  
**Last Updated:** 2025  
**Tested:** Pending
