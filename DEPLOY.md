
# Deployment Guide

This guide explains how to deploy the **ZDSPGC Online Enrollment System**.

## Prerequisites
- Node.js (v20 or higher)
- PostgreSQL Database (or it will fallback to SQLite)

## Local Deployment (Production Mode)

To run the system in a production-like environment on your local machine:

1.  **Build the Project:**
    This compiles the client and server code into optimized files.
    ```bash
    npm run build
    ```

2.  **Start the Server:**
    This runs the server using the compiled files.
    ```bash
    npm run start
    ```

3.  **Access the Application:**
    -   **On the same machine:** Open browser to `http://localhost:5000`
    -   **On the same network (LAN):** Find your IP address (run `ipconfig` on Windows or `ifconfig` on Linux/Mac) and access `http://<YOUR_IP>:5000` from another device.

## External Deployment

To deploy this application to the internet, you can use a VPS or a Platform-as-a-Service (PaaS) provider.

### Option A: Using a VPS (Virtual Private Server)
1.  Upload your project files to the server.
2.  Install dependencies: `npm install`
3.  Set up environment variables (create a `.env` file):
    ```env
    DATABASE_URL=postgres://user:password@host:5432/dbname
    SESSION_SECRET=your_secret_key
    ```
4.  Build and Start:
    ```bash
    npm run build
    npm run start
    ```
5.  Use a process manager like `pm2` to keep the server running:
    ```bash
    npm install -g pm2
    pm2 start dist/index.js --name "enrollment-system"
    ```

### Option B: Cloud Platforms (e.g., Render, Railway)
1.  Connect your GitHub repository.
2.  Set the **Build Command** to: `npm install && npm run build`
3.  Set the **Start Command** to: `npm run start`
4.  Add your `DATABASE_URL` environment variable.

## Troubleshooting
-   **Port in Use:** If port 5000 is busy, the server won't start. Kill the process using port 5000 or change the port in `server/index.ts`.
-   **Database Issues:** Ensure your database credentials are correct. Running `npm run db:push` helps sync the schema.
