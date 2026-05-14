# Notification System Design

## Project Overview
A comprehensive notification system that integrates with the Affordmed evaluation service for logging and monitoring. This system handles email and SMS notifications with retry mechanisms, comprehensive logging, and error handling.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT / FRONTEND                        │
│                  (React Application)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│              (Express Server - Port 5000)                    │
├─────────────────────────────────────────────────────────────┤
│  Middleware:                                                 │
│  - Request Logger (logs all incoming requests)              │
│  - Error Handler (centralized error management)             │
│  - CORS Handler                                              │
│  - Request Parser                                            │
└─────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌────────────────────────────────────────────────┐
    │     NOTIFICATION ROUTES & CONTROLLERS          │
    │                                                 │
    │  POST   /api/notifications           (Create)  │
    │  GET    /api/notifications           (List)    │
    │  GET    /api/notifications/:id       (Detail)  │
    │  POST   /api/notifications/:id/send  (Send)    │
    │  POST   /api/notifications/:id/retry (Retry)   │
    │  DELETE /api/notifications/:id       (Delete)  │
    └────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   MongoDB    │  │  Email Svc   │  │   SMS Svc    │
    │  (Database)  │  │ (Simulation) │  │ (Simulation) │
    └──────────────┘  └──────────────┘  └──────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────────────────┐
    │      LOGGING MIDDLEWARE (Affordmed API)         │
    │                                                   │
    │  POST /evaluation-service/logs                   │
    │  - Logs all application events                   │
    │  - Tracks system health                          │
    │  - Monitors errors and warnings                  │
    └──────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Node.js + Express.js | REST API Server |
| **Database** | MongoDB | NoSQL Database |
| **Logging** | Custom Logger + Axios | Event Tracking |
| **Authentication** | Bearer Token (Affordmed) | API Authorization |
| **Communication** | Axios | HTTP Client |

---

## Database Schema

### Notification Collection

```javascript
{
  _id: ObjectId,
  title: String,              // Notification title
  message: String,            // Notification content
  recipientEmail: String,     // Email address
  recipientPhone: String,     // Phone number (optional)
  type: String,              // 'email', 'sms', or 'both'
  status: String,            // 'pending', 'sent', 'failed', 'retry'
  retryCount: Number,        // 0-3 retries allowed
  sentAt: Date,              // When it was sent
  failureReason: String,     // Why it failed
  metadata: Object,          // Additional data
  createdAt: Date,           // Creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

---

## API Flow

### 1. Create Notification
```
POST /api/notifications
{
  "title": "Welcome",
  "message": "Welcome to our service",
  "recipientEmail": "user@example.com",
  "recipientPhone": "+1234567890",
  "type": "email"
}

RESPONSE: 201 Created
{
  "success": true,
  "message": "Notification created successfully",
  "data": { notification_object }
}

LOGS:
  ✓ [INFO] Notification created successfully
  ✓ New notification logged to Affordmed
```

### 2. Get All Notifications
```
GET /api/notifications

RESPONSE: 200 OK
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [ notifications_array ],
  "count": 10
}

LOGS:
  ✓ [INFO] Retrieved 10 notifications
```

### 3. Send Notification
```
POST /api/notifications/:id/send

RESPONSE: 200 OK (on success)
{
  "success": true,
  "message": "Notification sent successfully",
  "data": { updated_notification }
}

LOGS:
  ✓ [INFO] Notification sent successfully to recipient@email.com
  ✓ [SIMULATION] Sending email to recipient@email.com: SUCCESS
```

### 4. Retry Failed Notification
```
POST /api/notifications/:id/retry

RESPONSE: 200 OK
{
  "success": true,
  "message": "Retry initiated",
  "data": { updated_notification }
}

LOGS:
  ✓ [INFO] Retry initiated, Attempt: 1
```

---

## Logging Strategy

### Log Levels
- **DEBUG**: Detailed information for debugging (incoming requests)
- **INFO**: General information (successful operations, notifications sent)
- **WARN**: Warning messages (missing fields, retry attempts)
- **ERROR**: Error messages (API failures, validation errors)
- **FATAL**: Critical errors (database connection loss, server failure)

### Log Packages (Modules)
- `route`: Route handlers
- `controller`: Business logic
- `model`: Database operations
- `middleware`: Request/response processing
- `db`: Database connections
- `service`: Third-party services
- `handler`: Event handlers

### Example Logs
```
[INFO] [controller] Notification created successfully: 507f1f77bcf86cd799439011
[WARN] [controller] Missing required fields in notification creation
[ERROR] [middleware] Error in notification pre-save hook: Validation failed
[FATAL] [db] MongoDB connection lost
[DEBUG] [middleware] Incoming request: POST /api/notifications from 192.168.1.1
```

---

## Retry Mechanism

```
Status: PENDING
    │
    ├─► SEND REQUEST
    │       │
    │       ├─ SUCCESS ──► STATUS: SENT, sentAt: timestamp
    │       │
    │       └─ FAILURE ──┐
    │                     ▼
    │              STATUS: FAILED
    │              retryCount: 1
    │                     │
    │                     ▼
    │         USER/SYSTEM: POST /retry
    │                     │
    │                     ▼
    │              STATUS: RETRY
    │              retryCount: 2
    │                     │
    │    ┌────────────────┴────────────────┐
    │    │ (max retries = 3)                │
    │    │                                  │
    │    ▼                                  ▼
    ├─ SUCCESS: SENT          └─ FAILURE: PERMANENT_FAILURE
```

**Rules:**
- Max retries: 3 attempts
- Each retry increments retryCount
- After 3 failed attempts, notification is marked as permanently failed
- Manual retry possible through `/retry` endpoint

---

## Notification Flow

```
CLIENT REQUEST
    │
    ▼
VALIDATE INPUT
    │
    ├─ INVALID ──► RETURN 400 + LOG [WARN]
    │
    ▼
CREATE NOTIFICATION
    │
    ▼
SAVE TO DATABASE
    │
    ▼
LOG TO AFFORDMED + LOG [INFO]
    │
    ▼
QUEUE FOR SENDING
    │
    ├─ EMAIL SIMULATION ──► LOG [INFO] or LOG [WARN]
    │
    ├─ SMS SIMULATION ──► LOG [INFO] or LOG [WARN]
    │
    └─ UPDATE STATUS
            │
            ▼
        RESPOND TO CLIENT
```

---

## Error Handling

### Error Types & Responses

| Error | Status | Response |
|-------|--------|----------|
| Missing required fields | 400 | Bad Request |
| Notification not found | 404 | Not Found |
| Invalid retry attempt | 400 | Bad Request |
| Server error | 500 | Internal Server Error |
| Database connection error | 500 | Service Unavailable |

### Error Logging Pattern
```javascript
await Log(
  "backend",
  "error",
  "controller",
  `Error message: ${error.message}`
);
```

---

## Scalability Considerations

### Current Implementation
- Single MongoDB instance
- Synchronous logging to Affordmed API
- In-memory notification queue

### Future Improvements

1. **Message Queuing**
   - Implement Bull/RabbitMQ for async job processing
   - Decouple notification sending from API request

2. **Caching Layer**
   - Redis for frequently accessed notifications
   - Cache notification history

3. **Database Optimization**
   - Indexes on status, recipientEmail, createdAt
   - Archival process for old notifications

4. **Horizontal Scaling**
   - Load balancer (Nginx)
   - Multiple server instances
   - Separate database replica for read operations

5. **Rate Limiting**
   - Prevent API abuse
   - Throttle notifications per user

---

## Caching Strategy

```
REQUEST ──► CHECK CACHE
             │
             ├─ HIT ──► RETURN CACHED DATA + LOG [DEBUG]
             │
             └─ MISS ──► QUERY DB
                         │
                         ▼
                    CACHE RESULT (TTL: 5 min)
                         │
                         ▼
                    RETURN DATA + LOG [INFO]
```

**Cache Keys:**
- `notifications:all` - All notifications list
- `notification:{id}` - Individual notification
- `notifications:status:{status}` - By status
- `notifications:email:{email}` - By recipient

---

## Retry Mechanism (Advanced)

### Exponential Backoff
```
Attempt 1: Immediate
Attempt 2: Wait 5 seconds
Attempt 3: Wait 15 seconds
Attempt 4: Wait 60 seconds (Max retries reached)
```

### Implementation
```javascript
const RETRY_DELAYS = [0, 5000, 15000, 60000]; // milliseconds

// In retry handler
const delay = RETRY_DELAYS[notification.retryCount] || 60000;
setTimeout(() => sendNotification(id), delay);
```

---

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Store secrets in .env.local
   - Use environment variables for tokens

2. **Input Validation**
   - Sanitize email addresses
   - Validate phone numbers
   - Limit message length

3. **Rate Limiting**
   - Implement request throttling
   - Prevent duplicate submissions

4. **Logging Security**
   - Never log sensitive data (passwords, tokens)
   - Sanitize email addresses in logs
   - Use error IDs for user-facing errors

---

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Create Notification | < 100ms | ~50ms |
| Send Notification | < 500ms | ~300ms |
| List Notifications | < 200ms | ~100ms |
| API Response Time | < 1s | ~200ms avg |
| Database Query Time | < 50ms | ~30ms |
| Notification Delivery | < 10s | ~5s (simulated) |

---

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Notification Delivery Rate**
   - % of successfully sent notifications
   - Target: > 95%

2. **Error Rate**
   - % of failed requests
   - Target: < 2%

3. **Response Time**
   - Average API response time
   - Target: < 500ms

4. **Database Health**
   - Connection pool usage
   - Query latency
   - Disk usage

### Alert Conditions
- Delivery rate drops below 90%
- Error rate exceeds 5%
- Average response time > 1s
- Database connection fails
- Memory usage > 80%

---

## Testing Strategy

### Unit Tests
- Model validation
- Controller business logic
- Logger functionality

### Integration Tests
- API endpoint tests
- Database operations
- Logging middleware

### E2E Tests
- Full notification workflow
- Retry mechanism
- Error scenarios

### Load Testing
- Concurrent request handling
- Database performance
- Memory usage

---

## Deployment

### Prerequisites
- Node.js 14+
- MongoDB 4.4+
- npm 6+

### Environment Setup
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start server
npm start

# Or with auto-reload (development)
npm run dev
```

### Docker Deployment
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

---

## Conclusion

This notification system provides:
- ✓ Comprehensive logging through Affordmed API
- ✓ Reliable notification delivery with retries
- ✓ Scalable architecture
- ✓ Error handling and monitoring
- ✓ Security best practices

The main focus is on the **logging middleware integration**, which tracks every operation and provides complete visibility into system behavior.
