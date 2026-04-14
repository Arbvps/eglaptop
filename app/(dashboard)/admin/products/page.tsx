'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/database';
import { Product } from '@/lib/types';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Professional',
    stock: 0,
    images: [] as string[],
    specs: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const docs = await getDocuments<Product>('products');
      setProducts(docs);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateDocument('products', editingId, formData);
    } else {
      await addDocument('products', formData);
    }

    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Professional',
      stock: 0,
      images: [],
      specs: {},
    });
    setShowForm(false);
    setEditingId(null);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد؟')) {
      await deleteDocument('products', id);
      loadProducts();
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">إدارة المنتجات</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            منتج جديد
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-slate-900 border border-blue-400/20 rounded-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="اسم المنتج"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-2 px-4 text-slate-100"
              />
              <textarea
                placeholder="الوصف"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-2 px-4 text-slate-100"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="السعر"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  className="bg-slate-800 border border-blue-400/20 rounded-lg py-2 px-4 text-slate-100"
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="bg-slate-800 border border-blue-400/20 rounded-lg py-2 px-4 text-slate-100"
                >
                  <option>Professional</option>
                  <option>Gaming</option>
                  <option>Business</option>
                  <option>Student</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="المخزون"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-2 px-4 text-slate-100"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  حفظ المنتج
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      category: 'Professional',
                      stock: 0,
                      images: [],
                      specs: {},
                    });
                  }}
                  className="flex-1 bg-slate-800 text-slate-100 py-2 rounded-lg font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-slate-900 border border-blue-400/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold">الاسم</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">الفئة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">السعر</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">المخزون</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-blue-400/10 hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-sm">{product.price} جنيه</td>
                    <td className="px-6 py-4 text-sm">{product.stock}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(product.id);
                          setFormData({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            category: product.category,
                            stock: product.stock,
                            images: product.images,
                            specs: product.specs,
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
