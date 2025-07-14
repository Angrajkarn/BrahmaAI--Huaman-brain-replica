<div align="center">
  <br />
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/firebase/genkit/main/docs/assets/brahma-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/firebase/genkit/main/docs/assets/brahma-logo-light.svg">
    <img alt="Brahma Logo" src="https://raw.githubusercontent.com/firebase/genkit/main/docs/assets/brahma-logo-dark.svg" width="120">
  </picture>
  <br />
  <h1 align="center">Brahma AI: Your Brain Replica</h1>
  <p align="center">
    A living mind in code, designed to think, feel, and reason like you.
  </p>

  <p align="center">
    <a href="https://brahmaai.netlify.app/" target="_blank"><img src="https://img.shields.io/badge/View_Live-Demo-brightgreen?style=for-the-badge" alt="live demo" /></a>
    <a href="#"><img src="https://img.shields.io/github/license/firebase/genkit?style=for-the-badge" alt="license" /></a>
    <a href="#"><img src="https://img.shields.io/github/stars/firebase/genkit?style=for-the-badge" alt="stars" /></a>
    <a href="#"><img src="https://img.shields.io/github/forks/firebase/genkit?style=for-the-badge" alt="forks" /></a>
  </p>
</div>

---

**Brahma** is a showcase Next.js application demonstrating an advanced, multimodal AI system built with **Firebase** and **Genkit**. It moves beyond traditional chatbots by simulating a cognitive architecture, enabling the creation of unique "AI Brains" that can be trained, managed, and even monetized by creators.

This project is designed to be a starting point and a source of inspiration for building sophisticated, scalable AI applications.

## ✨ Key Features

| Feature                  | Description                                                                                                                              | Tech Stack Highlights                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 🧠 **Cognitive Engine**  | A multi-agent system (Perception, Reasoning, Emotion) that simulates human thought processes for deeper contextual understanding.        | `Genkit`, `Zod`, `Next.js Server Actions`           |
| 📈 **Author Dashboard**    | A comprehensive command center for creators to manage their AI brains, view analytics, and track earnings.                             | `React`, `Recharts`, `Firestore Listeners`            |
| 🛒 **Marketplace**      | A discoverable hub where users can find, test, and subscribe to community-created AI brains.                                     | `Next.js App Router`, `Stripe Integration`            |
| 🧩 **Brain Creation**     | An intuitive UI for crafting new AI personas, defining their personality, uploading knowledge, and setting monetization rules.         | `React Hook Form`, `ShadCN UI`, `Firebase Storage`      |
| 🔒 **Secure & Scalable** | Built on a robust, serverless foundation with user authentication, Firestore security rules, and scalable cloud functions.           | `Firebase Auth`, `Firestore`, `Firebase Functions`    |
| 🎨 **Modern UI/UX**      | A sleek, responsive interface built with Tailwind CSS and ShadCN UI, featuring a collapsible sidebar, toasts, and modals.                | `Tailwind CSS`, `ShadCN UI`, `Framer Motion`          |

## 📸 Screenshots

*Replace these with actual screenshots of your application.*

| Dashboard View | Chat Interface |
| :---: | :---: |
| <img src="pic/dashboard.png" alt="Dashboard Screenshot" data-ai-hint="dashboard analytics" /> | <img src="pic/new chat.png" alt="Chat Screenshot" data-ai-hint="chat interface" /> |

| Author Dashboard | Marketplace |
| :---: | :---: |
| <img src="pic/window.png" alt="Author Dashboard Screenshot" data-ai-hint="author dashboard" /> | <img src="pic/market place.png" alt="Marketplace Screenshot" data-ai-hint="marketplace grid" /> |


## 🚀 Getting Started

Follow these steps to get a local copy of Brahma up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer recommended)
-   [Firebase CLI](https://firebase.google.com/docs/cli) installed and authenticated (`firebase login`)
-   A Firebase project with **Authentication**, **Firestore**, and **Storage** enabled.
-   Access to a Google Cloud project with the **Vertex AI API** enabled for Genkit functionality.

### 1. Clone the Repository

```bash
git clone https://github.com/Angrajkarn/BrahmaAI--Huaman-brain-replica.git
cd BrahmaAI--Huaman-brain-replica
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of your project by copying the example file:

```bash
cp .env.example .env
```

Now, fill in the `.env` file with your Firebase project's configuration details. You can find these in your Firebase project settings.

```dotenv
# -------------------------------------
# Firebase Client SDK Configuration
# -------------------------------------
# Find these in your Firebase project settings > General
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# -------------------------------------
# Firebase Admin SDK Configuration (for Genkit & Server-Side Logic)
# -------------------------------------
# Create a service account in GCP/Firebase, generate a JSON key, and paste the JSON content here.
# This is required for server-side operations that bypass security rules.
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type": "service_account", ...}'

# -------------------------------------
# Neo4j Database (Optional)
# -------------------------------------
# If you want to use Neo4j for the knowledge graph, provide your credentials.
# If left blank, Neo4j integration will be gracefully disabled.
NEO4J_URI="neo4j+s://your-database.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your-password"
NEO4J_DATABASE="neo4j"
```

### 4. Set Up Firebase Storage (CORS)

For the file upload functionality to work, you must configure CORS on your Firebase Storage bucket.

1.  Create a file named `cors.json`:
    ```json
    [
      {
        "origin": ["http://localhost:3000", "http://localhost:9002", "https://your-deployed-app-url.com"],
        "method": ["GET", "POST", "PUT", "HEAD"],
        "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Authorization", "X-Goog-Upload-Protocol"],
        "maxAgeSeconds": 3600
      }
    ]
    ```
    *Replace `your-deployed-app-url.com` with your actual production URL.*

2.  Install the `gsutil` tool from the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).

3.  Apply the CORS configuration:
    ```bash
    gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
    ```
    *Replace `YOUR_PROJECT_ID` with your actual Firebase Project ID.*

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000) (or the port specified by Next.js).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
