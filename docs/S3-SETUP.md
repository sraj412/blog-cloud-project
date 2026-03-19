# S3 Setup Guide - Cover Image Upload

This guide configures AWS S3 for storing blog post cover images.

---

## Overview

**Flow:** User selects image → Frontend sends to backend → Backend uploads to S3 → Returns public URL → Post saved with URL.

**What you need:**
1. AWS S3 bucket
2. IAM user with S3 access
3. Environment variables on backend (local + EC2)

---

## Step 1: Create S3 Bucket

1. **AWS Console** → **S3** → **Create bucket**
2. **Bucket name:** `blog-cloud-covers-<your-username>` (must be globally unique)
3. **Region:** Same as EC2 (e.g. `us-east-1`)
4. **Block Public Access:** Uncheck "Block all public access" (we need public read for cover images)
5. **Bucket Policy:** Add this (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/covers/*"
    }
  ]
}
```

6. **CORS:** Add CORS configuration (Bucket → Permissions → CORS):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

7. Click **Create bucket**

---

## Step 2: Create IAM User for S3 Access

1. **IAM** → **Users** → **Create user**
2. **User name:** `blog-cloud-s3`
3. **Permissions:** Attach policy directly → **Create policy** (JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Name the policy `blog-cloud-s3-policy`
5. Attach it to the user
6. **Create user**
7. **Security credentials** → **Create access key** → **Application running outside AWS** → Create
8. **Copy** Access Key ID and Secret Access Key — you won't see the secret again

---

## Step 3: Configure Backend

### Local (.env)

Add to `backend/.env`:

```
AWS_REGION=us-east-1
S3_BUCKET=blog-cloud-covers-yourusername
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### EC2 (production)

SSH to EC2 and add to `~/blog-cloud-project/.env`:

```bash
echo "AWS_REGION=us-east-1" >> .env
echo "S3_BUCKET=blog-cloud-covers-yourusername" >> .env
echo "AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY" >> .env
echo "AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY" >> .env
```

Or edit `nano ~/blog-cloud-project/.env` and add the lines.

**Restart the backend** so it picks up the new env vars:

```bash
cd ~/blog-cloud-project
docker compose down
docker compose up -d --build
```

---

## Step 4: Verify

1. Create a new post with a cover image (file upload)
2. Submit — you should see "Uploading..." then redirect
3. Check S3 bucket — a new object under `covers/<userId>/` should appear
4. The post should display the cover image

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "S3 is not configured" | Check all 4 env vars are set; restart backend |
| "Access Denied" on upload | IAM policy; ensure PutObject is allowed |
| "Block public access" | Uncheck block public access; add bucket policy |
| CORS error in browser | Add CORS config to bucket |
| Images don't load | Bucket policy allows GetObject on covers/* |

---

## Security Notes

- **Never commit** `.env` or credentials to git
- Use **least privilege** IAM — only S3 Put/Get/Delete for this bucket
- For production, consider **CloudFront** in front of S3 for HTTPS and caching
