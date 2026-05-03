# AWS Manual Configuration Guide - Zudox E-Commerce

## Based on Existing CI/CD Workflows

**Setup Date**: May 1, 2026  
**Domain**: www.zudox.online  
**Environment**: Production  
**Architecture**: Multi-service microservices with MongoDB Atlas, Kafka EC2, and ALB

---

## Overview of Workflow Architecture

Your GitHub Actions workflows automate:

1. **CI Pipeline** → Lint, Test, Build, SonarQube checks
2. **Build & Push** → Docker images to ECR (Elastic Container Registry)
3. **Deploy to EC2** → Uses SSM to run containers on tagged EC2 instances

**Key Dependencies**:

- ECR repositories (6 services)
- EC2 instances with specific tags (Service, Environment)
- MongoDB Atlas database
- Kafka EC2 broker
- IAM OIDC role for GitHub Actions
- ALB for routing traffic

---

## Part 1: AWS Account Setup & Credentials

### Step 1: Create GitHub OIDC Provider

Go to **IAM → Identity Providers → Add Provider**

```
Provider Type: OpenID Connect
Provider URL: https://token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

Click **Add Provider**.

---

### Step 2: Create IAM Role for GitHub Actions

Go to **IAM → Roles → Create Role**

```
Trusted entity type: Web identity
Web identity provider: token.actions.githubusercontent.com
Audience: sts.amazonaws.com

Add condition (important):
  - Condition: StringLike
  - sts:sub: repo:YOUR_GITHUB_USERNAME/e-commerce-multi-vendor:*
```

Click **Next**.

**Add Permissions**:

- `AmazonEC2ContainerRegistryPowerUser` (for ECR operations)
- `AmazonEC2FullAccess` (for EC2 tagging and instance lookup)
- `AmazonSSMManagedInstanceCore` (for SSM operations)

**Inline Policy** (for fine-grained control):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:CreateRepository",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["ec2:DescribeInstances", "ec2:CreateTags"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["ssm:SendCommand", "ssm:GetCommandInvocation"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    }
  ]
}
```

**Save the Role ARN** (example: `arn:aws:iam::123456789012:role/github-actions-oidc-role`)

---

### Step 3: Configure GitHub Secrets & Variables

Go to **GitHub Repository → Settings → Secrets and Variables → Actions**

**Repository Secrets**:

```
AWS_GHA_ROLE_ARN = arn:aws:iam::123456789012:role/github-actions-oidc-role
SONAR_TOKEN = (if using SonarQube)
SONAR_HOST_URL = (if using SonarQube)
```

**Repository Variables**:

```
AWS_REGION = us-east-1
ECR_REPOSITORY_PREFIX = eshop
CONTAINER_NAME_PREFIX = eshop
```

---

## Part 2: Network Infrastructure

### Step 1: Create VPC

Go to **VPC → VPCs → Create VPC**

```
Name: zudox-vpc
IPv4 CIDR block: 10.0.0.0/16
Tenancy: Default
DNS support: Enabled
DNS hostnames: Enabled
```

---

### Step 2: Create Subnets

Go to **VPC → Subnets → Create Subnet**

**Public Subnets** (for ALB):

```
Subnet 1:
  Name: zudox-public-1a
  VPC: zudox-vpc
  AZ: us-east-1a
  IPv4 CIDR: 10.0.1.0/24 - 10.0.0.0/20

Subnet 2:
  Name: zudox-public-1b
  VPC: zudox-vpc
  AZ: us-east-1b
  IPv4 CIDR: 10.0.2.0/24 - 10.0.16.0/20
```

**Private Subnets** (for services and Kafka EC2):

```
Subnet 1:
  Name: zudox-private-1a
  VPC: zudox-vpc
  AZ: us-east-1a
  IPv4 CIDR: 10.0.128.0/20

Subnet 2:
  Name: zudox-private-1b
  VPC: zudox-vpc
  AZ: us-east-1b
  IPv4 CIDR: 10.0.144.0/20

Subnet 3:
  Name: zudox-private-1c
  VPC: zudox-vpc
  AZ: us-east-1c
  IPv4 CIDR: 10.0.160.0/20
```

---

### Step 3: Create Internet Gateway & NAT

**Internet Gateway**:

```
Go to VPC → Internet Gateways → Create Internet Gateway
Name: zudox-igw
Attach to VPC: zudox-vpc
```

**NAT Gateways** (for private subnet outbound traffic):

```
Gateway 1:
  Name: zudox-nat-1a
  Subnet: zudox-public-1a
  Allocate Elastic IP

Gateway 2:
  Name: zudox-nat-1b
  Subnet: zudox-public-1b
  Allocate Elastic IP
```

---

### Step 4: Create Route Tables

**Public Route Table**:

```
Go to VPC → Route Tables → Create Route Table
Name: zudox-public-rt
VPC: zudox-vpc

Routes:
  Destination: 0.0.0.0/0
  Target: zudox-igw

Subnet Associations:
  - zudox-public-1a
  - zudox-public-1b
```

**Private Route Table 1a**:

```
Name: zudox-private-rt-1a
VPC: zudox-vpc

Routes:
  Destination: 0.0.0.0/0
  Target: zudox-nat-1a

Subnet Associations:
  - zudox-private-1a
```

**Private Route Table 1b**:

```
Name: zudox-private-rt-1b
VPC: zudox-vpc

Routes:
  Destination: 0.0.0.0/0
  Target: zudox-nat-1b

Subnet Associations:
  - zudox-private-1b
  - zudox-private-1c
```

---

## Part 3: Security Groups

Go to **EC2 → Security Groups → Create Security Group**

### ALB Security Group

```
Name: zudox-alb-sg
Description: Allow HTTPS/HTTP from internet
VPC: zudox-vpc

Inbound Rules:
  - Protocol: TCP, Port: 80, Source: 0.0.0.0/0
  - Protocol: TCP, Port: 443, Source: 0.0.0.0/0

Outbound Rules:
  - All traffic (default)
```

### API Gateway Security Group

```
Name: zudox-api-gateway-sg
Description: API Gateway service
VPC: zudox-vpc

Inbound Rules:
  - Protocol: TCP, Port: 8080, Source: zudox-alb-sg
  - Protocol: TCP, Port: 22, Source: YOUR_IP/32 (for SSH admin access) - ///remmm

Outbound Rules:
  - All traffic (default)
```

### Microservices Security Group

```
Name: zudox-services-sg
Description: Auth, Product, Order, Payment, Review services
VPC: zudox-vpc

Inbound Rules:
  - Protocol: TCP, Port: 6001-6005, Source: zudox-api-gateway-sg
  - Protocol: TCP, Port: 6001-6005, Source: zudox-services-sg (self-reference)
  - Protocol: TCP, Port: 22, Source: YOUR_IP/32

Outbound Rules:
  - All traffic (default)
```

### MongoDB Atlas Access

```
Name: zudox-atlas-access
Description: Outbound access from EC2 to MongoDB Atlas
VPC: zudox-vpc

Inbound Rules:
  - None required for Atlas

Outbound Rules:
  - All traffic (default)
```

### Kafka EC2 Security Group

```
Name: zudox-kafka-sg
Description: Kafka broker on EC2
VPC: zudox-vpc

Inbound Rules:
  - Protocol: TCP, Port: 9092, Source: zudox-services-sg
  - Protocol: TCP, Port: 9092, Source: zudox-kafka-sg (self-reference)

Outbound Rules:
  - All traffic (default)
```

---

## Part 4: Database (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

Go to **MongoDB Atlas → Create Cluster**

```
Cluster Name: zudox-mongo-cluster
Cloud Provider: AWS
Region: us-east-1
Tier: M10 or higher for production
Network Access: allow only your EC2/NAT public IPs or use VPC peering/private endpoint
```

---

### Step 2: Create Database User and Network Access

Go to **MongoDB Atlas → Database Access** and **Network Access**

**Database User**:

```
Username: zudox_app
Password: [Generate strong password - store securely]
Privileges: readWrite on zudox database
```

**Network Access**:

```
Allow access from your EC2 instances via their NAT public IPs or a VPC peering/private endpoint
```

**Connection String**:

```
mongodb+srv://zudox_app:<PASSWORD>@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
```

**Environment Variable**:

```
DATABASE_URL=mongodb+srv://zudox_app:<PASSWORD>@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
```

**Backup / Resilience**:

```
Enable replica set / multi-region if needed
Enable backups/snapshots in Atlas
```

**Security**:

```
Enable TLS and keep Atlas network access restricted
```

**After Setup**:

```
npx prisma generate
npx prisma db push
```

### Step 3: Save Atlas Connection String in AWS

Store the Atlas connection string in **AWS Secrets Manager** or **SSM Parameter Store** and pass it to your EC2 instances as `DATABASE_URL`.

---

## Part 5: Kafka on EC2 (KRaft)

Use a **small EC2 instance** as a self-hosted Kafka broker so you avoid MSK cost.

### Step 1: Launch Kafka EC2 Instance

```
Name: zudox-kafka-1
Instance Type: t3.small
Subnet: zudox-private-1a
Security Group: zudox-kafka-sg
Storage: 50 GB gp3
Public IP: No
```

### Step 2: Install Kafka in KRaft Mode

```
1) SSH into the Kafka instance
  ssh -i <your-key>.pem ec2-user@<kafka-instance-private-ip>

2) Install Java 17 and basic tools
  sudo dnf update -y
  sudo dnf install -y java-17-amazon-corretto-headless wget tar
  java -version

3) Download and install Kafka 3.6.x
  cd /opt
  sudo wget https://archive.apache.org/dist/kafka/3.6.2/kafka_2.13-3.6.2.tgz
  sudo tar -xzf kafka_2.13-3.6.2.tgz
  sudo ln -sfn kafka_2.13-3.6.2 kafka
  sudo chown -R ec2-user:ec2-user /opt/kafka_2.13-3.6.2 /opt/kafka

4) Get this instance private IP - 10.0.141.134
  PRIVATE_IP=$(hostname -I | awk '{print $1}')
  echo $PRIVATE_IP

5) Create KRaft config (single node)
  cat > /opt/kafka/config/kraft/server.properties << EOF
  process.roles=broker,controller
  node.id=1
  controller.quorum.voters=1@${PRIVATE_IP}:9093

  listeners=PLAINTEXT://${PRIVATE_IP}:9092,CONTROLLER://${PRIVATE_IP}:9093
  advertised.listeners=PLAINTEXT://${PRIVATE_IP}:9092
  listener.security.protocol.map=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
  inter.broker.listener.name=PLAINTEXT
  controller.listener.names=CONTROLLER

  log.dirs=/var/lib/kafka/data
  num.partitions=3
  default.replication.factor=1
  offsets.topic.replication.factor=1
  transaction.state.log.replication.factor=1
  transaction.state.log.min.isr=1
  EOF

6) Prepare data dir and format storage
  sudo mkdir -p /var/lib/kafka/data
  sudo chown -R ec2-user:ec2-user /var/lib/kafka
  KAFKA_CLUSTER_ID=$(/opt/kafka/bin/kafka-storage.sh random-uuid)
  /opt/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /opt/kafka/config/kraft/server.properties

7) Start Kafka
  nohup /opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/kraft/server.properties > /var/log/kafka.log 2>&1 &

8) Verify broker is running
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --list
  ss -lntp | grep -E ':9092|:9093'
```

### Step 3: Networking

```
Security Group: zudox-kafka-sg

Inbound rules:
- TCP 9092 from zudox-services-sg (required)
- TCP 9092 from zudox-api-gateway-sg (optional, only if API Gateway produces/consumes Kafka)
- TCP 9092 from zudox-kafka-sg (self reference, optional for future scale-out)

Inbound 9093 (controller) is NOT required from other services for single-node KRaft.
Keep 9093 internal to the broker process.

Outbound rules:
- Keep default allow-all outbound

Quick connectivity test from one service EC2 instance:
- nc -vz <kafka-private-ip> 9092
```

### Step 4: Topics

```
Run these on the Kafka EC2 instance:

PRIVATE_IP=$(hostname -I | awk '{print $1}')

/opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --create --topic products --partitions 3 --replication-factor 1
/opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --create --topic orders --partitions 3 --replication-factor 1
/opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --create --topic payments --partitions 3 --replication-factor 1
/opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --create --topic reviews --partitions 3 --replication-factor 1

Verify topics:
/opt/kafka/bin/kafka-topics.sh --bootstrap-server ${PRIVATE_IP}:9092 --list

Optional smoke test:
/opt/kafka/bin/kafka-console-producer.sh --bootstrap-server ${PRIVATE_IP}:9092 --topic orders
/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server ${PRIVATE_IP}:9092 --topic orders --from-beginning
```

### Step 5: Connection String

```
1) Get Kafka private IP from EC2 console or on instance: 10.0.141.134
  hostname -I | awk '{print $1}'

2) Set this value in each service env file:
  KAFKA_BROKERS=<kafka-private-ip>:9092

Example:
KAFKA_BROKERS=10.0.141.134:9092

3) Restart containers/services after changing env files.
```

---

## Part 6: Elastic Container Registry (ECR)

Go to **ECR → Repositories → Create Repository**

Create **6 repositories** (one per service):

```
1. Repository name: eshop-api-gateway
   Scan on push: Enabled
   Encryption: Default (AWS managed)

2. Repository name: eshop-auth-service
3. Repository name: eshop-product-service
4. Repository name: eshop-order-service
5. Repository name: eshop-payment-service
6. Repository name: eshop-review-service
```

**Note**: Names match `ECR_REPOSITORY_PREFIX` variable (eshop-\*) from your workflows.

---

## Part 7: EC2 Instances

### Step 1: Create IAM Instance Profile

Go to **IAM → Roles → Create Role**

```
Trusted entity: EC2
Permissions:
  - AmazonEC2ContainerRegistryReadOnly (pull from ECR)
  - AmazonSSMManagedInstanceCore (for SSM agent)

Policies to add:
  - ecr:GetAuthorizationToken
  - ssm:UpdateInstanceInformation
  - ec2messages:AcknowledgeMessage
  - ec2messages:DeleteMessage
  - ec2messages:GetMessages

Role name: zudox-ec2-instance-role
```

---

### Step 2: Launch EC2 Instances

Go to **EC2 → Instances → Launch Instances**

**Base Configuration** (for all services):

```
AMI: Amazon Linux 2 (al2023-ami-*)
Instance Type: t3.medium
VPC: zudox-vpc
IAM Instance Profile: zudox-ec2-instance-role
Security Groups: Based on service (see below)
EBS Volume: 50 GB gp3, Encrypted: Yes
Monitoring: Detailed CloudWatch
```

**User Data Script** (paste in Advanced details → User data):

```bash
#!/bin/bash
set -e

# Update system
yum update -y
amazon-linux-extras install docker -y

# Start Docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
yum install aws-cli -y

# Create service directories
mkdir -p /opt/auth-service /opt/product-service /opt/order-service /opt/payment-service /opt/review-service /opt/api-gateway
chmod 777 /opt/*

# Create placeholder for .env files
touch /opt/api-gateway/.env
touch /opt/auth-service/.env
touch /opt/product-service/.env
touch /opt/order-service/.env
touch /opt/payment-service/.env
touch /opt/review-service/.env

# SSM agent (usually pre-installed on AL2)
yum install -y amazon-ssm-agent
systemctl start amazon-ssm-agent
systemctl enable amazon-ssm-agent
```

---

### Step 3: Create Individual Service Instances

Launch instances with these configurations:

#### 1. API Gateway Instance

```
Name: api-gateway-prod
Subnet: zudox-public-1a
Private IP: 10.0.1.20
Security Group: zudox-api-gateway-sg
Elastic IP: Allocate and associate

Tags:
  - Name: api-gateway-prod
  - Service: api-gateway
  - Environment: production
  - Backup: daily
```

#### 2. Auth Service Instance

```
Name: auth-service-prod
Subnet: zudox-private-1a
Private IP: 10.0.128.10
Security Group: zudox-services-sg

Tags:
  - Name: auth-service-prod
  - Service: auth-service
  - Environment: production
  - Backup: daily
```

#### 3. Product Service Instance

```
Name: product-service-prod
Subnet: zudox-private-1a
Private IP: 10.0.128.20
Security Group: zudox-services-sg

Tags:
  - Name: product-service-prod
  - Service: product-service
  - Environment: production
  - Backup: daily
```

#### 4. Order Service Instance

```
Name: order-service-prod
Subnet: zudox-private-1a
Private IP: 10.0.128.30
Security Group: zudox-services-sg

Tags:
  - Name: order-service-prod
  - Service: order-service
  - Environment: production
  - Backup: daily
```

#### 5. Payment Service Instance

```
Name: payment-service-prod
Subnet: zudox-private-1b
Private IP: 10.0.144.10
Security Group: zudox-services-sg

Tags:
  - Name: payment-service-prod
  - Service: payment-service
  - Environment: production
  - Backup: daily
```

#### 6. Review Service Instance

```
Name: review-service-prod
Subnet: zudox-private-1b
Private IP: 10.0.144.20
Security Group: zudox-services-sg

Tags:
  - Name: review-service-prod
  - Service: review-service
  - Environment: production
  - Backup: daily
```

**⚠️ CRITICAL**: Tags must match your deploy workflow:

- `Service` tag: Exact service name (auth-service, product-service, etc.)
- `Environment` tag: production or staging

---

## Part 8: Environment Variables

After instances are launched, SSH into each one and create environment files:

### Auth Service (10.0.128.10)

```bash
cat > /opt/auth-service/.env << 'EOF'
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.141.134:9092
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=30d
NODE_ENV=production
PORT=6001
STRIPE_SECRET_KEY=sk_live_xxxxx
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@zudox.com
MAIL_PASSWORD=app-specific-password
MAIL_FROM_NAME=Zudox
EOF

sudo chmod 644 /opt/auth-service/.env
```

### Product Service (10.0.128.20)

```bash
cat > /opt/product-service/.env << 'EOF'
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.141.134:9092
NODE_ENV=production
PORT=6002
EOF

sudo chmod 644 /opt/product-service/.env
```

### Order Service (10.0.128.30)

```bash
cat > /opt/order-service/.env << 'EOF'
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.141.134:9092
NODE_ENV=production
PORT=6003
EOF

sudo chmod 644 /opt/order-service/.env
```

### Payment Service (10.0.144.10)

```bash
cat > /opt/payment-service/.env << 'EOF'
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.141.134:9092
STRIPE_SECRET_KEY=sk_live_xxxxx
NODE_ENV=production
PORT=6004
EOF

sudo chmod 644 /opt/payment-service/.env
```

### Review Service (10.0.144.20)

```bash
cat > /opt/review-service/.env << 'EOF'
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.141.134:9092
NODE_ENV=production
PORT=6005
EOF

sudo chmod 644 /opt/review-service/.env
```

### API Gateway (10.0.1.20 in public subnet)

```bash
cat > /opt/api-gateway/.env << 'EOF'
NODE_ENV=production
PORT=8080
AUTH_SERVICE_URL=http://10.0.128.10:6001
PRODUCT_SERVICE_URL=http://10.0.128.20:6002
ORDER_SERVICE_URL=http://10.0.128.30:6003
PAYMENT_SERVICE_URL=http://10.0.144.10:6004
REVIEW_SERVICE_URL=http://10.0.144.20:6005
ALLOWED_ORIGINS=https://www.zudox.online,https://admin.zudox.online,https://seller.zudox.online
EOF

sudo chmod 644 /opt/api-gateway/.env
```

---

## Part 9: Database Initialization

After MongoDB Atlas is ready, initialize the database:

```bash
# From any EC2 instance with network access to MongoDB Atlas
# Connect to MongoDB Atlas and push the Prisma schema
export DATABASE_URL="mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority"

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push
```

---

## Part 10: Application Load Balancer

Go to **EC2 → Load Balancers → Create Load Balancer → Application Load Balancer**

**Basic Configuration**:

```
Name: zudox-alb
Scheme: Internet-facing
IP address type: IPv4
VPC: zudox-vpc
Subnets: zudox-public-1a, zudox-public-1b
Security Groups: zudox-alb-sg
```

**Listeners and Routing**:

```
Listener 1: HTTP (80)
  Default action: Redirect to HTTPS (443)

Listener 2: HTTPS (443)
  Default SSL certificate: (select after requesting in ACM)
  Default action: Forward to target group (created below)
```

---

## Part 11: Target Groups & Health Checks

Go to **EC2 → Target Groups → Create Target Group**

### API Gateway Target Group

```
Name: zudox-api-gateway-tg
Protocol: HTTP
Port: 8080
VPC: zudox-vpc

Health Check:
  Protocol: HTTP
  Path: / (or /api/health if endpoint exists)
  Port: 8080
  Interval: 30 seconds
  Timeout: 5 seconds
  Healthy threshold: 2
  Unhealthy threshold: 2

Register Targets:
  - api-gateway-prod (10.0.1.20:8080)
```

---

## Part 12: SSL Certificate (ACM)

Go to **Certificate Manager → Request Certificate**

```
Domain names:
  - www.zudox.online
  - admin.zudox.online
  - seller.zudox.online
  - *.zudox.online (wildcard)

Validation method: DNS

After approval:
  - Attach to ALB HTTPS listener
```

---

## Part 13: DNS Configuration (Route 53)

Go to **Route 53 → Hosted Zones → Create or select zudox.online**

Create **A Records**:

```
Record 1:
  Name: www
  Type: A
  Alias: Yes
  Alias Target: zudox-alb (ALB DNS name)
  Routing Policy: Simple
  Evaluate Target Health: Yes

Record 2:
  Name: admin
  Type: A
  Alias: Yes
  Alias Target: zudox-alb

Record 3:
  Name: seller
  Type: A
  Alias: Yes
  Alias Target: zudox-alb
```

---

## Part 14: Testing & Deployment

### Test Service Communication

```bash
# SSH into API Gateway
ssh ec2-user@API_GATEWAY_IP

# Test connectivity to services
curl http://10.0.128.10:6001/api/health
curl http://10.0.128.20:6002/api/health
curl http://10.0.128.30:6003/api/health
curl http://10.0.144.10:6004/api/health
curl http://10.0.144.20:6005/api/health
```

### First Deployment (Manual)

After EC2 setup is complete, your GitHub Actions will auto-deploy. But you can trigger manually:

1. Go to **GitHub → Actions → Deploy to EC2 → Run Workflow**
2. Select **environment**: production
3. This will:
   - Pull images from ECR
   - Stop old containers
   - Start new containers with environment variables
   - Services will be accessible within minutes

---

## Checklist

- [ ] VPC and Subnets created
- [ ] Internet Gateway and NAT Gateways set up
- [ ] Route tables configured
- [ ] Security Groups created (5 total)
- [ ] MongoDB Atlas cluster running
- [ ] Kafka EC2 instance running
- [ ] ECR repositories created (6 services)
- [ ] EC2 instances launched with proper tags
- [ ] User data script executed on all instances
- [ ] .env files created on all EC2 instances
- [ ] Database initialized with Prisma for MongoDB
- [ ] ALB created with target groups
- [ ] SSL certificate requested in ACM
- [ ] Route 53 DNS records pointing to ALB
- [ ] GitHub OIDC provider configured
- [ ] GitHub secrets configured (AWS_GHA_ROLE_ARN)
- [ ] GitHub variables configured (AWS_REGION, ECR_REPOSITORY_PREFIX, etc.)
- [ ] First deployment triggered

---

## Key Points

✅ **Tagging is Critical**: Your deploy workflow finds instances by:

- Tag `Service` = exact service name
- Tag `Environment` = production or staging

✅ **Environment Files**: Workflow expects `.env` files at `/opt/<service>/.env`

✅ **IAM OIDC**: Secure, no long-lived credentials needed

✅ **SSM Agent**: Pre-installed on AL2, enables passwordless command execution

✅ **Port Mapping**:

- API Gateway: 8080 (internally on EC2)
- Services: 6001-6005
- MongoDB Atlas: 27017/27018 (managed by Atlas; use connection string)
- Kafka: 9092

✅ **Database Connection**: All services use MongoDB Atlas connection string, not localhost

✅ **Kafka Brokers**: Use the private IP of the Kafka EC2 instance

---

## Troubleshooting Common Issues

**Deployment fails with "No running EC2 instance found"**

- Check EC2 instance tags match exactly (Service, Environment)
- Verify instance is running
- Check security group allows SSM (port 443)

**Services can't reach database**

- Verify Atlas network access allows your EC2 NAT public IP(s) or VPC peering/private endpoint
- Check services subnet has NAT gateway route
- Verify DATABASE_URL in .env files

**Services can't reach each other**

- Check zudox-services-sg inbound rules (ports 6001-6005)
- Verify private IP addresses in API Gateway .env match service IPs
- Test with curl commands from EC2

**Kafka connection fails**

- Verify bootstrap servers in .env
- Check zudox-kafka-sg allows port 9092 from service security groups
- Ensure services subnet has NAT gateway route

---

This manual setup aligns with your GitHub Actions workflows and provides a complete production environment.
