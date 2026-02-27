
# 📖 Guide: Implementing a Node.js MCP Server

This document serves as a technical breakdown of the **"Anatomy of an NPM MCP Server."** Understanding these components will help you troubleshoot and deploy Model Context Protocol (MCP) servers built with TypeScript and Node.js.

---

## 1. The Project DNA (`package.json`)

In Python, you have `requirements.txt`. In Node.js, you have `package.json`.

* **What it is:** A manifest of every library the project needs.
* **The Workflow:** Running `npm install` creates a `node_modules` folder (similar to a `.venv/lib`). This folder contains the dependencies required to run the server.

---

## 2. The Language Gap: TypeScript vs. JavaScript

Most high-quality MCP servers are written in **TypeScript** (`.ts` files).

* **The Problem:** Node.js cannot run `.ts` files directly; it only understands JavaScript (`.js`).
* **The Solution:** You must "Transpile" (convert) the code using the command `npm run build`.
* **Troubleshooting:** If the code has "Type Errors" (strict rules about variable shapes), the build will fail. Using `// @ts-ignore` tells the compiler to bypass specific errors and generate the `.js` file anyway.

---

## 3. The Compiler Configuration (`tsconfig.json`)

This file acts as the "instruction manual" for the conversion process. Key settings often include:

| Setting | Purpose |
| --- | --- |
| **`outDir: "./build"`** | Tells the compiler to put the finished JavaScript files into a folder named `build`. |
| **`exclude: ["tests"]`** | Prevents errors in testing files from blocking the main server build. |
| **`module: "NodeNext"`** | Ensures the server uses modern "Import/Export" logic required by the MCP SDK. |

---

## 4. Environment Variables (`.env`)

MCP servers often require sensitive data or configuration keys (e.g., API Client IDs).

* **`dotenv`:** This is the library that reads your `.env` file.
* **The Logic:** When the server starts, it looks for a `.env` file. These variables are then accessible in the code via `process.env.VARIABLE_NAME`.
* **Critical Check:** Often, specific variables (like `SUPPORT_API`) act as a "master switch." If they are missing, the server may run but fail to expose any tools.

---

## 5. Connecting to Cursor (`mcp.json`)

This is the bridge between your IDE and your code.

* **The Command:** Point this to your Node.js executable (e.g., `/opt/homebrew/bin/node`).
* **The Args:** Point this to the **compiled** JavaScript file (e.g., `build/index.js`), **not** the original TypeScript source code.
* **The Environment:** Use the `env` block or `envFile` path to ensure Cursor passes your API keys into the Node process correctly.

---

## 🛠 Summary Checklist for Your Next NPM Server

1. **Clone & Install:** `git clone <repo>` then `npm install`.
2. **Configure:** Create and populate the `.env` file.
3. **Check the Config:** Review `tsconfig.json` to identify the `outDir` (usually `build` or `dist`).
4. **Build:** Run `npm run build`.
5. **Locate Entry Point:** Find the main `.js` file (usually `index.js` or `server.js` inside the build folder).
6. **Add to Cursor:** Use the absolute path to `node` and your compiled script.

---
