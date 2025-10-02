import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = 3001;

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
        model: 'ep-20251002143355-9kspk',
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

// 4. Creem Checkout Session - Create checkout for subscription purchase
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { planId, interval, userId } = req.body;

    if (!planId || !interval) {
      return res.status(400).json({ error: 'Missing planId or interval' });
    }

    // TODO: Map planId and interval to Creem product IDs
    // For now, we'll return a placeholder
    const productId = `prod_${planId}_${interval}`;

    const response = await axios.post(
      'https://api.creem.io/v1/checkout/sessions',
      {
        product_id: productId,
        success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          interval: interval
        }
      },
      {
        headers: {
          'x-api-key': process.env.CREEM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      checkoutUrl: response.data.url,
      sessionId: response.data.id
    });
  } catch (error) {
    console.error('Creem Checkout Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.response?.data || error.message
    });
  }
});

// 5. Creem Webhook Handler - Handle payment events
app.post('/api/webhooks/creem', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-creem-signature'];
    const payload = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = payload;
    console.log('Webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout completed:', event.data);
        // Extract user and plan info from metadata
        const checkoutData = event.data;
        if (checkoutData.metadata) {
          const { user_id, plan_id, interval } = checkoutData.metadata;
          // Get credit amount based on plan
          const creditAmounts = { basic: 150, pro: 400, max: 1000 };
          const credits = creditAmounts[plan_id] || 0;

          // Add credits
          await supabase.from('user_credits').upsert({
            user_id,
            credits: supabase.raw(`credits + ${credits}`),
            total_earned: supabase.raw(`total_earned + ${credits}`)
          });

          // Record transaction
          await supabase.from('credit_transactions').insert({
            user_id,
            amount: credits,
            type: 'purchase',
            description: `Purchased ${plan_id} plan (${interval}ly)`
          });
        }
        break;

      case 'payment.succeeded':
        console.log('Payment succeeded:', event.data);
        // Additional handling if needed
        break;

      case 'subscription.created':
        console.log('Subscription created:', event.data);
        // Create subscription record
        const subData = event.data;
        if (subData.metadata) {
          await supabase.from('user_subscriptions').insert({
            user_id: subData.metadata.user_id,
            subscription_id: subData.id,
            product_id: subData.product_id,
            plan_name: subData.metadata.plan_id,
            interval: subData.metadata.interval,
            status: 'active',
            current_period_start: new Date(subData.current_period_start * 1000),
            current_period_end: new Date(subData.current_period_end * 1000)
          });
        }
        break;

      case 'subscription.canceled':
        console.log('Subscription canceled:', event.data);
        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('subscription_id', event.data.id);
        break;

      case 'subscription.updated':
        console.log('Subscription updated:', event.data);
        // Update subscription details
        const updatedSub = event.data;
        await supabase
          .from('user_subscriptions')
          .update({
            status: updatedSub.status,
            current_period_start: new Date(updatedSub.current_period_start * 1000),
            current_period_end: new Date(updatedSub.current_period_end * 1000)
          })
          .eq('subscription_id', updatedSub.id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// 6. Get Products - Return available pricing plans
app.get('/api/products', async (req, res) => {
  try {
    // TODO: Fetch from Creem API or return static configuration
    // For now, return the pricing configuration
    const products = [
      {
        id: 'basic',
        name: 'Basic',
        monthlyProductId: 'prod_basic_month',
        yearlyProductId: 'prod_basic_year',
        monthlyPrice: 12,
        yearlyPrice: 115,
        credits: 150
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyProductId: 'prod_pro_month',
        yearlyProductId: 'prod_pro_year',
        monthlyPrice: 29,
        yearlyPrice: 278,
        credits: 400
      },
      {
        id: 'max',
        name: 'Max',
        monthlyProductId: 'prod_max_month',
        yearlyProductId: 'prod_max_year',
        monthlyPrice: 59,
        yearlyPrice: 566,
        credits: 1000
      }
    ];

    res.json({ success: true, products });
  } catch (error) {
    console.error('Products Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 7. Check and Deduct Credits - Verify user has enough credits and deduct them
app.post('/api/credits/deduct', async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || !amount || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's current credits
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (creditError || !creditData) {
      return res.status(404).json({ error: 'User credits not found' });
    }

    // Check if user has enough credits
    if (creditData.credits < amount) {
      return res.status(403).json({
        error: 'Insufficient credits',
        available: creditData.credits,
        required: amount
      });
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits: creditData.credits - amount,
        total_spent: supabase.raw(`total_spent + ${amount}`)
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -amount,
      type,
      description: description || `Used ${amount} credits for ${type}`
    });

    res.json({
      success: true,
      remaining: creditData.credits - amount
    });
  } catch (error) {
    console.error('Credit Deduction Error:', error);
    res.status(500).json({ error: 'Failed to deduct credits' });
  }
});

// 8. Add Credits - Add credits to user account (used by webhooks)
app.post('/api/credits/add', async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user has a credit record
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCredits) {
      // Update existing record
      await supabase
        .from('user_credits')
        .update({
          credits: existingCredits.credits + amount,
          total_earned: existingCredits.total_earned + amount
        })
        .eq('user_id', userId);
    } else {
      // Create new record
      await supabase.from('user_credits').insert({
        user_id: userId,
        credits: amount,
        total_earned: amount,
        total_spent: 0
      });
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: amount,
      type: type || 'purchase',
      description: description || `Added ${amount} credits`
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Add Credits Error:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Remove.bg API Key: ${process.env.REMOVE_BG_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 ARK API Key: ${process.env.ARK_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 Creem API Key: ${process.env.CREEM_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 Creem Webhook Secret: ${process.env.CREEM_WEBHOOK_SECRET ? '✓ Loaded' : '✗ Missing'}`);
});
