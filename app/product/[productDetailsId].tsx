import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
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

// const BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}:3000`;
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.6:3000";
export default function ProductDetails() {
  const { productDetailsId: id } = useLocalSearchParams<{
    productDetailsId: string;
  }>();
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

        if (productData.category) {
          fetchSimilarProducts(productData.category, productData.id);
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
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

  const handleContentSizeChange = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#007AFF" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
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
      {/* main product content */}
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#007AFF" size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          stickyHeaderIndices={[4]}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Product Details Footer */}
          <View style={styles.productFooter}>
            <Text style={styles.productId}>Product ID: {product.id}</Text>
            <Text style={styles.listedDate}>
              Listed since {new Date(product.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* Similar Products Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Similar Products in {product.category}
            </Text>

            {loadingSimilar ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#007AFF" />
                <Text style={styles.loadingText}>
                  Loading similar products...
                </Text>
              </View>
            ) : similarProducts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.similarProductsRow}>
                  {similarProducts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => router.push(`/product/${item.id}` as any)}
                      style={styles.similarProductCard}
                    >
                      <Text style={styles.similarProductName} numberOfLines={2}>
                        {item.brand} — {item.product_name}
                      </Text>
                      <Text style={styles.similarProductCategory}>
                        {item.category}
                      </Text>
                      <Text style={styles.similarProductPrice}>
                        ₹{item.price.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={styles.noProductsText}>
                No similar products found
              </Text>
            )}
          </View>

          {/* Specifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationsContainer}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Brand</Text>
                <Text style={styles.specValue}>{product.brand}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Category</Text>
                <Text style={styles.specValue}>{product.category}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Model</Text>
                <Text style={styles.specValue}>{product.product_name}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Warranty</Text>
                <Text style={styles.specValue}>1 Year</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buyNowButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addToCartContainer}>
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
            <Text style={styles.descriptionText}>
              This premium product from {product.brand} represents the perfect
              blend of quality, functionality, and value. Designed with
              attention to detail and built to last, it's an excellent choice
              for anyone looking for reliability and performance.
            </Text>
            <Text style={styles.descriptionText}>
              Whether you're a professional or an enthusiast, this product
              delivers consistent results and exceeds expectations. Join
              thousands of satisfied customers who have made this their go-to
              choice.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Shield color="#10B981" size={20} />
                <Text style={styles.featureText}>1 year warranty included</Text>
              </View>
              <View style={styles.featureRow}>
                <Truck color="#007AFF" size={20} />
                <Text style={styles.featureText}>
                  Free delivery within 3-5 days
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Star color="#FCD34D" size={20} />
                <Text style={styles.featureText}>
                  Premium quality certified
                </Text>
              </View>
            </View>
          </View>

          {/* Main Product Card */}
          <View style={styles.productCard}>
            <Text style={styles.brandTitle}>{product.brand}</Text>
            <Text style={styles.productTitle}>{product.product_name}</Text>

            <View style={styles.categoryRatingContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#FCD34D" size={16} fill="#FCD34D" />
                <Star color="#D1D5DB" size={16} />
                <Text style={styles.ratingText}>4.0 (128 reviews)</Text>
              </View>
            </View>

            <Text style={styles.priceText}>
              ₹{product.price.toLocaleString()}
            </Text>
            <Text style={styles.stockText}>Free shipping • In stock</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Loading state */}
      {loading && (
        <SafeAreaView style={styles.loadingOverlay}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft color="#007AFF" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.mainLoadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.mainLoadingText}>Loading product...</Text>
          </View>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    paddingVertical: 10,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  scrollViewContent: {
    padding: 16,
  },
  productFooter: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    transform: [{ scaleY: -1 }],
  },
  productId: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 8,
  },
  listedDate: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    transform: [{ scaleY: -1 }],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  similarProductsRow: {
    flexDirection: "row",
    gap: 12,
  },
  similarProductCard: {
    width: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  similarProductName: {
    fontWeight: "600",
    color: "#0F172A",
    fontSize: 14,
    marginBottom: 4,
  },
  similarProductCategory: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 8,
  },
  similarProductPrice: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "700",
  },
  noProductsText: {
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
  specificationsContainer: {
    gap: 12,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  specLabel: {
    color: "#6B7280",
    fontSize: 16,
  },
  specValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    gap: 12,
    marginBottom: 20,
    transform: [{ scaleY: -1 }],
  },
  buyNowButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buyNowButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  addToCartContainer: {
    width: "100%",
    backgroundColor: "white",
  },
  addToCartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    transform: [{ scaleY: -1 }],
    marginBottom: 15,
  },
  addToCartButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    marginLeft: 12,
    color: "#374151",
    fontSize: 16,
  },
  productCard: {
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
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  categoryRatingContainer: {
    marginBottom: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  categoryBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  priceText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#007AFF",
    marginBottom: 8,
  },
  stockText: {
    color: "#10B981",
    fontSize: 14,
    marginBottom: 24,
  },
  loadingOverlay: {
    height: "100%",
    backgroundColor: "#ffffff",
    position: "absolute",
    width: "100%",
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainLoadingText: {
    marginTop: 16,
    color: "#64748B",
  },
});
