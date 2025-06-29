import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFileList, loadFileData } from '../redux/slices/excelSlice';

const FileList = () => {
  const dispatch = useDispatch();
  const { fileList, loading, error } = useSelector(state => state.excel);

  useEffect(() => {
    dispatch(fetchFileList());
  }, [dispatch]);

  const handleClick = (fileId) => {
    dispatch(loadFileData(fileId));
  };

  if (loading) 
  return <p>Loading files...</p>;
  if (error)
  return (
    <p className="text-red-600 font-semibold">
      Error: {typeof error === 'string' ? error : error?.msg || 'Unknown error'}
    </p>
  );


  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
      <ul className="space-y-2">
        {fileList.map(file => (
          <li key={file._id}>
            <button
              onClick={() => handleClick(file._id)}
              className="text-blue-600 hover:underline"
            >
              {file.originalname} - {new Date(file.uploadDate).toLocaleString()}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
