import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const RemoveBg = () => {
  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/remove-bg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '抠图失败');
      }

      setProcessedImage(data.image);
    } catch (error) {
      console.error('抠图失败:', error);
      setError(error instanceof Error ? error.message : '抠图失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'no-background.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8"
        >
          <span>←</span>
          返回首页
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">抠图去背景</h1>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">错误</p>
              <p>{error}</p>
            </div>
          )}

          {!originalImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-purple-300 rounded-xl p-16 text-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              <span className="text-6xl">📤</span>
              <p className="text-xl text-gray-600">点击或拖拽上传图片</p>
              <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG 等格式</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">原图</h3>
                <img src={originalImage} alt="原图" className="w-full rounded-lg shadow-md" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">处理后</h3>
                {loading ? (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Remove.bg API 处理中...</p>
                    </div>
                  </div>
                ) : processedImage ? (
                  <>
                    <div className="bg-gray-100 rounded-lg p-4" style={{
                      backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                    }}>
                      <img src={processedImage} alt="处理后" className="w-full rounded-lg" />
                    </div>
                    <button
                      onClick={downloadImage}
                      className="mt-4 flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <span>⬇</span>
                      下载图片
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {originalImage && (
            <button
              onClick={() => {
                setOriginalImage(null);
                setProcessedImage(null);
                setError(null);
              }}
              className="mt-6 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              重新上传
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBg;
