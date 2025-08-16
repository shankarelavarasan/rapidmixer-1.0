# 🔧 Render Environment Variables

## Add these EXACT variables in your Render dashboard:

### Variable 1:
**Name:** `JWT_SECRET`
**Value:** `rapid-mixer-super-secure-jwt-secret-2024`

### Variable 2:
**Name:** `ALLOWED_ORIGINS`
**Value:** `https://shankarelavarasan.github.io,https://rapid-mixer-2-0-1.onrender.com`

### Variable 3:
**Name:** `NODE_ENV`
**Value:** `production`

### Variable 4:
**Name:** `PORT`
**Value:** `10000`

## 📋 How to Add in Render Dashboard:

1. Go to: https://dashboard.render.com
2. Find your service: **rapid-mixer-2-0-1**
3. Click on your service name
4. Go to **Environment** tab
5. Click **Add Environment Variable**
6. Add each variable one by one:

```
Name: JWT_SECRET
Value: rapid-mixer-super-secure-jwt-secret-2024

Name: ALLOWED_ORIGINS  
Value: https://shankarelavarasan.github.io,https://rapid-mixer-2-0-1.onrender.com

Name: NODE_ENV
Value: production

Name: PORT
Value: 10000
```

7. Click **Save Changes**
8. Go to **Deployments** tab
9. Click **Manual Deploy**
10. Wait 2-3 minutes
11. Test: https://rapid-mixer-2-0-1.onrender.com/health

## ✅ Expected Result:
After adding these variables and redeploying, your backend should return:
```json
{
  "status": "OK",
  "message": "Rapid Mixer Backend is running",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0"
}
```