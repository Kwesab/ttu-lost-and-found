import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-yellow-400 rounded-lg opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd3e5efc7369e4f42922463a207b8e5f8%2Fed98ff7e99bc4e99a7c401332ea6be22?format=webp&width=800"
                alt="Takoradi Technical University Logo"
                className="h-14 w-14 object-contain relative group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">Lost & Found</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">Takoradi Technical University</span>
            </div>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 font-medium transition-all duration-300 relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/lost" className="text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 font-medium transition-all duration-300 relative group">
              Lost Items
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/found" className="text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 font-medium transition-all duration-300 relative group">
              Found Items
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/my-claims" className="text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-green-600 hover:to-teal-600 font-medium transition-all duration-300 relative group">
              My Claims
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-teal-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/admin" className="text-slate-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 font-medium transition-all duration-300 relative group">
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="sm:hidden p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:hidden">
              <div className="flex flex-col gap-6 mt-8">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Home
                </Link>
                <Link 
                  to="/lost" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Lost Items
                </Link>
                <Link 
                  to="/found" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Found Items
                </Link>
                <Link 
                  to="/my-claims" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-green-700 hover:text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  My Claims
                </Link>
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-red-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Admin
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="bg-gradient-to-br from-white to-slate-50 border-t border-slate-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd3e5efc7369e4f42922463a207b8e5f8%2Fed98ff7e99bc4e99a7c401332ea6be22?format=webp&width=800"
                  alt="Takoradi Technical University Logo"
                  className="h-12 w-12 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                />
                <span className="font-bold text-slate-900">Lost & Found</span>
              </div>
              <p className="text-sm text-slate-600 text-center md:text-left">
                Reconnecting TTU community
              </p>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-semibold text-slate-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600 text-center">
                <li><Link to="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link to="/lost" className="hover:text-blue-600 transition-colors">Lost Items</Link></li>
                <li><Link to="/found" className="hover:text-blue-600 transition-colors">Found Items</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <h4 className="font-semibold text-slate-900 mb-3">Get Help</h4>
              <p className="text-sm text-slate-600">Have questions?</p>
              <p className="text-sm text-slate-600">Contact us anytime</p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8">
            <p className="text-center text-slate-600 text-sm">
              &copy; 2024 Takoradi Technical University Lost & Found. Help your community find what matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
