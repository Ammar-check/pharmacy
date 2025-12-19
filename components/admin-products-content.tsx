"use client";
import { useState } from "react";
import Link from "next/link";
import AdminLogoutButton from "@/components/admin-logout-button";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  base_price: number;
  stock_quantity: number;
  status: string;
  featured: boolean;
  primary_image_url: string | null;
  created_at: string;
};

export default function AdminProductsContent({ products }: { products: Product[] }) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (filterStatus && product.status !== filterStatus) return false;
    if (filterCategory && product.category !== filterCategory) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statuses = ["draft", "active", "archived", "out_of_stock"];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">Product Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your product catalog</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full lg:w-auto">
            <Link
              href="/admin"
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/admin/products/new"
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base whitespace-nowrap"
            >
              + Add New Product
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Total Products</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Active</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {products.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Draft</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {products.filter((p) => p.status === "draft").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600">Out of Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {products.filter((p) => p.status === "out_of_stock" || p.stock_quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory || ""}
                onChange={(e) => setFilterCategory(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category!}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg font-medium">No products found</p>
                        <Link
                          href="/admin/products/new"
                          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Add Your First Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center">
                          {product.primary_image_url ? (
                            <img
                              src={product.primary_image_url}
                              alt={product.name}
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover mr-2 sm:mr-4 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-200 mr-2 sm:mr-4 flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-400 text-xs">No img</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate hidden sm:block">{product.slug}</div>
                            {product.featured && (
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{product.category || "—"}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          ${product.base_price.toFixed(2)}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${
                            product.stock_quantity === 0
                              ? "text-red-600"
                              : product.stock_quantity < 10
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800"
                              : product.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : product.status === "out_of_stock"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span className="hidden sm:inline">{product.status}</span>
                          <span className="sm:hidden">
                            {product.status === "active" ? "✓" : product.status === "draft" ? "D" : "✕"}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-blue-600 hover:text-blue-900 sm:mr-4"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
