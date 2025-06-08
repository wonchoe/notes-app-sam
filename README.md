# Serverless Notes App

A simple serverless reference project for AWS, implemented using Node.js, Lambda, DynamoDB, API Gateway, and Cognito.  
The app demonstrates how to deploy a minimal API for notes, protected by Cognito User Pool authentication, using AWS SAM.

---

## Architecture

- **API Gateway** — REST API secured with Cognito authorizer
- **AWS Lambda (Node.js)** — business logic for handling requests
- **DynamoDB** — stores notes (single primary key: `noteId`)
- **Cognito User Pool** — authentication and identity management for users

---

## Deployment

1. **Ensure your IAM user has the required permissions**  
   (see sample IAM policy below)
2. **Clone and build the project:**
   ```bash
   git clone https://github.com/your-org/notes-app-sam.git
   cd notes-app-sam
   sam build
   ```
3. **Deploy with guided setup:**
   ```bash
   sam deploy --guided
   ```

---

## Getting Started

### 1. Create a Cognito app client (without secret)
### 2. Create a user in the Cognito User Pool
### 3. Get a JWT token via AWS CLI:
   ```bash
   aws cognito-idp initiate-auth      --auth-flow USER_PASSWORD_AUTH      --client-id <CLIENT_ID>      --auth-parameters USERNAME=<username>,PASSWORD=<password>
   ```
   If `NEW_PASSWORD_REQUIRED`, use `respond-to-auth-challenge` as described above.

### 4. Copy your `IdToken` from the AuthenticationResult for use with API requests.

---

## API Usage

### Create a note:
```bash
curl -X POST "https://<API-ID>.execute-api.<region>.amazonaws.com/prod/notes"   -H "Content-Type: application/json"   -H "Authorization: <IdToken>"   -d '{"noteId": "note1", "text": "Hello from Lambda!"}'
```

### Get a note:
```bash
curl "https://<API-ID>.execute-api.<region>.amazonaws.com/prod/notes?noteId=note1"   -H "Authorization: <IdToken>"
```

---

## How It Works

- All API requests require a valid Cognito JWT `IdToken` (passed in the `Authorization` header).
- Notes are stored in DynamoDB with a primary key `noteId`.
- **Important**: Any authenticated user with a valid token can access any note by `noteId`. There is no per-user data isolation in this implementation.

---

## IAM Policy Example (minimum required for deployment)
```json
{
    "Effect": "Allow",
    "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "iam:PassRole",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:TagRole",
        "iam:UntagRole",
        "logs:*",
        "s3:*",
        "cognito-idp:CreateUserPool",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:DeleteUserPool"
    ],
    "Resource": "*"
}
```

---

## TODO / Improvements

- Add per-user note isolation (by storing notes with userId from Cognito token)
- Implement full CRUD (currently only create/get)
- Input validation
- CI/CD pipeline with GitHub Actions

---
