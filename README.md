#  Fraud Analytics Intelligence (FAI)

> Real-time fraud detection system powered by microservices, asynchronous processing, and AI-driven context analysis.
<img width="1365" height="804" alt="Ekran Resmi 2026-05-03 03 11 18" src="https://github.com/user-attachments/assets/01afb14d-8ab2-4c55-ab1a-d0223c84779a" />

---

##  Project Overview

###  Purpose
The Fraud Analytics Intelligence (FAI) platform is an end-to-end fintech engine designed for real-time transaction monitoring and anomaly detection.

###  Problem It Solves
Traditional fraud detection systems rely on batch processing, which introduces latency.

FAI solves this by:
- Decoupled architecture
- Async processing
- Real-time alerts

---

##  System Architecture
<img width="1536" height="1024" alt="archdiagram" src="https://github.com/user-attachments/assets/31fae7c1-2fb6-44f5-aa06-1605443a21fb" />

### Components
- API Gateway (FastAPI)
- Worker Service
- MCP (AI Context Layer)
- RabbitMQ (Queue)
- MongoDB (Database)
- Redis (Cache)
- Frontend (React)

---

##  Data Flow Diagram

```mermaid
flowchart TD
    A[Transaction Source] -->|HTTP POST| B[API Gateway / FastAPI]

    B -->|Publish to Queue| C[RabbitMQ]
    B -->|Save Initial State| D[MongoDB]
    B -->|Context Request| M[MCP Service]

    M -->|AI Context Response| B
    M -->|Model Inference| K[AI Models / Knowledge Base]

    C -->|Async Consume| E[Worker Service]

    E -->|Store / Retrieve| F[Redis]
    E -->|Fraud Alert (SSE)| G[Frontend]

    F -->|Anomaly Data| E
```

---

##  Run with Docker

```bash
docker-compose up --build -d
```

---

##  Installation

```bash
git clone <your-repo>
cd project
docker-compose up --build
```

---

##  API Example

```json
{
  "user_id": 123,
  "amount": 200
}
```

---

##  MCP Layer

Handles:
- Context enrichment
- Feature engineering
- AI inference

---

##  Testing

```bash
curl -X POST http://localhost:8000/
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
