import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import "./AdminLayout.css"; // 👈 Add this line


const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 w-full">
        <Navbar />
        <div className="p-6 bg-gray-50 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
