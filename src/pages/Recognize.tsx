import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';

const Recognize = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await recognizeText(file);
  };

  const recognizeText = async (file: File) => {
    setLoading(true);
    setText('');
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      setText(result.data.text);
    } catch (error) {
      console.error('识别失败:', error);
      alert('识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
        >
          <span>←</span>
          返回首页
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">图片识别</h1>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-green-300 rounded-xl p-16 text-center cursor-pointer hover:border-green-500 transition-colors"
            >
              <span className="text-6xl">📤</span>
              <p className="text-xl text-gray-600">点击或拖拽上传图片</p>
              <p className="text-sm text-gray-500 mt-2">支持中英文识别</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">原图</h3>
                <img src={image} alt="原图" className="w-full rounded-lg shadow-md" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">识别结果</h3>
                {loading ? (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">识别中... {progress}%</p>
                    </div>
                  </div>
                ) : text ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800">{text}</pre>
                    </div>
                    <button
                      onClick={copyText}
                      className="mt-4 flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <span>📋</span>
                      复制文本
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center text-gray-400">
                    等待识别...
                  </div>
                )}
              </div>
            </div>
          )}

          {image && (
            <button
              onClick={() => {
                setImage(null);
                setText('');
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

export default Recognize;
