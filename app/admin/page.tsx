"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Users, Package, ShoppingBag, Plus, X, Search, Filter, Mail, Phone, Calendar } from "lucide-react";

const AdminPage = () => {
  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress!;

  // Fetch queries
  const allUsers = useQuery(api.user.getAllUsers, { email });
  const allOrders = useQuery(api.order.getAllOrders, { email });
  const allProducts = useQuery(api.product.getAllProducts);

  // Product creation mutation
  const createProduct = useMutation(api.product.createProducts);

  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [addProductModal, setAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    imageUrl: "",
    cost: 0,
    category: "",
  });

  if (!allUsers || !allOrders || !allProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  // Error handling
  if ("error" in allUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-red-500 text-xl">❌ {allUsers.error}</div>
      </div>
    );
  }
  if ("error" in allOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-red-500 text-xl">❌ {allOrders.error}</div>
      </div>
    );
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      alert("Product created successfully!");
      setAddProductModal(false);
      setNewProduct({
        title: "",
        description: "",
        imageUrl: "",
        cost: 0,
        category: "",
      });
    } catch (err) {
      alert("Failed to create product.");
    }
  };

  const tabs = [
    { id: "users", label: "Users", icon: Users, count: allUsers.length },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: allOrders.length },
    { id: "products", label: "Products", icon: Package, count: allProducts.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/80 border-b border-yellow-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your store with ease</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-yellow-50 border-2 border-yellow-200 rounded-full px-4 py-2">
                <span className="text-gray-600 font-medium">Welcome,</span>
                <span className="font-bold text-gray-900">{user?.firstName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-xl shadow-yellow-500/50"
                    : "bg-white text-gray-600 border-2 border-yellow-200 hover:border-yellow-400"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-lg">{tab.label}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-500/20 transition-all bg-white"
            />
          </div>
          {activeTab === "products" && (
            <button
              onClick={() => setAddProductModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-2xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 pb-12">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allUsers
                .filter((u) =>
                  u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u._id?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((u) => (
                  <div
                    key={u._id}
                    className="group bg-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900">{u.name || "—"}</h3>
                        <p className="text-sm text-gray-500">User ID: {u._id}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{u.email || "—"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{u.phone || "—"}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(u._creationTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {allOrders
                .filter((o) =>
                  o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.status?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((order) => {
                  // Get product details for each product in the order
                  const orderProducts = order.products.map((p) => {
                    const product = allProducts.find((prod) => prod._id === p.productId);
                    return {
                      ...p,
                      productDetails: product,
                    };
                  });

                  return (
                    <div
                      key={order._id}
                      className="bg-white border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-sm md:text-2xl text-gray-900 mb-1">
                            Order #{order._id}
                          </h3>
                          <p className="text-gray-600">{order.name || "—"}</p>
                        </div>
                        <span
                          className={`px-2 md:px-4 py-1 text-sm md:py-2 rounded-full md:font-bold ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-600"
                              : order.status === "DELIVERED"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status || "—"}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <p className="text-xs text-gray-600 mb-1">Email</p>
                          <p className="font-semibold text-gray-900 text-sm">{order.email || "—"}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <p className="text-xs text-gray-600 mb-1">Contact</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {order.contactNumber || "—"}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {order.paymentMethod || "—"}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4">
                          <p className="text-xs text-gray-600 mb-1">Reference #</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {order.referenceNumber || "—"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Products Section with Images */}
                      <div className="border-t-2 border-yellow-100 pt-4 mb-4">
                        <p className="text-sm text-gray-600 mb-3 font-semibold">Products Ordered:</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {orderProducts.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-3 bg-yellow-50 rounded-xl p-3 border border-yellow-200"
                            >
                              {item.productDetails ? (
                                <>
                                  <img
                                    src={item.productDetails.imageUrl}
                                    alt={item.productDetails.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">
                                      {item.productDetails.title}
                                    </p>
                                    <p className="text-yellow-600 font-semibold text-sm">
                                      ₹{item.productDetails.cost} × {item.quantity}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Total: ₹{item.productDetails.cost * item.quantity}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex-1">
                                  <p className="text-gray-600 text-sm">
                                    Product ID: {item.productId}
                                  </p>
                                  <p className="text-sm">Quantity: {item.quantity}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="border-t-2 border-yellow-100 pt-4 text-right">
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-3xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                          ₹{order.totalCost || "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allProducts
                .filter((p) =>
                  p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white border-2 border-yellow-200 rounded-2xl overflow-hidden hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h4 className="font-bold text-xl text-gray-900">{product.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      <div className="pt-3 border-t border-yellow-100">
                        <p className="text-3xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                          ₹{product.cost}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {addProductModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Plus className="w-8 h-8 text-gray-900" />
                  <h2 className="text-3xl font-bold text-gray-900">Add New Product</h2>
                </div>
                <button
                  onClick={() => setAddProductModal(false)}
                  className="text-gray-900 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Tyre">Tyre</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Car Accessories">Car Accessories</option>
                    <option value="Parts">Parts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all resize-none"
                  rows={3}
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cost (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                  placeholder="0"
                  required
                  min="0"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold text-lg transform hover:scale-105"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;