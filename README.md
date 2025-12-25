# URL Shortener API (Souvik)

Simple URL Shortener using **AWS SAM**, **Node.js ES Modules**, and **DynamoDB**.

---

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Testing](#testing)

---

## Setup Instructions

### Prerequisites

- **Node.js** 24.x or higher
- **AWS CLI** configured with appropriate credentials
- **AWS SAM CLI** for deployment
- **TypeScript** 5.9.3+

### Local Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Build the Project**

   ```bash
   npm run build
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

### Deployment

1. **Build the SAM Application**

   ```bash
   sam build
   ```

2. **Deploy to AWS**

   ```bash
   sam deploy --guided
   ```

   - Choose region (recommended: `ap-south-1`)
   - Accept default values or customize as needed
   - The deployment will create:
     - API Gateway endpoint
     - Two Lambda functions (CreateShortUrl and Redirect)
     - DynamoDB table

3. **Get Your API Endpoint**
   After deployment, the output will display your API URL:
   ```
   https://{api-id}.execute-api.{region}.amazonaws.com/
   ```

---

## Architecture Overview

The URL Shortener API is built on AWS serverless infrastructure:

- **API Gateway**: HTTP endpoint handling requests
- **Lambda Functions**: Two serverless functions for URL creation and redirection
- **DynamoDB**: NoSQL database for storing URL mappings with GSI for lookup by original URL

### Key Features

- ✅ URL validation (HTTP/HTTPS only)
- ✅ Automatic short ID generation
- ✅ Duplicate URL detection (returns existing short URL)
- ✅ URL trimming and normalization
- ✅ Fast redirect with 302 HTTP status code

---

## API Endpoints

### 1. Create Short URL

**Endpoint:** `POST /get-url-shortner`

**Description:** Creates a shortened URL for a given original URL. If the URL already exists, returns the previously generated short URL.

#### Request

```json
{
  "url": "https://www.example.com/very/long/url/that/needs/shortening"
}
```

**Headers:**

```
Content-Type: application/json
```

#### Response

**Success (200 OK):**

```json
{
  "shortUrl": "https://{api-domain}/short/a1b2c3d4"
}
```

**Error (400 Bad Request):**

```json
"URL is required"
```

**Error (400 Bad Request):**

```json
"Invalid URL"
```

**Error (500 Internal Server Error):**

```json
"Failed to store URL mapping"
```

#### Status Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 201  | Successfully created short URL                    |
| 200  | Successfully retrieved existing short URL         |
| 400  | Missing or invalid URL parameter                  |
| 500  | Server-side error during URL storage or retrieval |

#### Example Usage

**cURL:**

```bash
curl -X POST https://{api-domain}/get-url-shortner \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/souvik-biswas/"}'
```

**JavaScript/Fetch:**

```javascript
const response = await fetch('https://{api-domain}/get-url-shortner', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://github.com/souvik-sardar',
  }),
});

const data = await response.json();
console.log(data.shortUrl);
```

---

### 2. Redirect to Original URL

**Endpoint:** `GET /short/{shortId}`

**Description:** Redirects to the original URL associated with the given short ID.

#### Request

**Path Parameters:**

- `shortId` (string, required): The unique short identifier

#### Response

**Success (302 Found):**

- Redirects to the original URL
- Response includes `Location` header with the original URL

**Error (400 Bad Request):**

```
"Short ID is required"
```

**Error (404 Not Found):**

```
"URL not found"
```

**Error (500 Internal Server Error):**

```
"Internal Server Error"
```

#### Status Codes

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 302  | Redirect to original URL            |
| 400  | Missing short ID parameter          |
| 404  | Short ID does not exist in database |
| 500  | Server-side error during lookup     |

#### Example Usage

**Direct Browser:**

```
https://{api-domain}/short/a1b2c3d4
```

**cURL:**

```bash
curl -L -X GET https://{api-domain}/short/a1b2c3d4
```

**JavaScript/Fetch:**

```javascript
const shortId = 'a1b2c3d4';
window.location.href = `https://{api-domain}/short/${shortId}`;
```

---

## Database Schema

### DynamoDB Table: `UrlTableSouvik`

**Primary Key:** `shortId` (String)

**Attributes:**

| Attribute     | Type                 | Description                                     |
| ------------- | -------------------- | ----------------------------------------------- |
| `shortId`     | String (Primary Key) | Unique 8-character identifier for the short URL |
| `originalUrl` | String               | The full original URL provided by the user      |

**Global Secondary Index:** `OriginalUrlIndex`

- **Key:** `originalUrl` (Hash key)
- **Purpose:** Fast lookup to check if a URL already has a short ID
- **Projection:** KEYS_ONLY

**Billing Mode:** PAY_PER_REQUEST (on-demand)

---

## Testing

### Run All Tests with Coverage

```bash
npx jest --coverage
```

### Test Coverage

The project includes comprehensive tests for:

- URL creation and validation
- URL redirection
- Database operations
- Utility functions

### Test Files

- `tests/createUrl.test.ts` - Tests for short URL creation
- `tests/redirectUrl.test.ts` - Tests for URL redirection
- `tests/url.utils.test.ts` - Tests for URL utilities
- `tests/db.utils.test.ts` - Tests for database operations

### View Coverage Report

After running tests, open the coverage report:

```bash
open coverage/lcov-report/index.html
```

---

## CORS Configuration

The API is configured with CORS enabled for development:

- **Allowed Methods:** GET, POST
- **Allowed Headers:** Content-Type
- **Allowed Origins:** \* (all origins)

For production, update the `template.yaml` to restrict origins to your domain.

---

## Troubleshooting

### Issue: "URL is required"

- **Cause:** The request body is missing the `url` field
- **Solution:** Ensure your request includes: `{"url": "..."}`

### Issue: "Invalid URL"

- **Cause:** The URL doesn't start with `http://` or `https://`
- **Solution:** Provide a complete URL with protocol

### Issue: "URL not found" (404)

- **Cause:** The short ID doesn't exist in the database
- **Solution:** Verify the short ID is correct

### Issue: Lambda Timeout

- **Cause:** DynamoDB query taking too long
- **Solution:** Check DynamoDB table scaling and network connectivity

---

## Environment Variables

The Lambda functions use the following environment variables:

```
TABLE_NAME=UrlTableSouvik
ORIGINAL_URL_INDEX=OriginalUrlIndex
```

These are automatically set by the SAM template during deployment.
