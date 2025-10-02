import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 1. Remove.bg API Proxy
app.post('/api/remove-bg', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

    const formData = new FormData();
    formData.append('image_file_b64', imageBase64.split(',')[1]);
    formData.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });

    // Convert to base64 and send back
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`
    });
  } catch (error) {
    console.error('Remove.bg API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to remove background',
      details: error.response?.data?.errors || error.message
    });
  }
});

// 2. 火山引擎图片识别 API Proxy
app.post('/api/recognize', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: 'ep-20251002143225-lp445',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              },
              {
                type: 'text',
                text: '请详细识别并描述这张图片的内容，包括：1. 图片中的主要物体或人物 2. 场景和背景 3. 颜色和氛围 4. 任何可见的文字'
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      result: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Recognize API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to recognize image',
      details: error.response?.data || error.message
    });
  }
});

// 3. 火山引擎 AI 生图 API Proxy
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: 'ep-20250922151247-nzclw',
        prompt: prompt,
        sequential_image_generation: 'disabled',
        response_format: 'url',
        size: '2K',
        stream: false,
        watermark: true
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      imageUrl: response.data.data[0].url
    });
  } catch (error) {
    console.error('Generate Image API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Remove.bg API Key: ${process.env.REMOVE_BG_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 ARK API Key: ${process.env.ARK_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
});
