# Story 4U

Ứng dụng 4U — frontend Nuxt 4 + backend Spring Boot (Java 21). Dự án cung cấp chức năng tạo & chia sẻ thiệp điện tử (E-card) với các tính năng: upload media (Cloudinary), authentication (Firebase), gửi email (Brevo); media/audio (three.js, wavesurfer), QR sharing.

---

## ⚙️ Công nghệ chính
- Backend: Java 21, Spring Boot 3.x, Gradle
- Frontend: Nuxt 4, Vue 3, Tailwind CSS, Pinia
- Cloud & Storage: Firebase (Realtime / Firestore), Cloudinary
- Thư viện khác: Three.js, GSAP, Wavesurfer, QRCode
- Container: Docker, docker-compose

---

## ✅ Yêu cầu môi trường
- Java 21 (OpenJDK)
- Gradle wrapper (sử dụng `./gradlew`)
- Node 18+ (npm/PNPM) cho frontend
- Docker & docker-compose (nếu muốn chạy container)

Frontend: sử dụng `pnpm` (hoặc `npm`).

---

## 🏁 Mục tiêu & Trạng thái (cho người nhận bàn giao)
- Mục tiêu: Sản phẩm hoàn chỉnh cho deploy và dễ bảo trì; repository hiện có full codebase cho backend + frontend và CI preview for frontend.
- Status brief: frontend configured for Vercel (see `vercel.json`). backend uses Gradle and is containerized via Docker. **Important**: repository contains `backend/.env` (contains private keys); rotate and remove after handover.

---

## 🔁 CI/CD
- `/.github/workflows/cd.yml` — auto-merges `dev` → `main` when Vercel preview succeeds. No current build/test CI for backend or unified integration tests. Recommended: add `ci.yml` to run `./gradlew build` (backend) and `pnpm build` & tests (frontend) on PR.

---

## 🔗 Endpoints (overview)
- POST /api/user/send-otp — send OTP
- POST /api/user/verify-otp — verify OTP
- POST /api/user/share-qr — email share
- POST /api/user/ecard/delete — delete user ecard media
- POST /api/media/delete — delete Cloudinary assets
- POST /api/admin/telegram/webhook — admin bot webhook endpoint

Front-end components use `VITE_BACKEND_URL` (e.g., `http://localhost:8080/api/`).

---

## 📌 Production/Deployment Notes
- Frontend: Vercel + `vercel.json` (build & dev commands configured). Add Vercel environment variables under project settings.
- Backend: Docker container (Dockerfile uses multi-stage build). Healthcheck calls `/actuator/health` — ensure actuator dependency and endpoint in `application.yml` for production.

---

## 🔃 Troubleshooting tips (quick)
- "FIREBASE_CREDENTIALS not set": set `FIREBASE_CREDENTIALS` with JSON for service account.
- SMTP failures: check BREVO keys and `mail.from` identity verification.
- Cloudinary delete: backend needs `CLOUDINARY_*` keys to delete assets.

---

## 📁 Cấu trúc hệ thống (tóm tắt)
- `backend/` — Spring Boot REST API
- `frontend/` — Nuxt 4 client
- `docker-compose.yml` — cấu hình nhanh cho backend

---

## 🚀 Chạy dự án (Quick-start)
1) Backend (local):
```bash
cd backend
./gradlew bootRun
```
Hoặc build và chạy jar:
```bash
./gradlew bootJar
java -jar build/libs/*.jar
```

2) Backend (Docker):
```bash
docker-compose up --build
```

3) Frontend (dev):
```bash
cd frontend
pnpm install  # hoặc npm install
pnpm dev      # hoặc npm run dev
```

4) Frontend (build):
```bash
pnpm build
pnpm preview
```

---

## 🔐 Biến môi trường quan trọng (không commit secrets)
- Backend (`backend/.env` hoặc `.env`):
  - FIREBASE_CREDENTIALS (JSON string or path)
  - BREVO_SMTP_KEY, BREVO_SMTP_USERNAME
  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - FIRESTORE_ROOT_PATH
- Frontend (`frontend/.env`):
  - VITE_BACKEND_URL
  - VITE_FIREBASE_*
  - VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET

Xem `backend/.env.example` và `frontend/.env` để tham khảo các giá trị mẫu.

---

## 🛠 Hướng dẫn đóng góp (rút gọn)
1. Fork repository → tạo branch `feature/<name>` hoặc `fix/<name>`.
2. Tuân thủ `AGENTS.md` (style, tailwind, file < 200 lines, SOLID).
3. Commit message: `<type>(<scope>): <short description>` — types: `feat|fix|chore|docs|test`.
4. Tạo PR: bao gồm mô tả ngắn, steps để kiểm thử, và checklist (build & dev không lỗi).
5. PR reviewer sẽ kiểm tra style, test (nếu có), và run local dev build.

Ngắn gọn: follow the rules in `AGENTS.md`, keep commits nhỏ, tests rõ ràng, và add description to PR.
