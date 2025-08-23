---
title: Cloning & Renaming Vite + React + Tailwind Project Template
tags: [vite, react, tailwind, setup, guide]
created: 2025-08-21
---

# 🧬 Cloning & Renaming Vite + React + Tailwind Project Template

This guide explains how to copy a template project to a new folder, rename it, and make it fully independent.

---

## 📁 1. Copy the Folder

- Copy the entire project folder to the new location.
- Rename the folder to your new project name, e.g., `my-new-holiday-app`.

---

## 📦 2. Update `package.json`

- Open `package.json`.
- Change the `"name"` field:

```json
"name": "my-new-holiday-app",
Optionally update:

json
"version": "0.1.0",
"description": "A new holiday planner app"
Check "scripts" for any hardcoded paths and update if needed.

🛠 3. Update Project References
index.html title
Open index.html (or public/index.html) and update the <title> tag:

html
<title>My New Holiday App</title>
CSS / JS imports
Update any absolute imports or folder references to match the new structure.

🔗 4. Rename Source-Level References
React components
Optionally rename main components, e.g., App.jsx → MainApp.jsx, and update imports.

Environment variables
Update .env or .env.local variables if they reference the old project name.

Tailwind config
Open tailwind.config.cjs (or .js) and check content paths:

js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}"
],
Usually, you don’t need to change these unless your folder structure changed.

🧹 5. Reinstall Dependencies
bash
cd my-new-holiday-app
npm install
Ensures all local node_modules match the new project.

✅ 6. Test the Project
bash
npm run dev
Open the app in your browser and verify it runs correctly.

Check that Tailwind classes and React components are working.

⚠️ Hidden Gotchas
If you cloned a project that previously had global Node modules installed, make sure all required packages are locally installed.

Tailwind may require re-initialization if your folder structure changes drastically.

Watch for .env variables or config files that reference old project paths.

If you see module not found errors, deleting node_modules and reinstalling often fixes the problem:

bash
rm -rf node_modules package-lock.json
npm install
text