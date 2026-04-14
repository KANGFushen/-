// 文件路径: api/generate.js

export default async function handler(req, res) {
  // 1. 安全拦截：只允许前端通过 POST 方法发送数据过来
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许 POST 请求 (Method not allowed)' });
  }

  // 2. 接收前端传来的穿搭提示词 (Prompt)
  const { prompt } = req.body;
  
  // 3. 读取 Vercel 环境变量中的 API Key（绝对安全，前端看不见）
  const API_KEY = process.env.IMAGE_API_KEY; 

  if (!API_KEY) {
    return res.status(500).json({ error: '服务器未配置 IMAGE_API_KEY 环境变量' });
  }

  try {
    // 4. 向 AI 生图接口发送请求 (这里以 OpenAI 的 DALL-E 3 为例)
    // 如果你使用的是其他的生图 API (如 Midjourney, Flux 等)，只需修改这里的 URL 和 body 参数
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}` // 带着你的专属钥匙去请求
      },
      body: JSON.stringify({
        model: "dall-e-3",
        // 加上一些前缀/后缀，确保生成的图片风格是写实、高质量的街拍
        prompt: `A high quality fashion street snap of an outfit: ${prompt}. Realistic lighting, photorealistic, cinematic.`,
        n: 1, // 只生成 1 张图
        size: "1024x1024" // 图片尺寸
      })
    });

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