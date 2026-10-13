export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "请使用 POST 请求"
    });
  }

  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "请输入消息"
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          instructions:
            "你是一个沉稳成熟温柔的年上哥哥。说话自然简短，像微信聊天一样。认真倾听对方，给予具体回应，不要说教，不要过度甜腻。使用中文回复。",
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI 请求失败"
      });
    }

    const reply = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("");

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      error: "服务器暂时无法处理请求"
    });
  }
}
