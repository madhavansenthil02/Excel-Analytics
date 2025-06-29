import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import ChartDisplay from '../components/ChartDisplay';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchFileList } from '../redux/slices/excelSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
    };
    const refreshFiles = () => {
    dispatch(fetchFileList());
    };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center">Dashboard</h2>
        <button
            onClick={handleLogout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Logout
          </button>
      </div>
      <FileUpload refreshFiles={refreshFiles}/>
      <FileList />
      <ChartDisplay />
    </div>
  );
};

export default Dashboard;
