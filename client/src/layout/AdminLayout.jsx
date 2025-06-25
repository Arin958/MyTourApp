import { Outlet, useNavigate } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { PanelMenu } from "primereact/panelmenu";
import NotificationBar from "../components/NotificationBar"; // Adjust path as needed

export default function AdminLayout() {
  const navigate = useNavigate();

  const topNavItems = [
    {
      label: "Admin Dashboard",
      icon: "pi pi-home",
      command: () => navigate("/admin"),
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        localStorage.removeItem("user");
        navigate("/signin");
      },
    },
  ];

  const sideNavItems = [
    {
      label: "Dashboard",
      icon: "pi pi-chart-bar",
      command: () => navigate("/admin"),
    },
    {
      label: "Bookings",
      icon: "pi pi-shopping-bag",
      command: () => navigate("/admin/bookings"),
    },
    {
      label: "Tours",
      icon: "pi pi-copy",
      command: () => navigate("/admin/tours"),
    },
    {
      label: "Users",
      icon: "pi pi-users",
      command: () => navigate("/admin/users"),
    },
  ];

  const startContent = (
    <div className="flex items-center gap-4">
      <h2 className="text-xl font-semibold hidden md:block">Admin Panel</h2>
    </div>
  );

  const endContent = (
    <div className="flex items-center gap-4">
      <NotificationBar />
      <div className="flex items-center gap-2">
        <i className="pi pi-user text-gray-600"></i>
        <span className="text-gray-600 hidden sm:inline">Admin User</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow z-10">
        <div className="max-w-7xl mx-auto px-4">
          <Menubar
            model={topNavItems}
            className="bg-white border-none text-gray-800"
            start={startContent}
            end={endContent}
          />
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm p-4 hidden md:block">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Navigation</h2>
          <PanelMenu
            model={sideNavItems}
            className="w-full"
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}