#  Fraud Analytics Intelligence (FAI)

> Real-time fraud detection system powered by microservices, asynchronous processing, and AI-driven context analysis.
<img width="1365" height="804" alt="Ekran Resmi 2026-05-03 03 11 18" src="https://github.com/user-attachments/assets/01afb14d-8ab2-4c55-ab1a-d0223c84779a" />

---

##  Project Overview

###  Purpose
The Fraud Analytics Intelligence platform is an end-to-end fintech engine engineered for real-time transaction monitoring and anomaly detection. The system captures credit card transaction streams, evaluates user risk levels asynchronously, and triggers instant alerts for abnormal spending behavior before financial assets are put at risk.

###  Problem It Solves
Traditional batch validation tools are unable to process multi-dimensional risks fast enough to stop attacks. This platform solves the problem of high latency in fraud detection by utilizing a decoupled architecture to decouple ingestion, processing, and visualization

FAI solves this by:
- Decoupled architecture
- Async processing
- Real-time alerts

---

##  System Architecture
<img width="1536" height="1024" alt="archdiagram" src="https://github.com/user-attachments/assets/31fae7c1-2fb6-44f5-aa06-1605443a21fb" />

### Components
API Service (FastAPI): Exposes HTTP endpoints for frontend consumption and publishes incoming transaction events to the message queue.

Worker Service: Consumes messages from RabbitMQ, executes anomaly detection rules (speed, amount, and location checks), and updates the databases.

MCP (Model Context Protocol) Service: Translates business rules and provides context for AI-driven risk scoring.

Frontend (React): An interactive UI that renders live data feeds, analytical charts, and critical alerts.

MongoDB: Stores historical transactions and anomaly events.

Redis: Caches user states and monitors rate limits to provide high-speed responses.

RabbitMQ: Handles the decoupled and asynchronous message queue between the API and workers.

---

## Scope and Limitations
Scope: Real-time event ingestion using FastAPI, queue management through RabbitMQ, asynchronous anomaly processing, and an interactive React dashboard.

Limitations: The local development and testing environment is tuned for demonstration loads. High-volume, production deployments require external cluster configuration for the message broker and database.


## Technology Choices & Justifications
Backend Framework: FastAPI

Justification: Chosen for its high performance, native support for asynchronous operations, and automatic OpenAPI documentation generation.

Frontend Framework: React with Recharts

Justification: Provides dynamic and responsive dashboard widgets and charting capabilities to represent live-streamed financial data.

Database: MongoDB

Justification: Offers a flexible document model capable of storing unstructured and structured transaction payloads and locations.

Queue System: RabbitMQ

Justification: A highly reliable and scalable message broker that supports durable message queues.

Cache Management: Redis

Justification: Ensures lightning-fast reads/writes for analytical thresholds and maintains the stateful logic required for anomaly evaluation.

Containerization: Docker & docker-compose

Justification: Eliminates environment inconsistencies and allows all 7 services to spin up with a single command.

---

## Containerization & Deployment

The entire system runs with docker-compose. This ensures consistency between development and production environments.

Services Overview
api: The FastAPI-based web server and REST API.

worker: The background consumer processing transactions from the queue.

mcp: The Model Context Protocol abstraction service.

frontend: The React development or production build container.

mongodb: The persistent document data layer.

redis: The cache layer.

rabbitmq: The event streaming message broker.

```bash
Quick Start Deployment Command
docker-compose up --build -d
```

##  Run with Docker

```bash
docker-compose up --build -d
```

---

##  Installation Guide
Follow these steps to set up the system on your local machine.

Requirements
Docker Engine: Version 20.10 or higher

Docker Compose: Version 1.29 or higher

Git

Step 1: Clone the Repository
```bash
git clone https://github.com/org/fraud-analytics-NergizALICİ-Çekirdekten_YetişenlerProgramı.git
cd fraud-analytics-NergizALICİ-Çekirdekten_YetişenlerProgramı
```

Step 2: Configure Environment Variables
Create a .env file in the root directory and update it with the following configuration:

```bash
MONGO_URL=mongodb://root:example@mongodb:27017/
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
PORT=8000
```

Step 3: Run the System
Run the containers in the background:

```bash
docker-compose up --build -d
```

Step 4: Verify System Status
Verify that all containers are running:

```bash
docker-compose ps
```
Access the Swagger documentation at http://localhost:8000/docs to test endpoints.

---

## Usage Guide
Dashboard Overview: Once the frontend is loaded, you will see real-time transactions streaming into the system.

Alerts Panel: The live anomaly feed processes events as they enter. When high-risk thresholds are met, the UI highlights anomalies.

Drilldown Analysis: Click on any table row related to an individual user to view historical transaction events.

##  API Example

Main Endpoints
GET /transactions - Fetches the 20 most recent transactions.

GET /user-status/{user_id} - Fetches user-specific aggregated transaction data.

GET /stream-alerts - Establishes an SSE (Server-Sent Events) connection to stream alerts.

Request Example (POST /)
{
  "user_id": 12345,
  "amount": 299.90,
  "location": {"country": "TR", "lat": 41.0082, "lon": 28.9784},
  "timestamp": "1682850000000",
  "status": "OK"
}

Response Example (GET /transactions)

[
  {
    "id": "6472ab67e3...",
    "user_id": 12345,
    "amount": 299.90,
    "status": "OK",
    "timestamp": 1682850000000
  }
]


---

##  MCP Layer

The Model Context Protocol (MCP) acts as the bridge for our AI integrations. It accepts the input payload, runs contextual validation rules, and determines whether an anomaly exists.

Integration with Client
The MCP configuration file should be mounted or referenced under your MCP proxy settings:

{
  "mcpServers": {
    "fraud-detection-mcp": {
      "command": "python",
      "args": ["-m", "mcp_server"]
    }
  }
}

---

##  Testing

Simulate Live Data Stream:

```bash
python3 scripts/mock_stream.py --interval 2
```

---

##  Troubleshooting

- Check ports
- Restart Docker
- Inspect logs

---

##  Future Improvements

- Add ML models
- Kafka integration
- Scaling
