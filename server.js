// server.js
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ----------------- PASSWORD → HASH -----------------
app.post("/api/hash", (req, res) => {
  const { text, algorithm } = req.body;

  if (!text || !algorithm) {
    return res.status(400).json({ error: "text and algorithm are required" });
  }

  try {
    const hash = crypto.createHash(algorithm).update(text).digest("hex");
    res.json({ hash });
  } catch (err) {
    res.status(400).json({ error: "Unsupported algorithm" });
  }
});

// ----------------- AES ENCRYPT / DECRYPT -----------------
function deriveKey(password) {
  // 32-byte key from password
  return crypto.createHash("sha256").update(password).digest();
}

function encryptAES(text, password) {
  const key = deriveKey(password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted; // iv:cipher
}

function decryptAES(cipherText, password) {
  const key = deriveKey(password);
  const [ivB64, dataB64] = cipherText.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(dataB64, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.post("/api/encrypt", (req, res) => {
  const { text, password } = req.body;
  if (!text || !password) {
    return res.status(400).json({ error: "text and password are required" });
  }
  try {
    const cipherText = encryptAES(text, password);
    res.json({ cipherText });
  } catch (err) {
    res.status(500).json({ error: "Encryption failed" });
  }
});

app.post("/api/decrypt", (req, res) => {
  const { cipherText, password } = req.body;
  if (!cipherText || !password) {
    return res.status(400).json({ error: "cipherText and password are required" });
  }
  try {
    const text = decryptAES(cipherText, password);
    res.json({ text });
  } catch (err) {
    res.status(400).json({ error: "Decryption failed (wrong password or data)" });
  }
});

// ----------------- PASSWORD GENERATOR -----------------
function getCharset(key) {
  const sets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numeric: "0123456789",
    alphanumeric: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    all: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?/{}[]|",
  };
  return sets[key] || sets.alphanumeric;
}

function randomPassword(len, charset) {
  let p = "";
  for (let i = 0; i < len; i++) {
    p += charset[Math.floor(Math.random() * charset.length)];
  }
  return p;
}

app.get("/api/password/generate", (req, res) => {
  const length = Math.max(4, Math.min(64, parseInt(req.query.length || "12", 10)));
  const charsetKey = req.query.charset || "alphanumeric";
  const charset = getCharset(charsetKey);
  const password = randomPassword(length, charset);
  res.json({ password });
});

// ----------------- RAINBOW TABLE (simple demo) -----------------
let rainbowTable = [];

function toyHash(text) {
  // NOT real crypto, just for demo visual
  let h1 = 0x811c9dc5,
    h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 ^= c;
    h1 = (h1 * 0x01000193) >>> 0;
    h2 = (h2 + c * 31 + i) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 16; i++) {
    const v = (i % 2 === 0 ? h1 : h2) + i * 0x9e3779b9;
    out += (v >>> 0).toString(16).padStart(8, "0");
  }
  return out.slice(0, 64);
}

function reduceHash(hash, length, charset) {
  let pwd = "";
  for (let i = 0; i < length; i++) {
    const num = parseInt(hash.substr(i * 2, 2), 16) || 0;
    pwd += charset[num % charset.length];
  }
  return pwd;
}

app.post("/api/rainbow/generate", (req, res) => {
  const { chainLength, numChains, passwordLength, charsetKey } = req.body;

  const cl = Math.max(3, Math.min(200, Number(chainLength) || 5));
  const nc = Math.max(1, Math.min(500, Number(numChains) || 20));
  const pl = Math.max(3, Math.min(10, Number(passwordLength) || 4));
  const charset = getCharset(charsetKey || "lowercase");

  rainbowTable = [];

  for (let i = 0; i < nc; i++) {
    const steps = [];
    let pwd = randomPassword(pl, charset);
    const startPassword = pwd;
    steps.push({ type: "password", value: pwd });

    for (let step = 0; step < cl; step++) {
      const h = toyHash(pwd);
      steps.push({ type: "hash", value: h });
      pwd = reduceHash(h, pl, charset);
      if (step !== cl - 1) {
        steps.push({ type: "password", value: pwd });
      }
    }

    const endHash = toyHash(pwd);
    steps.push({ type: "hash", value: endHash });

    rainbowTable.push({
      id: i,
      startPassword,
      endHash,
      steps,
    });
  }

  // send only summary + steps
  res.json({ chains: rainbowTable });
});

app.post("/api/rainbow/lookup", (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: "hash is required" });
  if (!rainbowTable.length) return res.json({ found: false, message: "No table generated yet." });

  for (const chain of rainbowTable) {
    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];
      if (step.type === "hash" && step.value === hash) {
        let password = null;
        for (let j = i - 1; j >= 0; j--) {
          if (chain.steps[j].type === "password") {
            password = chain.steps[j].value;
            break;
          }
        }
        return res.json({
          found: true,
          chainId: chain.id,
          password,
        });
      }
    }
  }

  res.json({ found: false, message: "Hash not found in current rainbow table." });
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
