import { Link, Outlet, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationUserBar from "../components/Notification/NotificationUserBar";

export default function AppLayout() {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is home page for special hero treatment
  const isHomePage = location.pathname === "/";

  const accountItems = user
    ? [
        {
          label: "My Bookings",
          icon: "pi pi-calendar",
          url: "/bookings",
        },
        {
          label: "My Profile",
          icon: "pi pi-user-edit",
          url: "/profile",
        },
        {
          label: "Sign Out",
          icon: "pi pi-sign-out",
          command: () => {
            localStorage.removeItem("token");
            dispatch({ type: "LOGOUT" });
            navigate("/signin");
          },
        },
      ]
    : [
        {
          label: "Sign In",
          icon: "pi pi-sign-in",
          url: "/signin",
        },
        {
          label: "Sign Up",
          icon: "pi pi-user-plus",
          url: "/signup",
        },
      ];

  const items = [
    {
      label: "Home",
      icon: "pi pi-home",
      url: "/",
    },
    {
      label: "Tours",
      icon: "pi pi-globe",
      url: "/tours",
    },
    {
      label: "About",
      icon: "pi pi-info-circle",
      url: "/about",
    },
    {
      label: user ? user.name : "Account",
      icon: user ? "pi pi-user" : "pi pi-user",
      items: accountItems,
    },
    {
      label: user?.role === "admin" ? "Admin" : null,
      icon: user?.role === "admin" ? "pi pi-lock" : null,
      url: user?.role === "admin" ? "/admin" : null,
    },
  ];

  const start = (
    <Link to="/" className="flex items-center gap-2">
      <span className="text-black text-2xl">✈️</span>
      <span className="text-shadow-red-500 text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">
        TravelXplorer
      </span>
    </Link>
  );

  const end = (
  <div className="flex items-center gap-4">
    {user && <NotificationUserBar userId={user.id} />}
  </div>
);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with glass morphism effect */}
      <header className="bg-white/10 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-2">
          <Menubar
            model={items}
            start={start}
            end={end}
            className="border-none bg-transparent"
            pt={{
              root: { className: "gap-4" },
              menuitem: {
                className:
                  "hover:bg-white/20 rounded-md transition-all duration-200 px-3 py-2 text-white",
              },
              icon: { className: "mr-2 text-white" },
              submenu: {
                className: "bg-white/90 text-gray-800 shadow-lg rounded-md py-2 backdrop-blur-md",
              },
              submenuItem: {
                className:
                  "hover:bg-gray-100 px-4 py-2 rounded-none transition-colors duration-200",
              },
            }}
          />
        </div>
      </header>

      {/* Hero section (only on home page) */}
      {isHomePage && (
        <section className="relative w-full h-[100vh] min-h-[500px] bg-gradient-to-r from-sky-600 to-emerald-500 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1920')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-900/80 to-transparent"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Discover Your Next Adventure
              </h1>
              <p className="text-xl text-white/90 mb-8 drop-shadow-md">
                Explore breathtaking destinations with our curated travel experiences. 
                Book your dream vacation today!
              </p>
              <Link 
                to="/tours" 
                className="bg-amber-400 hover:bg-amber-500 text-sky-900 font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore Tours
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </section>
      )}

      {/* Main content with subtle animation */}
      <main className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 ${isHomePage ? 'pt-16' : 'pt-8'}`}>
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
          <Outlet />
        </div>
      </main>

      {/* Footer with improved design */}
      <footer className="bg-gradient-to-r from-sky-800 to-emerald-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✈️</span>
                <span className="text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">
                  TravelXplorer
                </span>
              </Link>
              <p className="text-white/80 text-sm">
                Making travel dreams come true since 2023.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><Link to="/tours" className="text-white/80 hover:text-white transition-colors">Tours</Link></li>
                <li><Link to="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-white/80 hover:text-white transition-colors">Travel Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-white/80 hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="text-white/80 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/support" className="text-white/80 hover:text-white transition-colors">Customer Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-white/80 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="text-white/80 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-6 text-center">
            <p className="text-sm text-white/70">
              © {new Date().getFullYear()} TravelXplorer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add this to your global CSS file
