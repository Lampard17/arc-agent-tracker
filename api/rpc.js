module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RPCS = [
    "https://arc-testnet.drpc.org",
    "https://5042002.rpc.thirdweb.com",
    "https://rpc.testnet.arc.network",
  ];

  for (const url of RPCS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (data.error && data.error.code === -32600) continue;
      return res.status(200).json(data);
    } catch (e) {
      continue;
    }
  }

  return res.status(502).json({ error: "All RPC endpoints failed" });
};
