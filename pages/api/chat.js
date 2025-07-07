export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, image } = req.body;

  try {
    // 📸 If image exists → process via Hugging Face ViT
    if (image) {
      const hfRes = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: image }),
      });

      const hfData = await hfRes.json();

      if (hfData && Array.isArray(hfData) && hfData[0]?.label) {
        return res.status(200).json({ reply: `I see: ${hfData[0].label} `});
      } else {
        return res.status(200).json({ reply: "Hmm, I couldn't understand the image." });
      }
    }

    // 💬 If text exists → respond via Mistral (OpenRouter)
    if (message) {
      const mistralRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message },
          ],
        }),
      });

      const mistralData = await mistralRes.json();
      const reply = mistralData?.choices?.[0]?.message?.content;
      return res.status(200).json({ reply: reply || "No reply from model." });
    }

    return res.status(400).json({ reply: "No message or image provided." });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Something went wrong.", details: err.message });
  }
}