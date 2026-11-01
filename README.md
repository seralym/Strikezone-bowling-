# 🎳 StrikeZone — Автономный Трекер Боулинга (PWA)

**StrikeZone** — это полнофункциональное прогрессивное веб-приложение (PWA) для профессиональных боулеров и любителей.

---

## 🚀 Основные возможности

1. **Интерактивный подсчёт очков и трекер кеглей:**
   - 10-фреймовая классическая игра с живым отображением сбитых кеглей на деке (Pin Deck).
   - Быстрые кнопки: Страйк, Спэр, Фол, подсчёт по кеглям, автоопределение сплитов (*7-10, 2-8-10, Baby Split, Washout, Big Four*).
   - Звуковые эффекты падения кеглей, синтезируемые процедурно через Web Audio API (без внешних аудиофайлов).

2. **База и каталог шаров (200 моделей + личный арсенал):**
   - 10 мировых брендов: **Storm, Brunswick, Hammer, Roto Grip, 900 Global, Motiv, Ebonite, DV8, Columbia 300, Track** (минимум 20 моделей на бренд).
   - Реалистичная 3D-визуализация с заводскими цветами и разводами.
   - Полные ТТХ для 15 lbs: RG, Diff, MB (для асимметриков), рекомендуемое масло, покрытие и ядро.
   - Ручное добавление любого шара с кастомными характеристиками и параметрами сверления (*Layout*, *Pin to PAP*).

3. **Режим «Практика» (Drills):**
   - Тренировка добивания сложных кеглей и сплитов (*10-я кегля, 7-я кегля, 7-10, 3-6-10*).
   - Выбор боулинг-центра и программы масла перед стартом тренировки.
   - Подсчёт процента конверсии и детальная статистика.

4. **Турниры и Лиги:**
   - Календарь регулярных турниров с указанием клубов, дорожек, программ масла и дат.
   - Ведение серии игр с автоматическим расчётом среднего балла (Average).

5. **Раздел «Заметки боулера»:**
   - Персональный дневник для фиксации наблюдений по переходам масла, корректировок хвата, тайминга и итогов матчей.
   - Готовые шаблоны: *План тренировки*, *Анализ турнира*, *Поведение шара на масле*, *Чек-лист техники*.
   - Теги, закрепление важных заметок и быстрый поиск.

6. **Профиль игрока и статистика:**
   - Тепловая карта остающихся кеглей (Heatmap).
   - Динамика счёта по фреймам, процент страйков, спэров и чистых игр (Clean Games).

---

## 📦 Автономная 100% Offline PWA-архитектура

- **Нулевая зависимость от сети (Zero CDN):** Все шрифты, стили, иконки и скрипты собраны локально. Никаких запросов к внешним серверам (`googleapis.com`, `gstatic.com` и т.д.).
- **Локальное хранилище:** Все данные игрока (игры, статистика, арсенал шаров, турниры, заметки) сохраняются в локальном хранилище браузера (`localStorage` / IndexedDB). Доступен экспорт и импорт в JSON.
- **Service Worker:** Настроен через `vite-plugin-pwa` с автоматическим кэшированием всех ассетов (HTML, JS, CSS, SVG, PNG) для полной работоспособности без интернета.
- **Web App Manifest:** Приложение можно установить на рабочий стол или экран смартфона (Android, iPhone / iPad).

---

## 🌐 Инструкция по деплою на GitHub Pages

В проекте уже настроена сборка с относительными путями (`base: './'` в `vite.config.ts`), поэтому приложение корректно работает в любых подпапках репозитория на GitHub Pages (`https://<username>.github.io/<repo-name>/`).

### Вариант 1: Автоматический деплой через GitHub Actions (Рекомендуется)

Файл `.github/workflows/deploy.yml` уже настроен в репозитории:

```yaml
name: Deploy StrikeZone to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci --legacy-peer-deps
          else
            npm install --legacy-peer-deps
          fi

      - name: Build production bundle
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload dist artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

1. В настройках вашего репозитория на GitHub:
   - Перейдите в **Settings** → **Pages**.
   - В выпадающем списке **Build and deployment** выберите **Source: GitHub Actions**.
2. При каждом коммите или пуше в ветку `main` или `master` (или по нажатию кнопки «Run workflow» во вкладке Actions) проект собирается и деплоится на GitHub Pages автоматически.
3. В сборку включены `.nojekyll` и `404.html` SPA-редирект, а также `touch-action: pan-y` для комфортной вертикальной прокрутки страницы на сенсорных экранах.

---

### Вариант 2: Ручной деплой с помощью пакета `gh-pages`

1. Соберите проект:
   ```bash
   npm run build
   ```
2. Разверните содержимое папки `dist`:
   ```bash
   npx gh-pages -d dist
   ```
3. В настройках репозитория в разделе **Pages** укажите ветку `gh-pages` и корневую папку `/`.

---

## 🛠 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Проверка типов
npm run lint

# Сборка production-бандла
npm run build
```
