# Instagram Scheduler

A Next.js + Express application for scheduling Instagram posts.

## Prerequisites

- Node.js 18+
- NPM

## Installation

1.  Clone the repository.
2.  Install dependencies and build the client:
    ```bash
    npm install
    ```
    This command will automatically install dependencies for root, server, and client, and build the Next.js client to `client/out`.

## Running locally

To start the application in production mode (using the built client):

```bash
npm start
```

The server will start on port 5001 (default). Open `http://localhost:5001` in your browser.

## Development

To run in development mode (with hot-reload for client and server):

```bash
npm run dev
```

## Deployment (Hostinger / VPS)

1.  Upload the files to your server.
2.  Run `npm install` to build the project.
3.  Start the application:
    -   **Shared Hosting**: Configure the startup file to `server/index.js` or `npm start`.
    -   **VPS (PM2)**: run `pm2 start ecosystem.config.js`.
