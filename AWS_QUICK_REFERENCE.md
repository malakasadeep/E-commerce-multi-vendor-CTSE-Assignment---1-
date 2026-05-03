# AWS Setup Quick Reference

## Zudox E-Commerce - Fast Configuration Path

**Total Setup Time**: ~2-3 hours (after EC2 instances running)

---

## Configuration Sequence (In Order)

### Phase 1: IAM & GitHub (15 minutes)

```
1. Create OIDC Provider (token.actions.githubusercontent.com)
2. Create IAM Role (github-actions-oidc-role)
3. Add inline ECR + EC2 + SSM permissions
4. Set GitHub Secrets: AWS_GHA_ROLE_ARN
5. Set GitHub Variables: AWS_REGION, ECR_REPOSITORY_PREFIX, CONTAINER_NAME_PREFIX
```

### Phase 2: Network (20 minutes)

```
1. Create VPC (10.0.0.0/16)
2. Create 5 subnets (2 public, 3 private)
3. Create Internet Gateway + 2 NAT Gateways
4. Create route tables (public → IGW, private → NAT)
5. Create 5 Security Groups (ALB, API Gateway, Services, Atlas, Kafka)
```

### Phase 3: Data Layer (30 minutes - most of this is waiting)

```
1. Create MongoDB Atlas cluster
2. Create MongoDB Atlas database user and network access
3. Launch a small Kafka EC2 instance (KRaft mode)
   ⏳ Wait ~15-20 minutes for cluster creation
```

### Phase 4: Container Registry (5 minutes)

```
1. Create 6 ECR repositories:
   - eshop-api-gateway
   - eshop-auth-service
   - eshop-product-service
   - eshop-order-service
   - eshop-payment-service
   - eshop-review-service
```

### Phase 5: EC2 Instances (30 minutes)

```
1. Create IAM instance role (zudox-ec2-instance-role)
2. Launch 6 EC2 instances with user data script:
   - api-gateway-prod (10.0.1.20, public subnet)
   - auth-service-prod (10.0.10.10, private subnet)
   - product-service-prod (10.0.10.20, private subnet)
   - order-service-prod (10.0.10.30, private subnet)
   - payment-service-prod (10.0.11.10, private subnet)
   - review-service-prod (10.0.11.20, private subnet)
   - kafka-1 (10.0.10.50, private subnet)

⚠️ CRITICAL: Add tags:
   - Service: [service-name]
   - Environment: production
```

### Phase 6: Configuration (20 minutes)

```
For each EC2 instance:
1. SSH in: ssh ec2-user@INSTANCE_IP
2. Create .env file at /opt/<service>/.env
3. Copy environment variables from guide
4. chmod 644 /opt/<service>/.env
```

### Phase 7: Database Init (10 minutes)

```
1. Set DATABASE_URL to the MongoDB Atlas connection string
2. Run: npx prisma generate
3. Run: npx prisma db push
```

### Phase 8: Load Balancer (15 minutes)

```
1. Create ALB (zudox-alb)
2. Create target group (zudox-api-gateway-tg)
3. Register api-gateway-prod as target
4. Add HTTP → HTTPS redirect listener
5. Add HTTPS listener with SSL cert
```

### Phase 9: SSL Certificate (varies)

```
1. Request certificate in ACM
2. Add domains: www.zudox.online, admin.zudox.online, seller.zudox.online
3. Validate with DNS CNAME records
4. Attach to ALB
```

### Phase 10: DNS (5 minutes)

```
1. Create Route 53 records:
   - www → ALB
   - admin → ALB
   - seller → ALB
```

---

## Environment Variables Template

### Services (Use actual values)

```bash
# All Services
DATABASE_URL=mongodb+srv://zudox_app:PASSWORD@<cluster>.mongodb.net/zudox?retryWrites=true&w=majority
KAFKA_BROKERS=10.0.10.50:9092
NODE_ENV=production

# Auth Service (port 6001)
PORT=6001
JWT_SECRET=[32+ char random string]
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_live_xxxxx
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@zudox.com
MAIL_PASSWORD=[app-specific-password]
MAIL_FROM_NAME=Zudox

# Product Service (port 6002)
PORT=6002

# Order Service (port 6003)
PORT=6003

# Payment Service (port 6004)
PORT=6004
STRIPE_SECRET_KEY=sk_live_xxxxx

# Review Service (port 6005)
PORT=6005

# API Gateway (port 8080)
PORT=8080
AUTH_SERVICE_URL=http://10.0.10.10:6001
PRODUCT_SERVICE_URL=http://10.0.10.20:6002
ORDER_SERVICE_URL=http://10.0.10.30:6003
PAYMENT_SERVICE_URL=http://10.0.11.10:6004
REVIEW_SERVICE_URL=http://10.0.11.20:6005
ALLOWED_ORIGINS=https://www.zudox.online,https://admin.zudox.online,https://seller.zudox.online
```

---

## EC2 Instance Details

| Service     | Instance             | IP         | Port | Subnet     | SG          |
| ----------- | -------------------- | ---------- | ---- | ---------- | ----------- |
| API Gateway | api-gateway-prod     | 10.0.1.20  | 8080 | public-1a  | alb-sg      |
| Auth        | auth-service-prod    | 10.0.10.10 | 6001 | private-1a | services-sg |
| Product     | product-service-prod | 10.0.10.20 | 6002 | private-1a | services-sg |
| Order       | order-service-prod   | 10.0.10.30 | 6003 | private-1a | services-sg |
| Payment     | payment-service-prod | 10.0.11.10 | 6004 | private-1b | services-sg |
| Review      | review-service-prod  | 10.0.11.20 | 6005 | private-1b | services-sg |

---

## GitHub Actions Automation

After manual setup complete, your workflows handle:

1. **CI Workflow** (on push)
   - Lint, Test, Build, Typecheck
   - SonarQube scans

2. **Build & Push Workflow** (after CI passes)
   - Builds Docker images
   - Pushes to ECR with tags:
     - `latest`
     - `sha-COMMIT_SHA`

3. **Deploy Workflow** (after build passes)
   - Finds EC2 instances by `Service` + `Environment` tags
   - Uses SSM to:
     1. Pull latest image from ECR
     2. Stop old container
     3. Start new container with /opt/SERVICE/.env

---

## Testing Deployment

After first deployment via GitHub Actions:

```bash
# Test from API Gateway instance
ssh ec2-user@API_GATEWAY_IP

# Check service health
curl http://10.0.10.10:6001/api/health
curl http://10.0.10.20:6002/api/health
curl http://10.0.10.30:6003/api/health
curl http://10.0.11.10:6004/api/health
curl http://10.0.11.20:6005/api/health

# Check containers running
docker ps

# View logs
docker logs eshop-auth-service
docker logs eshop-api-gateway
```

---

## Key Commands (Quick Copy-Paste)

**Check MongoDB Atlas Connection**:

```bash
mongosh "mongodb+srv://<cluster>.mongodb.net/zudox" --username zudox_app
```

**Check Kafka Broker**:

```bash
# Check Kafka service on the EC2 instance
ssh ec2-user@10.0.10.50
sudo systemctl status kafka
```

**SSH to Instances**:

```bash
# Use EC2 Instance Connect or Systems Manager Session Manager
# Or traditional SSH with key file
ssh -i zudox-key.pem ec2-user@10.0.10.10
```

**View CloudWatch Logs**:

```bash
# EC2 instance system logs
# RDS performance insights
# ALB access logs
# MSK broker logs
```

---

## Safety Checklist

- [ ] Store RDS password in AWS Secrets Manager
- [ ] Store JWT_SECRET somewhere secure
- [ ] Store Stripe keys securely
- [ ] Enable RDS backups (30 days)
- [ ] Enable RDS multi-AZ
- [ ] Enable RDS encryption at rest
- [ ] Enable EBS encryption on EC2
- [ ] Restrict SSH access (only your IP)
- [ ] Set up CloudWatch alarms for:
  - RDS CPU > 70%
  - EC2 CPU > 80%
  - ALB response time > 1s
  - ALB 5xx errors > 10

---

**Detailed guide**: See `AWS_MANUAL_CONFIGURATION.md`  
**Previous deployment info**: See `AWS_EC2_DEPLOYMENT_GUIDE.md`
