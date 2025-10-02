import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AIGenerate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('生成失败:', error);
      setError(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    }
  };

  // 示例提示词
  const examplePrompts = [
    '一只可爱的橘猫坐在窗台上看风景，温暖的阳光',
    '星空下的古老城堡，月光照耀，神秘氛围',
    '未来科技感的城市，霓虹灯光，赛博朋克风格',
    '宁静的湖边小屋，秋天落叶，温馨画面'
  ];

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
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">错误</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的图片，例如：一只可爱的橘猫坐在窗台上看风景，温暖的阳光..."
              className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  generateImage();
                }
              }}
            />
            <p className="mt-1 text-sm text-gray-500">提示：Ctrl + Enter 快速生成</p>
          </div>

          {/* 示例提示词 */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">示例提示词：</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                >
                  {example.length > 30 ? example.substring(0, 30) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateImage}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>✨</span>
            {loading ? '火山引擎 AI 生成中...' : '开始生成'}
          </button>

          {loading && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">请耐心等待，AI 正在创作中...</p>
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
              <div className="mt-4 flex gap-4">
                <button
                  onClick={downloadImage}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <span>⬇</span>
                  下载图片
                </button>
                <button
                  onClick={() => {
                    setGeneratedImage(null);
                    setPrompt('');
                  }}
                  className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  重新生成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerate;
