# WebUMKM
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/lrndwy/WebUMKM.git)

WebUMKM is a full-stack e-commerce platform designed for Small and Medium Enterprises (UMKM). It features a Vue.js frontend for user interaction and product display, and a Node.js backend that primarily serves as a proxy to the RajaOngkir API for shipping calculations. The application utilizes PocketBase for data persistence, user authentication, and file storage.

## Features

*   **User Authentication:** Secure login and registration powered by PocketBase.
*   **Role-Based Access Control:** Differentiates between regular users and administrators.
*   **Product Catalog:** Display products with details like name, description, price, weight, and image.
*   **Shopping Cart:** Users can add products to a cart and manage quantities.
*   **Multi-Step Checkout Process:**
    *   Cart review.
    *   Shipping information input with RajaOngkir integration for destination search.
    *   Shipping cost calculation via RajaOngkir.
    *   Selection of payment methods (configured in PocketBase).
    *   Secure transaction creation.
    *   Proof of payment upload functionality.
*   **Order Management:** Users can view their order history and status.
*   **Admin Dashboard:**
    *   Transaction verification.
    *   Application settings management (e.g., setting the origin address for shipping calculations).
    *   (Implied: Product management, user management).
*   **RajaOngkir Proxy:** Backend server proxies requests to RajaOngkir for fetching destinations and calculating shipping costs, keeping the API key secure.
*   **Telegram Notifications:** Sends notifications to an admin/owner via Telegram bot for new paid transactions.
*   **Responsive UI:** Built with Tailwind CSS and shadcn-vue components for a modern and responsive user experience.
*   **Dockerized:** Includes a Dockerfile for containerized deployment.

## Tech Stack

*   **Client (Frontend):**
    *   Vue.js (v3) with Composition API
    *   TypeScript
    *   Vite (Build Tool)
    *   Pinia (State Management)
    *   Vue Router (Routing)
    *   Tailwind CSS
    *   shadcn-vue (UI Components)
    *   PocketBase Client SDK
    *   VeeValidate & Zod (Form Validation)
*   **Server (Backend - RajaOngkir Proxy):**
    *   Node.js
    *   Express.js
    *   Axios (HTTP Client)
    *   CORS
*   **Backend-as-a-Service (BaaS):**
    *   PocketBase (Database, Authentication, File Storage)
*   **Containerization:**
    *   Docker

## Project Structure

```
webumkm/
├── Dockerfile              # Docker configuration for the entire application
├── package.json            # Root project: scripts to run client & server
├── pnpm-lock.yaml
├── .env.example            # Example environment variables
├── client/                 # Vue.js frontend application
│   ├── public/
│   ├── src/                # Main source code for client
│   │   ├── components/     # UI components (including shadcn-vue)
│   │   ├── lib/            # PocketBase client, utility functions
│   │   ├── router/         # Vue Router configuration
│   │   ├── stores/         # Pinia stores (e.g., auth)
│   │   └── views/          # Page-level components
│   ├── package.json        # Client dependencies and scripts
│   └── ...
└── server/                 # Node.js Express backend (RajaOngkir proxy)
    ├── index.js            # Express server setup
    └── package.json        # Server dependencies and scripts
```

## Prerequisites

*   Node.js (v20 or compatible, as per `Dockerfile`)
*   pnpm (Package Manager)
*   Docker (Optional, for containerized deployment)
*   A running PocketBase instance accessible to the application.
*   RajaOngkir API Key.
*   Telegram Bot Token and Owner/Chat ID for notifications.

## Environment Variables

Create a `.env` file in the root directory of the project by copying `.env.example`. Fill in the required values:

```env
# Client Configuration
VITE_PB_URL=https://your-pocketbase-url.com
VITE_RAJAONGKIR_API_KEY=your_rajaongkir_api_key # Note: This is likely unused by client; backend handles actual key
VITE_RAJAONGKIR_URL=https://rajaongkir.komerce.id # Base URL for RajaOngkir (used by Vite dev proxy if configured)
VITE_BOT_TELEGRAM_TOKEN=your_telegram_bot_token
VITE_OWNER_TELEGRAM_ID=your_telegram_chat_id
VITE_APP_URL=http://localhost:5173 # Frontend URL during development or deployed URL
VITE_BACKEND_URL=http://localhost:3001 # URL of your Node.js proxy server

# Server Configuration
PORT=3001
NODE_ENV=development
RAJA_ONGKIR_API_KEY=your_rajaongkir_api_key # Crucial for the backend proxy
FRONTEND_URL=http://localhost:5173,https://webumkm.hexanest.id # Comma-separated list for CORS
```

**Important:**
*   Ensure your PocketBase instance is set up with the necessary collections: `users`, `products`, `payments`, `app_settings`, `transaction`. Refer to `client/lib/pocketbase.ts` and `client/lib/settings.ts` for schema insights.
*   The `VITE_RAJAONGKIR_API_KEY` in the client's environment variables is likely not used directly for API calls, as the backend server (`server/index.js`) handles the RajaOngkir API key.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lrndwy/webumkm.git
    cd webumkm
    ```

2.  **Install root dependencies:**
    ```bash
    pnpm install
    ```

3.  **Install client dependencies:**
    Navigate to the client directory and install its dependencies (or use `--prefix`):
    ```bash
    pnpm --prefix client install
    ```

4.  **Install server dependencies:**
    Navigate to the server directory and install its dependencies (or use `--prefix`):
    ```bash
    pnpm --prefix server install
    ```

## Running the Application

### Development Mode

To run both the client (Vue.js Vite dev server) and the server (Node.js proxy) concurrently:

```bash
pnpm dev
```

*   The Vue.js client will typically be available at `http://localhost:5173`.
*   The Node.js server (RajaOngkir proxy) will run on the port specified by `PORT` in your `.env` file (default: `http://localhost:3001`).

### Building for Production

To build the client application for production:

```bash
pnpm build
```

This command executes `pnpm --prefix client run build`. The optimized static assets for the client will be generated in the `client/dist/` directory.

### Running in Production (Conceptual)

The root `package.json` provides a `start` script: `"start": "pnpm --prefix server start && pnpm --prefix client serve"`.
This script intends to start the backend server and then serve the built client.

**Note:** The `&&` operator runs commands sequentially. For true concurrent operation in production without Docker, you might use a process manager like PM2 or run them in separate terminals.

*   **Backend Server (`server/index.js`):** Runs on the port defined by `PORT` (e.g., 3001).
*   **Frontend Client (`client/dist` served by `serve`):** The `serve` command (from `serve` package) typically defaults to port 3000 if available.

## Running with Docker

The application includes a `Dockerfile` for building and running a containerized version.

1.  **Build the Docker image:**
    Ensure you are in the root directory of the project.
    ```bash
    docker build -t webumkm-app .
    ```

2.  **Run the Docker container:**
    The `Dockerfile` uses `pnpm start` as its `CMD`. This will attempt to run the Node.js server (listening on `PORT`, e.g., 3001 internally) and serve the static client assets (using `serve -s dist`, which defaults to port 3000 internally).

    To run the container, mapping the client's internal port 3000 to host port 8080, and server's internal port 3001 to host port 3001:
    ```bash
    docker run -p 8080:3000 -p 3001:3001 --env-file .env webumkm-app
    ```
    *   Replace `8080` with your desired host port for the client.
    *   Replace `3001` on the host side if needed.
    *   Ensure your `.env` file is correctly configured, as these variables will be used by the application inside the container. `VITE_PB_URL` and other external service URLs must be accessible from the Docker container.

    The client application should then be accessible at `http://localhost:8080` and the backend proxy at `http://localhost:3001` on your host machine.

## Client Application Details

The `client/` directory contains a detailed `client/README.md` file which covers:
*   Vue 3 + TypeScript + PocketBase setup.
*   Route protection mechanisms.
*   Authentication service methods and usage.
*   UI/UX and security features.
*   Customization guidance.

## Server Application (RajaOngkir Proxy)

The `server/` directory contains a simple Express.js application (`server/index.js`) that acts as a proxy for the RajaOngkir API. Its main purposes are:
*   To hide the RajaOngkir API key from the client-side code.
*   To handle CORS issues when communicating with the RajaOngkir API from the browser.
*   Provides endpoints for:
    *   `/api/rajaongkir/destinations`: To search for domestic shipping destinations.
    *   `/api/rajaongkir/calculate`: To calculate shipping costs.
