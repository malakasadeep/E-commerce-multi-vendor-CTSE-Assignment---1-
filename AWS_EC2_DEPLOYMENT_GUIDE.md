# AWS EC2 Deployment Guide - Zudox E-Commerce Platform

## Distributed Microservices Architecture

**Domain**: www.zudox.online  
**Database**: MongoDB Atlas  
**Message Queue**: Kafka on EC2 (KRaft)  
**Deployment Date**: May 1, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Kafka on EC2 Setup](#kafka-on-ec2-setup)
5. [EC2 Instance Setup](#ec2-instance-setup)
6. [Service Deployment](#service-deployment)
7. [Application Load Balancer](#application-load-balancer)
8. [DNS & SSL Setup](#dns--ssl-setup)
9. [Monitoring & Scaling](#monitoring--scaling)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet Users                            │
│                    (www.zudox.online)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼──────┐
                    │ Route 53   │
                    │ & CloudFront│
                    └────┬───────┘
                         │
              ┌──────────▼──────────┐
              │ Application Load    │
              │ Balancer (public)   │
              │ 10.0.1.100:443      │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼───┐    ┌──────▼──────┐   ┌────▼──────┐
   │ API GW │    │ Admin UI     │   │ User UI   │
   │10.0.1.20│   │ (Next.js)    │   │(Next.js)  │
   │ Port 6000│   │ 10.0.1.30:80│  │10.0.1.40:80│
   └────┬───┘    │              │   │           │
        │        │              │   │           │
        │        └──────────────┘   └───────────┘
        │
        │ Internal Traffic (Private Subnets)
        │
  ┌─────┴─────────────────────────────────────┐
  │         Microservices (Private)            │
  │                                            │
  │ ┌──────────────────────────────────────┐  │
  │ │ Auth Service       (10.0.10.10:6001) │  │
  │ ├──────────────────────────────────────┤  │
  │ │ Product Service    (10.0.10.20:6002) │  │
  │ ├──────────────────────────────────────┤  │
  │ │ Order Service      (10.0.10.30:6003) │  │
  │ ├──────────────────────────────────────┤  │
  │ │ Payment Service    (10.0.11.10:6004) │  │
  │ ├──────────────────────────────────────┤  │
  │ │ Review Service     (10.0.11.20:6005) │  │
  │ └──────────────────────────────────────┘  │
  └─────┬────────────────────────┬──────────┘
        │                        │
   ┌────▼────────────────┐  ┌───▼────────────┐
  │  MongoDB Atlas      │  │ Kafka EC2      │
  │  (Atlas Cluster)    │  │  (KRaft)       │
  │ mongodb+srv://...   │  │  10.0.10.50    │
   └─────────────────────┘  └────────────────┘
```

---

## AWS Infrastructure Setup

### Step 1: Create VPC and Subnets

#### 1.1 Create VPC

```bash
AWS Console > VPC > Create VPC

Settings:
- Name: zudox-vpc
- IPv4 CIDR block: 10.0.0.0/16
- Tenancy: Default
- Tag: Environment=Production, Project=Zudox
```

#### 1.2 Create Public Subnets (for ALB + NAT)

```bash
# Public Subnet 1 (us-east-1a)
Name: zudox-public-1a
VPC: zudox-vpc
CIDR: 10.0.1.0/24
AZ: us-east-1a

# Public Subnet 2 (us-east-1b)
Name: zudox-public-1b
VPC: zudox-vpc
CIDR: 10.0.2.0/24
AZ: us-east-1b
```

#### 1.3 Create Private Subnets (for Services)

```bash
# Private Subnet 1a (Services)
Name: zudox-private-1a
VPC: zudox-vpc
CIDR: 10.0.10.0/24
AZ: us-east-1a

# Private Subnet 1b (Services)
Name: zudox-private-1b
VPC: zudox-vpc
CIDR: 10.0.11.0/24
AZ: us-east-1b

# Private Subnet 1c (RDS Primary)
Name: zudox-private-1c
VPC: zudox-vpc
CIDR: 10.0.12.0/24
AZ: us-east-1c
```

#### 1.4 Create Internet Gateway

```bash
Name: zudox-igw
Attach to: zudox-vpc
```

#### 1.5 Create NAT Gateways (for outbound internet from private subnets)

```bash
# NAT Gateway 1
Name: zudox-nat-1
Subnet: zudox-public-1a
Allocate Elastic IP

# NAT Gateway 2 (optional, for HA)
Name: zudox-nat-2
Subnet: zudox-public-1b
Allocate Elastic IP
```

#### 1.6 Create and Configure Route Tables

**Public Route Table:**

```bash
Name: zudox-public-rt
VPC: zudox-vpc

Routes:
- Destination: 0.0.0.0/0
  Target: Internet Gateway (zudox-igw)

Associate: zudox-public-1a, zudox-public-1b
```

**Private Route Table 1a:**

```bash
Name: zudox-private-rt-1a
VPC: zudox-vpc

Routes:
- Destination: 0.0.0.0/0
  Target: NAT Gateway (zudox-nat-1)

Associate: zudox-private-1a
```

**Private Route Table 1b:**

```bash
Name: zudox-private-rt-1b
VPC: zudox-vpc

Routes:
- Destination: 0.0.0.0/0
  Target: NAT Gateway (zudox-nat-2 or nat-1)

Associate: zudox-private-1b
```

---

### Step 2: Create Security Groups

#### 2.1 ALB Security Group

```bash
Name: zudox-alb-sg
VPC: zudox-vpc
Description: Allow HTTPS/HTTP from internet

Inbound Rules:
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0

Outbound Rules:
- All traffic (auto-created)
```

#### 2.2 API Gateway Security Group

```bash
Name: zudox-api-gateway-sg
VPC: zudox-vpc
Description: API Gateway traffic

Inbound Rules:
- TCP 6000 from zudox-alb-sg (source)
- TCP 22 from YOUR_IP/32 (SSH admin access)

Outbound Rules:
- All traffic (auto-created)
```

#### 2.3 Microservices Security Group

```bash
Name: zudox-services-sg
VPC: zudox-vpc
Description: Internal service-to-service communication

Inbound Rules:
- TCP 6001-6005 from zudox-api-gateway-sg
- TCP 6001-6005 from zudox-services-sg (self-reference)
- TCP 22 from YOUR_IP/32 (SSH)

Outbound Rules:
- All traffic (auto-created)
```

#### 2.4 MongoDB Atlas Access

```bash
Name: zudox-rds-sg
VPC: zudox-vpc
Description: PostgreSQL database access

Inbound Rules:
- TCP 5432 from zudox-services-sg
- TCP 5432 from zudox-api-gateway-sg

Outbound Rules:
- All traffic
```

#### 2.5 Kafka EC2 Security Group

```bash
Name: zudox-kafka-sg
VPC: zudox-vpc
Description: Kafka broker communication

Inbound Rules:
- TCP 9092 from zudox-services-sg
- TCP 9092 from zudox-kafka-sg (self)

Outbound Rules:
- All traffic
```

---

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Cluster

```bash
AWS Console > MongoDB Atlas > Create Cluster

Settings:
- Cluster Name: zudox-mongo-cluster
- Cloud Provider: AWS
- Region: us-east-1
- Tier: M10 or higher for production
```

### Step 2: Create Database User and Network Access

```bash
AWS Console > MongoDB Atlas > Database Access / Network Access

Engine Options:
- Engine: PostgreSQL
- Version: 15.7
- Template: Production (Multi-AZ)

Settings:
- Username: zudox_app
- Privileges: readWrite on zudox database

Connectivity:
- Allow access from your EC2 NAT public IPs or a VPC peering/private endpoint

Database:
- Connection String: mongodb+srv://zudox_app:<PASSWORD>@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority

Backup:
- Enable backups/snapshots in Atlas

Monitoring:
- Enable TLS and restrict network access

Additional:
- Run: npx prisma generate
- Run: npx prisma db push

After Creation:
- Store the connection string in AWS Secrets Manager or SSM Parameter Store
```

### Step 3: Initialize Database with Prisma

```bash
# After RDS is ready, run Prisma migrations
export DATABASE_URL="postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db"

npx prisma migrate deploy
npx prisma db seed  # If seed script exists
```

---

## Kafka on EC2 Setup

### Step 1: Launch Kafka EC2 Instance

```bash
AWS Console > EC2 > Launch Instance

Cluster Configuration:
- Name: zudox-kafka-1
- Instance Type: t3.small
- Subnet: zudox-private-1a
- Security Group: zudox-kafka-sg
- Storage: 50 GB gp3

Encryption:
- In-transit: TLS ✅
- At-rest: EBS encryption ✅

Public Accessibility:
- Disabled ✅

Monitoring:
- CloudWatch logs/alarms optional

After Creation:
- Bootstrap server: 10.0.10.50:9092
- Use the private IP in KAFKA_BROKERS env var
```

### Step 2: Create Required Topics

```bash
# SSH into the Kafka EC2 instance and run:
/opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server 10.0.10.50:9092 \
  --create --topic products \
  --partitions 3 --replication-factor 2

/opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server 10.0.10.50:9092 \
  --create --topic orders \
  --partitions 3 --replication-factor 2

/opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server 10.0.10.50:9092 \
  --create --topic payments \
  --partitions 3 --replication-factor 2
```

---

## EC2 Instance Setup

### Step 1: Prepare Base AMI

**Option A: Use AWS Linux 2 (Recommended)**

```bash
# Latest AWS Linux 2 with Docker pre-installed
# AMI: ami-0c55b159cbfafe1f0 (check for latest in your region)
```

**Option B: Create Custom AMI**

```bash
#!/bin/bash
# User data script for EC2 launch

sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
sudo yum install aws-cli -y

# Create app directory
mkdir -p /opt/services
chmod 777 /opt/services
```

### Step 2: Launch EC2 Instances

#### API Gateway Instance

```bash
AWS Console > EC2 > Launch Instance

Details:
- Name: api-gateway-prod
- AMI: AWS Linux 2 (latest)
- Instance Type: t3.medium
- VPC: zudox-vpc
- Subnet: zudox-public-1a
- Security Group: zudox-api-gateway-sg
- Availability Zone: us-east-1a
- Private IPv4 address: 10.0.1.20 (assign elastic IP for NAT)

Storage:
- EBS Volume: 30 GB gp3
- Encrypted: Yes

Network Settings:
- Auto-assign public IP: Yes ⚠️ For Docker image pulls
- Elastic IP: Allocate (for static IP)

Tags:
- Name: api-gateway-prod
- Service: api-gateway
- Environment: production
- Backup: daily

User Data:
[See user data script above]
```

**Copy for Microservices** (adjust subnet, IP, and name):

```bash
Instances to create:
1. auth-service-prod       (10.0.10.10, zudox-private-1a)
2. product-service-prod    (10.0.10.20, zudox-private-1a)
3. order-service-prod      (10.0.10.30, zudox-private-1a)
4. payment-service-prod    (10.0.11.10, zudox-private-1b)
5. review-service-prod     (10.0.11.20, zudox-private-1b)

All use: zudox-services-sg security group
```

---

## Service Deployment

### Step 1: Build and Push Docker Images

```bash
# Build locally
docker-compose -f docker-compose.yml build

# Tag images
docker tag eshop/auth-service:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
docker tag eshop/product-service:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/product-service:latest
# ... repeat for all services

# Create ECR repositories (if not exists)
aws ecr create-repository --repository-name auth-service --region us-east-1
aws ecr create-repository --repository-name product-service --region us-east-1
# ... repeat for all services

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/product-service:latest
# ... repeat for all services
```

### Step 2: Deploy to EC2 Instances

**SSH into each instance and pull image:**

```bash
# For Auth Service
ssh -i your-key.pem ec2-user@10.0.10.10

# Pull and run
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker pull YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest

docker run -d \
  --name auth-service \
  --restart unless-stopped \
  -p 6001:6001 \
  -e DATABASE_URL="postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db" \
  -e KAFKA_BROKERS="broker-1:9092,broker-2:9092,broker-3:9092" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NODE_ENV="production" \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
```

### Step 3: Environment Variables per Service

**Auth Service (6001)**

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db
KAFKA_BROKERS=broker-1:9092,broker-2:9092,broker-3:9092
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_EXPIRE=30d
NODE_ENV=production
PORT=6001
STRIPE_SECRET_KEY=sk_live_xxxxx
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@zudox.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Zudox
```

**Product Service (6002)**

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db
KAFKA_BROKERS=broker-1:9092,broker-2:9092,broker-3:9092
REDIS_URL=redis://10.0.11.30:6379
NODE_ENV=production
PORT=6002
```

**Order Service (6003)**

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db
KAFKA_BROKERS=broker-1:9092,broker-2:9092,broker-3:9092
REDIS_URL=redis://10.0.11.30:6379
NODE_ENV=production
PORT=6003
```

**Payment Service (6004)**

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db
KAFKA_BROKERS=broker-1:9092,broker-2:9092,broker-3:9092
STRIPE_SECRET_KEY=sk_live_xxxxx
NODE_ENV=production
PORT=6004
```

**Review Service (6005)**

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@zudox-prod-db.xxxxx.rds.amazonaws.com:5432/zudox_db
KAFKA_BROKERS=broker-1:9092,broker-2:9092,broker-3:9092
REDIS_URL=redis://10.0.11.30:6379
NODE_ENV=production
PORT=6005
```

**API Gateway (6000)**

```bash
NODE_ENV=production
PORT=6000
AUTH_SERVICE_URL=http://10.0.10.10:6001
PRODUCT_SERVICE_URL=http://10.0.10.20:6002
ORDER_SERVICE_URL=http://10.0.10.30:6003
PAYMENT_SERVICE_URL=http://10.0.11.10:6004
REVIEW_SERVICE_URL=http://10.0.11.20:6005
ALLOWED_ORIGINS=https://www.zudox.online,https://admin.zudox.online,https://seller.zudox.online
```

---

## Application Load Balancer

### Step 1: Create ALB

```bash
AWS Console > EC2 > Load Balancers > Create Application Load Balancer

Basic Configuration:
- Name: zudox-alb
- Scheme: Internet-facing
- IP address type: IPv4
- VPC: zudox-vpc
- Subnets: zudox-public-1a, zudox-public-1b (both AZs)

Security Groups:
- zudox-alb-sg

Listeners:
- HTTP (80) → Redirect to HTTPS
- HTTPS (443) → Forward to target groups
```

### Step 2: Create Target Groups

**API Gateway Target Group**

```bash
Name: zudox-api-gateway-tg
Protocol: HTTP
Port: 6000
VPC: zudox-vpc
Health Check:
  - Path: /api/health
  - Port: 6000
  - Interval: 30s
  - Timeout: 5s
  - Healthy threshold: 2
  - Unhealthy threshold: 2

Register Targets:
  - api-gateway-prod (10.0.1.20:6000)
```

**Admin UI Target Group**

```bash
Name: zudox-admin-ui-tg
Protocol: HTTP
Port: 3000
VPC: zudox-vpc
# (Deploy admin-ui Next.js app to instance 10.0.1.30)
```

**User UI Target Group**

```bash
Name: zudox-user-ui-tg
Protocol: HTTP
Port: 3000
VPC: zudox-vpc
# (Deploy user-ui Next.js app to instance 10.0.1.40)
```

### Step 3: Configure Listener Rules

```bash
HTTPS (443):
  Rule 1:
    - Host header: www.zudox.online
    - Forward to: zudox-api-gateway-tg

  Rule 2:
    - Host header: admin.zudox.online
    - Forward to: zudox-admin-ui-tg

  Rule 3:
    - Host header: seller.zudox.online
    - Forward to: zudox-user-ui-tg (reuse)

HTTP (80):
  - Redirect to HTTPS
```

---

## DNS & SSL Setup

### Step 1: Request SSL Certificate

```bash
AWS Console > Certificate Manager > Request a certificate

Domain Names:
- www.zudox.online
- admin.zudox.online
- seller.zudox.online
- *.zudox.online (wildcard for future subdomains)

Validation Method: DNS (preferred)

Wait for AWS to create CNAME records and validate
```

### Step 2: Update Route 53

**Create Hosted Zone** (if not exists)

```bash
AWS Console > Route 53 > Hosted Zones > Create Hosted Zone

Domain: zudox.online
Type: Public Hosted Zone
```

**Create DNS Records**

```bash
Record Name: www
Type: A
Alias: Yes
Alias Target: zudox-alb (ALB DNS name)
Routing Policy: Simple
Evaluate Target Health: Yes

---

Record Name: admin
Type: A
Alias: Yes
Alias Target: zudox-alb

---

Record Name: seller
Type: A
Alias: Yes
Alias Target: zudox-alb
```

### Step 3: Attach Certificate to ALB

```bash
AWS Console > EC2 > Load Balancers > zudox-alb > Listeners

HTTPS (443) Listener:
- Certificate: Select from ACM (choose www.zudox.online cert)
- Default Action: Forward to appropriate target group
```

---

## Monitoring & Scaling

### CloudWatch Setup

**Create Dashboards**

```bash
Metrics to monitor:
- ALB: RequestCount, TargetResponseTime, HTTPCode_Target_5XX
- EC2: CPUUtilization, NetworkIn, NetworkOut
- RDS: DBConnections, CPUUtilization, FreeableMemory
- MSK: BytesInPerSec, BytesOutPerSec
```

**Set CloudWatch Alarms**

```bash
- ALB Response Time > 1000ms → SNS Notification
- EC2 CPU > 80% → Scale Up
- RDS CPU > 70% → Alert
- RDS Storage > 80% → Alert
```

### Auto Scaling (Optional)

```bash
For stateless services, create launch template:
- Image: Your service image
- Instance type: t3.medium
- Security group: zudox-services-sg
- IAM role: EC2-ECR-access role

Create Auto Scaling Group:
- Min: 1, Desired: 2, Max: 5
- Attach to target group
- Scale based on ALB request count
```

---

## Troubleshooting

### Service Connection Issues

```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Test connectivity from API Gateway to service
ssh -i key.pem ec2-user@10.0.1.20
curl http://10.0.10.10:6001/api/health

# Check service logs
docker logs auth-service
```

### Database Connection Issues

```bash
# Verify RDS endpoint
nslookup zudox-prod-db.xxxxx.rds.amazonaws.com

# Test from EC2
psql -h zudox-prod-db.xxxxx.rds.amazonaws.com -U postgres -d zudox_db

# Check RDS security group
aws ec2 describe-security-groups --filters Name=group-name,Values=zudox-rds-sg
```

### Kafka Connection Issues

```bash
# Get bootstrap servers
aws kafka describe-cluster --cluster-arn <cluster-arn>

# Test topic creation
/opt/kafka/bin/kafka-topics.sh --bootstrap-server broker-1:9092 --list
```

---

## Deployment Checklist

- [ ] VPC and subnets created
- [ ] Security groups configured
- [ ] RDS instance running
- [ ] MSK cluster running
- [ ] EC2 instances launched
- [ ] Docker images built and pushed to ECR
- [ ] Services deployed and running
- [ ] ALB configured and health checks passing
- [ ] SSL certificate installed
- [ ] Route 53 DNS records pointing to ALB
- [ ] Services can communicate via private network
- [ ] CloudWatch monitoring enabled
- [ ] Backup policies in place
- [ ] Load testing completed

---

**Questions or issues?** Check troubleshooting section or review CloudWatch logs.
