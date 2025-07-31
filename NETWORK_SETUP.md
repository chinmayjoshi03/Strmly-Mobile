# Network Configuration Guide

## Quick IP Address Change

When switching networks, you only need to update **one variable** in the `.env` file:

```bash
# In Strmly-Mobile/.env
EXPO_PUBLIC_IP_ADDRESS=YOUR_NEW_IP_ADDRESS
```

## Example

If your new network IP is `192.168.0.100`, simply change:

```bash
# From:
EXPO_PUBLIC_IP_ADDRESS=192.168.252.2

# To:
EXPO_PUBLIC_IP_ADDRESS=192.168.0.100
```

## Backend Port Configuration

Your backend runs on **port 8080**. The configuration automatically uses:
- `EXPO_PUBLIC_API_URL=http://YOUR_IP:8080` - For video feeds and main API
- `BACKEND_API_URL=http://YOUR_IP:8080` - For authentication and user actions

## What Gets Updated Automatically

The app will automatically use this IP address for:
- Video feed API calls
- Authentication (login/signup)
- User profile and actions
- Upload flow
- Series management
- Draft operations
- Studio functionality

## Files That Use This Configuration

- `Constants/config.ts` - Central configuration
- `app/upload/hooks/useUploadFlow.ts` - Upload operations
- `app/studio/hooks/useStudioDrafts.ts` - Draft management
- `app/studio/hooks/useSeries.ts` - Series operations
- `app/studio/screens/SimpleSeriesCreationScreen.tsx` - Series creation

## No More Manual Updates Needed!

Previously, you had to update IP addresses in multiple files. Now everything is centralized through the environment variable.