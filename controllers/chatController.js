const db = require("../config/db");
const axios = require("axios");

exports.chatController = (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY is missing in .env file",
    });
  }

  const msg = message.toLowerCase();

  // -------------------------------
  // STEP 1: BUILD QUERY
  // -------------------------------
  let sql = "SELECT id, title, destination, price, duration FROM tours WHERE 1=1";
  let values = [];

  // ---------- CATEGORY ----------
  if (msg.includes("trek")) {
    sql += " AND category = ?";
    values.push("trekking");
  }

  if (msg.includes("religious")) {
    sql += " AND category = ?";
    values.push("religious");
  }

  if (msg.includes("adventure")) {
    sql += " AND category = ?";
    values.push("adventure");
  }

  if (msg.includes("food")) {
    sql += " AND category = ?";
    values.push("food");
  }

  // ---------- FOOD SUBCATEGORIES ----------
  if (msg.includes("barista") || msg.includes("coffee")) {
    sql += " AND subcategory = ?";
    values.push("barista");
  }

  if (msg.includes("street")) {
    sql += " AND subcategory = ?";
    values.push("street_food");
  }

  if (msg.includes("cooking") || msg.includes("class")) {
    sql += " AND subcategory = ?";
    values.push("cooking_class");
  }

  // ---------- DESTINATION ----------
  if (msg.includes("lumbini")) {
    sql += " AND destination LIKE ?";
    values.push("%Lumbini%");
  }

  if (msg.includes("nagarkot")) {
    sql += " AND destination LIKE ?";
    values.push("%Nagarkot%");
  }

  if (msg.includes("janakpur")) {
    sql += " AND destination LIKE ?";
    values.push("%Janakpur%");
  }

  // ---------- DURATION ----------
  if (msg.includes("2 day")) {
    sql += " AND duration LIKE ?";
    values.push("%2%");
  }

  if (msg.includes("3 day")) {
    sql += " AND duration LIKE ?";
    values.push("%3%");
  }

  // ---------- ORDER ----------
  if (msg.includes("cheap")) {
    sql += " ORDER BY price ASC";
  } else {
    sql += " ORDER BY created_at DESC";
  }

  sql += " LIMIT 5";

  // -------------------------------
  // STEP 2: QUERY DATABASE
  // -------------------------------
  db.query(sql, values, async (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: "DB error" });
    }

    // FALLBACK
    if (results.length === 0) {
      const fallbackSql =
        "SELECT id, title, destination, price, duration FROM tours ORDER BY created_at DESC LIMIT 5";

      db.query(fallbackSql, (err, fallbackResults) => {
        if (err) {
          console.error("DB FALLBACK ERROR:", err);
          return res.status(500).json({ error: "DB error" });
        }

        return res.json({
          reply: "No exact match found. Here are some popular tours:",
          tours: fallbackResults,
        });
      });

      return;
    }

    // -------------------------------
    // FORMAT DATA
    // -------------------------------
    const tourData = results
      .map(
        (t) =>
          `${t.title} in ${t.destination} - Rs ${t.price} (${t.duration})`
      )
      .join("\n");

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a travel assistant. ONLY use the provided tour data.",
            },
            {
              role: "user",
              content: `User asked: ${message}

Available tours:
${tourData}

Answer clearly using ONLY this data.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message.content;

      return res.json({
        reply,
        tours: results,
      });
    } catch (error) {
      console.error("GROQ ERROR:", error.response?.data || error.message);

      return res.status(500).json({
        error: "Chatbot AI service error",
        details: error.response?.data || error.message,
      });
    }
  });
};