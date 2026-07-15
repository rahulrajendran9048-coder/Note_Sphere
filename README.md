# Note Sphere

A full-stack, secure application that automatically generates premium textbook-style notes for engineering students using the blazing-fast Groq API (`llama-3.3-70b-versatile`).

## Features

* **Secure Full-Stack Architecture**: Note Sphere uses a modular Node.js/Express backend to ensure your Groq API key is never exposed to the frontend browser.
* **Auto Model Fallback**: Automatically falls back to secondary Groq models (like `llama-3.1-8b-instant` or `mixtral-8x7b-32768`) in case of rate limits or capacity constraints.
* **Premium Markdown Rendering**: Supports LaTeX mathematics and Markdown tables flawlessly.
* **Monorepo Structure**: Start both the frontend and backend with a single command.

## Setup

1. **Install Dependencies**
   At the root of the project, run:

   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**

   * **Backend**: In `backend/`, copy `.env.example` to `.env` and add your Groq API Key:

     ```env
     GROQ_API_KEY="your_groq_api_key_here"
     PORT=5000
     ```
   * **Frontend**: In `frontend/`, ensure `.env` has the correct API URL:

     ```env
     VITE_API_URL="http://localhost:5000/api/v1"
     ```

3. **Start the Application**
   From the root folder, start both the frontend and backend servers simultaneously:

   ```bash
   npm run dev
   ```

## Cloud Deployment (e.g. Google Cloud Run, Vercel)

When deploying the backend, ensure you set the `GROQ_API_KEY` and `NODE_ENV=production` environment variables. Ensure the frontend's `VITE_API_URL` points to your deployed backend URL.

## Contributors

* **Rahul Raj R** – Project Creator & Full-Stack Developer
* **[Akshay D](https://github.com/akshayd444)** (@akshayd444) – Contributor

