"use client";

import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, ShoppingCart, Package, Menu, X, Phone, User} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import { UserButton, useUser } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/checkAdmin"; 
import Image from "next/image";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Bank Transfer">("UPI");
  const [referenceNumber, setReferenceNumber] = useState<number | null>();
  const [userContact, setUserContact] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [address, setAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [selectedTireSize, setSelectedTireSize] = useState<string | undefined>("");
  const [selectedTireModel, setSelectedTireModel] = useState<string>("");
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const { cartItems, addToCart, updateQuantity, clearCart, total } = useCart();

  const products = useQuery(api.product.getAllProducts) ?? [];
  
  const tireData = useQuery(api.product.getAllTyres, {
    size: selectedTireSize || undefined,
    model: selectedTireModel || undefined,
  });
  
  const allTireData = useQuery(api.product.getAllTyres, {});

  const userData = useQuery(api.user.getUserByEmail, {
    email: user?.primaryEmailAddress?.emailAddress || "",
  });

  const needsPhone = useQuery(
    api.user.checkPhone,
    userData?._id ? { id: userData._id } : "skip"
  );

  const updatePhone = useMutation(api.user.updatePhoneNumber);

  const email = user?.primaryEmailAddress?.emailAddress;
  const username = user?.firstName + " " + user?.lastName;
  const phone = userData?.phone

  useEffect(() => {
    if (user && userData && needsPhone) {
      setPhoneModalOpen(true);
    }
  }, [user, userData, needsPhone]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handlePaymentModal = async () => {
    if(!isSignedIn){
      return router.push("/sign-up")
    }
    setCartOpen(false);
    setCheckoutModalOpen(true);
  }

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
        phone: phoneNumber,
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
  

  const showTireFilters = selectedCategory === "All" || selectedCategory === "Tyres";
  const anyTireFilterActive = selectedTireSize || selectedTireModel;
  
  const filterOptions = allTireData || { uniqueSizes: [], uniqueModels: [] };
  
  const filteredModels = filterOptions.uniqueModels.filter(model =>
    model.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );
  
  const isLoadingFilteredTires = showTireFilters && anyTireFilterActive && !tireData;
  
  let filteredProducts;
  if (showTireFilters && anyTireFilterActive && tireData) {
    filteredProducts = tireData.tyres;
  } else if (selectedCategory === "Tyres") {
    filteredProducts = products.filter((p) => p.category === "Tyres");
  } else if (selectedCategory === "All") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter((p) => p.category === selectedCategory);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

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
                Please add your phone number to continue shopping and receive
                order updates.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
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

      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl gap-x-2 flex md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            <span className="hidden md:block">Skyyuga</span>
            <Image src={"/Logo.png"} height={25} width={40} alt="logo"/>
          </h1>


          <div className="hidden md:flex items-center space-x-16">
            <a
              href="https://wa.me/919825376646"
              target="_blank"
              rel="noopener noreferrer"
              title="Chat on WhatsApp"
            >
              <Image src={"/WhatsApp.svg"} alt="whatsapp" width={40} height={40}/>
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
            {isAdmin && (
                <button
                  className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-semibold"
                  onClick={() => router.push("/admin")}
                >
                  <span className="flex items-center space-x-2">
                    <span>Admin</span>
                  </span>
                </button>
              )}

            {user ? (
              <div>
                <UserButton />
              </div>
            ) : (
              <button
                className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 font-semibold"
                onClick={() => router.push("/sign-in")}
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
              <Image src={"/WhatsApp.svg"} alt="whatsapp" width={40} height={40}/>
            </a>
            <a href="mailto:akashpetroleum086@gmail.com" title="Send Email">
              <Mail className="w-6 h-6 text-blue-500 hover:text-blue-600" />
            </a>

            {user ? (
              <UserButton />
            ) : (
              <button
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-1.5 rounded-full font-semibold text-sm"
                onClick={() => router.push("/sign-in")}
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-2 rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        
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

              {isAdmin && (
                <button
                  onClick={() => {
                    router.push("/admin");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-gray-900 px-4 py-3 rounded-lg transition-colors font-semibold"
                >
                  <User className="w-5 h-5" />
                  Admin
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pt-24 relative z-10">
      
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
              Tyres, Lubricating & Industrial Oil, Grease, Car Oil, Fuel & Air
              Filters, Car Accessories, Car Spanner & More
            </p>
          </div>
        </section>

        <section className="py-12 overflow-hidden relative">
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

        <section id="products" className="max-w-7xl mx-auto px-6 py-20">
          <h3 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Featured Products
          </h3>

          <div className="mb-12">
            <div className="flex flex-col items-center gap-2 sm:hidden">
              <div className="inline-flex bg-yellow-50 border-2 border-yellow-200 rounded-full p-1 flex-nowrap">
                {categories
                  .slice(0, Math.ceil(categories.length / 2))
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedTireSize("");
                        setSelectedTireModel("");
                      }}
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
              <div className="inline-flex bg-yellow-50 border-2 border-yellow-200 rounded-full p-1 flex-nowrap">
                {categories
                  .slice(Math.ceil(categories.length / 2))
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedTireSize("");
                        setSelectedTireModel("");
                      }}
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


            <div className="hidden sm:flex justify-center overflow-x-auto pb-2">
              <div className="inline-flex bg-yellow-50 border-2 border-yellow-200 rounded-full p-1 flex-nowrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedTireSize("");
                      setSelectedTireModel("");
                    }}
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
          </div>

          {showTireFilters && (
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="w-[70%] sm:w-64 relative">
                <button
                  onClick={() => {
                    setSizeDropdownOpen(!sizeDropdownOpen);
                    setModelDropdownOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-full font-semibold text-gray-900 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer hover:border-yellow-400 shadow-md flex items-center justify-between"
                >
                  <span>{selectedTireSize || "All Sizes"}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {sizeDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-yellow-300 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                    <div
                      onClick={() => {
                        setSelectedTireSize("");
                        setSizeDropdownOpen(false);
                      }}
                      className="px-6 py-3 hover:bg-yellow-50 cursor-pointer font-semibold text-gray-900 transition-colors border-b border-yellow-100"
                    >
                      All Sizes
                    </div>
                    {filterOptions.uniqueSizes.map((size) => (
                      <div
                        key={size}
                        onClick={() => {
                          setSelectedTireSize(size);
                          setSizeDropdownOpen(false);
                        }}
                        className={`px-6 py-3 hover:bg-yellow-50 cursor-pointer font-semibold transition-colors border-b border-yellow-100 last:border-b-0 ${
                          selectedTireSize === size ? 'bg-yellow-100 text-yellow-700' : 'text-gray-900'
                        }`}
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-[70%] sm:w-64 relative">
                <button
                  onClick={() => {
                    setModelDropdownOpen(!modelDropdownOpen);
                    setSizeDropdownOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-full font-semibold text-gray-900 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer hover:border-yellow-400 shadow-md flex items-center justify-between"
                >
                  <span>{selectedTireModel || "All Models"}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {modelDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-yellow-300 rounded-2xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-yellow-200">
                      <input
                        type="text"
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="w-full px-4 py-2 border-2 border-yellow-200 rounded-full focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="overflow-y-auto">
                      <div
                        onClick={() => {
                          setSelectedTireModel("");
                          setModelSearchQuery("");
                          setModelDropdownOpen(false);
                        }}
                        className="px-6 py-3 hover:bg-yellow-50 cursor-pointer font-semibold text-gray-900 transition-colors border-b border-yellow-100"
                      >
                        All Models
                      </div>
                      {filteredModels.length > 0 ? (
                        filteredModels.map((model) => (
                          <div
                            key={model}
                            onClick={() => {
                              setSelectedTireModel(model);
                              setModelSearchQuery("");
                              setModelDropdownOpen(false);
                            }}
                            className={`px-6 py-3 hover:bg-yellow-50 cursor-pointer font-semibold transition-colors border-b border-yellow-100 last:border-b-0 ${
                              selectedTireModel === model ? 'bg-yellow-100 text-yellow-700' : 'text-gray-900'
                            }`}
                          >
                            {model}
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-3 text-gray-500 text-center">
                          No models found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {anyTireFilterActive && (
                <button
                  onClick={() => {
                    setSelectedTireSize("");
                    setSelectedTireModel("");
                    setModelSearchQuery("");
                    setSizeDropdownOpen(false);
                    setModelDropdownOpen(false);
                  }}
                  className="w-[70%] sm:w-auto px-6 py-3 bg-yellow-100 text-black rounded-full font-semibold transition-all shadow-lg transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {isLoadingFilteredTires ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="relative h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-12 bg-gray-200 rounded-full w-32"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredProducts.map((product) => {
                const firstImage = Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl;
                
                return (
                  <div
                    key={product._id}
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="group relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={firstImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-center">
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                        {product.category === "Tyres" && product.tyreSize && (
                          <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            {product.tyreSize}
                          </span>
                        )}
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
                            addToCart({
                              ...product,
                              imageUrl: firstImage
                            });
                            toast.success("Added to cart!");
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12 mb-12">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl border-2 border-yellow-200 p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  About Us
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  We are serving the best products in Tyres and Lubricants since
                  1964 in Jamnagar District. This is a noble profession from our
                  ancestors' time, and we have deep and years of experience in
                  this business.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Our Vision
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  We are trying to spread our business and experience across
                  India and abroad, bringing our legacy of quality and trust to
                  more customers.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Every customer is to be delivered door-to-door with standard
                  and original branded company fresh goods.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block bg-white border-2 border-yellow-300 rounded-full px-6 py-3 shadow-lg">
                <p className="text-xl md:text-2xl font-black text-gray-900">
                  <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Serving Since 1964
                  </span>{" "}
                  • 60+ Years of Excellence
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {cartOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
          onClick={() => setCartOpen(false)}
        ></div>
      )}

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
              {cartItems.map((item) => {
                const itemImage = Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl;
                
                return (
                  <div
                    key={item._id}
                    className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:border-yellow-400 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-3">
                      <img
                        src={itemImage}
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
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="text-gray-900 hover:text-yellow-600 transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-xl text-gray-900">
                        ₹{item.cost * item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              onClick={() => handlePaymentModal()}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 font-bold text-lg transform hover:scale-105"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>

     {checkoutModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50  flex items-center justify-center p-2 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95%] scale-[85%] md:scale-100 sm:max-w-md mx-auto overflow-hidden my-4">
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

              <div className="mb-6 space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900 font-semibold">{username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">{email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900 font-semibold">{phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    className="w-full font-semibold p-2.5 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  />
                </div>
              </div>

              


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

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Amount to Pay</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-4">
                  ₹{total}
                </p>

                {paymentMethod === "UPI" ? (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">UPI ID</h4>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="font-mono text-gray-800">9825376646.ibz@icici</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Bank Details</h4>
                    <div className="bg-gray-100 p-3 rounded-lg space-y-2">
                      <p className="font-mono text-gray-800">
                        Account No:{" "}
                        <span className="font-bold">072605002943</span>
                      </p>
                      <p className="font-mono text-gray-800">
                        IFSC Code: <span className="font-bold">ICIC0000726</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paymentMethod === "UPI"
                    ? "UTR Reference Number"
                    : "Banking Transaction Reference Number"}
                </label>
                <input
                  type="number"
                  value={referenceNumber || ""}
                  onChange={(e) => setReferenceNumber(Number(e.target.value))}
                  placeholder={`Enter your ${paymentMethod === "UPI" ? "UTR" : "transaction"} reference number`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              {address && address.length < 10 && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">
                  ⚠️ Address must be at least 10 characters long.
                </p>
              )}
              <button
                disabled={!referenceNumber || orderProcessing}
                onClick={async () => {
                  if (orderProcessing) return;
                  
                  setOrderProcessing(true);
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
                      address : address,
                      name: username,
                      email: email,
                      contactNumber: phone,
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
                    setReferenceNumber(null);
                  } catch (error) {
                    toast.error("Failed to place order. Please try again.");
                    console.error("Order placement error:", error);
                  } finally {
                    setOrderProcessing(false);
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all ${
                  referenceNumber && !orderProcessing && address.length > 10
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 cursor-pointer transform hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {orderProcessing ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-t border-yellow-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
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

          <div className="space-y-4">
            <h5 className="text-xl font-bold text-gray-900">Contact Us</h5>
            <div className="flex items-center space-x-3">
              <Image src={"/WhatsApp.svg"} alt="whatsapp" width={25} height={25}/>
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

          <div className="space-y-4">
            <h5 className="text-xl font-bold text-gray-900">Find Us</h5>
            <a
              href="https://maps.app.goo.gl/jrpoBoxsdTVkuTSAA"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-40 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.3856985847733!2d70.06282007537654!3d22.46950237954091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959ca19f086bc77%3A0x43ad1cc58fa4c7c2!2sAkash%20Petroleum!5e0!3m2!1sen!2sin!4v1730736845123!5m2!1sen!2sin"
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
                allowFullScreen
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