# SentriX Test Environment API

سيرفر اختبار جاهز (FastAPI) يغطي: استخراج بيانات من PDF، توليد PDF من بيانات incident،
والأرشفة مع Integrity Verification (SHA-256). مُختبر ويشتغل فعليًا.

## تشغيله محليًا (دقيقتين)

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

افتح `http://localhost:8000/docs` — واجهة تفاعلية تقدر تجرب فيها كل endpoint مباشرة.

## نشره على Cloud اليوم (خيارين، مجانيين، بدون بطاقة ائتمان)

### الخيار الأول: Render.com (أسهل واحد لـ FastAPI)

1. ارفعوا هذا المجلد كـ repo على GitHub (لو ما عندكم واحد جاهز، سووا repo جديد وارفعوا هالملفات).
2. روحوا [render.com](https://render.com) → سجلوا بحساب GitHub.
3. `New +` → `Web Service` → اختاروا الـ repo.
4. الإعدادات:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
5. اضغط `Create Web Service` — يجهز خلال 2-3 دقائق ويعطيكم رابط زي:
   `https://sentrix-test.onrender.com`

⚠️ ملاحظة مهمة عن الـ Free tier: السيرفر "ينام" لو ما فيه طلبات لمدة معينة، وأول طلب بعد النوم ياخذ ~30 ثانية يصحّى. عادي لبيئة اختبار، بس لو تبون شي يفضل صاحي دايمًا لازم خطة مدفوعة أو Railway.

### الخيار الثاني: Railway.app

نفس الخطوات تقريبًا: `New Project` → `Deploy from GitHub repo` → يكتشف تلقائيًا إنه Python ويشغّل حسب الـ `Procfile` الموجود بالمشروع. أسرع بالاستيقاظ من Render لكن الفريّة محدودة بساعات شهرية.

### مهم بعد النشر

- جربوا `https://your-url/health` أول شي للتأكد إنه شغّال.
- التخزين هنا محلي على السيرفر (filesystem) — يعني لو السيرفر أعاد التشغيل (على الـ free tier يصير هذا أحيانًا) الأرشيف يروح. هذا متوقع لبيئة اختبار؛ خطوة الربط بـ S3/GCS الحقيقي تجي بعدين.

## كيف فريق الويب يربط عليه

CORS مفتوح للجميع حاليًا (بيئة اختبار فقط)، فيقدرون يستدعون مباشرة من الفرونت:

```javascript
const res = await fetch("https://your-url/api/archive", { method: "GET" });
const records = await res.json();
```

رفع PDF للاستخراج:
```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);
const res = await fetch("https://your-url/api/pdf/extract", {
  method: "POST",
  body: formData,
});
```

## Endpoints

| Method | Path | الوظيفة |
|---|---|---|
| GET | `/health` | فحص إن السيرفر شغّال |
| POST | `/api/pdf/extract` | يستقبل PDF (multipart file) ويرجّع نص + جداول |
| POST | `/api/pdf/generate?archive=true\|false` | يستقبل JSON incident ويرجّع PDF (أو يؤرشفه مباشرة لو archive=true) |
| POST | `/api/archive/file` | يؤرشف أي ملف مرفوع (multipart) |
| POST | `/api/archive/json` | يؤرشف بيانات JSON |
| GET | `/api/archive` | يرجّع قائمة كل الأرشيف |
| GET | `/api/archive/{id}` | يرجّع سجل واحد + نتيجة التحقق من السلامة (`integrity_ok`) |
| GET | `/api/archive/{id}/download` | تحميل الملف الأصلي |

## اللي يحتاج تغيير لاحقًا (production)

- `CORSMiddleware` → تحصرونه بدومين الويب الفعلي بدل `*`.
- `archive_bytes` / التخزين المحلي → يتحول لـ Supabase Storage، بدون ما تغيّرون أي endpoint.
- الجداول المحلية (`storage/db/*.json`) → تتحول لجداول Supabase Postgres الحقيقية بنفس الأسماء.
- تضيفون auth (API key أو JWT) قبل ما يوصل الرابط لأي جهة خارج الفريق.

## ربط DataRobot الحقيقي (بمجرد ما يجهز)

ما يحتاج تعديل كود. بس ضيفوا هذين المتغيرين في إعدادات الـ Environment على Render/Railway:

```
DATAROBOT_ENDPOINT=https://your-datarobot-prediction-url
DATAROBOT_API_KEY=your-key
```

لو موجودين، السيرفر يستدعي DataRobot فعليًا. لو مو موجودين (أو صار خطأ اتصال)، يرجع تلقائيًا للـ mock بدون ما يكسر أي شي عند فريق الويب — لأن شكل الرد ثابت في الحالتين.

⚠️ لاحظوا: شكل رد DataRobot الفعلي قد يختلف عن الافتراض في الكود (`resp.json()["predictions"][0]["anomaly_score"]`) — لما يوصلكم الرابط الحقيقي، جربوه بـ curl أول وعدّلوا هذا السطر في `call_isolation_forest()` حسب شكل الرد الفعلي.
