const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = JSON.stringify(req.body);

  return new Promise((resolve) => {
    const options = {
      hostname: "rpc.testnet.arc.network",
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        try {
          resolve(res.status(200).json(JSON.parse(data)));
        } catch (e) {
          resolve(res.status(502).json({ error: "Invalid response from RPC" }));
        }
      });
    });

    request.on("error", (err) => {
      resolve(res.status(502).json({ error: err.message }));
    });

    request.write(body);
    request.end();
  });
};
