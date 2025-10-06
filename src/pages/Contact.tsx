import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">联系我们（Contact）</h1>
        <p className="text-gray-700 mb-6">如有任何问题、退款或商务合作，请通过以下方式与我们联系：</p>
        <div className="space-y-3 text-gray-800">
          <p>
            支持邮箱：
            <a className="text-blue-600" href="mailto:a842123094@gmail.com">a842123094@gmail.com</a>
          </p>
          <p>
            联系电话：
            <a className="text-blue-600" href="tel:13068140697">130-6814-0697</a>
          </p>
        </div>
      </div>
    </div>
  );
}

