# 🚀 Smart AI Email Assistant

An Enterprise-ready AI Email Assistant built with **Spring Boot 3.4 (Java 21)**, local **Ollama (`llama3.2`)**, and a modern **React + Vite** dashboard.

Inspired by the enterprise architecture presentation, this project converts rough notes or bullet points into polished, context-aware emails with multiple personas/tones and sends them directly to any recipient email address.

---

## 🌟 Key Features

1. **4 Tone-Adaptive Email Modes**:
   - 💼 **Professional**: Formal, structured, business-ready email with formal salutations and executive sign-offs.
   - ☕ **Casual**: Relaxed, conversational, and natural phrasing.
   - 🤝 **Friendly**: Warm, encouraging, empathetic, and collaborative.
   - ⚡ **Urgent**: High-priority, direct, action-driven, with clear deadlines and next steps.

2. **Local AI Privacy with Ollama (Llama 3.2)**:
   - 100% private: Emails are generated directly on your machine via local Ollama (`http://localhost:11434`).
   - Zero token cost: No OpenAI or third-party paid API keys required.

3. **Direct Email Sending**:
   - Integrated with Spring Boot `JavaMailSender`.
   - **Sandbox / Test Mode**: Works out-of-the-box without requiring email passwords (dispatches to local database and logs).
   - **Live SMTP Mode**: Enter your Gmail or company SMTP App Password directly from the UI Settings modal or in `application.properties` to send real emails to inboxes.

4. **Persistent History & Drafts**:
   - Powered by Spring Data JPA with embedded file-based H2 database (persists across restarts).
   - Easy 1-click switch to MySQL in `application.properties` as shown in Slide 8.
   - View previously generated drafts, sent statuses, timestamps, and reload them into the editor with one click.

---

## 📁 Project Architecture

```
MyProject/
├── backend/                             # Spring Boot 3.4 (Java 21) Application
│   ├── mvnw.cmd                         # Maven Wrapper with pre-configured JDK 21
│   ├── pom.xml                          # Dependencies (Web, Mail, JPA, H2, MySQL, Lombok)
│   └── src/main/
│       ├── java/com/ai/email/
│       │   ├── SmartEmailAssistantApplication.java
│       │   ├── config/CorsConfig.java   # Full CORS support for React frontend
│       │   ├── controller/EmailController.java # REST Endpoints
│       │   ├── dto/                     # Request and Response DTOs
│       │   ├── model/EmailDraft.java    # JPA Entity for persistence
│       │   ├── repository/EmailRepository.java
│       │   └── service/
│       │       ├── OllamaService.java   # Ollama Llama 3.2 Prompt Pipeline
│       │       └── EmailSenderService.java # JavaMailSender + Sandbox Dispatcher
│       └── resources/
│           └── application.properties   # Database, Ollama & Mail Configuration
│
├── frontend/                            # React + Vite Client
│   ├── index.html                       # Google Fonts & Metadata
│   ├── src/
│   │   ├── App.jsx                      # Main Dashboard with Tones, Composer & History
│   │   ├── App.css                      # Modern Dark Glassmorphism Styles
│   │   └── index.css                    # Design Tokens & Global Styles
│   └── package.json
│
├── start.bat                            # 1-Click Launch Script
└── README.md                            # Documentation
```

---

## 🚦 How to Run the Project

### 1. Prerequisites
- **Java**: Java 21 LTS (`java -version`)
- **Node.js**: Node 18+ (`node -v`)
- **Ollama**: Running locally with `llama3.2` model:
  ```bash
  ollama run llama3.2
  ```

### 2. Quick 1-Click Launch (Windows)
Double click [`start.bat`](file:///c:/Users/pramo/OneDrive/Desktop/MyProject/start.bat) in the project root.

---

### 3. Manual Step-by-Step Launch

#### Start Backend:
```bash
cd backend
mvnw.cmd spring-boot:run
```
Backend will start on: **`http://localhost:8080`**
- H2 Web Console: **`http://localhost:8080/h2-console`** (JDBC URL: `jdbc:h2:file:./data/emaildb`)

#### Start Frontend:
```bash
cd frontend
npm run dev
```
Frontend UI will start on: **`http://localhost:5173`**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/email/status` | Checks Ollama (`llama3.2`), backend, and SMTP health |
| `POST` | `/api/email/generate` | Generates email body based on prompt and tone |
| `POST` | `/api/email/send` | Dispatches email to recipient and saves to DB |
| `GET` | `/api/email/history` | Retrieves all drafts and sent emails ordered by date |
| `DELETE` | `/api/email/history/{id}` | Deletes a draft or history record |
| `POST` | `/api/email/smtp-config` | Dynamically updates SMTP credentials from the UI |

---

## 📧 How to Send Real Gmail Emails
1. Go to your Google Account -> **Security** -> **2-Step Verification** -> **App Passwords**.
2. Create an App Password for **Mail**.
3. In the UI, click **⚙️ SMTP Setup** on the top right.
4. Enter your Gmail address and 16-character App Password, then click **Save Configuration**.
5. Any email you hit **Send Email** on will now land directly in the recipient's real inbox!
