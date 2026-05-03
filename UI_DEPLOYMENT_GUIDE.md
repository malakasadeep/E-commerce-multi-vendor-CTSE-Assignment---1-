# UI Deployment & ALB Configuration Guide

## Overview

This guide covers deploying the 3 Next.js UIs (user-ui, seller-ui, admin-ui) to EC2 and configuring ALB for public access.

## Architecture

```
Internet → Route 53 (DNS) → ALB (Application Load Balancer)
                              ├→ /api/* → API Gateway (port 8080)
                              ├→ / (yourdomain.com) → User UI (port 3000)
                              ├→ seller.yourdomain.com → Seller UI (port 3001)
                              └→ admin.yourdomain.com → Admin UI (port 3002)
```

---

## Part 1: Create EC2 Instances for UIs

You can either:

- **Option A**: Use existing service instances (co-host UIs with services)
- **Option B**: Create dedicated UI instances (recommended for production)

### Option B: Single UI Instance (Recommended)

1. **Launch 1 EC2 instance** (t3.small, Amazon Linux 2023):

- `zudox-ui-server-1` (`10.0.128.21`) — runs all 3 UIs

2. Instance configuration:

- VPC: `zudox-vpc` (`10.0.0.0/16`)
- Subnet: `zudox-private-1a` (`10.0.128.0/20`)
- Security Group: `zudox-ui-sg` (inbound from ALB to ports `3000-3002`, plus `80/443` if you use them)
- IAM Role: `zudox-ec2-instance-role` (ECR read access)
- Tags:
  - `Name: zudox-ui-server-1`
  - `Service: ui-server`
  - `Environment: production`

3. Install Docker:

```bash
sudo yum update -y && sudo yum install -y docker git
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

4. Run the three containers on the instance:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker run -d --name eshop-user-ui --restart unless-stopped -p 3000:3000 ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/eshop-user-ui:latest
docker run -d --name eshop-seller-ui --restart unless-stopped -p 3001:3001 ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/eshop-seller-ui:latest
docker run -d --name eshop-admin-ui --restart unless-stopped -p 3002:3002 ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/eshop-admin-ui:latest
docker ps
```

**Why single instance?**

- One box is enough for the three UIs right now
- It avoids the vCPU quota problem you hit during launch
- The workflow can still deploy each UI independently because it uses separate ports and container names

---

## Part 2: Configure GitHub Actions Workflow for UI Deployment

The workflow has been updated to:

1. **Build** UI images on code push
2. **Push** to ECR with image URIs:
   - `{ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/eshop-user-ui:sha-{COMMIT}`
   - `{ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/eshop-seller-ui:sha-{COMMIT}`
   - `{ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/eshop-admin-ui:sha-{COMMIT}`

3. **Deploy** to EC2 instances via SSM (same as services)

The workflow will automatically:

- Pull images from ECR
- Deploy all three UI containers to the single `ui-server` instance
- Run containers on ports `3000`, `3001`, and `3002`
- Expose them through ALB listener rules

---

## Part 3: Create ECR Repositories for UIs

Run this once in AWS:

```bash
aws ecr create-repository --repository-name eshop-user-ui --region us-east-1
aws ecr create-repository --repository-name eshop-seller-ui --region us-east-1
aws ecr create-repository --repository-name eshop-admin-ui --region us-east-1
```

---

## Part 4: Configure Application Load Balancer (ALB)

### 4.1 Create Target Groups

```bash
# User UI
aws elbv2 create-target-group \
  --name zudox-user-ui-tg \
  --protocol HTTP --port 3000 --vpc-id vpc-xxxxx \
  --health-check-protocol HTTP \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 2

# Seller UI
aws elbv2 create-target-group \
  --name zudox-seller-ui-tg \
  --protocol HTTP --port 3001 --vpc-id vpc-xxxxx \
  --health-check-path / \
  --health-check-interval-seconds 30

# Admin UI
aws elbv2 create-target-group \
  --name zudox-admin-ui-tg \
  --protocol HTTP --port 3002 --vpc-id vpc-xxxxx \
  --health-check-path / \
  --health-check-interval-seconds 30
  --protocol HTTP --port 8080 --vpc-id vpc-xxxxx
```

### 4.2 Register Targets

```bash
# Get the UI instance ID:
UI_INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Service,Values=ui-server" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

# Register the same instance to all 3 UI target groups:
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-user-ui-tg/xxxxx \
  --targets Id=$UI_INSTANCE_ID

aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-seller-ui-tg/xxxxx \
  --targets Id=$UI_INSTANCE_ID

aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-admin-ui-tg/xxxxx \
  --targets Id=$UI_INSTANCE_ID

# Register API Gateway instance
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-api-gateway-tg/xxxxx \
  --targets Id=i-api-gateway-id
```

**Why this works:**

- One EC2 instance hosts all three containers
- Each target group forwards to the same instance but a different port
- ALB listener rules still separate user, seller, and admin traffic

### 4.3 Create ALB Listener Rules

**On HTTP (port 80) Listener**, add rules (in order):

1. **API routes** → API Gateway TG
   - Host header: (any)
   - Path pattern: `/api/*` → zudox-api-gateway-tg

2. **Seller subdomain** → Seller UI TG
   - Host header: `seller.*` → zudox-seller-ui-tg

3. **Admin subdomain** → Admin UI TG
   - Host header: `admin.*` → zudox-admin-ui-tg

4. **Default (user UI)** → User UI TG
   - Default action → zudox-user-ui-tg

**Via AWS CLI**:

```bash
ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:loadbalancer/app/zudox-alb/xxxxx"
LISTENER_ARN="arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:listener/app/zudox-alb/xxxxx/80"

# Rule 1: /api/* → API Gateway
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 1 \
  --conditions Field=path-pattern,Values="/api/*" \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-api-gateway-tg/xxxxx

# Rule 2: seller.* → Seller UI
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 2 \
  --conditions Field=host-header,Values="seller.*" \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-seller-ui-tg/xxxxx

# Rule 3: admin.* → Admin UI
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 3 \
  --conditions Field=host-header,Values="admin.*" \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/zudox-admin-ui-tg/xxxxx

# Default rule (user UI) is created by ALB automatically
```

---

## Part 5: Configure Route 53 DNS

You need a domain. For testing, use ALB DNS: `zudox-alb-xxxxxx.us-east-1.elb.amazonaws.com`

For production DNS:

1. **Create Route 53 Hosted Zone** (if not existing):

```bash
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)
```

2. **Create A records** pointing to ALB:

```bash
# Main domain → User UI (ALB)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Seller subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "seller.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "zudox-alb-xxxxxx.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Admin subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "admin.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "zudox-alb-xxxxxx.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# API subdomain (optional, for explicit API access)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "zudox-alb-xxxxxx.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## Part 6: Test Deployment

### 6.1 Manual Push (first time)

```bash
# On each UI instance, manually deploy the first time:
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker pull ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/eshop-user-ui:latest

docker run -d \
  --name eshop-user-ui \
  --restart unless-stopped \
  -p 3000:3000 \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/eshop-user-ui:latest

docker logs eshop-user-ui
```

### 6.2 Test via ALB

```bash
# Using ALB DNS:
curl http://zudox-alb-xxxxxx.us-east-1.elb.amazonaws.com/

# Using domain (after Route 53 propagation):
curl http://yourdomain.com/
curl http://seller.yourdomain.com/
curl http://admin.yourdomain.com/
curl http://api.yourdomain.com/api/...
```

### 6.3 GitHub Actions Deployment

Once infrastructure is ready:

1. **Push code** to GitHub
2. **CI workflow** runs tests
3. **Build and Push workflow** builds UI images, pushes to ECR
4. **Deploy workflow** runs SSM commands on EC2 to pull and run containers

Monitor in GitHub Actions → "Deploy to EC2" workflow.

---

## Troubleshooting

### ALB shows unhealthy targets

- Check health check settings (path `/` should return 200 for Next.js)
- Check security group inbound rules allow ALB → instance ports
- Check instance has Docker container running on correct port

### Next.js returns 404 on ALB

- Ensure `ALLOWED_ORIGINS` env var includes ALB DNS and domain names
- Check ALB listener rules (path patterns, host headers)
- Test directly on instance: `curl http://instance-ip:3000/`

### UI images not deploying

- Verify ECR repositories exist
- Verify EC2 instance role has `ecr:GetAuthorizationToken` + `ecr:BatchGetImage` + `ecr:GetDownloadUrlForLayer`
- Check deploy workflow SSM send-command logs in GitHub Actions

---

## Summary

After completing these steps:
✅ UIs are containerized with Dockerfiles  
✅ GitHub Actions builds and pushes UI images  
✅ EC2 instances have Docker + IAM roles  
✅ ALB routes traffic by host/path  
✅ Route 53 provides DNS  
✅ Public access via `yourdomain.com`

User visits `yourdomain.com` → ALB → User UI (3000)  
Seller visits `seller.yourdomain.com` → ALB → Seller UI (3001)  
Admin visits `admin.yourdomain.com` → ALB → Admin UI (3002)  
API calls to `/api/*` → ALB → API Gateway (8080) → Backend services
