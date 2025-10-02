import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const Compress = () => {
  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto compress
    await compressImage(file);
  };

  const compressImage = async (file: File) => {
    setLoading(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: quality / 100
      };

      const compressedFile = await imageCompression(file, options);
      setCompressedSize(compressedFile.size);

      const reader = new FileReader();
      reader.onload = (e) => {
        setCompressedImage(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('压缩失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const downloadImage = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = 'compressed-image.jpg';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <span>←</span>
          返回首页
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">图片压缩</h1>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              压缩质量: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!originalImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-blue-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <span className="text-6xl">📤</span>
              <p className="text-xl text-gray-600">点击或拖拽上传图片</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">原图</h3>
                <img src={originalImage} alt="原图" className="w-full rounded-lg shadow-md" />
                <p className="mt-2 text-gray-600">大小: {formatSize(originalSize)}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">压缩后</h3>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : compressedImage ? (
                  <>
                    <img src={compressedImage} alt="压缩后" className="w-full rounded-lg shadow-md" />
                    <p className="mt-2 text-gray-600">
                      大小: {formatSize(compressedSize)}
                      <span className="text-green-600 ml-2">
                        (减少 {((1 - compressedSize / originalSize) * 100).toFixed(1)}%)
                      </span>
                    </p>
                    <button
                      onClick={downloadImage}
                      className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
                setCompressedImage(null);
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

export default Compress;
