const http = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const cron = require("node-cron");

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      handle(req, res);
    })
    .listen(port, (err) => {
      if (err) throw err;
      console.log(`Server running on http://localhost:${port}`);

      // Schedule task to run every day at 9:00 AM
      cron.schedule("0 9 * * *", async () => {
        console.log("Running daily license expiration check...");
        try {
          // We use fetch to call our own API route.
          // In production, ensuring the full URL is correct is important.
          // For local dev/simple setup, usually localhost works if env is set or we can rely on relative if using internal helper,
          // but fetch needs absolute URL.
          const baseUrl = `http://localhost:${port}`;
          await fetch(`${baseUrl}/api/cron/check-licenses`);
        } catch (e) {
          console.error("Error triggering cron API:", e);
        }
      });
    });
});
