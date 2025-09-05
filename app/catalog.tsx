import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
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

const BASE_URL = "http://192.168.1.7:3000"; // align with advisor.tsx

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
    // initial and when sort/category changes
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
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          padding: 14,
          marginBottom: 12,
          backgroundColor: "#ffffff",
        }}
      >
        <Text style={{ fontWeight: "600", color: "#0F172A" }}>
          {item.brand} — {item.product_name}
        </Text>
        <Text style={{ color: "#64748B", marginTop: 4 }}>{item.category}</Text>
        <Text style={{ color: "#007AFF", marginTop: 6, fontWeight: "700" }}>
          ₹{item.price}
        </Text>
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 12,
            marginTop: 4,
            textAlign: "right",
          }}
        >
          Tap for details →
        </Text>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <StatusBar style="dark" translucent={true} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          backgroundColor: "#ffffff",
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
          Catalog
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ backgroundColor: "#ffffff", gap: 10, paddingTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginHorizontal: 10,
          }}
        >
          <TextInput
            placeholder="Search products"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              color: "#0F172A",
            }}
          />
          <TouchableOpacity
            onPress={onSearch}
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#007AFF",
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}
          contentContainerStyle={{
            gap: 10,
          }}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() =>
              setSort(sort === "price_asc" ? "price_desc" : "price_asc")
            }
            style={{
              marginLeft: 10,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F1F5F9",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <SortAsc color="#0F172A" size={18} />
            <Text style={{ marginLeft: 8, color: "#0F172A" }}>
              {sort === "price_asc" ? "Price ↑" : "Price ↓"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCategory(null)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: category === null ? "#007AFF" : "#F1F5F9",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Filter
              color={category === null ? "#ffffff" : "#0F172A"}
              size={18}
            />
            <Text
              style={{
                marginLeft: 8,
                color: category === null ? "#ffffff" : "#0F172A",
              }}
            >
              All
            </Text>
          </TouchableOpacity>
          <FlatList
            data={categories}
            contentContainerStyle={{
              flexDirection: "row",
              gap: 10,
            }}
            style={{ marginRight: 16 }}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(category === item ? null : item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: category === item ? "#007AFF" : "#F1F5F9",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Filter
                  color={category === item ? "#ffffff" : "#0F172A"}
                  size={18}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: category === item ? "#ffffff" : "#0F172A",
                  }}
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
        keyExtractor={(item) => item.id} // set to your average row height
        renderItem={renderItem}
        // getItemType={() => "product"} // optional for homogeneous items
        contentContainerStyle={{ padding: 16 }}
        onEndReached={() => {
          if (loading || category || page >= totalPages) return;
          const next = page + 1;
          setPage(next);
          fetchPage();
        }}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loading ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator color="#007AFF" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text
            style={{ color: "#64748B", textAlign: "center", marginTop: 24 }}
          >
            No products
          </Text>
        }
      />
    </View>
  );
}
