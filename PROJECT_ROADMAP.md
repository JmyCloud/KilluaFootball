# KilluaFootball — خطة العمل الكاملة
## من الحالة الحالية إلى التشغيل الإنتاجي

> آخر تحديث: 2026-03-24

---

## الرؤية

نظام ذكاء كروي واستخبارات مراهنات يعمل على Cloud VPS 20.
- **Backend**: يجمع، ينظم، يحلل، يتنبأ، ويولد إشارات رهان
- **Frontend**: Custom GPT يستدعي Internal API ليشرح النتائج للمستخدم

### المبدأ الأساسي
> تغطية كاملة للبيانات + استرجاع انتقائي ذكي + تحليل عميق بدون فقدان أي معلومة مهمة

---

## البنية التحتية

| المكون | التقنية |
|--------|---------|
| VPS | Cloud VPS 20: 6 vCPU, 12GB RAM, 100GB NVMe, Ubuntu 24.04 |
| Backend | Next.js 16 (API + Workers) |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| ML Service | Python 3.12 + FastAPI |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |
| Frontend | Custom GPT via OpenAI Actions |

---

## الحالة الحالية — ما تم إنجازه ✅

### 1. طبقة الاستحواذ (Acquisition Layer) ✅
- [x] SportMonks HTTP client مع retry/timeout/pagination
- [x] 18 خدمة endpoint مكتملة مع includes وفلاتر صحيحة
- [x] فلاتر الدوريات (fixtureLeagues/newsitemLeagues) مطبقة
- [x] فلترة xG من جهة العميل (client-side) بحسب الدوريات المدعومة
- [x] نظام الأسواق الديناميكي (183 سوق بدلاً من 3)
- [x] خدمة markets جديدة لجلب الأسواق من API
- [x] فلترة odds ديناميكياً بحسب market IDs

### 2. قاعدة البيانات (Prisma Schema) ✅
- [x] Raw Layer: 5 جداول (snapshots + news + match facts)
- [x] Normalized Layer: ~20 جدول (fixtures, events, stats, odds, standings, etc.)
- [x] Feature Layer: 6 جداول (prematch, live, schedule, squad, market, rankings)
- [x] Prediction/Signal Layer: 4 جداول (predictions, calibrated, signals, packets)
- [x] Job Monitoring: جدول job_history

### 3. التكوين (Config) ✅
- [x] 6 مسابقات مدعومة (CL, PL, BL, L1, SA, LL)
- [x] Bookmaker 35 ثابت
- [x] 183 سوق ديناميكي
- [x] Cache TTLs لكل خدمة
- [x] Polling intervals لكل تدفق
- [x] Model weights + signal thresholds

### 4. البنية التحتية (Infrastructure) ✅
- [x] Docker Compose (7 services: proxy, nextjs, postgres, redis, python, sync-worker, feature-worker, signal-worker)
- [x] Prisma client + Redis client جاهزين
- [x] Python FastAPI skeleton مع routers
- [x] Nginx config

### 5. الأنواع (Types) ✅
- [x] SportMonks types كاملة
- [x] Analysis types (PreMatchPacket, LivePacket)
- [x] Signal types (BettingSignal, DerivedFeatures)

### 6. Job Stubs ✅
- [x] sync-reference.ts (هيكل)
- [x] sync-pre-match.ts (هيكل)
- [x] sync-live-trigger.ts (مُنفذ جزئياً)
- [x] sync-live-refresh.ts (هيكل)
- [x] recompute-features.ts (هيكل)
- [x] recompute-signals.ts (هيكل)

---

## ما يجب بناؤه — المراحل

---

## المرحلة 1: Sync Workers — جلب وحفظ البيانات
**المدة المقدرة: 3-4 أيام**

هذه المرحلة تحول stubs إلى workers حقيقيين يجلبون البيانات من SportMonks ويحفظونها.

### 1.1 Job Runner + Scheduler
```
src/workers/runner.ts         — محرك الجدولة (cron-based)
src/workers/job-wrapper.ts    — غلاف: lock + logging + job_history
```
- يشغّل كل job بحسب POLLING_INTERVALS
- يستخدم Redis lock (acquireLock/releaseLock) لمنع التكرار
- يسجل كل تشغيل في job_history

### 1.2 تنفيذ sync-reference (Background Sync)
```
الجدولة: كل ساعة
```
لكل مسابقة من الست:
1. جلب standings الموسم الحالي → حفظ في standings_rows + standings_details
2. جلب standings corrections → حفظ في standings_corrections
3. جلب squads بالموسم → حفظ في team_squads
4. جلب team rankings → حفظ في team_rankings
5. جلب topscorers → حفظ في topscorers
6. جلب markets → تحديث cache

### 1.3 تنفيذ sync-pre-match (Pre-Match Sync)
```
الجدولة: كل 5 دقائق
```
لكل مباراة قادمة خلال 48 ساعة:
1. جلب fixture prematch → حفظ raw + normalize
2. جلب H2H → حفظ/تحديث
3. جلب team season stats (كلا الفريقين) → cache
4. جلب referee season stats → cache
5. جلب predictions → حفظ في raw
6. جلب pre-match odds (bookmaker 35) → حفظ في odds_prematch_rows
7. جلب news → حفظ في news_articles + news_lines
8. جلب expected lineups → حفظ في expected_lineups
9. جلب match facts → حفظ في match_fact_rows
10. جلب xG (من cache المفلتر) → حفظ في xg_team_rows + xg_player_rows
11. جلب schedules → حساب rest days

### 1.4 تنفيذ sync-live (Live Sync)
```
الجدولة: كل 8 ثوانٍ (trigger) → كل 15 ثانية (refresh)
```
**sync-live-trigger** (موجود جزئياً):
- يجلب livescores/latest → يكتشف المباريات المتغيرة → يرجع IDs

**sync-live-refresh** لكل مباراة متغيرة:
1. جلب fixture live → حفظ raw_livescore_snapshots + normalize
2. جلب inplay odds → حفظ في odds_inplay_rows
3. جلب live standings → حفظ في live_standings_rows
4. جلب commentaries → حفظ في commentary_lines

### 1.5 Raw Ingestion Layer
```
src/lib/ingestion/raw-store.ts    — حفظ الـ payloads الخام
src/lib/ingestion/normalizer.ts   — تحويل الخام إلى جداول نظيفة
```
لكل استجابة SportMonks:
1. حفظ الـ JSON payload الكامل في الجدول الخام المناسب
2. استخراج الكيانات → upsert في الجداول المنظمة
3. تحديث timestamp

### 1.6 Normalization Functions
```
src/lib/normalization/
  fixture.ts          — تحويل fixture response → fixtures + participants + scores + events + statistics
  standings.ts        — تحويل standings response → standings_rows + details
  odds.ts             — تحويل odds response → odds_prematch_rows / odds_inplay_rows
  lineups.ts          — تحويل lineups → lineups + expected_lineups
  xg.ts               — تحويل xG → xg_team_rows + xg_player_rows
  news.ts             — تحويل news → news_articles + news_lines
  commentary.ts       — تحويل commentaries → commentary_lines
  match-facts.ts      — تحويل match facts → match_fact_rows
  squads.ts           — تحويل squads → team_squads
  rankings.ts         — تحويل rankings → team_rankings
  topscorers.ts       — تحويل topscorers → topscorers
```

---

## المرحلة 2: Feature Engineering — تحويل البيانات إلى features
**المدة المقدرة: 3-4 أيام**

### 2.1 Pre-Match Features
```
src/features/prematch/
  form.ts              — آخر 5-10 نتائج → معدل النقاط + الاتجاه
  attack-defence.ts    — أهداف مسجلة/مستقبلة → قوة الهجوم/الدفاع
  xg-trend.ts          — اتجاه xG عبر آخر المباريات
  rest-congestion.ts   — أيام الراحة + ازدحام الجدول
  squad-depth.ts       — حجم التشكيلة + جودة البدلاء + المصابين
  lineup-strength.ts   — قوة التشكيلة المتوقعة
  topscorer-dep.ts     — اعتماد الفريق على الهداف الأول
  standings-pressure.ts — ضغط الترتيب (صراع لقب/هبوط/أوروبا)
  h2h-features.ts      — معدلات H2H (فوز/تعادل/BTTS/Over)
  referee-features.ts  — معدلات الحكم (بطاقات/ركلات جزاء/أخطاء)
  ranking-features.ts  — تصنيف الفريق + الاتجاه
  market-features.ts   — odds الافتتاحية → الحالية → الاتجاه
```
→ يحفظ النتائج في `features_prematch`

### 2.2 Live Features
```
src/features/live/
  live-stats.ts        — الاستحواذ + التسديدات + xG المباشر
  momentum.ts          — زخم من التعليقات + الهجمات الخطيرة
  table-swing.ts       — تأثير النتيجة الحالية على الترتيب
  market-drift.ts      — اتجاه أودز inplay
```
→ يحفظ النتائج في `features_live`

### 2.3 Schedule + Squad Features
```
src/features/schedule/
  schedule-calc.ts     — حساب الراحة والازدحام من جدول المباريات
src/features/squad/
  squad-calc.ts        — تحليل عمق التشكيلة والمصابين
```
→ يحفظ في `features_schedule` + `features_squad`

### 2.4 Market + Rankings Features
```
src/features/market/
  odds-movement.ts     — تتبع حركة الأودز عبر الوقت
src/features/rankings/
  ranking-trend.ts     — اتجاه التصنيف
```
→ يحفظ في `features_market` + `features_rankings`

### 2.5 Feature Orchestrator
```
src/features/orchestrator.ts
```
- يأخذ fixtureId → يجمع كل الـ features → يحفظ في DB
- يُستدعى من recompute-features job (كل 10 دقائق)

---

## المرحلة 3: Python Model Service — التدريب والاستدلال
**المدة المقدرة: 5-7 أيام**

### 3.1 Data Pipeline (Python)
```
python/data/
  db_connector.py      — اتصال مباشر بـ PostgreSQL (psycopg2)
  feature_loader.py    — يقرأ features_prematch من DB → DataFrame
  dataset_builder.py   — يبني training/validation/test sets
```

### 3.2 النماذج الإحصائية
```
python/models/
  poisson.py           — Poisson Goal Model (عدد الأهداف المتوقع)
  dixon_coles.py       — Dixon-Coles (تعديل Poisson للنتائج المنخفضة)
```
- تُدرَّب على بيانات المواسم السابقة
- تُخرج احتمالات لكل نتيجة ممكنة (0-0, 1-0, 0-1, 1-1, ...)
- تُحوَّل إلى احتمالات 1X2, O/U 2.5, BTTS

### 3.3 نماذج الـ ML
```
python/models/
  catboost_model.py    — CatBoost (النموذج الأساسي)
  lightgbm_model.py    — LightGBM (نموذج ثانوي)
  xgboost_model.py     — XGBoost (نموذج ثانوي)
```
- تأخذ features_prematch كـ input
- تتنبأ باحتمالات لكل سوق
- تُدرَّب بـ Optuna للـ hyperparameter tuning

### 3.4 التدريب
```
python/training/
  trainer.py           — يدرّب جميع النماذج
  evaluator.py         — يقيّم الأداء (Brier Score, Log Loss, ROI)
  model_store.py       — يحفظ/يحمّل النماذج (joblib)
```
- التدريب الأول: على بيانات تاريخية (يتطلب جمع بيانات أولاً)
- إعادة التدريب: أسبوعياً أو عند تراكم بيانات كافية

### 3.5 الاستدلال (Inference)
```
python/inference/
  predictor.py         — يشغّل كل النماذج على مباراة
  model_registry.py    — يحمّل أحدث النماذج المدرَّبة
```

### 3.6 المعايرة والدمج (Calibration + Ensemble)
```
python/calibration/
  calibrator.py        — Platt Scaling / Isotonic Regression
  ensemble.py          — Weighted Ensemble (MODEL_WEIGHTS from config)
```
- يأخذ مخرجات كل النماذج
- يعايرها → يدمجها → يخرج احتمال نهائي واحد لكل outcome

### 3.7 API Endpoints (توسيع)
```
python/service/routers/
  predict.py           — POST /predict/{market} → يشغل النماذج
  train.py             — POST /train → يبدأ دورة تدريب
  health.py            — GET /health → (موجود)
  status.py            — GET /status → حالة النماذج
```

---

## المرحلة 4: Betting Signal Engine
**المدة المقدرة: 2-3 أيام**

### 4.1 Signal Pipeline
```
src/signals/
  fair-odds.ts         — calibrated probability → fair odds (1/p)
  edge-calc.ts         — (fair odds - bookmaker odds) / bookmaker odds × 100
  confidence.ts        — يحسب الثقة من: ensemble agreement + edge size + data quality
  classifier.ts        — يصنف: NO_BET / LEAN / STRONG_SIGNAL
  signal-builder.ts    — يجمع كل شيء → BettingSignal object
```

### 4.2 حدود التصنيف (من config/modelWeights.ts)
```
STRONG_SIGNAL: edge ≥ 8% AND confidence ≥ 0.7
LEAN:         edge ≥ 3% AND confidence ≥ 0.5
NO_BET:       الباقي
```

### 4.3 Signal Orchestrator
```
src/signals/orchestrator.ts
```
- يُستدعى من recompute-signals job
- لكل مباراة بـ features جاهزة:
  1. يطلب predictions من Python service
  2. يحسب fair odds
  3. يقارن مع bookmaker 35 odds
  4. يحسب edge + confidence
  5. يصنف الإشارة
  6. يحفظ في betting_signals

---

## المرحلة 5: Analysis Packets — حزم التحليل الذكية
**المدة المقدرة: 2-3 أيام**

### 5.1 Pre-Match Packet Assembler
```
src/lib/analysis/packets/
  pre-match-assembler.ts
```
يجمع من DB بشكل انتقائي (ليس من API مباشرة):
- هوية المباراة + المسابقة + المشاركون
- الترتيب + التصحيحات + سياق الجولة
- H2H ملخص (آخر 10 مواجهات)
- إحصائيات الموسم (ملخص لكل فريق)
- إحصائيات الحكم (ملخص)
- xG + التشكيلة المتوقعة
- عمق التشكيلة + المصابين
- الراحة والازدحام
- الأخبار (ملخصات)
- odds Bookmaker 35 (pre-match)
- predictions + features ملخصة
- match facts
- التصنيف + الاتجاه
- **الإشارات النهائية (signals)**

→ يحفظ في analysis_packets (packetType = "pre-match")

### 5.2 Live Packet Assembler
```
src/lib/analysis/packets/
  live-assembler.ts
```
يجمع:
- الحالة المباشرة (الدقيقة + النتيجة)
- الأحداث (أهداف، بطاقات، تبديلات)
- الإحصائيات المباشرة
- xG المباشر
- أودز inplay
- تأثير الترتيب المباشر
- زخم التعليقات
- التشكيلة الفعلية
- match facts محدثة

→ يحفظ في analysis_packets (packetType = "live")

### 5.3 مبدأ الاسترجاع التدريجي
```
المستوى 1 (أساسي):     الهوية + النتيجة + الإشارات + الملخص          (~2KB)
المستوى 2 (تفصيلي):    + الترتيب + H2H + الأودز + Features          (~8KB)
المستوى 3 (عميق):       + كل التفاصيل + التعليقات + match facts      (~20KB)
```
الـ Custom GPT يطلب المستوى 1 أولاً، ثم يسحب المستويات الأعمق عند الحاجة.

---

## المرحلة 6: Internal API — واجهة برمجية داخلية
**المدة المقدرة: 2-3 أيام**

### 6.1 API Routes (Next.js App Router)
```
src/app/api/
  fixtures/
    upcoming/route.ts        — GET  المباريات القادمة (مع ملخص الإشارات)
    [id]/route.ts            — GET  تفاصيل مباراة واحدة
    [id]/analysis/route.ts   — GET  حزمة التحليل الكاملة
    [id]/signals/route.ts    — GET  إشارات الرهان
    live/route.ts            — GET  المباريات الحية حالياً

  standings/
    [seasonId]/route.ts      — GET  ترتيب الموسم

  predictions/
    [fixtureId]/route.ts     — GET  التوقعات لمباراة

  signals/
    today/route.ts           — GET  كل إشارات اليوم
    strong/route.ts          — GET  إشارات STRONG_SIGNAL فقط

  markets/
    route.ts                 — GET  الأسواق المتاحة

  system/
    health/route.ts          — GET  حالة النظام
    jobs/route.ts            — GET  حالة الـ workers
```

### 6.2 Authentication
```
src/middleware.ts             — التحقق من API Key (x-api-key header)
src/app/api/auth.ts          — helper للتحقق
```
- API Key ثابت يُخزن في .env
- يُستخدم من Custom GPT في الـ Actions

### 6.3 Response Format
كل response يتبع نمط موحد:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "generatedAt": "...",
    "freshness": "...",
    "level": 1
  }
}
```

---

## المرحلة 7: Custom GPT — الواجهة الذكية
**المدة المقدرة: 1-2 يوم**

### 7.1 OpenAI Actions Schema
```
openai/
  actions-schema.yaml        — OpenAPI spec للـ Internal API
  gpt-instructions.md        — تعليمات الـ Custom GPT
```

### 7.2 تعليمات الـ GPT
- أنت محلل كرة قدم محترف
- تستخدم الـ Actions لجلب البيانات من KilluaFootball API
- تطلب المستوى 1 أولاً، ثم تسحب تفاصيل أعمق عند الحاجة
- تشرح التحليل والتوقعات بوضوح مع الأدلة
- لا تخترع بيانات — كل شيء من الـ API

### 7.3 سيناريوهات الاستخدام
1. "حلل مباراة ليفربول القادمة" → fixtures/upcoming → analysis packet
2. "ما هي أفضل رهانات اليوم؟" → signals/strong
3. "كيف حال ريال مدريد في الترتيب؟" → standings
4. "أخبرني عن المباريات الحية الآن" → fixtures/live

---

## المرحلة 8: VPS Deployment — النشر
**المدة المقدرة: 1-2 يوم**

### 8.1 تهيئة الـ VPS
```bash
# 1. تحديث النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. تثبيت أدوات إضافية
sudo apt install -y htop curl git ufw

# 4. إعداد الجدار الناري
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 5. إعداد swap (احتياطي)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 8.2 النشر
```bash
# 1. نسخ المشروع
git clone <repo-url> /opt/killuafootball
cd /opt/killuafootball

# 2. إعداد .env
cp .env.example .env
nano .env  # تعبئة القيم الحقيقية

# 3. بناء وتشغيل
docker compose build
docker compose up -d

# 4. تهيئة قاعدة البيانات
docker compose exec nextjs-app npx prisma migrate deploy

# 5. التحقق
docker compose ps
curl http://localhost:3000/api/system/health
curl http://localhost:8000/health
```

### 8.3 SSL (اختياري لاحقاً)
- Caddy أو Certbot لشهادة SSL مجانية
- مطلوب domain name

---

## المرحلة 9: التدريب الأولي وجمع البيانات
**المدة المقدرة: 3-5 أيام (تشغيل + انتظار)**

### 9.1 جمع البيانات التاريخية
- تشغيل sync-reference لجمع standings + squads + rankings
- تشغيل sync-pre-match للمباريات القادمة
- الانتظار لتراكم بيانات كافية (50-100 مباراة كحد أدنى)
- بديل: استيراد بيانات تاريخية من SportMonks (fixtures by date range)

### 9.2 التدريب الأول
```bash
docker compose exec killua-python python -m training.trainer
```
- تدريب Poisson + Dixon-Coles على البيانات التاريخية
- تدريب CatBoost + LightGBM + XGBoost على features
- معايرة (Platt Scaling)
- تقييم الأداء
- حفظ النماذج

### 9.3 Backtesting
```
python/backtesting/
  backtester.py          — يختبر الإشارات على بيانات تاريخية
  metrics.py             — يحسب ROI, Hit Rate, Brier Score
```

---

## المرحلة 10: المراقبة والصيانة
**مستمرة**

### 10.1 Dashboard بسيط (Next.js page)
```
src/app/dashboard/
  page.tsx               — حالة الـ workers + آخر الإشارات + أداء النماذج
```

### 10.2 تنبيهات
- Worker failure → log
- Model drift → إعادة تدريب
- API rate limit → تعديل polling

### 10.3 إعادة التدريب الدورية
- أسبوعياً أو عند تراكم 50+ مباراة جديدة
- مقارنة أداء النموذج الجديد vs القديم
- تفعيل تلقائي إذا تحسن الأداء

---

## ملخص تدفق البيانات

```
SportMonks API
    │
    ▼
[Sync Workers] ──────────── جلب كل 8s/5m/1h
    │
    ▼
[Raw Ingestion] ─────────── حفظ JSON الخام
    │
    ▼
[Normalization] ─────────── تحويل → جداول نظيفة
    │
    ▼
[PostgreSQL] ────────────── التخزين الدائم
    │
    ▼
[Feature Engineering] ───── تحويل → features جاهزة (كل 10 دقائق)
    │
    ▼
[Python Model Service] ──── استدلال → احتمالات (كل 5 دقائق)
    │
    ▼
[Calibration + Ensemble] ── تعديل → احتمال نهائي
    │
    ▼
[Signal Engine] ─────────── fair odds → edge → confidence → signal class
    │
    ▼
[Analysis Packets] ──────── حزم منظمة وجاهزة
    │
    ▼
[Internal API] ──────────── REST endpoints
    │
    ▼
[Custom GPT] ────────────── يسأل API → يشرح للمستخدم
```

---

## ترتيب التنفيذ الأمثل

| # | المرحلة | يعتمد على | الأولوية |
|---|---------|-----------|----------|
| 1 | VPS Setup + Docker | لا شيء | 🔴 فوري |
| 2 | Normalization Layer | VPS | 🔴 فوري |
| 3 | Sync Workers (Reference + Pre-match) | Normalization | 🔴 فوري |
| 4 | Sync Workers (Live) | Normalization | 🟡 مهم |
| 5 | Feature Engineering | Sync Workers | 🔴 فوري |
| 6 | Python Models (Statistical) | Feature Eng. | 🔴 فوري |
| 7 | Python Models (ML) | بيانات كافية | 🟡 مهم |
| 8 | Signal Engine | Models | 🔴 فوري |
| 9 | Analysis Packets | Signal Engine | 🔴 فوري |
| 10 | Internal API | Packets | 🔴 فوري |
| 11 | Custom GPT | Internal API | 🟢 أخير |
| 12 | Monitoring + Dashboard | كل شيء | 🟢 أخير |

---

## الخطوة التالية الآن

### ✅ هل تشتري Cloud VPS 20؟

**نعم، لكن ليس مطلوباً فوراً.** يمكنك:
1. **الآن**: متابعة التطوير محلياً (المراحل 1-6 كلها تعمل محلياً)
2. **عند الجاهزية**: شراء VPS ونشر كل شيء دفعة واحدة

**لكن إذا أردت البدء فوراً بجمع البيانات** (مهم للتدريب)، فشراء VPS الآن أفضل لتشغيل sync workers مبكراً.

### الخطوة التالية الفعلية:
> **المرحلة 1.5 + 1.6**: بناء Normalization Layer + Raw Ingestion Layer
>
> هذا هو الأساس الذي يعتمد عليه كل شيء آخر — تحويل استجابات SportMonks إلى جداول PostgreSQL نظيفة.

---

## موارد الخادم المتوقعة

| المكون | RAM | CPU | ملاحظات |
|--------|-----|-----|---------|
| PostgreSQL | ~2GB | متوسط | يزيد مع البيانات |
| Redis | ~512MB | منخفض | cache فقط |
| Next.js + Workers | ~1.5GB | متوسط-عالي | 3 workers |
| Python Service | ~2GB | عالي أثناء التدريب | inference خفيف |
| Nginx | ~50MB | منخفض | |
| **المجموع** | **~6-7GB** | | من أصل 12GB متاح ✅ |

---

*هذه الخطة قابلة للتعديل مع تقدم التطوير. كل مرحلة ستُراجع قبل البدء فيها.*
