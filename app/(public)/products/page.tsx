'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getDocuments } from '@/lib/firebase/database';
import { Product } from '@/lib/types';
import { trackPageView, trackSearch } from '@/lib/firebase/analytics';

const CATEGORIES = ['Professional', 'Gaming', 'Business', 'Student'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');

  useEffect(() => {
    trackPageView('/products', 'Products');
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments<Product>('products');
      setProducts(docs);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (term: string) => {
    setSearch(term);
    trackSearch(term, filteredProducts.length);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">المنتجات</h1>
          <p className="text-slate-300">استكشف مجموعتنا الفائقة من الأجهزة</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن جهاز..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 pr-12 pl-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg transition-all ${
                !selectedCategory
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الكل
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-300">جاري التحميل...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-300">لا توجد منتجات مطابقة</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="bg-slate-900 border border-blue-400/20 rounded-xl overflow-hidden hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                  <div className="relative h-48 bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center group-hover:from-blue-900/60 group-hover:to-purple-900/60 transition-all">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-400">
                        {product.price.toLocaleString()} جنيه
                      </span>
                      {product.rating > 0 && (
                        <span className="text-xs text-yellow-400">
                          ⭐ {product.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <div className="text-xs text-green-400 mt-2">
                        {product.stock} متاح
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 mt-2">غير متاح</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
