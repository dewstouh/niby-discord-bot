# Support & Troubleshooting Guide

Having issues with the Niby Discord Bot? This guide will help you troubleshoot common problems and find support when needed.

## 📋 Table of Contents

- [Common Issues](#common-issues)
- [Environment Setup](#environment-setup)
- [Database Connectivity](#database-connectivity)
- [Music System](#music-system)
- [Redis Cache](#redis-cache)
- [Dashboard](#dashboard)
- [Getting Help](#getting-help)

## Common Issues

### Bot Not Starting

1. **Check Environment Variables**
   - Ensure your `.env` file contains all required variables
   - Verify your bot token is correct and not expired
   - Make sure MongoDB and Redis connection strings are valid

2. **Check Node.js Version**
   - Run `node -v` to verify you have Node.js 18.x or newer
   - If outdated, [update Node.js](https://nodejs.org/en/download/)

3. **Check Dependencies**
   - Run `npm install` to ensure all dependencies are installed
   - Check for any error messages during installation

### Commands Not Working

1. **Check Permissions**
   - Ensure the bot has proper permissions in the server
   - Check if the command requires specific user or bot permissions

2. **Check Command Syntax**
   - Verify you're using the correct prefix
   - Check command arguments and syntax

3. **Check Bot Status**
   - Verify the bot is online and responding to other commands
   - Check if the command might be disabled or restricted

## Environment Setup

### Node.js Requirements

- Node.js 18.x or newer is required
- npm 9.x or newer recommended

### Setting Up Environment Variables

1. Copy `example.env` to `.env`
2. Fill in required values:
   - `BOT_TOKEN`: Your Discord bot token
   - `DATABASE_URL`: MongoDB connection URL
   - `REDIS_URL`: Redis connection URL
   - Other required fields as specified in comments

### Handling Permission Issues

If you encounter permission errors:

1. Check Discord Developer Portal to ensure intents are enabled
2. Review bot's server permissions
3. Ensure necessary environment variables are set

## Database Connectivity

### MongoDB Connection Issues

1. **Check Connection String**
   - Verify username and password are correct
   - Ensure IP whitelist includes your server's IP

2. **Check MongoDB Version**
   - MongoDB 5.0+ recommended

3. **Test Connection**
   ```bash
   mongosh "mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/dbName"
   ```

### Database Performance Issues

1. **Check Indexes**
   - Ensure appropriate indexes are created on frequently queried fields

2. **Enable Caching**
   - Set `CACHE_DB="true"` in your `.env` file
   - Ensure Redis is properly configured

## Music System

### Lavalink Setup

1. **Install Java**
   - Java 11+ required for Lavalink

2. **Start Lavalink Server**
   - Download Lavalink.jar (4.0.0+)
   - Create proper `application.yml`
   - Run with `java -jar Lavalink.jar`

### Common Music Issues

1. **No Sound**
   - Check if bot has joined the voice channel
   - Verify Lavalink server is running
   - Check if the URL/track is valid

2. **Laggy Playback**
   - Check server CPU usage
   - Consider upgrading server resources
   - Check network bandwidth

## Redis Cache

### Setting Up Redis

1. **Install Redis**
   - Follow [Redis installation guide](https://redis.io/download)

2. **Configure Redis**
   - Default port is 6379
   - Set password if needed
   - Update `.env` with correct configuration

### Troubleshooting Redis

1. **Test Connection**
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

2. **Check Memory Usage**
   ```bash
   redis-cli info memory
   ```

## Dashboard

### Dashboard Not Loading

1. **Check Configuration**
   - Verify `DASHBOARD="true"` in `.env`
   - Check `PORT` and `WEB_DOMAIN` settings

2. **Check Dependencies**
   - Ensure all frontend dependencies are installed
   - Check for console errors in browser

### Authentication Issues

1. **Check Discord OAuth**
   - Verify redirect URLs are correctly set in Discord Developer Portal
   - Check callback URL configuration

## Getting Help

If you're still experiencing issues after trying these troubleshooting steps:

### 💬 Discord Support Server

Join our [Discord Support Server](https://discord.gg/MBPsvcphGf) for direct help from the community and developers.

### 📝 GitHub Issues

Create a [GitHub Issue](https://github.com/dewstouh/niby-discord-bot/issues) with:
- Detailed description of the problem
- Steps to reproduce
- Environment details (Node.js version, OS, etc.)
- Relevant logs

### 📧 Direct Contact

For critical issues, contact the main developer directly via Discord: `dewstouh`

---

Remember to check the [documentation](README.md) first, as many answers can be found there!
