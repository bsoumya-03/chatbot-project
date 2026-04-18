# Chatbot Project

## Overall Project Description
This is a full-stack web application that features a modern chatbot interface powered by an external AI API via OpenRouter. The project includes a complete user authentication flow, user profile management, a contact form, and a dedicated chat interface answering queries in real time.

The backend is built with **Node.js** and **Express.js**, utilizing **SQLite** for lightweight, file-based data storage. Passwords are securely hashed with `bcrypt`, and user sessions are managed using JSON Web Tokens (`JWT`s). 
The frontend is constructed using vanilla HTML, CSS, and JavaScript to deliver a lightweight, responsive, and seamless user experience without requiring a heavy frontend framework.

## Project Architecture & Flow
1. **Authentication**: Users can sign up and sign in. `JWT` tokens are issued upon authentication and saved in the browser (`localStorage`).
2. **Chat Interface**: Authenticated users can access the chat page. It communicates with the backend, which securely proxies the request to the OpenRouter AI API.
3. **Database Storage**: The SQLite database manages `users` (credentials) and `contacts` (messages sent via the contact form).

---

## Directory & File Structure

Here is a detailed breakdown of each file and folder in the repository:

### Root Directory (Backend & Configuration)

- **`server.js`**
  The core of the backend server. It handles:
  - Setting up the Express application and basic middlewares (`cors`, json parsing, static file serving).
  - Connecting to the SQLite database (`database.db`) and initializing the `users` and `contacts` tables.
  - Exposing REST API endpoints:
    - `/api/signup` and `/api/signin` for user registration and authentication logic.
    - `/api/chat` for handling text payload to the OpenRouter API.
    - `/api/contact` to receive, validate, and store form submissions.
    - `/api/profile` and `/api/change-password` for fetching user state and updating credentials securely.
  
- **`package.json` & `package-lock.json`**
  These files define the Node.js project. `package.json` contains metadata, the run scripts (e.g., `"start": "node server.js"`), and a list of project dependencies like `express`, `sqlite3`, `bcrypt`, `jsonwebtoken`, and `node-fetch`.

- **`database.db`**
  Automatically generated file once `server.js` is started for the first time. This is the SQLite database file containing all application records.

- **`.gitignore`**
  A Git configuration file that instructs git on which files or directories to ignore (e.g., `node_modules`, `.env`).

- **`.env` (Suggested file used by `dotenv`)**
  A file used to store application secrets safely (like `JWT_SECRET` for generating JWT tokens and `OPENROUTER_API_KEY` for passing requests to OpenRouter). It should never be checked into version control.

---

### `public/` Directory (Frontend)

This directory serves static assets directly to the user's browser.

#### HTML Files
- **`index.html`**
  The landing page of the application providing the initial entry point, presentation, and links to get users started with the chatbot.
- **`about.html`**
  A basic informational page generally explaining the background or purpose of the application.
- **`contact.html`**
  A contact form interface. Submissions from this page are securely sent to the backend `/api/contact` route and saved.
- **`signup.html` & `signin.html`**
  The user registration and authentication pages. They contain forms that when submitted interact with the server.js API.
- **`chat.html`**
  The primary interactive interface for the system. Once authenticated, users can type messages and receive replies from the AI model in a dedicated chat window.
- **`profile.html`**
  A user dashboard where they can see their account details and execute options like changing the password.

#### StyleSheets & Scripts
- **`style.css`**
  The central global stylesheet. It provides the visual layout, color themes, responsive design media queries, and animations spanning across all HTML files.
- **`script.js`**
  The primary frontend JavaScript hub. It maintains shared logic ranging from managing navbar toggling and JWT usage, to processing form data submissions (`fetch` actions for login, signup, contact, and profile settings).
- **`chat.js`**
  A localized JavaScript file dedicated only to the `chat.html` page logic. It listens for user events, visually renders chat bubbles for both user queries and bot replies, fetches answers from `/api/chat`, and manages visual loading indicators during wait states.

#### Assets
- **`fonts/`**
  A folder for locally hosted web fonts. Ensuring typefaces stay completely consistent without heavily relying on external CDNs or standard OS fonts.

---

## How to Run the Project Local

1. Make sure you have **Node.js** installed on your windows system.
2. Provide a `.env` file in the root with valid values for:
   \`\`\`env
   JWT_SECRET=your_jwt_secret
   OPENROUTER_API_KEY=your_openrouter_key
   PORT=3000
   \`\`\`
3. Run `npm install` in the terminal to resolve all modules in `package.json`.
4. Run `node server.js` or `npm start`.
5. Navigate to `http://localhost:3000/index.html` on your browser to load up the application.
