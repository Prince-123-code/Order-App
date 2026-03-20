# Walkthrough - Restrict Cart Access for Admin

I have implemented the requested changes to ensure the shopping cart page is only accessible to regular users and hidden for administrators.

## Changes Made

### Frontend Changes

#### 1. [navbar.jsx](file:///c:/Users/princ/Desktop/order-app/frontend/src/components/navbar.jsx)
- Updated the navigation bar to conditionally render the shopping cart link.
- **Logic**: `{token && role !== "ADMIN" && ...}` ensures the cart is only visible to logged-in non-admin users.

#### 2. [ProtectedRoute.jsx](file:///c:/Users/princ/Desktop/order-app/frontend/src/components/ProtectedRoute.jsx)
- Enhanced the `ProtectedRoute` component to support role-based navigation.
- Added optional `adminOnly` and `userOnly` props to redirect users if they don't meet the role requirements.
- **Redirection**: Unauthorized users are redirected to the `/dashboard`.

#### 3. [App.jsx](file:///c:/Users/princ/Desktop/order-app/frontend/src/App.jsx)
- Applied the new `userOnly` restriction to the `/cart` route.
- Applied the `adminOnly` restriction to the `/analytics` route to keep it secure.

## Verification

The changes ensure that:
1. **UI**: Admin users cannot see the cart icon.
2. **Security**: Admin users attempting to navigate to `/cart` directly are redirected to the dashboard.
3. **Consistency**: Non-admin users can still access the cart as before.
