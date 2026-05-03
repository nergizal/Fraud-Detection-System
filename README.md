#  E-Ticaret Fraud Tespit ve Analiz Platformu

Gerçek zamanlı işlem izleme, anomali tespiti ve yapay zeka entegrasyonuna sahip kapsamlı bir fraud tespit sistemi.
<img width="1365" height="804" alt="Ekran Resmi 2026-05-03 03 11 18" src="https://github.com/user-attachments/assets/3e740ff1-1d49-44d3-82ee-c2307b27b2db" />


---

##  Projenin Amacı ve Kapsamı

Bu sistem; e-ticaret platformlarında gerçekleşen ödeme ve işlem verilerini toplayarak analiz eder, görselleştirir ve yapay zeka ajanları için **Model Context Protocol (MCP)** üzerinden sunar.

Sistem; kullanıcı davranışlarını izleyerek belirlenen kurallar **(Hız, Tutar, Konum)** çerçevesinde şüpheli işlemleri anında tespit eder. Yapay zeka ajanları, MCP üzerinden sisteme bağlanarak kullanıcı risk durumunu ve son şüpheli işlemleri sorgulayabilir.

---

##  Sistem Mimarisi

Sistem mikroservis mimarisine ve asenkron veri akışına sahiptir:
<img width="1536" height="1024" alt="archdiagram" src="https://github.com/user-attachments/assets/48317c64-de6a-492d-97de-bc101a45c8df" />


### Komponent Açıklamaları

| Komponent | Görev |
|---|---|
| **API Katmanı (FastAPI)** | Kullanıcı işlemlerini alır, veritabanına kaydeder ve RabbitMQ kuyruğuna iletir |
| **Worker (worker.py)** | Kuyruğu dinleyerek veriyi anomali kurallarına göre değerlendirir ve işaretler |
| **MCP Server** | Yapay zeka ajanlarının sistemi sorgulayabilmesi için araçları dışa açar |
| **MongoDB** |İşlem verilerinin esnek ve ölçeklenebilir şekilde depolanması için kullanılmıştır. Fraud işlemlerinin şema değişikliklerine açık doğası (farklı kural ihlali tipleri, ek metadata) MongoDB'nin şemasız belge modeliyle doğal uyum sağlar. Yatay ölçekleme ve JSON-native yapısı, FastAPI ile entegrasyonu da kolaylaştırmaktadır.|
| **Redis** | Hızlı erişim, önbellekleme ve hız (velocity) kontrolleri |
| **Frontend (React)** | Veriyi canlı akış olarak sunan, görselleştiren ve kullanıcı analizlerini gösteren modern arayüz |

---

##  Teknoloji Seçimleri ve Gerekçeleri

### FastAPI
Asenkron I/O desteği ve yüksek performanslı API geliştirme imkanı sunduğu için tercih edilmiştir. Pydantic entegrasyonu ile veri doğrulama otomatik olarak sağlanmaktadır.

### RabbitMQ
API ve Worker arasında asenkron iletişimi ve kuyruklama yönetimini sağlamak için seçilmiştir. Bu sayede ani trafik artışlarında API yanıt süreleri etkilenmez; işlemler kuyruğa alınarak Worker tarafından sırayla işlenir.

### MongoDB
İşlem verilerinin esnek ve ölçeklenebilir şekilde depolanması için kullanılmıştır. Fraud işlemlerinin şema değişikliklerine açık doğası (farklı kural ihlali tipleri, ek metadata) MongoDB'nin şemasız belge modeliyle doğal uyum sağlar. Yatay ölçekleme ve JSON-native yapısı, FastAPI ile entegrasyonu da kolaylaştırmaktadır.

### Redis — Anomali Tespitinde Cache Yönetimi
Redis, sistemin en kritik karar noktasında görev almaktadır: **velocity (hız) kontrolü.**

- **Neden Redis?** Hız kontrolü, her işlem için son N saniye/dakika içindeki işlem sayısını sorgulamayı gerektirir. Bu işlem milisaniyeler içinde tamamlanmalıdır. PostgreSQL'e yapılan her sorgu bu latency'yi karşılayamazken Redis, in-memory yapısıyla bu kontrolü gecikme yaşatmadan gerçekleştirir.
- **Nasıl çalışır?** Her kullanıcı için `user:{id}:tx_count` gibi anahtarlarla kayan zaman penceresi tutulur. Belirli eşiği aşan kullanıcılar anlık olarak işaretlenir.
- **Cache TTL:** Sayaçlar belirli bir TTL ile otomatik expire olur; böylece eski veriler sistemi kirletmez.

---

##  Kurulum Adımları

### Önkoşullar

- [Docker](https://www.docker.com/get-started) kurulu olmalı
- [Docker Compose](https://docs.docker.com/compose/install/) kurulu olmalı

### Tek Komutla Başlatma

```bash
docker-compose up --build -d && sleep 7 && open http://localhost:3000
```

Bu komut sırasıyla:
1. Tüm servislerin Docker imajlarını derler
2. Container'ları arka planda başlatır
3. Servislerin ayağa kalkması için 7 saniye bekler
4. Tarayıcıda Dashboard arayüzünü açar

> **Not (Linux):** `open` komutu macOS'a özgüdür. Linux'ta `xdg-open http://localhost:3000` kullanın veya tarayıcınızda manuel olarak açın.

### Servislerin Durumunu Kontrol Etme

```bash
docker-compose ps
```

Tüm servislerin `Up` durumunda olduğunu doğrulayın:

```
fraud_api        Up   0.0.0.0:8000->8000/tcp
fraud_worker     Up
fraud_frontend   Up   0.0.0.0:3000->3000/tcp
fraud_postgres   Up   5432/tcp
fraud_redis      Up   6379/tcp
fraud_rabbitmq   Up   5672/tcp, 15672/tcp
```

### Sistemi Durdurmak

```bash
docker-compose down
```

Veritabanı verilerini de temizlemek için:

```bash
docker-compose down -v
```

---

##  Kullanım Rehberi

Sistemi başlattıktan sonra `http://localhost:3000` adresine giderek arayüzü açın.

### Canlı İşlem Akışı
Gelen işlemleri **APPROVED** (onaylanan) veya **FRAUD** (şüpheli) durumlarına göre gerçek zamanlı izleyebilirsiniz.

### Fraud Trend Grafikleri
Recharts ile oluşturulmuş grafikler üzerinden şüpheli işlem oranlarının zamansal değişimini görüntüleyebilirsiniz.

### Detaylı Kullanıcı Analizi
Bir kullanıcının üzerine tıklayarak o kullanıcının **risk skorunu** ve **geçmiş işlemlerini** detaylıca inceleyebilirsiniz.

---

##  API Dokümantasyonu

API, `http://localhost:8000` adresinde çalışır. Swagger arayüzüne `http://localhost:8000/docs` üzerinden erişilebilir.

### Endpoint'ler

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/transactions/` | Tüm işlemleri veya son işlemleri listeler |
| `GET` | `/user/{user_id}/status` | Belirli bir kullanıcının anlık risk durumunu ve işlem geçmişini getirir |
| `GET` | `/frauds/` | Belirli bir zaman aralığında tespit edilen şüpheli işlemleri listeler |
| `POST` | `/transactions/` | Yeni bir işlem oluşturur ve kuyruğa iletir |

### Örnek İstekler

```bash
# Tüm işlemleri listele
curl http://localhost:8000/transactions/

# Belirli bir kullanıcının durumunu sorgula
curl http://localhost:8000/user/101/status

# Son 1 saatteki fraud işlemleri
curl "http://localhost:8000/frauds/?minutes=60"

# Yeni işlem gönder
curl -X POST http://localhost:8000/transactions/ \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101, "amount": 1500, "latitude": 41.00, "longitude": 28.97}'
```

---

##  MCP Dokümantasyonu

### MCP Araçları (Tools)

Yapay zeka ajanlarının erişimine açık fonksiyonlar:

| Tool | Açıklama |
|---|---|
| `get_recent_frauds` | Son tespit edilen şüpheli işlemleri getirir |
| `check_user_status` | İlgili kullanıcının risk durumunu ve işlem geçmişini kontrol eder |

### Claude Desktop ile Entegrasyon

`claude_desktop_config.json` dosyanıza aşağıdaki bloğu ekleyin:

```json
{
  "mcpServers": {
    "fraud-detection": {
      "command": "python",
      "args": ["-m", "mcp.server"]
    }
  }
}
```

Yapılandırma dosyasının konumu:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### MCP'yi Manuel Test Etmek

Container içinden MCP sunucusuna doğrudan bağlanarak test edebilirsiniz:

```bash
# MCP server container'ına bağlan
docker exec -it fraud_mcp python -m mcp.server

# Ardından JSON-RPC formatında araç çağrısı yapın:
{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "get_recent_frauds", "arguments": {}}, "id": 1}
```

---

##  Script'lerin Kullanımı

### 1. Manuel Veri Girişi (`manual-input.sh`)

Sisteme tekil işlem verisi göndermek için kullanılır.

```bash
# Script'e çalıştırma izni verin
chmod +x manual-input.sh

# Kullanım: ./manual-input.sh <user_id> <amount> <lat> <lon>
./manual-input.sh 101 1500 41.00 28.97
```

| Parametre | Açıklama | Örnek |
|---|---|---|
| `user_id` | Kullanıcı kimliği | `101` |
| `amount` | İşlem tutarı (TL) | `1500` |
| `lat` | Enlem koordinatı | `41.00` |
| `lon` | Boylam koordinatı | `28.97` |

### 2. Otomatik Test Script'i (`auto-test.py`)

Sistemi yük testine sokmak ve anomali kurallarını tetiklemek için kullanılır.

```bash
python auto-test.py --duration=60 --rate=3 --anomaly-chance=0.3
```

| Parametre | Açıklama | Varsayılan |
|---|---|---|
| `--duration` | Testin çalışma süresi (saniye) | `60` |
| `--rate` | Saniyede gönderilecek istek sayısı | `3` |
| `--anomaly-chance` | Şüpheli işlem oluşturma olasılığı (0.0–1.0) | `0.3` |

**Örnek senaryolar:**

```bash
# Yüksek yük testi — 2 dakika, saniyede 10 istek
python auto-test.py --duration=120 --rate=10 --anomaly-chance=0.1

# Fraud ağırlıklı test — anomali oranı %50
python auto-test.py --duration=30 --rate=5 --anomaly-chance=0.5
```

---

##  Test Suite (Robot Framework)

Proje, dört farklı katmanda otomatik test kapsamına sahiptir. Tüm testler `tests/` dizininde Robot Framework ile yazılmıştır.

### Test Yapısı

```
tests/
├── api/
│   └── api_tests.robot        # API endpoint testleri
├── e2e/
│   └── e2e_tests.robot        # Uçtan uca senaryo testleri
├── ui/
│   └── ui_tests.robot         # Selenium tabanlı arayüz testleri
├── unit/
│   └── test_utils.py          # Anomali tespit mantığı birim testleri
├── resources/
│   └── keywords.robot         # Paylaşılan keyword tanımları
└── data/
    └── test_data.json         # Test senaryoları için örnek veri seti
```

### Önkoşullar

```bash
pip install robotframework robotframework-requestslibrary robotframework-seleniumlibrary
```

Selenium UI testleri için ChromeDriver gerekmektedir:

```bash
# macOS
brew install chromedriver

# Linux
sudo apt-get install chromium-chromedriver
```

### Testleri Çalıştırma

Sistemi önce başlatın, ardından testleri çalıştırın:

```bash
docker-compose up --build -d && sleep 7
```

**Tüm testleri çalıştır:**

```bash
robot tests/
```

**Katman bazında çalıştırma:**

```bash
# Sadece API testleri
robot tests/api/api_tests.robot

# Sadece E2E testleri
robot tests/e2e/e2e_tests.robot

# Sadece UI testleri (Selenium)
robot tests/ui/ui_tests.robot
```

**Unit testler (pytest ile):**

```bash
pytest tests/unit/test_utils.py -v
```

**Belirli tag ile çalıştır:**

```bash
# Sadece smoke testleri
robot --include smoke tests/

# Fraud tespiti ile ilgili testler
robot --include fraud tests/
```

### Test Raporları

Robot Framework testler tamamlandıktan sonra otomatik olarak üç dosya üretir:

| Dosya | Açıklama |
|---|---|
| `report.html` | Okunabilir HTML raporu, geçen/kalan test özeti |
| `log.html` | Adım adım detaylı test logu |
| `output.xml` | CI/CD sistemleri için makine-okunabilir çıktı |

```bash
# Raporu tarayıcıda aç (macOS)
open report.html

# Linux
xdg-open report.html
```

> `tests/ui/` altındaki `selenium-screenshot-1.png` dosyası, başarısız UI testlerinde Selenium'un otomatik aldığı ekran görüntüsüdür.

### Test Senaryoları

`tests/data/test_data.json` dosyası test koşularında kullanılan senaryoları içerir:

```json
{
  "normal_transaction": { "user_id": 101, "amount": 150, "lat": 41.00, "lon": 28.97 },
  "high_amount":        { "user_id": 102, "amount": 99999, "lat": 41.00, "lon": 28.97 },
  "velocity_attack":    { "count": 20, "interval_seconds": 5, "user_id": 103 }
}
```

---

##  Sorun Giderme (Troubleshooting)

### Tüm işlemler APPROVED olarak gözüküyor

Anomali kuralları yeterince tetiklenmiyor olabilir. `backend/app/utils.py` dosyasında `violation_count` eşiğini düşürün:

```python
# utils.py
VIOLATION_THRESHOLD = 1  # Varsayılan değeri 1'e çekerek test edin
```

Ardından worker'ı yeniden başlatın:

```bash
docker-compose restart fraud_worker
```

### Redis Bağlantı Hatası

`docker-compose.yml` içinde `redis` servisinin doğru ağda olduğunu kontrol edin:

```yaml
# API ve Worker'ın redis'e bağlandığı host adı
REDIS_HOST: redis   # container adı olmalı, localhost değil
```

Servislerin aynı Docker ağında olduğunu doğrulayın:

```bash
docker network inspect fraud_default
```

### RabbitMQ'ya bağlanılamıyor

RabbitMQ ayağa kalması birkaç saniye sürebilir. `depends_on` ile sağlık kontrolü eklendiğinden emin olun ya da manuel olarak yeniden başlatın:

```bash
docker-compose restart fraud_api fraud_worker
```

### Frontend verileri göstermiyor

API'nin erişilebilir olduğunu kontrol edin:

```bash
curl http://localhost:8000/transactions/
```

Browser konsolunda CORS hatası varsa `backend/app/main.py` içindeki `allow_origins` ayarını kontrol edin.

### Worker loglarını canlı izlemek

Anomali tespit kararlarını (hız/tutar ihlalleri) gerçek zamanlı görmek için:

```bash
docker logs -f fraud_worker
```

### Tüm servislerin loglarını görmek

```bash
docker-compose logs -f
```

---

##  Proje Yapısı

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI uygulama giriş noktası
│   │   ├── models.py        # Veritabanı modelleri
│   │   ├── utils.py         # Anomali tespit kuralları
│   │   └── database.py      # PostgreSQL bağlantısı
│   └── worker.py            # RabbitMQ consumer
├── mcp/
│   └── server.py            # MCP server tanımı
├── frontend/                # React arayüzü
├── tests/
│   ├── api/
│   │   └── api_tests.robot      # API endpoint testleri
│   ├── e2e/
│   │   └── e2e_tests.robot      # Uçtan uca senaryo testleri
│   ├── ui/
│   │   └── ui_tests.robot       # Selenium tabanlı UI testleri
│   ├── unit/
│   │   └── test_utils.py        # Birim testler (pytest)
│   ├── resources/
│   │   └── keywords.robot       # Paylaşılan keyword'ler
│   └── data/
│       └── test_data.json       # Test veri seti
├── scripts/
│   └── ui/                      # Robot test çıktıları (report.html, log.html)
├── docker-compose.yml           # Servis tanımları
├── manual-input.sh              # Tekil işlem gönderme script'i
├── auto-test.py                 # Otomatik yük testi script'i
├── test_flow.py                 # Senaryo bazlı test akışı
└── trigger_fraud.py             # Fraud senaryosu tetikleyici
```

---

##  Servis Portları

| Servis | Port | Erişim |
|---|---|---|
| Frontend | `3000` | http://localhost:3000 |
| FastAPI | `8000` | http://localhost:8000 |
| API Docs (Swagger) | `8000` | http://localhost:8000/docs |
| RabbitMQ Yönetim Paneli | `15672` | http://localhost:15672 (guest/guest) |
| PostgreSQL | `5432` | — |
| Redis | `6379` | — |
