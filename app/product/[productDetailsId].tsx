import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  InteractionManager,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star, Shield, Truck } from "lucide-react-native";

type Product = {
  id: string;
  brand: string;
  product_name: string;
  price: number;
  category: string;
  description: string;
  created_at: string;
};

const BASE_URL = "http://192.168.1.7:3000"; // align with other pages

export default function ProductDetails() {
  const { productDetailsId:id } = useLocalSearchParams<{ productDetailsId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        // setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BASE_URL}/products/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Product not found");
          } else {
            setError("Failed to load product");
          }
          return;
        }

        const productData = await res.json();
        setProduct(productData);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: false });
        }

        // Fetch similar products from the same category
        if (productData.category) {
          fetchSimilarProducts(productData.category, productData.id);
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        // setLoading(false);
      }
    };

    const fetchSimilarProducts = async (
      category: string,
      currentProductId: string
    ) => {
      try {
        setLoadingSimilar(true);
        const res = await fetch(
          `${BASE_URL}/products?category=${encodeURIComponent(
            category
          )}&pageSize=6&all=true`
        );

        if (res.ok) {
          const data = await res.json();
          // Filter out the current product and limit to 5 similar products
          const filtered = (data.items || [])
            .filter((item: Product) => item.id !== currentProductId)
            .slice(0, 5);
          setSimilarProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchProduct();
  }, [id]);

  //     useEffect(() => {
  //     const task = InteractionManager.runAfterInteractions(() => {
  //       if (product) {
  //         if (data?.getItemData?.sizingAttributes?.length > 1) {
  //           setSelectedSizeQuantity(data?.getItemData?.sizingAttributes[0]?.quantity)
  //         } else {
  //           setSizeSelected(attributeId)
  //           setSelectedSizeQuantity(data?.getItemData?.quantity)
  //         }
  //         if (data?.getItemData || !loading) {
  //           const { getItemData } = data
  //           setItemData(getItemData)
  //           if (getItemData?.quantity <= 0) {
  //             setAddCartLoading("Out Of Stock")
  //           }
  //         }
  //         setBrandImages(itemData?.product?.distributor?.brandsPromoUrls)

  //       }
  //     })

  //     return () => {
  //       task.cancel()
  //     }
  //   }, [product])

  const handleContentSizeChange = () => {
    // if (runCount.current <= 2 && scrollViewRef.current) {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
      setTimeout(() => {
        setLoading(false);
      }, 500);
      //   runCount.current += 1
    }
  };

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingVertical: 10, paddingRight: 12 }}
          >
            <ArrowLeft color="#007AFF" size={22} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#0F172A",
              flex: 1,
              textAlign: "center",
            }}
          >
            Product Details
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#EF4444",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ paddingVertical: 10, paddingRight: 12 }}
          >
            <ArrowLeft color="#007AFF" size={22} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#0F172A",
              flex: 1,
              textAlign: "center",
            }}
          >
            Product Details
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Product Details */}
        <ScrollView
          ref={scrollViewRef}
          style={{
            flex: 1,
            transform: [{ scaleY: -1 }],
          }}
          contentContainerStyle={{
            padding: 16,
          }}
          stickyHeaderIndices={[4]}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Product Details Footer */}
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Product ID: {product.id}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                textAlign: "center",
              }}
            >
              Listed since {new Date(product.created_at).toLocaleDateString()}
            </Text>
          </View>
          {/* Similar Products Section */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F172A",
                marginBottom: 16,
              }}
            >
              Similar Products in {product.category}
            </Text>

            {loadingSimilar ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator color="#007AFF" />
                <Text style={{ marginTop: 8, color: "#6B7280" }}>
                  Loading similar products...
                </Text>
              </View>
            ) : similarProducts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {similarProducts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/product/${item.id}` as any)}
                      style={{
                        width: 180,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 12,
                        padding: 12,
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "600",
                          color: "#0F172A",
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {item.brand} — {item.product_name}
                      </Text>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        {item.category}
                      </Text>
                      <Text
                        style={{
                          color: "#007AFF",
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        ₹{item.price.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text
                style={{
                  color: "#6B7280",
                  textAlign: "center",
                  paddingVertical: 20,
                }}
              >
                No similar products found
              </Text>
            )}
          </View>
          {/* Specifications Section */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F172A",
                marginBottom: 16,
              }}
            >
              Specifications
            </Text>
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 16 }}>Brand</Text>
                <Text
                  style={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
                >
                  {product.brand}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 16 }}>Category</Text>
                <Text
                  style={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
                >
                  {product.category}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 16 }}>Model</Text>
                <Text
                  style={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
                >
                  {product.product_name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 16 }}>Warranty</Text>
                <Text
                  style={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
                >
                  1 Year
                </Text>
              </View>
            </View>
          </View>
          {/* Action Buttons */}
          <View
            style={{ gap: 12, marginBottom: 20, transform: [{ scaleY: -1 }] }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#10B981",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Buy Now
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: "100%", backgroundColor: "white" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                transform: [{ scaleY: -1 }],
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
          {/* Description Section */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F172A",
                marginBottom: 12,
              }}
            >
              Product Description
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: "#374151",
                marginBottom: 16,
              }}
            >
              {product.description}
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: "#374151",
                marginBottom: 16,
              }}
            >
              This premium product from {product.brand} represents the perfect
              blend of quality, functionality, and value. Designed with
              attention to detail and built to last, it&apos;s an excellent
              choice for anyone looking for reliability and performance.
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: "#374151",
              }}
            >
              Whether you&apos;re a professional or an enthusiast, this product
              delivers consistent results and exceeds expectations. Join
              thousands of satisfied customers who have made this their go-to
              choice.
            </Text>
          </View>
          {/* Features Section */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F172A",
                marginBottom: 16,
              }}
            >
              Key Features
            </Text>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Shield color="#10B981" size={20} />
                <Text
                  style={{ marginLeft: 12, color: "#374151", fontSize: 16 }}
                >
                  1 year warranty included
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Truck color="#007AFF" size={20} />
                <Text
                  style={{ marginLeft: 12, color: "#374151", fontSize: 16 }}
                >
                  Free delivery within 3-5 days
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Star color="#FCD34D" size={20} />
                <Text
                  style={{ marginLeft: 12, color: "#374151", fontSize: 16 }}
                >
                  Premium quality certified
                </Text>
              </View>
            </View>
          </View>
          {/* Main Product Card */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              marginBottom: 20,
              transform: [{ scaleY: -1 }],
              display: "flex",
            }}
          >
            {/* Brand and Product Name */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              {product.brand}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 16,
              }}
            >
              {product.product_name}
            </Text>

            {/* Category and Rating */}
            <View
              style={{
                // alignItems: "center",
                marginBottom: 16,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  //   marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  {product.category}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#D1D5DB" size={16} />
                <Text style={{ marginLeft: 8, color: "#6B7280", fontSize: 14 }}>
                  4.0 (128 reviews)
                </Text>
              </View>
            </View>

            {/* Price */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#007AFF",
                marginBottom: 8,
              }}
            >
              ₹{product.price.toLocaleString()}
            </Text>
            <Text style={{ color: "#10B981", fontSize: 14, marginBottom: 24 }}>
              Free shipping • In stock
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      {loading && (
        <SafeAreaView
          style={{
            height: "100%",
            backgroundColor: "#ffffff",
            position: "absolute",
            width: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingVertical: 10, paddingRight: 12 }}
            >
              <ArrowLeft color="#007AFF" size={22} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#0F172A",
                flex: 1,
                textAlign: "center",
              }}
            >
              Product Details
            </Text>
            <View style={{ width: 22 }} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 16, color: "#64748B" }}>
              Loading product...
            </Text>
          </View>
        </SafeAreaView>
      )}
    </>
  );
}
