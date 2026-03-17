# Blog Cloud Project - Deployment & Learning Guide

A practical, step-by-step guide to deploying this full-stack application to AWS EC2. Each section explains **what**, **why**, and **how**.

---

## Table of Contents

1. [AWS Account & Prerequisites](#1-aws-account--prerequisites)
2. [Understanding EC2](#2-understanding-ec2)
3. [Launching Your First EC2 Instance](#3-launching-your-first-ec2-instance)
4. [Connecting to EC2 via SSH](#4-connecting-to-ec2-via-ssh)
5. [Installing Docker on EC2](#5-installing-docker-on-ec2)
6. [Deploying the Application](#6-deploying-the-application)
7. [Making it Production-Ready](#7-making-it-production-ready)
8. [Next Steps: S3, CloudFront, RDS](#8-next-steps-s3-cloudfront-rds)

---

## 1. AWS Account & Prerequisites

### What

You need an AWS account and basic familiarity with the AWS Console.

### Why

- **AWS Free Tier**: First 12 months, you get 750 hours/month of t2.micro EC2 (enough for 1 always-on instance)
- **Learning**: Hands-on AWS experience is valuable for DevOps/Cloud roles
- **Real deployment**: Your app will be publicly accessible on the internet

### How

1. Go to [aws.amazon.com](https://aws.amazon.com) → Create Free Account
2. Complete signup (credit card required for verification, but Free Tier won't charge if you stay within limits)
3. Log into the **AWS Console**: https://console.aws.amazon.com
4. **Important**: Set up billing alerts (Billing → Budgets) to get notified if you approach $5-10 (safety net)

### Key Concepts

| Term | Meaning |
|------|---------|
| **Region** | Physical location of AWS data centers (e.g., `us-east-1` = N. Virginia). Choose one close to your users. |
| **Availability Zone (AZ)** | A data center within a region. For redundancy, you'd use multiple AZs; for learning, one is fine. |

---

## 2. Understanding EC2

### What is EC2?

**Elastic Compute Cloud** = virtual servers in the cloud. You rent a computer (instance) that runs 24/7. You get:
- An OS (we'll use Ubuntu 22.04)
- CPU, RAM, storage
- A public IP address so the world can reach it

### Why EC2 for this project?

- **Simple**: One machine runs everything (Docker Compose)
- **Cheap**: t2.micro is Free Tier eligible
- **Portable**: Same Docker setup as local → no "works on my machine"
- **Foundation**: EC2 is the base; later we add RDS (managed DB), S3 (storage), etc.

### Instance Types (Free Tier)

| Type | vCPU | RAM | Free Tier |
|------|------|-----|-----------|
| **t2.micro** | 1 | 1 GB | ✅ 750 hrs/month |
| t2.small | 1 | 2 GB | ❌ Paid |

We'll use **t2.micro** throughout.

---

## 3. Launching Your First EC2 Instance

### Step 3.1: Open EC2 Console

1. In AWS Console, search for **EC2** or go to **Services → Compute → EC2**
2. Select a **Region** (top-right) — e.g., **us-east-1 (N. Virginia)** — and stick with it
3. Click **Launch Instance**

### Step 3.2: Configure the Instance

| Field | Value | Why |
|-------|-------|-----|
| **Name** | `blog-cloud` | Friendly label |
| **AMI** | Ubuntu Server 22.04 LTS | Stable, well-documented, good Docker support |
| **Instance type** | t2.micro | Free Tier |
| **Key pair** | Create new → `blog-cloud-key` | Needed for SSH; download the `.pem` file and keep it safe |
| **Network settings** | Create security group | We'll configure next |

### Step 3.3: Security Group (Firewall Rules)

A **Security Group** is a firewall. It controls **inbound** (who can connect) and **outbound** (what the instance can reach) traffic.

**Create security group:** `blog-cloud-sg`

**Inbound rules** (who can reach your server):

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | **Your IP only** (or `0.0.0.0/0` for learning — less secure) | SSH access |
| Custom TCP | 5173 | 0.0.0.0/0 | Frontend (React) |
| Custom TCP | 3579 | 0.0.0.0/0 | Backend (NestJS) |
| Custom TCP | 5432 | **Do NOT open** | PostgreSQL — keep internal only |

**Why restrict SSH to your IP?** Reduces brute-force attacks. Use `0.0.0.0/0` only for testing if your IP changes often.

**Why 0.0.0.0/0 for 5173 and 3579?** Allows anyone on the internet to access your app. For production, you'd put a load balancer or reverse proxy in front.

### Step 3.4: Storage

- **8 GB gp3** — default is fine, Free Tier includes 30 GB
- Keep default

### Step 3.5: Launch

1. Click **Launch Instance**
2. **Download the key pair** (`.pem` file) — you get one chance
3. Save it to `~/.ssh/blog-cloud-key.pem`
4. Set permissions: `chmod 400 ~/.ssh/blog-cloud-key.pem`

---

## 4. Connecting to EC2 via SSH

### What

**SSH (Secure Shell)** = secure way to run commands on a remote server. Your laptop connects to the EC2 instance's terminal.

### Why

- Install software (Docker)
- Deploy and manage your application
- View logs, debug issues

### How

1. **Get your instance's Public IP**
   - EC2 Console → Instances → select `blog-cloud` → copy **Public IPv4 address**

2. **Connect via SSH**
   ```bash
   ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@<PUBLIC_IP>
   ```
   Example: `ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@54.123.45.67`

3. **First time?** You'll see "authenticity of host...": type `yes`

4. You're in — you should see a prompt like `ubuntu@ip-172-31-xx-xx:~$`

### Troubleshooting

| Error | Cause | Fix |
|------|-------|-----|
| "Permission denied (publickey)" | Wrong key or permissions | `chmod 400 ~/.ssh/blog-cloud-key.pem` |
| "Connection refused" | Security group blocks port 22 | Add SSH (22) from your IP |
| "Connection timed out" | Wrong IP or instance not running | Check instance state in EC2 console |

---

## 5. Installing Docker on EC2

### What

We install Docker and Docker Compose on the EC2 instance so we can run our containerized app the same way we do locally.

### Why

- **Consistency**: Same images, same behavior as local
- **Isolation**: App runs in containers; easy to update/restart
- **No Node install**: We don't install Node.js on the host — everything runs inside containers

### How (run these on the EC2 instance via SSH)

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose (standalone plugin)
sudo apt install -y docker-compose-v2

# Verify
docker --version
docker compose version
```

**Log out and log back in** for `usermod` to take effect (or run `newgrp docker`).

---

## 6. Deploying the Application

### What

Copy your code to EC2 and run `docker compose up`.

### Why

Your app (backend + frontend + postgres) runs on a single EC2 instance. Users hit the public IP, get the frontend, which calls the API on the same machine.

### How

**Option A: Clone from GitHub (recommended)**

On the EC2 instance:

```bash
# Install git if needed
sudo apt install -y git

# Clone your repo (use your actual repo URL)
git clone https://github.com/sraj412/blog-cloud-project.git
cd blog-cloud-project
```

**Option B: SCP (copy from your laptop)**

From your laptop:

```bash
scp -i ~/.ssh/blog-cloud-key.pem -r /home/sraj/Documents/REACT/blog-cloud-project ubuntu@<PUBLIC_IP>:~/
```

Then on EC2: `cd blog-cloud-project`

### Run the Application

On EC2:

```bash
cd ~/blog-cloud-project
docker compose up -d --build
```

### Access Your App

- **Frontend**: http://\<PUBLIC_IP\>:5173
- **Backend API**: http://\<PUBLIC_IP\>:3579
- **Swagger**: http://\<PUBLIC_IP\>:3579/api/docs

### Important: VITE_API_URL for Production

The frontend was built with `VITE_API_URL=http://localhost:3579`. In production, the browser needs to reach the API using the **public IP** or **domain**.

**Fix**: Rebuild the frontend with the correct API URL:

1. Edit `docker-compose.yml` — change the frontend build arg:
   ```yaml
   VITE_API_URL: http://<YOUR_PUBLIC_IP>:3579
   ```
2. Rebuild: `docker compose up -d --build`

**Better**: Use an environment variable or CI/CD to inject the URL at deploy time.

---

## 7. Making it Production-Ready

### What's Missing?

| Item | Purpose |
|------|---------|
| **Domain + HTTPS** | Users expect `https://myblog.com`, not `http://54.x.x.x:5173` |
| **Reverse proxy (nginx)** | Single port 80/443, serve frontend + API, handle SSL |
| **Managed Database (RDS)** | Postgres in Docker loses data if instance stops; RDS persists |
| **Environment secrets** | JWT_SECRET, DB credentials in env vars or Secrets Manager |
| **Process manager** | Restart containers on crash (Docker restart: always helps) |

### Quick Wins

1. **Elastic IP**: So your public IP doesn't change when you stop/start the instance
   - EC2 → Elastic IPs → Allocate → Associate with your instance

2. **Docker restart policy**: Already set (`restart: always`) — containers auto-restart on crash

3. **Firewall**: Restrict SSH to your IP; consider closing 5432 from the internet (it's internal to Docker network)

---

## 8. Next Steps: S3, CloudFront, RDS

### S3

**What**: Object storage (files, images, backups)

**Use in this project**: Store cover images for blog posts instead of saving on the EC2 disk. Frontend uploads → Backend saves to S3 → Returns URL.

**Why**: Scalable, cheap, durable. EC2 disk is ephemeral; S3 survives instance loss.

### CloudFront

**What**: CDN (Content Delivery Network) — caches your static assets (frontend JS/CSS) at edge locations worldwide.

**Use**: Put CloudFront in front of your frontend. Users get faster load times; less traffic hits your EC2 directly.

**Why**: Better performance, DDoS protection, can add custom domain + SSL easily.

### RDS (PostgreSQL)

**What**: Managed database service. AWS runs Postgres for you; you get backups, patches, multi-AZ.

**Use**: Replace Postgres in Docker with RDS. Point backend's `DB_HOST` to RDS endpoint.

**Why**: Data persists; no need to back up Docker volumes; Free Tier includes 750 hrs of db.t2.micro.

---

## Summary: Your Learning Path

| Step | You Learned |
|------|-------------|
| 1. AWS Account | Free Tier, regions, billing alerts |
| 2. EC2 | Virtual servers, instance types, t2.micro |
| 3. Security Groups | Firewall rules, ports 22/5173/3579 |
| 4. SSH | Remote access, key-based auth |
| 5. Docker on EC2 | Containerized deployment |
| 6. Deploy | Clone, docker compose, public access |
| 7. Production | Elastic IP, HTTPS, reverse proxy |
| 8. Advanced | S3, CloudFront, RDS |

---

*This guide lives in the repo. Update it as you learn more.*
