# KLAVA — концепт інтернет-магазину механічних клавіатур

Головна сторінка з живим конструктором: розмір (60 / 65 / 75%), світчі й кейкапи.
Клавіатура малюється кодом (HTML/CSS), без жодних зображень. Портфоліо-проєкт.

## Структура

```
index.html          — розмітка сторінки
assets/styles.css   — стилі (кольори, шрифти, адаптив)
assets/app.js       — стан конструктора, генератор клавіатури, графіки світчів
favicon.svg
vercel.json         — налаштування для Vercel (статичний сайт, без збирання)
```

Збирання не потрібне — це чистий HTML/CSS/JS. Шрифти (Unbounded, Manrope, JetBrains Mono)
підтягуються з Google Fonts.

## Локальний запуск

Відкрий `index.html` у браузері або запусти простий сервер:

```bash
npx serve .
# або
python3 -m http.server 8000
```

## GitHub

```bash
git init
git add .
git commit -m "KLAVA: головна сторінка"
git branch -M main
git remote add origin https://github.com/<твій-логін>/klava.git
git push -u origin main
```

## Vercel

1. vercel.com → **Add New… → Project** → імпортуй репозиторій з GitHub.
2. Framework Preset: **Other**. Build Command — порожньо, Output Directory — порожньо (корінь).
3. **Deploy**. Кожен push у `main` автоматично оновлюватиме сайт.

Або з терміналу: `npx vercel` у папці проєкту.

## Як змінити ціни чи варіанти

Усі дані — на початку `assets/app.js`: об'єкти `SIZES`, `SWITCHES`, `CAPS`, `BUILDS`.
Ціна збірки = ціна розміру + доплата за світчі + доплата за кейкапи.

© 2026 KLAVA — концепт-проєкт
