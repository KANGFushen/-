// 文件路径: api/generate.js (Gemini 版)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求' });
  }

  const { prompt } = req.body;
  // 建议将 Vercel 环境变量名改为 GEMINI_API_KEY 保持统一
  const API_KEY = process.env.GEMINI_API_KEY; 

  if (!API_KEY) {
    return res.status(500).json({ error: '未配置 GEMINI_API_KEY' });
  }

  try {
    // 调用 Google 的 Imagen 3 模型 (或当前最新的 imagen-3.0-generate-001)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: `A high-quality fashion street snap of an outfit: ${prompt}. Cinematic lighting, photorealistic.` }]
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    // Google 返回的是 Base64 格式的图片数据
    const base64Image = data.predictions[0].bytesBase64Encoded;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    res.status(200).json({ url: imageUrl });

  } catch (error) {
    res.status(500).json({ error: error.message || '图片生成失败' });
  }
}

    const data = await response.json();
    
    // 如果 AI 返回了错误（比如余额不足、提示词违规等），抛出异常
    if (data.error) {
      throw new Error(data.error.message);
    }

    // 5. 成功拿到图片！把图片的 URL 链接发回给你的前端网页
    res.status(200).json({ url: data.data[0].url });

  } catch (error) {
    // 如果中途出现任何问题，把错误信息传给前端，方便排查
    res.status(500).json({ error: error.message || '图片生成失败，请稍后重试' });
  }
}