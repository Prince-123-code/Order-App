# Real-Time WebSocket Implementation Plan

Add Socket.IO-based real-time updates so the admin sees new orders instantly and users see their order status change instantly without a page refresh.

## Real-Time Events

| Event | Emitter | Listeners |
|---|---|---|
| `order:created` | Backend (on `POST /orders`) | Admin's Orders page — inserts new order at top |
| `order:statusUpdated` | Backend (on `PUT /orders/:id/status` or `DELETE /orders/:id`) | User's Orders page — updates that specific order's status inline |

---

## Proposed Changes

### Backend

#### [NEW] `src/events/events.gateway.ts`
WebSocket gateway using `@WebSocketGateway`. Exposes `emitOrderCreated(order)` and `emitOrderStatusUpdated(order)` helpers.

#### [NEW] `src/events/events.module.ts`
Wraps the gateway for import into `AppModule`.

#### [MODIFY] `src/app.module.ts`
Import and register `EventsModule`.

#### [MODIFY] `src/orders/orders.module.ts`
Import `EventsModule` so `OrdersService` can inject the gateway.

#### [MODIFY] `src/orders/orders.service.ts`
Inject `EventsGateway` and emit events after `create()`, `updateStatus()`.

---

### Frontend

#### [NEW] `src/context/SocketContext.jsx`
Creates a single shared Socket.IO connection. Exposes the socket instance via context.

#### [MODIFY] `src/App.jsx`
Wrap the app in `<SocketProvider>`.

#### [MODIFY] `src/pages/orders.jsx`
- Listen for `order:created` — if user is ADMIN, prepend the new order to state.
- Listen for `order:statusUpdated` — find matching order by ID and update its status in state (works for both users and admins).

---

## Packages to Install

```bash
# Backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Frontend
npm install socket.io-client
```

## Verification Plan
1. Open admin Orders page in one browser tab and user Orders page in another.
2. User places an order → admin sees it appear instantly.
3. Admin changes order status → user's Order History updates the timeline instantly.
