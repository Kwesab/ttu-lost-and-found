import { Link } from "react-router-dom";
import { Search, Plus, Eye, Heart, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-yellow-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd3e5efc7369e4f42922463a207b8e5f8%2Fed98ff7e99bc4e99a7c401332ea6be22?format=webp&width=800"
                alt="Takoradi Technical University Logo"
                className="h-40 w-40 mx-auto mb-4 object-contain relative z-10 hover:scale-125 transition-transform duration-300 drop-shadow-lg"
              />
            </div>
            <div className="mb-6 inline-block">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
                <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  🎓 Takoradi Technical University
                </p>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 leading-tight">
              Reunite with Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Belongings</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A smart community platform for students to report lost items, discover found belongings, and help reunite belongings with their rightful owners.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mb-12 animate-fade-in-delayed-1">
            <div className="bg-white/60 backdrop-blur-md rounded-lg p-4 border border-white/40 text-center hover:bg-white/80 transition-all">
              <div className="text-2xl font-bold text-blue-600">100+</div>
              <div className="text-xs text-slate-600">Items Recovered</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-lg p-4 border border-white/40 text-center hover:bg-white/80 transition-all">
              <div className="text-2xl font-bold text-purple-600">2K+</div>
              <div className="text-xs text-slate-600">Community Members</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-lg p-4 border border-white/40 text-center hover:bg-white/80 transition-all">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-xs text-slate-600">Success Rate</div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-fade-in-delayed-2">
            {/* Report Lost Item */}
            <Link
              to="/report?type=lost"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-red-700 p-1 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-3xl p-8 text-white group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-400/40 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-300/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-5 group-hover:scale-125 group-hover:bg-white/30 transition-all duration-500 backdrop-blur-sm">
                    <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">Report Lost Item</h2>
                  <p className="text-red-50 text-base mb-5 leading-relaxed font-medium">
                    Help the community find what matters to you
                  </p>
                  <div className="flex items-center gap-2 text-red-100 group-hover:gap-4 transition-all">
                    <span className="font-bold text-lg">Post Now</span>
                    <span className="inline-block group-hover:translate-x-2 transition-transform duration-300 text-2xl">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Report Found Item */}
            <Link
              to="/report?type=found"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-500 to-green-700 p-1 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-green-700 rounded-3xl p-8 text-white group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-48 h-48 bg-green-400/40 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-300/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-5 group-hover:scale-125 group-hover:bg-white/30 transition-all duration-500 backdrop-blur-sm">
                    <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">Report Found Item</h2>
                  <p className="text-green-50 text-base mb-5 leading-relaxed font-medium">
                    Help reunite belongings with their owners
                  </p>
                  <div className="flex items-center gap-2 text-green-100 group-hover:gap-4 transition-all">
                    <span className="font-bold text-lg">Share Now</span>
                    <span className="inline-block group-hover:translate-x-2 transition-transform duration-300 text-2xl">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Browse Lost Items */}
            <Link
              to="/lost"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-1 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-3xl p-8 text-white group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/40 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-5 group-hover:scale-125 group-hover:bg-white/30 transition-all duration-500 backdrop-blur-sm">
                    <Search size={40} className="group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">Browse Lost Items</h2>
                  <p className="text-blue-50 text-base mb-5 leading-relaxed font-medium">
                    Search for items reported missing on campus
                  </p>
                  <div className="flex items-center gap-2 text-blue-100 group-hover:gap-4 transition-all">
                    <span className="font-bold text-lg">Explore</span>
                    <span className="inline-block group-hover:translate-x-2 transition-transform duration-300 text-2xl">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Browse Found Items */}
            <Link
              to="/found"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 p-1 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 rounded-3xl p-8 text-white group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400/40 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 mb-5 group-hover:scale-125 group-hover:bg-white/30 transition-all duration-500 backdrop-blur-sm">
                    <Eye size={40} className="group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">Browse Found Items</h2>
                  <p className="text-purple-50 text-base mb-5 leading-relaxed font-medium">
                    Check items found and waiting for their owners
                  </p>
                  <div className="flex items-center gap-2 text-purple-100 group-hover:gap-4 transition-all">
                    <span className="font-bold text-lg">Discover</span>
                    <span className="inline-block group-hover:translate-x-2 transition-transform duration-300 text-2xl">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* How It Works Section */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-10 mb-12 animate-fade-in-delayed-3">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">How It Works</h3>
              <p className="text-slate-600">Simple steps to reunite lost items with their owners</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-white font-bold text-2xl">1</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Report or Search</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Post a lost or found item with detailed information, or browse existing listings to find what you're looking for
                  </p>
                </div>
              </div>
              <div className="group relative p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-white font-bold text-2xl">2</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Verify & Claim</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Answer verification questions to prove ownership and claim the item you're looking for
                  </p>
                </div>
              </div>
              <div className="group relative p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-white font-bold text-2xl">3</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-lg">Reconnect</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    The owner reviews your claim and arranges to return your belongings safely
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 p-8 animate-fade-in-delayed-3">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Why Choose Our Platform?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500 text-white">
                    <Zap size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Fast & Easy</h4>
                  <p className="text-slate-600 text-sm">Report items in seconds with our intuitive interface</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-500 text-white">
                    <Heart size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Community Driven</h4>
                  <p className="text-slate-600 text-sm">Join thousands of students helping each other</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500 text-white">
                    <Search size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Smart Search</h4>
                  <p className="text-slate-600 text-sm">Find items quickly with advanced search filters</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-pink-500 text-white">
                    <Eye size={20} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Secure Claims</h4>
                  <p className="text-slate-600 text-sm">Verification questions ensure only real owners claim items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
