# URL Shortener API (Souvik)

Simple URL Shortener using **AWS SAM**, **Node.js ES Modules**, and **DynamoDB**.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/get-url-shortner` | POST | Accepts JSON `{"url":"<original-url>"}` and returns a short URL |
| `/short/{shortId}` | GET  | Redirects to the original URL |


