import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Item } from "@shared/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, MapPin, Calendar, Mail, ArrowLeft, X, Upload, Loader2, CheckCircle } from "lucide-react";
import { uploadToCloudinaryWithProgress } from "@/lib/cloudinary";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [claimData, setClaimData] = useState({
    name: "",
    email: "",
    message: "",
    answer1: "",
    answer2: "",
    answer3: "",
    proofImageUrl: ""
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${id}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data.item);
        }
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClaimData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setClaimData(prev => ({ ...prev, proofImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError("");
    setClaimLoading(true);

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item?.id,
          name: claimData.name,
          email: claimData.email,
          message: claimData.message,
          answers: [claimData.answer1, claimData.answer2, claimData.answer3],
          proofImageUrl: claimData.proofImageUrl
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit claim");
      }

      setClaimSuccess(true);
      setShowClaimForm(false);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4 animate-pulse">
              <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-slate-600 font-semibold">Loading item details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center animate-fade-in">
            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Item not found</h2>
            <p className="text-slate-600 mb-6">This item may have been removed or returned</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Back Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const claimButtonText = item.type === "lost" ? "I Found This Item" : "This Is My Item";
  const badgeColor = item.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
  const gradientColor = item.type === "lost" ? "from-red-500 to-red-600" : "from-green-500 to-green-600";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {claimSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg animate-fade-in">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-green-900 font-bold text-lg mb-1">
                    ✓ Claim Submitted Successfully!
                  </p>
                  <p className="text-green-700 text-sm mb-2">
                    Admin will review your claim. Check your email: <strong>{claimData.email}</strong>
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/my-claims?email=${encodeURIComponent(claimData.email)}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                📋 Track My Claim Status
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-8">
                {/* Main Image */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl group mb-4">
                  <div className="relative h-96 overflow-hidden">
                    <img
                      src={(item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[selectedImageIndex] : item.imageUrl)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {item.imageUrls && item.imageUrls.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {item.imageUrls.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-blue-600 shadow-lg scale-105"
                            : "border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-8 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${badgeColor} mb-3`}>
                      {item.type === "lost" ? "❌ Lost Item" : "✓ Found Item"}
                    </span>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">{item.title}</h1>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                      <MapPin className="text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Location</h4>
                        <p className="text-slate-600">{item.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Calendar className="text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Date</h4>
                        <p className="text-slate-600">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Questions */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="font-bold text-slate-900 mb-4">Verification Questions</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    To claim this item, you'll need to answer these questions to verify you're the rightful owner.
                  </p>
                  <div className="space-y-3">
                    {item.verificationQuestions?.map((question, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-900">Q{idx + 1}: {question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 animate-fade-in-delayed-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 sticky top-24 shadow-lg">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">Contact Information</h3>
                <div className="flex gap-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Mail className="text-blue-600 flex-shrink-0 mt-1" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-blue-700 mb-1">{item.type === "lost" ? "Item Owner" : "Finder"}</p>
                    <a 
                      href={`mailto:${item.contactEmail}`}
                      className="text-sm font-semibold text-blue-900 break-all hover:underline"
                    >
                      {item.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Choose how to connect:</p>
                  
                  {/* Option 1: Direct Email */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">⚡ Quick Contact (Instant)</p>
                    <a
                      href={`mailto:${item.contactEmail}?subject=${encodeURIComponent(`Regarding: ${item.title}`)}&body=${encodeURIComponent(`Hi,\n\nI saw your ${item.type} item post "${item.title}" and I'd like to connect with you.\n\nBest regards`)}`}
                      className="block w-full px-4 py-2 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300"
                    >
                      📧 Email Now
                    </a>
                    <p className="text-xs text-slate-600 mt-1">Best for urgent or obvious cases</p>
                  </div>

                  {/* Option 2: Verified Claim */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-2">🔐 Verified Claim (Secure)</p>
                    <p className="text-xs text-slate-600 mb-2">
                      Answer verification questions. Admin reviews before connecting you.
                    </p>
                    <p className="text-xs text-green-700 font-semibold">
                      ✓ Recommended for valuable items
                    </p>
                  </div>
                </div>

                {!showClaimForm ? (
                  <Button
                    onClick={() => setShowClaimForm(true)}
                    className={`w-full font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                      item.type === "lost"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    } text-white`}
                  >
                    {claimButtonText}
                  </Button>
                ) : (
                  <form onSubmit={handleClaimSubmit} className="space-y-4">
                    {claimError && (
                      <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle className="text-red-600 flex-shrink-0 w-5 h-5" />
                        <p className="text-red-700 text-xs font-semibold">{claimError}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Your Name *</label>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Full name"
                        value={claimData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Email *</label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={claimData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Message *</label>
                      <Textarea
                        name="message"
                        placeholder="Why do you believe this is yours?"
                        value={claimData.message}
                        onChange={handleInputChange}
                        required
                        rows={2}
                        className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                      />
                    </div>

                    {/* Answers */}
                    {item.verificationQuestions?.map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="block text-sm font-bold text-slate-900">Answer Q{idx + 1} *</label>
                        <Input
                          type="text"
                          name={`answer${idx + 1}`}
                          placeholder="Your answer..."
                          value={claimData[`answer${idx + 1}` as keyof typeof claimData] || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
                        />
                      </div>
                    ))}

                    {/* Proof Image */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-900">Proof Photo (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="proof-upload"
                      />
                      {previewImage ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border-2 border-slate-200">
                          <img src={previewImage} alt="Proof" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage("");
                              setClaimData(prev => ({ ...prev, proofImageUrl: "" }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="proof-upload"
                          className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <Upload className="w-5 h-5 text-slate-400" />
                          <p className="text-xs text-slate-500 mt-1">Click to upload</p>
                        </label>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={claimLoading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
                      >
                        {claimLoading ? "Submitting..." : "Submit Claim"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowClaimForm(false)}
                        variant="outline"
                        className="px-4 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
