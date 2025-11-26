import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Claim, Item } from "@shared/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Mail, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";

export default function MyClaims() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailFromUrl);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [items, setItems] = useState<{ [key: string]: Item }>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    
    try {
      // Fetch all claims
      const claimsResponse = await fetch("/api/claims");
      if (!claimsResponse.ok) throw new Error("Failed to fetch claims");
      
      const claimsData = await claimsResponse.json();
      const userClaims = claimsData.claims.filter((c: Claim) => 
        c.email.toLowerCase() === email.toLowerCase()
      );
      
      setClaims(userClaims);
      
      // Fetch item details for each claim
      const itemsMap: { [key: string]: Item } = {};
      for (const claim of userClaims) {
        try {
          const itemResponse = await fetch(`/api/items/${claim.itemId}`);
          if (itemResponse.ok) {
            const itemData = await itemResponse.json();
            itemsMap[claim.itemId] = itemData.item;
          }
        } catch (err) {
          console.error("Failed to fetch item:", err);
        }
      }
      setItems(itemsMap);
      setSearched(true);
    } catch (err) {
      setError("Failed to fetch claims. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailFromUrl) {
      handleSearch(new Event("submit") as any);
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors">
              <ArrowLeft size={20} />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="inline-block mb-3 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">📋 Track Claims</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">My Claims</h1>
            <p className="text-slate-600">Check the status of your submitted claims</p>
          </div>

          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-8 shadow-xl mb-8 animate-fade-in-delayed-1">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Enter your email to view claims
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
              >
                {loading ? "Searching..." : "🔍 Check My Claims"}
              </Button>
            </form>
          </div>

          {/* Claims List */}
          {searched && (
            <div className="space-y-4 animate-fade-in-delayed-2">
              {claims.length > 0 ? (
                claims.map((claim) => {
                  const item = items[claim.itemId];
                  const statusConfig = {
                    pending: {
                      icon: <Clock className="w-5 h-5" />,
                      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
                      badgeColor: "bg-yellow-500",
                      title: "⏳ Pending Review",
                      message: "Your claim is awaiting admin approval. Check back soon!"
                    },
                    approved: {
                      icon: <CheckCircle className="w-5 h-5" />,
                      color: "bg-green-100 border-green-300 text-green-800",
                      badgeColor: "bg-green-500",
                      title: "✅ Approved!",
                      message: "Your claim was approved. Contact information below:"
                    },
                    rejected: {
                      icon: <XCircle className="w-5 h-5" />,
                      color: "bg-red-100 border-red-300 text-red-800",
                      badgeColor: "bg-red-500",
                      title: "❌ Not Approved",
                      message: "This claim was not approved. The verification answers may not have matched."
                    }
                  };

                  const config = statusConfig[claim.status];

                  return (
                    <div key={claim.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-lg">
                      {/* Status Badge */}
                      <div className={`flex items-center gap-3 p-4 rounded-xl border-2 mb-4 ${config.color}`}>
                        {config.icon}
                        <div className="flex-1">
                          <p className="font-bold text-lg">{config.title}</p>
                          <p className="text-sm">{config.message}</p>
                        </div>
                        <span className={`px-3 py-1 ${config.badgeColor} text-white text-xs font-bold rounded-full uppercase`}>
                          {claim.status}
                        </span>
                      </div>

                      {/* Item Info */}
                      {item && (
                        <div className="flex gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-600">{item.description}</p>
                            <p className="text-xs text-slate-500 mt-1">📍 {item.location}</p>
                          </div>
                        </div>
                      )}

                      {/* Your Claim Details */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Your Message:</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{claim.message}</p>
                      </div>

                      {/* Contact Info (only shown when approved) */}
                      {claim.status === "approved" && item && (
                        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                          <p className="font-bold text-green-900 mb-3">📧 Contact Information:</p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">Item Owner/Finder:</p>
                              <a
                                href={`mailto:${item.contactEmail}`}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                {item.contactEmail}
                              </a>
                            </div>
                            <Button
                              asChild
                              className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                            >
                              <a
                                href={`mailto:${item.contactEmail}?subject=${encodeURIComponent(`Regarding Approved Claim: ${item.title}`)}&body=${encodeURIComponent(`Hi,\n\nMy claim for "${item.title}" was approved by the admin.\n\nClaim ID: ${claim.id}\nMy Email: ${claim.email}\n\nLet's arrange to meet up!\n\nBest regards,\n${claim.name}`)}`}
                              >
                                <Mail className="mr-2" size={18} />
                                Send Email Now
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Submitted Date */}
                      <p className="text-xs text-slate-500 mt-4">
                        Submitted: {new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-12 text-center shadow-lg">
                  <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                    <Mail className="w-12 h-12 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-lg mb-2">No claims found</p>
                  <p className="text-slate-600">
                    No claims were submitted using this email address.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
