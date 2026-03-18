# EC2 Setup - Step-by-Step Checklist

Use this checklist while creating your EC2 instance. Tick each box as you complete it.

> **Full explanation** of each step is in [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md).

---

## Before You Start

- AWS account created (aws.amazon.com → Create Free Account)
- Logged into AWS Console (console.aws.amazon.com)
- *(Optional but recommended)* Billing alert set (Billing → Budgets → Create budget)

---

## Step 1: Open EC2

1. [ -] In AWS Console top search bar, type **EC2**
2. [ ] Click **EC2** under Services
3. [ ] In the top-right, select **Region**: e.g. **us-east-1 (N. Virginia)** — remember this, stick with it
4. [ ] Click the orange **Launch Instance** button

---

## Step 2: Name and AMI

1. [ ] **Name**: Type `blog-cloud`
2. [ ] **Application and OS Images**: Leave **Quick Start** tab selected
3. [ ] **AMI**: Select **Ubuntu**
4. [ ] **Version**: Select **Ubuntu Server 22.04 LTS**
5. [ ] **Architecture**: Leave as **64-bit (x86)**

---

## Step 3: Instance Type

1. [ ] **Instance type**: Select **t2.micro** (should show "Free tier eligible")

---

## Step 4: Key Pair (Critical — Do Not Skip)

1. [ ] In **Key pair (login)** section, click **Create new key pair**
2. [ ] **Key pair name**: `blog-cloud-key`
3. [ ] **Key pair type**: RSA
4. [ ] **Private key format**: `.pem` (for Linux/Mac) or `.ppk` (for Windows PuTTY)
5. [ ] Click **Create key pair** — a file will download
6. [ ] Move the file to `~/.ssh/blog-cloud-key.pem`
7. [ ] Set permissions (in terminal): `chmod 400 ~/.ssh/blog-cloud-key.pem`

> ⚠️ **You can only download this once.** If you lose it, you’ll need a new key pair and to associate it with the instance.

---

## Step 5: Network Settings (Security Group)

1. [ ] Click **Edit** next to Network settings
2. [ ] **VPC**: Leave default
3. [ ] **Subnet**: Leave default
4. [ ] **Auto-assign public IP**: Enable
5. [ ] **Firewall (security groups)**: Select **Create security group**
6. [ ] **Security group name**: `blog-cloud-sg`
7. [ ] **Description**: `Allow SSH, frontend, and backend`

### Add Inbound Rules


| #   | Type       | Port range | Source    | Description |
| --- | ---------- | ---------- | --------- | ----------- |
| 1   | SSH        | 22         | My IP     | SSH access  |
| 2   | Custom TCP | 5173       | 0.0.0.0/0 | Frontend    |
| 3   | Custom TCP | 3579       | 0.0.0.0/0 | Backend API |


**How to add:**

- Rule 1: Type = **SSH**, Port = **22**, Source = **My IP** (click to auto-fill)
- Rule 2: Click **Add security group rule** → Type = **Custom TCP**, Port = **5173**, Source = **0.0.0.0/0**
- Rule 3: Click **Add security group rule** → Type = **Custom TCP**, Port = **3579**, Source = **0.0.0.0/0**

1. [ ] **Outbound**: Leave default (allows all outbound traffic)

---

## Step 6: Storage

1. [ ] **Configure storage**: Leave default **8 GiB gp3**
2. [ ] No need to add volumes

---

## Step 7: Launch

1. [ ] Scroll down and click **Launch instance**
2. [ ] Wait for the success message
3. [ ] Click **View all instances**
4. [ ] Wait until **Instance state** is **Running** (may take 1–2 minutes)

---

## Step 8: Get Your Public IP

1. [ ] Select your instance (checkbox)
2. [ ] In the details panel below, find **Public IPv4 address**
3. [ ] Copy this IP — you’ll use it for SSH and accessing the app

Example: `54.123.45.67`

---

## Step 9: Connect via SSH

From your **laptop** (not EC2 console), run:

```bash
ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@<YOUR_PUBLIC_IP>
```

Replace `<YOUR_PUBLIC_IP>` with the IP from Step 8.

Example:

```bash
ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@54.123.45.67
```

- First time: Type `yes` when asked about host authenticity
- You should see a prompt like `ubuntu@ip-172-31-xx-xx:~$`

**If it fails:**

- Check the key path: `~/.ssh/blog-cloud-key.pem`
- Check permissions: `chmod 400 ~/.ssh/blog-cloud-key.pem`
- Confirm security group allows SSH from **My IP**
- Ensure instance state is **Running**

---

## Step 10: Install Docker (Run on EC2)

While connected via SSH, run these commands one by one:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
sudo apt install -y docker-compose-v2
```

Then **log out and log back in** (or run `newgrp docker`) so the docker group takes effect:

```bash
exit
```

Then reconnect:

```bash
ssh -i ~/.ssh/blog-cloud-key.pem ubuntu@<YOUR_PUBLIC_IP>
```

Verify:

```bash
docker --version
docker compose version
```

- Both commands show version numbers

---

## Step 11: Clone Repo and Run App (Run on EC2)

Still on the EC2 instance via SSH:

```bash
git clone https://github.com/sraj412/blog-cloud-project.git
cd blog-cloud-project
```

**Important:** Before `docker compose up`, create a `.env` file with the frontend API URL:

```bash
echo "VITE_API_URL=http://$(curl -s ifconfig.me):3579" > .env
```

Or manually: `echo "VITE_API_URL=http://<YOUR_PUBLIC_IP>:3579" > .env`

Then:

```bash
docker compose up -d --build
```

- Wait for build to complete (2–5 minutes)
- Check containers: `docker compose ps` — all should show "Up"

---

## Step 12: Access Your App

From any browser:

- **Frontend:** http://:5173
- **Backend API:** http://:3579
- **Swagger docs:** http://:3579/api/docs
- Frontend loads
- You can register and login
- You can create and view posts

---

## Troubleshooting


| Problem                      | Check                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------- |
| SSH "Connection refused"     | Security group: SSH (22) from **My IP**                                       |
| SSH "Permission denied"      | `chmod 400 ~/.ssh/blog-cloud-key.pem`                                         |
| Frontend loads but API fails | CORS; ensure backend `enableCors()` is set. Check browser console for errors. |
| API calls go to localhost    | Rebuild frontend with correct `VITE_API_URL` (your public IP)                 |
| Containers exit              | `docker compose logs` to see errors                                           |


---

## Next: Production API URL Fix

The frontend needs to be rebuilt with your EC2 public IP in `VITE_API_URL`. We'll add a proper solution in the next implementation step so you don't have to edit the file manually each time.

---

**Checklist complete?** Tell me when you're at Step 11 (clone and run), and we'll implement the production API URL fix in the project.