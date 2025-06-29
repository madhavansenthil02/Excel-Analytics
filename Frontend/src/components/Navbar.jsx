import { useSelector } from 'react-redux';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-blue-600 text-white px-4 h-20 py-2 flex justify-center items-center">
      <h1 className="text-4xl font-bold ">Excel Analytics</h1>
      <div className="space-x-4">
      {user && (
        <div className="text-sm bg-gray-100 p-4 rounded mb-4 text-black">
          Logged in as: <span className="font-medium">{user.email}</span>
        </div>
      )}
      </div>
    </nav>
  );
};

export default Navbar;
