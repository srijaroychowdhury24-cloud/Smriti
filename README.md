# 🌸 Smriti (স্মৃতি / स्मृति)

**A gentle cognitive-care companion for people living with memory loss and dementia, and for the caregivers who support them.**

Smriti ("memory" in Bengali, Assamese and Hindi) combines calming cognitive games, a friendly companion named **Mimi** (a Himalayan red panda), medication and hydration reminders, and a caregiver dashboard, all in a soft pastel interface designed for elderly users. It is culturally grounded in North-East India and available in **English, Bengali, Assamese and Hindi**.

### 🔗 Live Demo

**👉 [Try Smriti live]: https://smriti-app-2.netlify.app/

> ⚠️ **Disclaimer:** Smriti is a supportive wellness tool, not a medical device. It does not diagnose, treat or replace professional clinical care.

---

## ✨ Features

### For patients
- **Six cognitive games, 10 levels each (60 levels total)**
  | Game | Focus |
  |---|---|
  | Cultural Match | Memory card matching with regional imagery |
  | Pattern Harmony | Musical sequence recall (Bihu dhol, temple bell, bamboo flute, diya) |
  | Daily Association | Linking everyday objects and routines |
  | My Home | Familiar home and place recognition |
  | Sort It Out | Categorisation and sorting |
  | Who Is This? | Face and relationship recognition |
- **Mimi, the companion**: encouragement, hints and read-aloud support, with voice input and text-to-speech
- **Calm breathing and Memory Garden**: a mindfulness exercise that blooms a new flower each day
- **Multilingual UI and voice**: English, বাংলা, অসমীয়া, हिन्दी
- **Adaptive difficulty**: an Item Response Theory / Elo-style engine tracks latent ability, reaction latency and a cognitive fatigue index, then adjusts pacing and hint timing

### For caregivers
- **PIN-protected caregiver dashboard** with overview, prescriptions and improvement-insight tabs
- **Score tracking and trends** across games and sessions
- **Prescription and care directives**: medicines, dosages, allergies, doctor and emergency contacts, important notes
- **Scheduled reminders**: medication, hydration, activity and appointments, with browser notifications, chimes and Mimi voice prompts. Critical missed doses can trigger caregiver escalation
- **Consent management and tamper-evident audit logging**, with pseudonymised patient identifiers

### Storage
- Works fully **offline / local-only** out of the box (browser storage)
- Optional **Supabase** cloud sync with row-level security (schema included)

---

## 🛠️ Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for animation, [Lucide](https://lucide.dev/) for icons
- [Supabase](https://supabase.com/) (optional) for cloud persistence
- Web Speech API and Web Audio API for voice and sound

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/))

### Installation

```bash
git clone https://github.com/<your-username>/smriti.git
cd smriti
npm install        # or: bun install
```

### Configure environment (optional)

The app runs without any configuration. To enable cloud sync, copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

If these are empty, Smriti automatically falls back to local-only storage.

### Set up the database (only if using Supabase)

1. Create a project at [supabase.com](https://supabase.com/)
2. Open **SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql)
3. Review the row-level-security policies and tighten them for your deployment (see [Security notes](#-security-notes))

### Run

```bash
npm run dev        # starts on http://localhost:3000
```

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
npm run lint       # type-check with tsc
```

---

## 🌐 Deploying

Smriti builds to a static site, so it deploys easily to GitHub Pages, Vercel, Netlify or Cloudflare Pages.

### GitHub Pages
1. In `vite.config.ts`, set `base: '/<repo-name>/'`
2. Build with `npm run build`
3. Publish the `dist/` folder (for example with a GitHub Actions workflow or the `gh-pages` package)

### Vercel / Netlify
- **Build command:** `npm run build`
- **Output directory:** `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables if using Supabase

> Microphone features (voice input) require **HTTPS**, which all of the platforms above provide.

---

## 📁 Project Structure

```
smriti/
├── src/
│   ├── components/        # UI: Home, games, Mimi, caregiver dashboard, garden
│   ├── data/              # Game content and multilingual translations
│   ├── utils/
│   │   ├── adaptiveEngine.ts      # IRT/Elo adaptive difficulty
│   │   ├── reminderScheduler.ts   # Medication & hydration alerts
│   │   ├── prescriptionStore.ts   # Patient care directives
│   │   ├── security.ts            # PIN/RBAC, consent, audit log
│   │   ├── scoreStore.ts          # Score persistence
│   │   ├── gardenStore.ts         # Memory Garden progress
│   │   ├── speech.ts / audio.ts   # Voice and sound effects
│   │   └── supabaseClient.ts      # Optional cloud sync
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase_schema.sql    # Database schema with RLS
├── .env.example
└── vite.config.ts
```

---

## 🔐 Security Notes

- The caregiver PIN **defaults to `1234`**. Change it on first use. It is stored client-side, so treat it as a convenience lock, not strong authentication.
- Never commit `.env` files. They are already in `.gitignore`.
- The Supabase anon key is public by design. Protection comes from **row-level security**, so review the policies in `supabase_schema.sql` before storing real patient data. In particular, check the `scores` read policy, which currently permits the `anon` role.
- If you plan to handle real health data, make sure you comply with applicable regulations (e.g. DPDP Act in India, GDPR, HIPAA).

---

## 🗺️ Roadmap Ideas

- More regional languages (Bodo, Manipuri, Mizo, etc.)
- Photo-based personal memory albums for caregivers to upload
- Exportable clinician-ready progress reports
- Offline PWA support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss major changes first, then submit a pull request.

<div align="center">
Made with 💛 for families walking the path of memory care.
</div>
