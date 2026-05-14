# Affordmed API Integration Guide

## Overview
This guide walks you through registering with Affordmed API and generating an authentication token.

**IMPORTANT:** Save your `clientID`, `clientSecret`, and `access_token`. You'll need them for the logging middleware.

---

## Step 1: Register with Affordmed

### Using cURL (Windows PowerShell)

```powershell
$body = @{
    email = "mohammed232@lpu.in"
    name = "Mohammed Hamza Qamar"
    mobileNo = "8434187375"
    githubUsername = "Hamza8470"
    rollNo = "12307352"
    accessCode = "TRvZWq"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://4.224.186.213/evaluation-service/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Using cURL (Linux/Mac)

```bash
curl -X POST http://4.224.186.213/evaluation-service/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mohammed232@lpu.in",
    "name": "Mohammed Hamza Qamar",
    "mobileNo": "8434187375",
    "githubUsername": "Hamza8470",
    "rollNo": "12307352",
    "accessCode": "TRvZWq"
  }'
```

### Using Postman

1. **Create New Request**
   - Method: `POST`
   - URL: `http://4.224.186.213/evaluation-service/register`

2. **Headers Tab**
   - `Content-Type: application/json`

3. **Body Tab** (Select `raw` and `JSON`)
   ```json
   {
     "email": "mohammed232@lpu.in",
     "name": "Mohammed Hamza Qamar",
     "mobileNo": "8434187375",
     "githubUsername": "Hamza8470",
     "rollNo": "12307352",
     "accessCode": "TRvZWq"
   }
   ```

4. **Send** and note the response

### Expected Response

```json
{
  "success": true,
  "clientID": "your_client_id_here",
  "clientSecret": "your_client_secret_here",
  "message": "Registration successful"
}
```

⚠️ **SAVE THESE VALUES:**
```
clientID: ___________________________
clientSecret: ___________________________
```

---

## Step 2: Generate Auth Token

### Using cURL (Windows PowerShell)

```powershell
$body = @{
    email = "mohammed232@lpu.in"
    name = "Mohammed Hamza Qamar"
    rollNo = "12307352"
    accessCode = "TRvZWq"
    clientID = "YOUR_CLIENT_ID_HERE"
    clientSecret = "YOUR_CLIENT_SECRET_HERE"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://4.224.186.213/evaluation-service/auth" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Using cURL (Linux/Mac)

```bash
curl -X POST http://4.224.186.213/evaluation-service/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mohammed232@lpu.in",
    "name": "Mohammed Hamza Qamar",
    "rollNo": "12307352",
    "accessCode": "TRvZWq",
    "clientID": "YOUR_CLIENT_ID_HERE",
    "clientSecret": "YOUR_CLIENT_SECRET_HERE"
  }'
```

### Using Postman

1. **Create New Request**
   - Method: `POST`
   - URL: `http://4.224.186.213/evaluation-service/auth`

2. **Headers Tab**
   - `Content-Type: application/json`

3. **Body Tab** (Select `raw` and `JSON`)
   ```json
   {
     "email": "mohammed232@lpu.in",
     "name": "Mohammed Hamza Qamar",
     "rollNo": "12307352",
     "accessCode": "TRvZWq",
     "clientID": "YOUR_CLIENT_ID_HERE",
     "clientSecret": "YOUR_CLIENT_SECRET_HERE"
   }
   ```

4. **Send** and copy the access_token

### Expected Response

```json
{
  "success": true,
  "access_token": "your_access_token_here_very_long_string",
  "message": "Token generated successfully"
}
```

⚠️ **SAVE THIS TOKEN:**
```
access_token: ___________________________
```

---

## Step 3: Update Environment Variables

Edit `logging_middleware/.env`:

```env
AFFORDMED_API_URL=http://4.224.186.213/evaluation-service
AFFORDMED_ACCESS_TOKEN=your_access_token_here
LOG_ENDPOINT=/logs
```

Edit `notification_app_be/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/affordmed_notifications
NODE_ENV=development

AFFORDMED_API_URL=http://4.224.186.213/evaluation-service
AFFORDMED_ACCESS_TOKEN=your_access_token_here
```

---

## Step 4: Test the Logging

Run your server and check if logs appear on Affordmed dashboard.

```bash
cd notification_app_be
npm start
```

Open browser: `http://localhost:5000`

The response should appear in Affordmed logs!

---

## Troubleshooting

### Registration Fails - Invalid Access Code
```
Error: "Invalid access code"
```
**Solution:** Double-check your access code from the assignment.

### Auth Token Generation Fails
```
Error: "Invalid clientID or clientSecret"
```
**Solution:** Ensure you copied the values correctly from registration response.

### Logging Fails with 401
```
Error: "Unauthorized - Invalid token"
```
**Solution:** Your access token may have expired. Generate a new one.

---

## Your Credentials

| Item | Value |
|------|-------|
| Email | mohammed232@lpu.in |
| Name | Mohammed Hamza Qamar |
| Roll Number | 12307352 |
| Mobile | 8434187375 |
| GitHub | Hamza8470 |
| Access Code | TRvZWq |
| clientID | (from registration) |
| clientSecret | (from registration) |
| access_token | (from auth endpoint) |

---

**Next Steps:**
1. Register using the endpoint above
2. Generate token using your clientID & clientSecret
3. Update .env files with your token
4. Start the server and verify logs appear
5. Push to GitHub
