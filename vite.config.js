import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/woundchron/',
})
```

**Step 4** — Click **"Commit changes"** → **"Commit changes"**

---

**MISSING FILE 2 — deploy.yml**

**Step 5** — Click **"Add file"** → **"Create new file"**

**Step 6** — In the filename box type:
```
.github/workflows/deploy.yml
name: Deploy WoundChron

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Step 8** — Click **"Commit changes"** → **"Commit changes"**

---

**Then check src folder:**

**Step 9** — Click the `src` folder and confirm you see both:
```
📄 App.jsx   ✅
📄 main.jsx  ← is this there?
