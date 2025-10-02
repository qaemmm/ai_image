import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AIGenerate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('请输入图片描述');
      return;
    }

    setLoading(true);
    try {
      // 这里应该调用实际的 AI 生图 API
      // 示例使用占位图片服务
      const response = await fetch(`https://source.unsplash.com/800x600/?${encodeURIComponent(prompt)}`);
      setGeneratedImage(response.url);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-generated.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8"
        >
          <span>←</span>
          返回首页
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">AI 生图</h1>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的图片，例如：一只可爱的橘猫坐在窗台上看风景..."
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={generateImage}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>✨</span>
            {loading ? '生成中...' : '开始生成'}
          </button>

          {loading && (
            <div className="mt-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {generatedImage && !loading && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">生成结果</h3>
              <img
                src={generatedImage}
                alt="AI生成"
                className="w-full rounded-lg shadow-lg"
              />
              <button
                onClick={downloadImage}
                className="mt-4 flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>⬇</span>
                下载图片
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>提示：</strong>当前使用演示 API，实际项目中需要接入真实的 AI 生图服务，如 Stable Diffusion、DALL-E 等。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerate;
