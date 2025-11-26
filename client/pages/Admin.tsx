import { useEffect, useState } from "react";
import { Item, Claim } from "@shared/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Trash2, CheckCircle, Eye, MessageSquare, X as XIcon } from "lucide-react";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [adminPassword] = useState("TTAdmin2024");
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<"items" | "claims">("items");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setAuthenticated(true);
      fetchItems();
      fetchClaims();
      setPassword("");
    } else {
      setError("Invalid password");
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (err) {
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await fetch("/api/claims");
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims);
      }
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const handleMarkReturned = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "returned" })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(items.map(item => item.id === id ? updatedItem.item : item));
      }
    } catch (err) {
      setError("Failed to update item");
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    if (!confirm("Approve this claim? The claimant and item owner will be connected.")) return;

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });

      if (response.ok) {
        fetchClaims();
        alert("Claim approved! Both parties can now contact each other.");
      }
    } catch (err) {
      setError("Failed to approve claim");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!confirm("Reject this claim?")) return;

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });

      if (response.ok) {
        fetchClaims();
      }
    } catch (err) {
      setError("Failed to reject claim");
    }
  };

  const getItemById = (itemId: string) => items.find(item => item.id === itemId);

  if (!authenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 flex items-center justify-center py-12">
          <div className="w-full max-w-md px-4 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-8 shadow-2xl">
              <div className="mb-8">
                <div className="inline-block px-3 py-1 bg-purple-100 border border-purple-200 rounded-full mb-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">🔐 Admin Access</p>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Portal</h1>
                <p className="text-slate-600">Manage lost and found items on campus</p>
              </div>

              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900">Admin Password</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <Input
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="relative w-full bg-slate-50 border border-slate-200 group-hover:border-purple-300 focus:border-purple-500 transition-all duration-300"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🔓 Unlock Admin Panel
                </Button>
              </form>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 font-mono text-center">
                  Demo password: <span className="font-bold text-slate-900">TTAdmin2024</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <div className="inline-block mb-3 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">📊 Dashboard</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Manage all lost and found items campus-wide</p>
            </div>
            <Button
              onClick={() => setAuthenticated(false)}
              variant="outline"
              className="px-6 py-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
            >
              🔓 Logout
            </Button>
          </div>

          {error && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 animate-fade-in">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-delayed-1">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-600/30 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
              <div className="relative z-10">
                <p className="text-slate-300 text-sm font-medium">Total Items</p>
                <p className="text-4xl font-bold mt-2">{items.length}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/30 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
              <div className="relative z-10">
                <p className="text-red-100 text-sm font-medium">Lost Items</p>
                <p className="text-4xl font-bold mt-2">{items.filter(i => i.type === "lost").length}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/30 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
              <div className="relative z-10">
                <p className="text-green-100 text-sm font-medium">Found Items</p>
                <p className="text-4xl font-bold mt-2">{items.filter(i => i.type === "found").length}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/30 rounded-full blur-3xl group-hover:blur-2xl transition-all"></div>
              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium">Pending Claims</p>
                <p className="text-4xl font-bold mt-2">{claims.filter(c => c.status === "pending").length}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 animate-fade-in-delayed-2">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "items"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              📦 Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab("claims")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 relative ${
                activeTab === "claims"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              💬 Claims ({claims.length})
              {claims.filter(c => c.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {claims.filter(c => c.status === "pending").length}
                </span>
              )}
            </button>
          </div>

          {/* Items Table */}
          {activeTab === "items" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden animate-fade-in-delayed-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-slate-600">Loading items...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Item</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Location</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Contact</th>
                      <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-300 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded opacity-0 group-hover:opacity-20 blur-sm transition-opacity"></div>
                              {item.imageUrls && item.imageUrls.length > 1 ? (
                                <div className="relative">
                                  <img
                                    src={item.imageUrls[0]}
                                    alt={item.title}
                                    className="w-10 h-10 rounded object-cover relative group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                                    +{item.imageUrls.length - 1}
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-10 h-10 rounded object-cover relative group-hover:scale-110 transition-transform duration-300"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.description.substring(0, 30)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            item.type === "lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.type === "lost" ? "❌ Lost" : "✓ Found"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{item.location}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.status === "active" ? "🟢 Active" : "⚪ " + item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <a
                            href={`mailto:${item.contactEmail}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            {item.contactEmail}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMarkReturned(item.id)}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                            >
                              <CheckCircle size={14} />
                              Mark Returned
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                  <Eye className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold">No items found</p>
              </div>
            )}
          </div>
          )}

          {/* Claims Section */}
          {activeTab === "claims" && (
            <div className="space-y-4">
              {/* Admin Guidance */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-bold text-purple-900 mb-2">📋 Claims Review Guide</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <p className="text-slate-700"><strong>Approve</strong> if verification answers are correct</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-600">✗</span>
                    <p className="text-slate-700"><strong>Reject</strong> if answers don't match or seem suspicious</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600">📧</span>
                    <p className="text-slate-700">When approved, <strong>both emails are revealed</strong> for connection</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-orange-600">⚠️</span>
                    <p className="text-slate-700">Contact item owner if you need clarification</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden animate-fade-in-delayed-2">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-slate-600">Loading claims...</p>
                  </div>
                ) : claims.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {claims.map((claim) => {
                    const item = getItemById(claim.itemId);
                    return (
                      <div key={claim.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left: Item Info */}
                          <div className="flex-shrink-0">
                            {item && (
                              <div className="flex items-start gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-bold text-slate-900">{item.title}</p>
                                  <p className="text-sm text-slate-600">{item.type === "lost" ? "❌ Lost" : "✓ Found"}</p>
                                  <p className="text-xs text-slate-500 mt-1">{item.location}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Middle: Claim Info */}
                          <div className="flex-1">
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-slate-700 mb-1">Claimant</p>
                              <p className="text-sm text-slate-900">{claim.name}</p>
                              <a href={`mailto:${claim.email}`} className="text-sm text-blue-600 hover:underline">
                                {claim.email}
                              </a>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-slate-700 mb-1">Message</p>
                              <p className="text-sm text-slate-600">{claim.message}</p>
                            </div>

                            {item && item.verificationQuestions && (
                              <div className="mb-4">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Verification Answers</p>
                                <div className="space-y-2">
                                  {item.verificationQuestions.map((q, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                                      <p className="text-xs font-semibold text-slate-600 mb-1">Q: {q}</p>
                                      <p className="text-sm text-slate-900">A: {claim.answers[idx]}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {claim.status === "approved" && item && (
                              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-semibold text-green-800 mb-2">✅ Claim Approved - Contact Information</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-semibold text-slate-700">Item Owner:</p>
                                    <a href={`mailto:${item.contactEmail}`} className="text-blue-600 hover:underline">
                                      {item.contactEmail}
                                    </a>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-700">Claimant:</p>
                                    <a href={`mailto:${claim.email}`} className="text-blue-600 hover:underline">
                                      {claim.email}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex-shrink-0">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                                claim.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : claim.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {claim.status === "pending" && "⏳ Pending"}
                                {claim.status === "approved" && "✅ Approved"}
                                {claim.status === "rejected" && "❌ Rejected"}
                              </span>

                              {claim.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApproveClaim(claim.id)}
                                    className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectClaim(claim.id)}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                                  >
                                    <XIcon size={16} className="inline mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                    <MessageSquare className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-semibold">No claims yet</p>
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
