import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Item } from "@shared/api";
import { Layout } from "@/components/Layout";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Lost() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items?type=lost");
        if (response.ok) {
          const data = await response.json();
          setItems(data.items);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="inline-block mb-4 px-4 py-2 bg-red-100/60 border border-red-200 rounded-full">
                  <p className="text-xs font-semibold text-red-700">❌ LOST ITEMS</p>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Lost Items</h1>
                <p className="text-slate-600 max-w-2xl">
                  Browse items that have been reported as lost. Help reunite them with their owners.
                </p>
              </div>
              <Link to="/report?type=lost">
                <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                  + Report Lost Item
                </Button>
              </Link>
            </div>

            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-slate-200 group-hover:border-red-300 rounded-xl transition-all duration-300">
                <Search className="absolute left-4 text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                <Input
                  type="text"
                  placeholder="Search by item name, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 w-full bg-transparent border-0 focus:outline-none text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading lost items...</p>
              </div>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-delayed-1">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className="animate-fade-in-delayed-1"
                >
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6">
                <div className="inline-block p-4 bg-red-100 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {searchQuery ? "No items found" : "No lost items yet"}
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? "Try adjusting your search query or browse all items"
                  : "Be the first to report a lost item and get help from the community"}
              </p>
              {!searchQuery && (
                <Link to="/report?type=lost">
                  <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Report a Lost Item
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
