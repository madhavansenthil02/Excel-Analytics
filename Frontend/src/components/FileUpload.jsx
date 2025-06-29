import { useState } from 'react';
import API from '../api/api';

const FileUpload = ({refreshFiles}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploadedFile(null);
    if (!file) {
      setMessage('Please select a file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading with token:', token); 
      const res = await API.post('/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('✅ File uploaded successfully');

      if (refreshFiles) refreshFiles();

      // Fetch and preview the uploaded file
      const fileId = res.data.file._id;
      const fileRes = await API.get(`/excel/file/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUploadedFile(fileRes.data);
    } catch (err) {
      console.error('Upload Error:', err);
      setMessage('❌ Upload failed: ' + (err.response?.data?.msg || 'Server error'));
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload Excel
        </button>
      </form>

      {message && (
        <p className="mt-4 font-semibold text-gray-800">{message}</p>
      )}

      {uploadedFile && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-bold mb-2">
            Preview: {uploadedFile.filename}
          </h3>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                {uploadedFile.headers.map((header, idx) => (
                  <th key={idx} className="border px-3 py-2 bg-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploadedFile.data.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {uploadedFile.headers.map((header, colIndex) => (
                    <td key={colIndex} className="border px-3 py-1">
                      {row[header] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm mt-2 text-gray-600">
            Showing first 5 rows of uploaded file.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
