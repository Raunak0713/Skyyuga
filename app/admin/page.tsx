"use client";
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Users, Package, ShoppingBag, Plus, X, Search, Pencil, Mail, Phone, Calendar, Check, Upload, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";

type OrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "DELIVERING" | "DELIVERED";

const AdminPage = () => {
  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress!;

  const allUsers = useQuery(api.user.getAllUsers, { email });
  const allOrders = useQuery(api.order.getAllOrders, { email });
  const allProducts = useQuery(api.product.getAllProducts);

  const createProduct = useMutation(api.product.createProducts);
  const updateOrderStatus = useMutation(api.order.updateOrderStatus);
  const updateProduct = useMutation(api.product.updateProduct);
  const deleteProduct = useMutation(api.product.deleteProduct);

  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [addProductModal, setAddProductModal] = useState(false);
  const [editProductModal, setEditProductModal] = useState(false);
  const [editOrderModal, setEditOrderModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Id<"products"> | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    imageUrl: "",
    cost: 0,
    category: "",
    size: "",
    models: [] as string[],
  });
  const [currentModel, setCurrentModel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditUploading, setIsEditUploading] = useState(false);

  // Order status filter
  const [statusFilters, setStatusFilters] = useState<Set<OrderStatus>>(
    new Set(["PENDING", "ACCEPTED", "REJECTED", "DELIVERING", "DELIVERED"])
  );
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowStatusFilter(false);
      }
    };

    if (showStatusFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusFilter]);

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
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl,
        cost: newProduct.cost,
        category: newProduct.category,
        ...(newProduct.category === "Tyres" && {
          tyreSize: newProduct.size,
          tyreModel: newProduct.models,
        }),
      };
      await createProduct(productData);
      toast.success("Product created successfully!");
      setAddProductModal(false);
      setNewProduct({
        title: "",
        description: "",
        imageUrl: "",
        cost: 0,
        category: "",
        size: "",
        models: [],
      });
      setCurrentModel("");
    } catch (err) {
      toast.error("Failed to create product.");
    }
  };

  const addModel = () => {
    if (currentModel.trim() && !newProduct.models.includes(currentModel.trim())) {
      setNewProduct({ ...newProduct, models: [...newProduct.models, currentModel.trim()] });
      setCurrentModel("");
    }
  };

  const removeModel = (modelToRemove: string) => {
    setNewProduct({
      ...newProduct,
      models: newProduct.models.filter((m) => m !== modelToRemove),
    });
  };

  const addModelEdit = () => {
    if (currentModel.trim() && !selectedProduct.models?.includes(currentModel.trim())) {
      setSelectedProduct({ 
        ...selectedProduct, 
        models: [...(selectedProduct.models || []), currentModel.trim()] 
      });
      setCurrentModel("");
    }
  };

  const removeModelEdit = (modelToRemove: string) => {
    setSelectedProduct({
      ...selectedProduct,
      models: (selectedProduct.models || []).filter((m: string) => m !== modelToRemove),
    });
  };

  const handleProductUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const updateData = {
        productId: selectedProduct._id,
        title: selectedProduct.title,
        description: selectedProduct.description,
        imageUrl: selectedProduct.imageUrl,
        cost: selectedProduct.cost,
        category: selectedProduct.category,
        ...(selectedProduct.category === "Tyres" && {
          size: selectedProduct.size || "",
          models: selectedProduct.models || [],
        }),
      };
      await updateProduct(updateData);
      toast.success("Product updated successfully!");
      setEditProductModal(false);
      setSelectedProduct(null);
      setCurrentModel("");
    } catch (err) {
      toast.error("Failed to update product.");
    }
  };

  const handleOrderStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus({
        orderId: selectedOrder._id,
        status: newStatus,
      });
      toast.success("Order status updated successfully!");
      setEditOrderModal(false);
      setSelectedOrder(null);
    } catch (err) {
      toast.error("Failed to update order status.");
    }
  };

  const handleProductDelete = async (productId: Id<"products">) => {
    setProductToDelete(productId);
    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct({ productId: productToDelete });
      toast.success("Product deleted successfully!");
      setDeleteConfirmModal(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  };

  const toggleStatusFilter = (status: OrderStatus) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  const tabs = [
    { id: "users", label: "Users", icon: Users, count: allUsers.length },
    { id: "orders", label: "Orders", icon: ShoppingBag, count: allOrders.length },
    { id: "products", label: "Products", icon: Package, count: allProducts.length },
  ];

  const orderStatuses: OrderStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "DELIVERING", "DELIVERED"];

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

        {/* Search Bar and Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
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
          
          {/* Status Filter for Orders */}
          {activeTab === "orders" && (
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="flex items-center space-x-2 bg-white border-2 border-yellow-200 text-gray-900 px-6 py-4 rounded-2xl hover:border-yellow-400 transition-all duration-300 font-bold"
              >
                <Check className="w-5 h-5" />
                <span>Filter Status ({statusFilters.size})</span>
              </button>
              
              {showStatusFilter && (
                <div className="absolute top-full mt-2 right-0 bg-white border-2 border-yellow-200 rounded-2xl shadow-2xl p-4 z-50 min-w-[200px]">
                  <p className="text-sm font-bold text-gray-700 mb-3">Order Status</p>
                  {orderStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-yellow-50 rounded-lg px-2 transition-colors group"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={statusFilters.has(status)}
                          onChange={() => toggleStatusFilter(status)}
                          className="appearance-none w-5 h-5 border-2 border-yellow-300 rounded checked:bg-gradient-to-r checked:from-yellow-400 checked:to-yellow-500 checked:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all cursor-pointer"
                        />
                        {statusFilters.has(status) && (
                          <Check className="w-4 h-4 text-gray-900 absolute top-0.5 left-0.5 pointer-events-none font-bold" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{status}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === "products" && (
            <button
              onClick={() => setAddProductModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-4 rounded-2xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-bold"
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
                .filter((o) => {
                  // Filter by status
                  if (!statusFilters.has(o.status as OrderStatus)) return false;
                  
                  // Filter by search term
                  return (
                    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.status?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                })
                .map((order) => {
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
                      <div className="flex flex-wrap items-start justify-between mb-4 gap-4">
                        <div>
                          <h3 className="font-bold text-sm md:text-2xl text-gray-900 mb-1">
                            Order #{order._id}
                          </h3>
                          <p className="text-gray-600">{order.name || "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 md:px-4 py-1 text-sm md:py-2 rounded-full md:font-bold ${
                              order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-600"
                                : order.status === "ACCEPTED"
                                ? "bg-blue-100 text-blue-600"
                                : order.status === "DELIVERING"
                                ? "bg-purple-100 text-purple-600"
                                : order.status === "DELIVERED"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {order.status || "—"}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditOrderModal(true);
                            }}
                            className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-full transition-colors"
                            title="Edit Status"
                          >
                            <Pencil className="w-4 h-4 text-gray-900" />
                          </button>
                        </div>
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
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setEditProductModal(true);
                          }}
                          className="p-2 bg-white hover:bg-yellow-100 rounded-full transition-colors shadow-lg"
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4 text-gray-900" />
                        </button>
                        <button
                          onClick={() => handleProductDelete(product._id)}
                          className="p-2 bg-white hover:bg-red-100 rounded-full transition-colors shadow-lg"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden animate-fade-in my-8">
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
                    <option value="Tyres">Tyres</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Car Accessories">Car Accessories</option>
                    <option value="Parts">Parts</option>
                  </select>
                </div>
              </div>

              {/* Tyre-specific fields - Size and Models right after category */}
              {newProduct.category === "Tyres" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newProduct.size}
                      onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                      className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                      placeholder="e.g., 195/65R15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Compatible Models <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Display added models as tags */}
                    {newProduct.models.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        {newProduct.models.map((model, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 bg-yellow-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium border border-yellow-300"
                          >
                            {model}
                            <button
                              type="button"
                              onClick={() => removeModel(model)}
                              className="hover:bg-yellow-300 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Input to add new model */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentModel}
                        onChange={(e) => setCurrentModel(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addModel();
                          }
                        }}
                        className="flex-1 p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                        placeholder="e.g., MERC BENZ"
                      />
                      <button
                        type="button"
                        onClick={addModel}
                        className="px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl transition-all font-bold flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add
                      </button>
                    </div>
                    {newProduct.models.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">* At least one model is required for tyres</p>
                    )}
                  </div>
                </>
              )}

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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Image <span className="text-red-500">*</span>
                </label>
                
                {!newProduct.imageUrl ? (
                  <div className="w-full">
                    <div className="w-full flex justify-center items-center border-2 border-dashed border-yellow-300 rounded-xl p-8 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <UploadButton
                          endpoint="imageUploader"
                          appearance={{
                            button: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-8 text-sm py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all ut-ready:bg-gradient-to-r ut-ready:from-yellow-400 ut-ready:to-yellow-500 ut-uploading:cursor-not-allowed ut-uploading:opacity-50",
                            container: "w-full flex flex-col items-center justify-center gap-2",
                            allowedContent: "text-gray-600 text-sm"
                          }}
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              setNewProduct({ ...newProduct, imageUrl: res[0].url });
                              toast.success("Image uploaded successfully!");
                            }
                            setIsUploading(false);
                          }}
                          onUploadBegin={() => {
                            setIsUploading(true);
                          }}
                          onUploadError={(error) => {
                            toast.error("Upload failed!");
                            setIsUploading(false);
                          }}
                        />
                        {isUploading && (
                          <p className="text-sm text-yellow-600 font-medium mt-3">Uploading...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={newProduct.imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-yellow-200"
                    />
                    <button
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, imageUrl: "" })}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                      Image uploaded successfully
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploading || (newProduct.category === "Tyres" && newProduct.models.length === 0)}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold text-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading Image..." : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Pencil className="w-8 h-8 text-gray-900" />
                  <h2 className="text-3xl font-bold text-gray-900">Edit Product</h2>
                </div>
                <button
                  onClick={() => {
                    setEditProductModal(false);
                    setSelectedProduct(null);
                  }}
                  className="text-gray-900 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleProductUpdate} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.title}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, title: e.target.value })}
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
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                    className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Tyres">Tyres</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Car Accessories">Car Accessories</option>
                    <option value="Parts">Parts</option>
                  </select>
                </div>
              </div>

              {/* Tyre-specific fields - Size and Models right after category */}
              {selectedProduct.category === "s" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.size || ""}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, size: e.target.value })}
                      className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                      placeholder="e.g., 195/65R15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Compatible Models <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Display added models as tags */}
                    {selectedProduct.models && selectedProduct.models.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        {selectedProduct.models.map((model: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 bg-yellow-200 text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium border border-yellow-300"
                          >
                            {model}
                            <button
                              type="button"
                              onClick={() => removeModelEdit(model)}
                              className="hover:bg-yellow-300 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Input to add new model */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentModel}
                        onChange={(e) => setCurrentModel(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addModelEdit();
                          }
                        }}
                        className="flex-1 p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                        placeholder="e.g., MERC BENZ"
                      />
                      <button
                        type="button"
                        onClick={addModelEdit}
                        className="px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl transition-all font-bold flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add
                      </button>
                    </div>
                    {(!selectedProduct.models || selectedProduct.models.length === 0) && (
                      <p className="text-xs text-red-500 mt-1">* At least one model is required for tyres</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={selectedProduct.description}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all resize-none"
                  rows={2}
                  placeholder="Enter product description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cost (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={selectedProduct.cost}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, cost: Number(e.target.value) })}
                  className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all"
                  placeholder="0"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Image <span className="text-red-500">*</span>
                </label>
                
                {!selectedProduct.imageUrl ? (
                  <div className="w-full">
                    <div className="w-full flex justify-center items-center border-2 border-dashed border-yellow-300 rounded-xl p-8 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <UploadButton
                          endpoint="imageUploader"
                          appearance={{
                            button: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all ut-ready:bg-gradient-to-r ut-ready:from-yellow-400 ut-ready:to-yellow-500 ut-uploading:cursor-not-allowed ut-uploading:opacity-50",
                            container: "w-full flex flex-col items-center justify-center gap-2",
                            allowedContent: "text-gray-600 text-sm"
                          }}
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              setSelectedProduct({ ...selectedProduct, imageUrl: res[0].url });
                              toast.success("Image uploaded successfully!");
                            }
                            setIsEditUploading(false);
                          }}
                          onUploadBegin={() => {
                            setIsEditUploading(true);
                          }}
                          onUploadError={(error) => {
                            toast.error("Upload failed!");
                            setIsEditUploading(false);
                          }}
                        />
                        {isEditUploading && (
                          <p className="text-sm text-yellow-600 font-medium mt-3">Uploading...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedProduct.imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-yellow-200"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedProduct({ ...selectedProduct, imageUrl: "" })}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                      Image uploaded successfully
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isEditUploading || (selectedProduct.category === "Tyres" && (!selectedProduct.models || selectedProduct.models.length === 0))}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold text-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditUploading ? "Uploading Image..." : "Update Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Status Modal */}
      {editOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Pencil className="w-8 h-8 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">Update Order Status</h2>
                </div>
                <button
                  onClick={() => {
                    setEditOrderModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-900 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-bold text-gray-900">{selectedOrder._id}</p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="font-bold text-gray-900">{selectedOrder.name}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Select New Status <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {orderStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleOrderStatusUpdate(status)}
                      className={`w-full p-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                        selectedOrder.status === status
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg"
                          : "bg-white border-2 border-yellow-200 text-gray-700 hover:border-yellow-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{status}</span>
                        {selectedOrder.status === status && (
                          <span className="bg-white text-gray-900 px-2 py-1 rounded-full text-xs">
                            Current
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-8 h-8 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">Delete Product</h2>
                </div>
                <button
                  onClick={() => {
                    setDeleteConfirmModal(false);
                    setProductToDelete(null);
                  }}
                  className="text-gray-900 hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h3>
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete the product from your store.
                </p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-gray-800 font-medium">
                  ⚠️ Warning: All product data will be lost permanently
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmModal(false);
                    setProductToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-yellow-200 text-gray-700 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold transform hover:scale-105"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;