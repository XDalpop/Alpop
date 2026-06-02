# PROJECT_MAP: TradeVault - منصة إدارة صفقات البورصة

> **تاريخ التخطيط:** 2026-06-02
> **الدور:** Staff Software Engineer / Tech Lead

---

## [TECH_STACK]

| الطبقة | التقنية | الإصدار | المصدر |
|--------|---------|---------|--------|
| UI | HTML5 + CSS3 (Vanilla) | — | محلي |
| Logic | JavaScript (ES2024) | — | محلي |
| Charts | Chart.js | **4.5.1** | CDN (jsDelivr) |
| Icons | Font Awesome 6 (Free) | **6.7.2** | CDN (jsDelivr) |
| Font (Latin) | Poppins | 300-700 | Google Fonts |
| Font (Arabic) | Cairo | 400-700 | Google Fonts |
| Persistence | LocalStorage API | — | Web API |
| XLSX Export | SheetJS | **2.0.0** | CDN (jsDelivr) |
| CSV Export | Native JS | — | محلي |
| Auth & Session | localStorage + sessionStorage | — | Web API |

**قرارات تقنية:**
- **لا توجد أداة بناء** — Vanilla JS حفاظاً على البساطة (Simplicity First)
- **لا يوجد إطار عمل** — SPA بسيط لا يحتاج React/Vue
- **CDN فقط** — لا حاجة لـ npm في مشروع صفحة واحدة
- **لا يوجد Micro-files** — ملفات مقسّمة حسب المجال (Domain-Driven)

---

## [ARCHITECTURE]

### هيكل الملفات

```
مضاربة/
├── index.html           # نقطة الدخول الوحيدة (Single Entry Point)
├── css/
│   └── style.css        # جميع الأنماط (Dark, Glassmorphism, Responsive)
├── js/
│   ├── store.js         # طبقة البيانات: LocalStorage CRUD (ديناميكي لكل مستخدم)
│   ├── calculator.js    # دوال الحساب المالي الخالصة (Pure Functions)
│   ├── auth.js          # نظام المصادقة: تسجيل دخول، جلسات، مستخدمين
│   ├── dashboard.js     # إحصائيات + Chart.js + Dashboard Cards
│   ├── app.js           # التنسيق الرئيسي: Form, Table, Events, Export, Auth
│   └── utils.js         # Utilities: تنسيق تواريخ/أرقام، تصدير CSV
└── PROJECT_MAP.md       # وثيقة المعمارية
```

### تدفق البيانات (Data Flow)

```
[نموذج الإدخال] ──> app.js ──> calculator.js (حساب الربح) ──> store.js (حفظ LocalStorage)
                                                                      │
                                                                      ▼
[Dashboard Cards] <── dashboard.js (إحصائيات) <── store.js (قراءة)
[Chart.js Chart]  <── dashboard.js (رسم)       <── store.js (قراءة)
[جدول الصفقات]    <── app.js (تصيير)           <── store.js (قراءة)
```

### نموذج البيانات (Data Model)

```js
// Trade schema — حقل واحد لكل صفقة
{
  id: string,            // UUID (nanoid-بسيط: timestamp + random)
  entryDate: string,     // ISO 8601 (e.g. "2026-06-01")
  exitDate: string,      // ISO 8601
  shares: number,        // عدد الأسهم (عدد صحيح موجب)
  entryPrice: number,    // سعر الشراء (عدد عشري > 0)
  exitPrice: number,     // سعر البيع (عدد عشري > 0)
  // الحقول المحسوبة (تُحسب عند الإدخال/التعديل وتُخزّن):
  profit: number,        // (exitPrice - entryPrice) * shares
  profitPercent: number, // (exitPrice - entryPrice) / entryPrice * 100
  holdingDays: number,   // فارق الأيام بين entryDate و exitDate
  createdAt: string,     // ISO timestamp
  updatedAt: string      // ISO timestamp
}
```

### Key Calculation Functions (calculator.js)

| الدالة | المدخلات | المخرجات |
|--------|---------|----------|
| `calcProfit(entryPrice, exitPrice, shares)` | أسعار + عدد | `{ profit, profitPercent }` |
| `calcHoldingDays(entryDate, exitDate)` | تاريخين | عدد الأيام |
| `classify(profit)` | رقم | `'win' \| 'loss' \| 'breakeven'` |
| `isWinner(trade)` | صفقة | boolean (profit > 0) |
| `isLoser(trade)` | صفقة | boolean (profit < 0) |

### Store API (store.js)

| الدالة | الوصف |
|--------|-------|
| `getAllTrades()` | كل الصفقات (مصفوفة) |
| `getTradeById(id)` | صفقة واحدة |
| `addTrade(data)` | إضافة + حساب + حفظ |
| `updateTrade(id, data)` | تعديل + إعادة حساب |
| `deleteTrade(id)` | حذف |
| `clearAllTrades()` | مسح الكل (تأكيد) |

### Dashboard Stats (dashboard.js)

| المؤشر | المعادلة |
|--------|----------|
| إجمالي الصفقات | `trades.length` |
| إجمالي الربح/الخسارة | `Σ profit` |
| متوسط نسبة الربح | `(Σ profitPercent) / trades.length` |
| الصفقات رابح / خاسر / تعادل | `isWinner` / `isLoser` / باقي |
| أكبر ربح | `Math.max(...trades.map(t => t.profit))` |
| أكبر خسارة | `Math.min(...trades.map(t => t.profit))` |
| متوسط مدة الاحتفاظ | `(Σ holdingDays) / trades.length` |
| Profit Factor | `Σ profits_positive / abs(Σ profits_negative)` |

---

## [SYSTEM_FLOW] — رحلة المستخدم GUI

```
User ──> [شاشة الدخول] ──> إدخال اسم المستخدم + كلمة المرور
  │
  ├── [مستخدم جديد] ──> إنشاء حساب تلقائي ──> حفظ في LocalStorage (tradevault_users)
  │
  └── [مستخدم موجود] ──> التحقق من كلمة المرور
         │
         ▼
    [sessionStorage] ──> حفظ الجلسة (tradevault_session)
         │
         ▼
    شاشة Dashboard الرئيسية (بيانات خاصّة بالمستخدم)
      │  (مفتاح التخزين: tradevault_trades_{username})
      │
      ├── [إضافة صفقة] ──> Modal ──> حفظ ──> تحديث
      ├── [تعديل/حذف] ──> تعديل البيانات ──> حفظ ──> تحديث
      ├── [بحث/فلترة] ──> تصفية الجدول
      ├── [تصدير] ──> CSV / XLSX
      └── [تسجيل خروج] ──> مسح الجلسة ──> العودة لشاشة الدخول
```

---

## [ORPHANS & PENDING]

| البند | الحالة | ملاحظات |
|-------|--------|---------|
| LocalStorage CRUD | ✅ مخطط | store.js |
| حساب الربح التلقائي | ✅ مخطط | calculator.js |
| جدول صفقات + Zebra | ✅ مخطط | app.js (renderTable) |
| Dashboard + 4 كروت | ✅ مخطط | dashboard.js |
| Chart.js (أداء الربح) | ✅ مخطط | dashboard.js (initChart) |
| تعديل صفقة | ✅ مخطط | Modal edit flow |
| حذف صفقة | ✅ مخطط | Confirm + store.deleteTrade |
| تصدير CSV | ✅ مخطط | utils.js (exportCSV) |
| تصدير XLSX | ✅ مخطط | utils.js عبر SheetJS CDN |
| فلترة + بحث | ✅ مخطط | Client-side filter |
| Arabic / RTL | ✅ مخطط | dir="rtl" + Cairo font |
| Responsive | ✅ مخطط | Media queries in style.css |
| Glassmorphism Dark | ✅ مخطط | CSS variables + backdrop-filter |
| نظام تسجيل دخول | ✅ مخطط | auth.js — جلسات لكل مستخدم |
| مساحة تخزين منفصلة | ✅ مخطط | store.js — مفتاح ديناميكي tradevault_trades_{user} |
| تسجيل خروج | ✅ مخطط | auth.js — مسح sessionStorage |
| تحويل العملات | ❌ خارج النطاق | لم يُطلب صراحة في النطاق الأساسي |

---

## [MILESTONES] — خطة العمل (Verifiable Goals)

### M1: الهيكل الأساسي والحفظ
- [ ] إنشاء `index.html` مع CDN links و RTL baseline
- [ ] `store.js`: CRUD كامل مع LocalStorage
- [ ] `calculator.js`: دوال الحساب
- **التحقق:** فتح الصفحة → إضافة صفقة → تحديث → بقاء البيانات

### M2: واجهة المستخدم
- [ ] `style.css`: Dark mode + Glassmorphism + Responsive
- [ ] `app.js`: نموذج إدخال + جدول مع حذف/تعديل
- **التحقق:** إضافة/تعديل/حذف صفقات → تحديث فوري للجدول

### M3: التحليلات والرسوم
- [ ] `dashboard.js`: 4 كروت إحصائية + Chart.js
- [ ] ربط التحديثات بين الإضافة/التعديل/الحذف ولوحة التحليلات
- **التحقق:** إضافة 5 صفقات → تحديث Dashboard + Chart تلقائياً

### M4: الإضافات
- [ ] فلترة بالتاريخ + بحث نصي في الجدول
- [ ] تصدير CSV + XLSX
- [ ] تجربة Responsive كاملة
- **التحقق:** تصدير ملف → فتحه في Excel → بيانات صحيحة

### M5: التعريب واللمسات النهائية
- [ ] دعم RTL كامل + أرقام عربية (Eastern Arabic)
- [ ] تأثيرات Hover/Animation
- [ ] اختبار على موبايل + Desktop
- **التحقق:** تبديل اللغة/الاتجاه → ظهور سليم
