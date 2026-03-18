# Continuous Deployment (CD) Setup Guide

This guide configures automatic deployment to EC2 when you push to `main`.

---

## Overview

**Flow:** Push to `main` → CI runs (lint, build, test) → Deploy job SSHs to EC2 → `git pull` + `docker compose up --build -d`

**What you need:**
1. A dedicated SSH key for GitHub Actions (deploy key)
2. GitHub repository secrets
3. EC2 security group allowing SSH from GitHub runners

---

## Step 1: Create Deploy SSH Key

On your **laptop** (not EC2):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/blog-deploy-key -N ""
```

This creates:
- `~/.ssh/blog-deploy-key` (private) — add to GitHub Secrets
- `~/.ssh/blog-deploy-key.pub` (public) — add to EC2

---

## Step 2: Add Public Key to EC2

1. **Copy the public key:**
   ```bash
   cat ~/.ssh/blog-deploy-key.pub
   ```

2. **SSH into your EC2** (using your existing key):
   ```bash
   ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@<YOUR_EC2_IP>
   ```

3. **Append the public key** to authorized_keys:
   ```bash
   echo "PASTE_THE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
   ```
   Or use `nano ~/.ssh/authorized_keys` and paste the key on a new line.

4. **Exit SSH:** `exit`

---

## Step 3: Create .env on EC2 (If Not Done Already)

SSH to EC2 and ensure the project has a `.env` file with the correct API URL:

```bash
ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@<YOUR_EC2_IP>
cd blog-cloud-project
echo "VITE_API_URL=http://<YOUR_EC2_IP>:3579" > .env
```

Replace `<YOUR_EC2_IP>` with your EC2 public IP. Example: `VITE_API_URL=http://54.123.45.67:3579`

This file is in `.gitignore`, so it won't be overwritten by `git pull`.

---

## Step 4: Update EC2 Security Group

GitHub Actions runs on AWS servers with dynamic IPs. To allow deploy SSH access:

1. **EC2 Console** → **Security Groups** → select `blog-cloud-sg`
2. **Edit inbound rules**
3. **Option A (simpler, less secure):** Add/Edit SSH rule: Source = `0.0.0.0/0`
4. **Option B (more secure):** Use [GitHub's IP ranges](https://api.github.com/meta) — more complex to maintain

For learning, Option A is common. Your EC2 is protected by SSH key authentication.

---

## Step 5: Add GitHub Secrets

1. Open your repo: **https://github.com/sraj412/blog-cloud-project**
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Name | Value | How to get it |
|------|-------|---------------|
| `EC2_HOST` | Your EC2 public IP | e.g. `54.123.45.67` |
| `EC2_USER` | `ubuntu` | Default Ubuntu user |
| `EC2_SSH_KEY` | Full private key content | Run `cat ~/.ssh/blog-deploy-key` and paste **everything** (including `-----BEGIN` and `-----END` lines) |

---

## Step 6: Verify

1. Make a small change (e.g. edit README.md)
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test CD pipeline"
   git push origin main
   ```
3. Go to **Actions** tab — you should see the workflow run
4. When complete, check your app at http://&lt;EC2_IP&gt;:5173 — it should reflect your changes

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Deploy job fails: "Permission denied (publickey)" | Check EC2_SSH_KEY is the full private key; verify public key is in EC2's `~/.ssh/authorized_keys` |
| Deploy job fails: "Connection refused" or timeout | Security group: allow SSH (22) from 0.0.0.0/0 |
| Deploy succeeds but app broken | Check `.env` on EC2 has correct `VITE_API_URL`; run `docker compose logs` on EC2 |
| "fatal: not a git repository" | Ensure you're in `blog-cloud-project` on EC2; path in workflow is `blog-cloud-project` |

---

## Security Notes

- **EC2_SSH_KEY** is stored encrypted by GitHub; only the workflow can use it
- Using a **separate deploy key** (not your personal EC2 key) limits blast radius
- SSH from 0.0.0.0/0 is acceptable for learning; for production, consider a bastion or GitHub's IP allowlist
