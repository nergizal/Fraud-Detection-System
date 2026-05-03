content = """# fraud-analytics-NergizALICİ-Çekirdekten_YetişenlerProgramı

> Real-time fraud detection system powered by microservices, asynchronous processing, and AI-driven context analysis.

<img width="1365" height="804" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/01afb14d-8ab2-4c55-ab1a-d0223c84779a" />

---

## 1. Project Overview

### Purpose of the Project
The **Fraud Analytics Intelligence** platform is an end-to-end fintech engine engineered for real-time transaction monitoring and anomaly detection. The system captures credit card transaction streams, evaluates user risk levels asynchronously, and triggers instant alerts for abnormal spending behavior before financial assets are put at risk.

### Problem It Solves
Traditional batch validation tools are unable to process multi-dimensional risks fast enough to stop attacks. This platform solves the problem of high latency in fraud detection by utilizing a decoupled architecture to separate ingestion, processing, and visualization.

FAI solves this by:
- Decoupling ingestion and processing.
- Asynchronous analysis and scoring.
- Triggering real-time event-driven alerts.

### Scope and Limitations
* **Scope:** Real-time event ingestion using FastAPI, queue management through RabbitMQ, asynchronous anomaly processing, and an interactive React dashboard.
* **Limitations:** The local development and testing environment is tuned for demonstration loads. High-volume, production deployments require external cluster configurations for the message broker and database.

---

## 2. System Architecture

The architecture is built on a microservices-based model, ensuring that ingestion, processing, and visualization are completely decoupled.

### Component Breakdown
* **API Service (FastAPI):** Exposes HTTP endpoints for frontend consumption and publishes incoming transaction events to the message queue.
* **Worker Service:** Consumes messages from RabbitMQ, executes anomaly detection rules (speed, amount, and location checks), and updates the databases.
* **MCP (Model Context Protocol) Service:** Translates business rules and provides context for AI-driven risk scoring.
* **Frontend (React):** An interactive UI that renders live data feeds, analytical charts, and critical alerts.
* **MongoDB:** Stores historical transactions and anomaly events.
* **Redis:** Caches user states and monitors rate limits to provide high-speed responses.
* **RabbitMQ:** Handles the decoupled and asynchronous message queue between the API and workers.

### Architectural Data Flow

```text
               +-----------------------------------+
               |       Transaction Source          |
               +-------------------+---------------+
                                   | HTTP POST
                                   v
+----------------------------------+----------------------------------+
| API Gateway / FastAPI                                               |
+-------------------+------------------------------+------------------+
                    |                              |
      Publish to Queue |               Save Initial State / Query
                    v                              v
           +--------+-------+             +--------+-------+
           |   RabbitMQ     |             |    MongoDB     |
           +--------+-------+             +--------+-------+
                    |                     
      Asynchronous Consume|
                    v
           +--------+-------+             +--------+-------+
           | Worker Service |<----------->|     Redis      |
           +--------+-------+ (Anomalies) +----------------+
                    |
      Push Fraud Alert / Notify SSE 
                    v
           +--------+-------+
           | Frontend (UI)  |
           +----------------+
