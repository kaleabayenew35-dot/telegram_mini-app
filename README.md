# Telegram Mini App

This folder contains the Telegram Games lobby. It loads the authenticated user's games and balance from the system backend and opens each configured game URL.

## Local preview

Serve this folder from an HTTP server. ES modules and Telegram Web Apps do not work correctly from `file://` URLs.

```bash
npx vite --host 0.0.0.0 --port 5173
```

Then open `http://localhost:5173` in a browser. Full Telegram authentication requires opening the deployed URL from Telegram.

## Deployment

Deploy this folder as a static site and configure its public HTTPS URL in BotFather with `/setmenubutton` or use it in a Telegram `web_app` button.

Add the deployed Mini App origin to `ALLOWED_ORIGINS` in `system_backend/render.yaml` and the live Render environment. The current app uses `/api/users/auto-login` with Telegram's user ID because that endpoint already exists. For stronger production security, add server-side validation of `Telegram.WebApp.initData` before relying on that identity.

The backend URL can be overridden by defining `window.__SYSTEM_BACKEND_URL__` before loading `app.js`.
