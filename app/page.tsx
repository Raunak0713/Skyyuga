"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Send, ShoppingCart, Package, Menu, X, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Bank Transfer">(
    "UPI"
  );
  const [referenceNumber, setReferenceNumber] = useState<number>(0);
  const [userContact, setUserContact] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const router = useRouter();
  const { user } = useUser();
  
  const { cartItems, addToCart, updateQuantity, clearCart, total } = useCart();

  const products = useQuery(api.product.getAllProducts) ?? [];
  
  const userData = useQuery(api.user.getUserByEmail, {
    email: user?.primaryEmailAddress?.emailAddress || ""
  });
  
  const needsPhone = useQuery(
    api.user.checkPhone,
    userData?._id ? { id: userData._id } : "skip"
  );
  
  const updatePhone = useMutation(api.user.updatePhoneNumber);

  const email = user?.primaryEmailAddress?.emailAddress;
  const username = user?.firstName + " " + user?.lastName;

  useEffect(() => {
    if (user && userData && needsPhone) {
      setPhoneModalOpen(true);
    }
  }, [user, userData, needsPhone]);

  const handleSavePhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (phoneNumber.length < 10) {
      toast.error("Phone number must be at least 10 digits");
      return;
    }

    try {
      await updatePhone({
        id: userData!._id,
        phone: phoneNumber
      });
      toast.success("Phone number saved successfully!");
      setPhoneModalOpen(false);
      setPhoneNumber("");
    } catch (error) {
      toast.error("Failed to save phone number. Please try again.");
      console.error("Error saving phone number:", error);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Phone Number Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-8 h-8 text-gray-900" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Your Profile
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Please add your phone number to continue shopping and receive order updates.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your 10-digit phone number"
                    maxLength={10}
                    className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll use this to contact you about your orders
                </p>
              </div>

              <button
                onClick={handleSavePhoneNumber}
                disabled={!phoneNumber.trim() || phoneNumber.length < 10}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all transform ${
                  phoneNumber.trim() && phoneNumber.length >= 10
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 shadow-lg"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Skyyuga
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-16">
            <a
              href="https://wa.me/919825376646"
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
            >
              <Send className="w-6 h-6 text-green-500 hover:text-green-600" />
            </a>
            <a href="mailto:akashpetroleum086@gmail.com" title="Send Email">
              <Mail className="w-6 h-6 text-blue-500 hover:text-blue-600" />
            </a>

            <button
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-semibold"
              onClick={() => router.push("/orders")}
            >
              <span className="flex items-center space-x-2">
                <span>Orders</span>
              </span>
            </button>

            <button
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-semibold"
              onClick={() => setCartOpen(!cartOpen)}
            >
              <span className="flex items-center space-x-2">
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </button>

            {user ? (
              <div>
                <UserButton />
              </div>
            ) : (
              <button
                className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-semibold"
                onClick={() => router.push('/sign-in')}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-4">
            <a
              href="https://wa.me/919825376646"
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
            >
              <Send className="w-6 h-6 text-green-500" />
            </a>
            
            {user ? (
              <UserButton />
            ) : (
              <button
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-1.5 rounded-full font-semibold text-sm"
                onClick={() => router.push('/sign-in')}
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-2 rounded-full"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-yellow-200 shadow-lg">
            <div className="px-6 py-4 space-y-3">
              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 text-gray-900 px-4 py-3 rounded-lg transition-colors font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart
                </span>
                {cartItems.length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  router.push("/orders");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-gray-900 px-4 py-3 rounded-lg transition-colors font-semibold"
              >
                <Package className="w-5 h-5" />
                Orders
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-24 relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-900">All In One Place</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Tyres, Lubricating & Industrial Oil, Grease, Car Oil, Fuel & Air Filters, Car Accessories, Car Spanner & More
            </p>
          </div>
        </section>

        {/* About Us Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 mb-12">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl border-2 border-yellow-200 p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* About Us */}
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  About Us
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  We are serving the best products in Tyres and Lubricants since 1964 in Jamnagar District. This is a noble profession from our ancestors' time, and we have deep and years of experience in this business.
                </p>
              </div>

              {/* Our Vision */}
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Our Vision
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  We are trying to spread our business and experience across India and abroad, bringing our legacy of quality and trust to more customers.
                </p>
              </div>

              {/* Our Mission */}
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Every customer is to be delivered door-to-door with standard and original branded company fresh goods.
                </p>
              </div>
            </div>

            {/* Legacy Badge */}
            <div className="mt-8 text-center">
              <div className="inline-block bg-white border-2 border-yellow-300 rounded-full px-6 py-3 shadow-lg">
                <p className="text-xl md:text-2xl font-black text-gray-900">
                  <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Serving Since 1964
                  </span>
                  {" "}• 60+ Years of Excellence
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 overflow-hidden relative">
          {/* Layer 1 - scroll left */}
          <div className="relative w-full mb-8">
            <div className="flex animate-scroll-left gap-x-20">
              {[
                "/images/apollo.jpeg",
                "/images/bharatpet.jpeg",
                "/images/bridge.jpeg",
                "/images/castrol.jpeg",
                "/images/ceat.jpeg",
                "/images/hp.jpeg",
                "/images/indianoil.jpeg",
                "/images/jk.jpeg",
              ].map((src, index) => (
                <div
                  key={index}
                  className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-xl shadow-lg flex-shrink-0"
                >
                  <Image
                    className="w-full h-full object-fit"
                    src={src}
                    alt={`Brand ${index}`}
                    height={192}
                    width={192}
                  /> 
                </div>
              ))}
              {/* Duplicate for infinite effect */}
              {[
                "/images/apollo.jpeg",
                "/images/bharatpet.jpeg",
                "/images/bridge.jpeg",
                "/images/castrol.jpeg",
                "/images/ceat.jpeg",
                "/images/hp.jpeg",
                "/images/indianoil.jpeg",
                "/images/jk.jpeg",
              ].map((src, index) => (
                <div
                  key={"dup-" + index}
                  className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-xl shadow-lg flex-shrink-0"
                >
                  <Image
                    className="w-full h-full object-fit"
                    src={src}
                    alt={`Brand dup ${index}`}
                    height={192}
                    width={192}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Layer 2 - scroll right */}
          <div className="relative w-full mt-20">
            <div className="flex animate-scroll-right gap-x-20">
              {[
                "/images/apollo.jpeg",
                "/images/bharatpet.jpeg",
                "/images/bridge.jpeg",
                "/images/castrol.jpeg",
                "/images/ceat.jpeg",
                "/images/hp.jpeg",
                "/images/indianoil.jpeg",
                "/images/jk.jpeg",
              ].map((src, index) => (
                <div
                  key={"layer2-" + index}
                  className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-xl shadow-lg flex-shrink-0"
                >
                  <Image
                    className="w-full h-full object-fit"
                    src={src}
                    alt={`Brand layer2 ${index}`}
                    height={192}
                    width={192}
                  />
                </div>
              ))}
              {/* Duplicate for infinite effect */}
              {[
                "/images/apollo.jpeg",
                "/images/bharatpet.jpeg",
                "/images/bridge.jpeg",
                "/images/castrol.jpeg",
                "/images/ceat.jpeg",
                "/images/hp.jpeg",
                "/images/indianoil.jpeg",
                "/images/jk.jpeg",
              ].map((src, index) => (
                <div
                  key={"layer2-dup-" + index}
                  className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-xl shadow-lg flex-shrink-0"
                >
                  <Image
                    className="w-full h-full object-fit"
                    src={src}
                    alt={`Brand layer2 dup ${index}`}
                    height={192}
                    width={192}
                  />
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            .animate-scroll-left {
              display: flex;
              width: max-content;
              animation: scroll-left 25s linear infinite;
            }
            .animate-scroll-right {
              display: flex;
              width: max-content;
              animation: scroll-right 30s linear infinite;
            }

            @keyframes scroll-left {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            @keyframes scroll-right {
              0% {
                transform: translateX(-50%);
              }
              100% {
                transform: translateX(0);
              }
            }
          `}</style>
        </section>

        {/* Products */}
        <section id="products" className="max-w-7xl mx-auto px-6 py-20">
          <h3 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Featured Products
          </h3>

          {/* Category Filter - Responsive */}
          <div className="flex justify-center mb-12 overflow-x-auto pb-2">
            <div className="inline-flex bg-yellow-50 border-2 border-yellow-200 rounded-full p-1 flex-nowrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => router.push(`/product/${product._id}`)}
                className="group relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 transform hover:scale-105"
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="font-bold text-2xl text-gray-900">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                      ₹ {product.cost}
                    </p>
                    <button
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold transform hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                        toast.success("Added to cart!");
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Cart Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
          onClick={() => setCartOpen(false)}
        ></div>
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-500 ease-out z-50 border-l-2 border-yellow-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Your Cart
            </h4>
            <button
              className="text-gray-500 hover:text-gray-900 transition-colors text-2xl"
              onClick={() => setCartOpen(false)}
            >
              ✕
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Your cart is empty.
                <br />
                Start shopping!
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:border-yellow-400 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-yellow-600 font-semibold">
                        ₹{item.cost} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-white rounded-full px-3 py-1 border border-yellow-200">
                      <button
                        className="text-gray-900 hover:text-yellow-600 transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="text-gray-900 hover:text-yellow-600 transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-xl text-gray-900">
                      ₹{item.cost * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 space-y-4 border-t-2 border-yellow-200 pt-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span className="text-gray-900">Total:</span>
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                ₹{total}
              </span>
            </div>
            <button
              onClick={() => {
                setCartOpen(false);
                setCheckoutModalOpen(true);
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold text-lg transform hover:scale-105"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Your Payment
                </h2>
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setCartOpen(false);
                  }}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              {/* User Information Display */}
              <div className="mb-6 space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900 font-semibold">{username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">{email}</p>
                </div>
              </div>

              {/* Contact Number Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  placeholder="Enter your contact number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Payment Method Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`flex-1 py-3 font-medium text-center transition-colors ${
                    paymentMethod === "UPI"
                      ? "text-yellow-600 border-b-2 border-yellow-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  UPI
                </button>
                <button
                  className={`flex-1 py-3 font-medium text-center transition-colors ${
                    paymentMethod === "Bank Transfer"
                      ? "text-yellow-600 border-b-2 border-yellow-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setPaymentMethod("Bank Transfer")}
                >
                  Bank Transfer
                </button>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Amount to Pay</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-4">
                  ₹{total}
                </p>

                {paymentMethod === "UPI" ? (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">UPI ID</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="font-mono text-gray-800">example@okaxis</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Bank Details</h4>
                    <div className="bg-gray-100 p-3 rounded-lg space-y-2">
                      <p className="font-mono text-gray-800">
                        Account Number:{" "}
                        <span className="font-bold">1234567</span>
                      </p>
                      <p className="font-mono text-gray-800">
                        IFSC Code: <span className="font-bold">EX0001212</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Number Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paymentMethod === "UPI"
                    ? "UTR Reference Number"
                    : "Banking Transaction Reference Number"}
                </label>
                <input
                  type="number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(Number(e.target.value))}
                  placeholder={`Enter your ${paymentMethod === "UPI" ? "UTR" : "transaction"} reference number`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Place Order Button */}
              <button
                disabled={!userContact.trim() || !referenceNumber}
                onClick={async () => {
                  try {
                    const productsForOrder = cartItems.map((item) => ({
                      productId: item._id,
                      quantity: item.quantity,
                    }));

                    const orderData = {
                      products: productsForOrder,
                      totalCost: total,
                      paymentMethod: paymentMethod,
                      referenceNumber: referenceNumber,
                      name: username,
                      email: email,
                      contactNumber: userContact,
                    };

                    const response = await fetch("/api/createOrder", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(orderData),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to place order");
                    }

                    const result = await response.json();
                    if (result.success) {
                      toast.success("Order Placed Successfully");
                    }
                    setCheckoutModalOpen(false);
                    setCartOpen(false);
                    clearCart();
                    setUserContact("");
                    setReferenceNumber(0);
                  } catch (error) {
                    toast.error("Failed to place order. Please try again.");
                    console.error("Order placement error:", error);
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-colors ${
                  userContact.trim() && referenceNumber
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-yellow-300 cursor-not-allowed"
                }`}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-t border-yellow-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h4 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Akash Petroleum
            </h4>
            <p className="text-gray-700 leading-relaxed">
              Famous Market, Digjam Circul, Opp. JMC Water Tank & HP Petrol
              Station,
              <br />
              Nr. Hotel Lemon Tree, Below Over Bridge, Jamnagar. 361006.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h5 className="text-xl font-bold text-gray-900">Contact Us</h5>
            <div className="flex items-center space-x-3">
              <Send className="w-6 h-6 text-green-500" />
              <a
                href="https://wa.me/919825376646"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-green-600 font-semibold"
              >
                9825376646
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <a
                href="mailto:akashpetroleum086@gmail.com"
                className="text-gray-800 hover:text-blue-600 font-semibold"
              >
                akashpetroleum086@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="tel:9825376646"
                className="text-gray-800 hover:text-yellow-600 font-semibold"
              >
                📞 <span className="ml-4">9825376646</span>
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h5 className="text-xl font-bold text-gray-900">Find Us</h5>
            <a
              href="https://goo.gl/maps/5v7ZcCJy9h32"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-40 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.123456789!2d70.065123!3d22.473456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc123456789ab%3A0xc123456789abcd!2sAkash%20Petroleum!5e0!3m2!1sen!2sin!4v1697612345678!5m2!1sen!2sin"
                className="w-full h-full border-0"
                loading="lazy"
              ></iframe>
            </a>
          </div>
        </div>

        <div className="border-t border-yellow-200 mt-6 pt-4 text-center text-gray-600 font-medium">
          © {new Date().getFullYear()} Akash Petroleum. All rights reserved.
        </div>
      </footer>
    </div>
  );
}