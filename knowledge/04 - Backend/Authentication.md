# Authentication

## Overview

AIXchange supports a dual authentication architecture:
1. **Web2 Authentication**: Traditional email and password registration with bcrypt hashing and JWT token issuance.
2. **Web3 Authentication**: Passwordless cryptographic wallet authentication using EIP-191 challenge nonces and signature verification.

---

## 1. Web3 Wallet Challenge-Response Authentication

```text
[ Client ]                                                          [ Server ]
    │                                                                   │
    ├── 1. GET /api/v1/wallet/nonce?address=0xABC... ──────────────────>│
    │                                                                   ├── Generates nonce = UUIDv4()
    │                                                                   ├── Saves nonce in User document
    │<── 2. Returns { nonce: "uuid-1234" } ─────────────────────────────┤
    │                                                                   │
    ├── 3. User signs message: "AIXchange Authentication Nonce: uuid-1234"
    │                                                                   │
    ├── 4. POST /api/v1/wallet/verify { address, signature } ──────────>│
    │                                                                   ├── ethers.verifyMessage(message, sig)
    │                                                                   ├── Confirms recovered == address
    │                                                                   ├── Rotates nonce (prevents replay)
    │                                                                   ├── Generates Session & JWT
    │<── 5. Returns { token: "jwt...", user: { ... } } ─────────────────┤
```

### Verification Implementation (`server/src/services/wallet.service.js`)
```javascript
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

export async function verifySignature(address, signature) {
  const user = await userRepository.findByWalletAddress(address);
  if (!user || !user.nonce) {
    throw new ApiError(400, 'Authentication nonce expired or not requested');
  }

  const message = `AIXchange Authentication Nonce: ${user.nonce}`;
  const recoveredAddress = ethers.verifyMessage(message, signature);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new ApiError(401, 'Invalid cryptographic signature');
  }

  // Rotate nonce to prevent replay attacks
  user.nonce = uuidv4();
  await user.save();

  // Create JWT session
  const token = jwtUtil.generateToken({ id: user._id, role: user.role, walletAddress: user.walletAddress });
  return { token, user };
}
```

---

## 2. JWT Middleware & Role Authorization

### `auth.middleware.js`
Extracts `Bearer <token>` from the `Authorization` header or HTTP-only cookies, verifies token authenticity using `JWT_SECRET`, checks session validity in `SessionRepository`, and attaches `req.user` to the request context.

### `role.middleware.js`
Restricts access to specific endpoints based on user roles (`buyer`, `creator`, `validator`, `admin`):
```javascript
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'Forbidden: Insufficient permissions');
  }
  next();
};
```
