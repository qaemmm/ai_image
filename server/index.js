import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getProductId } from './creem-products.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用绝对路径加载 .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

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
    const { planId, interval, userId, userEmail } = req.body;

    if (!planId || !interval) {
      return res.status(400).json({ error: 'Missing planId or interval' });
    }

    // Get real product ID from configuration
    const productId = getProductId(planId, interval);

    // Build the request payload according to Creem API documentation
    // Reference: https://docs.creem.io/api-reference/endpoint/create-checkout
    const checkoutPayload = {
      product_id: productId,
      units: 1, // Required field: number of units for the product
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        interval: interval
      }
    };

    // Add customer info if email is provided (optional but recommended)
    if (userEmail) {
      checkoutPayload.customer = {
        email: userEmail
      };
    }

    console.log('=== Creem Checkout Request ===');
    console.log(`Plan: ${planId} ${interval}`);
    console.log(`Product ID: ${productId}`);
    console.log('Payload:', JSON.stringify(checkoutPayload, null, 2));
    console.log('API Key present:', !!process.env.CREEM_API_KEY);
    if (process.env.CREEM_API_KEY) {
      const keyPreview = process.env.CREEM_API_KEY.substring(0, 6) + '...' + process.env.CREEM_API_KEY.slice(-4);
      console.log('API Key preview:', keyPreview);
    }

    const response = await axios.post(
      'https://api.creem.io/v1/checkouts', // Fixed: correct endpoint is /v1/checkouts (not /v1/checkout/sessions)
      checkoutPayload,
      {
        headers: {
          'x-api-key': process.env.CREEM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Checkout session created successfully');
    console.log('Session ID:', response.data.id);
    console.log('Checkout URL:', response.data.checkout_url);

    res.json({
      success: true,
      checkoutUrl: response.data.checkout_url, // Fixed: response field is checkout_url (not url)
      sessionId: response.data.id
    });
  } catch (error) {
    console.error('❌ Creem Checkout Error');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Headers:', error.response?.headers);

    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.response?.data || error.message,
      statusCode: error.response?.status
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

// ========================================
// 🧪 TEST MODE ENDPOINTS (Development Only)
// ========================================

// 9. Test: Add Credits and Subscription (without payment)
app.post('/api/test/grant-subscription', async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing userId or planId' });
    }

    // Credit amounts for each plan
    const creditAmounts = { basic: 150, pro: 400, max: 1000 };
    const credits = creditAmounts[planId] || 0;

    // Check if user already has credits
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCredits) {
      // Update existing credits
      await supabase
        .from('user_credits')
        .update({
          credits: existingCredits.credits + credits,
          total_earned: existingCredits.total_earned + credits
        })
        .eq('user_id', userId);
    } else {
      // Create new credit record
      await supabase.from('user_credits').insert({
        user_id: userId,
        credits: credits,
        total_earned: credits,
        total_spent: 0
      });
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      description: `[TEST] Granted ${planId} plan subscription`
    });

    // Create or update subscription record
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

    await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      subscription_id: `test_sub_${Date.now()}`,
      product_id: `test_${planId}`,
      plan_name: planId,
      interval: 'month',
      status: 'active',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString()
    });

    res.json({
      success: true,
      message: `Successfully granted ${planId} plan with ${credits} credits`,
      credits: credits
    });
  } catch (error) {
    console.error('Test Grant Error:', error);
    res.status(500).json({ error: 'Failed to grant subscription' });
  }
});

// 10. Test: Get User Credits Info
app.get('/api/test/user-credits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      credits: credits || { credits: 0, total_earned: 0, total_spent: 0 },
      subscription: subscription || null,
      recentTransactions: transactions || []
    });
  } catch (error) {
    console.error('Get User Credits Error:', error);
    res.status(500).json({ error: 'Failed to fetch user credits' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`� .env.local path: ${join(__dirname, '..', '.env.local')}`);
  console.log(`�🔑 Remove.bg API Key: ${process.env.REMOVE_BG_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 ARK API Key: ${process.env.ARK_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔑 Creem API Key: ${process.env.CREEM_API_KEY ? '✓ Loaded' : '✗ Missing'}`);

  // 显示 Creem API Key 的前几个字符用于调试
  if (process.env.CREEM_API_KEY) {
    const keyPreview = process.env.CREEM_API_KEY.substring(0, 20) + '...';
    console.log(`   → Key preview: ${keyPreview}`);
    console.log(`   → Key length: ${process.env.CREEM_API_KEY.length} characters`);
  }

  console.log(`🔑 Creem Webhook Secret: ${process.env.CREEM_WEBHOOK_SECRET ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`\n🧪 TEST MODE: Use POST /api/test/grant-subscription to add credits without payment`);
});
