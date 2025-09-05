import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Filter, SortAsc } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";

type Product = {
  id: string;
  brand: string;
  product_name: string;
  price: number;
  category: string;
  description: string;
};

const BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}:3000`;

export default function Catalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "newest">(
    "newest"
  );
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchPage = async (reset = false) => {
    if (loading) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        pageSize: "10",
        sort,
      });
      console.log(params, "params");
      if (query.trim()) params.set("q", query.trim());
      if (category) {
        params.set("category", category);
        params.set("all", "true"); // when filtering, fetch all results (no pagination)
      }

      const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
      console.log(res, "res");
      const json = await res.json();
      setTotalPages(json.totalPages || 1);
      if (reset) setItems(json.items || []);
      else setItems((prev) => [...prev, ...(json.items || [])]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/products/categories`);
        const j = await r.json();
        setCategories(Array.isArray(j.categories) ? j.categories : []);
      } catch {}
    })();
  }, []);

  const onSearch = () => {
    setPage(1);
    fetchPage(true);
  };
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        onPress={() => router.push(`/product/${item.id}` as any)}
        style={styles.productCard}
      >
        <Text style={styles.productTitle}>
          {item.brand} — {item.product_name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <Text style={styles.productDetailHint}>Tap for details →</Text>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <StatusBar style="dark" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#007AFF" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catalog</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search products"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() =>
              setSort(sort === "price_asc" ? "price_desc" : "price_asc")
            }
            style={styles.sortButton}
          >
            <SortAsc color="#0F172A" size={18} />
            <Text style={styles.sortButtonText}>
              {sort === "price_asc" ? "Price ↑" : "Price ↓"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCategory(null)}
            style={[
              styles.filterButton,
              category === null && styles.filterButtonActive,
            ]}
          >
            <Filter
              color={category === null ? "#ffffff" : "#0F172A"}
              size={18}
            />
            <Text
              style={[
                styles.filterButtonText,
                category === null && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <FlatList
            data={categories}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesList}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(category === item ? null : item)}
                style={[
                  styles.filterButton,
                  category === item && styles.filterButtonActive,
                ]}
              >
                <Filter
                  color={category === item ? "#ffffff" : "#0F172A"}
                  size={18}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    category === item && styles.filterButtonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </View>

      <FlashList
        data={items}
        extraData={{ loading, category, sort }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => {
          if (loading || category || page >= totalPages) return;
          const next = page + 1;
          setPage(next);
          fetchPage();
        }}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#007AFF" />
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No products</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#ffffff",
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
  searchSection: {
    backgroundColor: "#ffffff",
    gap: 10,
    paddingTop: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#0F172A",
  },
  searchButton: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  filtersScrollView: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  filtersContainer: {
    gap: 10,
  },
  sortButton: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sortButtonText: {
    marginLeft: 8,
    color: "#0F172A",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    marginLeft: 8,
    color: "#0F172A",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: 10,
  },
  categoriesList: {
    marginRight: 16,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  productTitle: {
    fontWeight: "600",
    color: "#0F172A",
  },
  productCategory: {
    color: "#64748B",
    marginTop: 4,
  },
  productPrice: {
    color: "#007AFF",
    marginTop: 6,
    fontWeight: "700",
  },
  productDetailHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  loadingContainer: {
    paddingVertical: 16,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 24,
  },
});
