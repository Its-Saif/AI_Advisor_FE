import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, ShoppingCart, Database } from "lucide-react-native";
import { router } from "expo-router";
import EventSource, { EventSourceListener } from "react-native-sse";
import "react-native-url-polyfill/auto";

const BASE_URL = "http://192.168.1.7:3000"; // CHANGE to your machine’s LAN IP:PORT

type Product = {
  id: string;
  brand: string;
  product_name: string;
  price: number;
  category: string;
  description: string;
};

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  product?: Product | null;
};

type SSEEvents = "progress" | "final" | "error" | "tokens";

const Header = () => {
  const insets = useSafeAreaInsets();
  const { top } = insets;
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#1e293b",
        paddingTop: top + 10,
        paddingBottom: 20,
        flexDirection: "row",
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
      >
        <ArrowLeft color={"#FFD700"} size={24} />
      </TouchableOpacity>
      <View
        style={{
          width: "80%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
            flex: 1,
          }}
        >
          Advisor
        </Text>
      </View>
      <View
        style={{ width: "10%", justifyContent: "center", alignItems: "center" }}
      >
        <ShoppingCart color={"#FFD700"} size={24} />
      </View>
    </View>
  );
};

const Footer = () => {
  const insets = useSafeAreaInsets();
  const { bottom } = insets;
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#1e293b",
        paddingBottom: bottom + 10,
      }}
    >
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>Footer Content</Text>
      </View>
    </View>
  );
};

const AdvisorSSE = () => {
  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "connecting" | "retrieving" | "reasoning" | "fetching_product" | "done" | "error"
  >("idle");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Streaming machinery
  const streamQueueRef = useRef<string[]>([]);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);
  const streamingStartedRef = useRef<boolean>(false);

  function startDrain(assistantId: string, intervalMs = 12) {
    streamingMsgIdRef.current = assistantId;
    if (streamTimerRef.current) return;
    streamTimerRef.current = setInterval(() => {
      const ch = streamQueueRef.current.shift();
      if (!ch) {
        clearInterval(streamTimerRef.current!);
        streamTimerRef.current = null;
        return;
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingMsgIdRef.current ? { ...m, content: m.content + ch } : m
        )
      );
    }, intervalMs);
  }

  // Clean up timer when unmounting or starting a new run
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.removeAllEventListeners();
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const seedCatalog = useCallback(async () => {
    try {
      setIsBusy(true);
      const res = await fetch(`${BASE_URL}/ingest`, { method: "POST" });
      const json = await res.json();
      setStatus("idle");
      alert(json.ok ? "Ingest successful" : "Ingest failed");
    } catch (e: any) {
      alert("Ingest failed: " + (e?.message || "Unknown error"));
    } finally {
      setIsBusy(false);
    }
  }, []);

  const startAdvice = useCallback(() => {
    if (!queryText.trim() || isBusy) return;

    // Push user message
    const userMsg: ChatMsg = {
      id: String(Date.now()) + "_user",
      role: "user",
      content: queryText.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setStatus("connecting");
    setIsBusy(true);

    // reset stream buffers for new turn
    streamQueueRef.current = [];
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    streamingMsgIdRef.current = null;

    // Clean up any previous stream
    if (esRef.current) {
      esRef.current.removeAllEventListeners();
      esRef.current.close();
      esRef.current = null;
    }

    const url = new URL(`${BASE_URL}/advice`);
    const es = new EventSource<SSEEvents>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" } as any,
      body: JSON.stringify({ query: userMsg.content }),
      pollingInterval: 0, // do not auto-reconnect for a single run
    });
    esRef.current = es;

    // Create an empty assistant message to stream tokens into
    const assistantId = String(Date.now()) + "_assistant";
    streamingStartedRef.current = false;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "Processing…" },
    ]);

    const onOpen: EventSourceListener<SSEEvents> = (event) => {
      if (event.type === "open") {
        console.log("[SSE] open");
        setStatus("retrieving");
      } else if (event.type === "error") {
        console.log("[SSE] open:error", event);
        setStatus("error");
        setIsBusy(false);
      }
    };

    const onProgress: EventSourceListener<SSEEvents, "progress"> = (ev) => {
      console.log("[SSE] progress", ev.data);
      try {
        const data = JSON.parse(ev.data || "{}");
        let label = "Processing…";
        if (data.stage === "retrieving") label = "Searching products…";
        if (data.stage === "reasoning") label = "Thinking…";
        if (data.stage === "fetching_product") label = "Fetching product details…";
        // Update the active assistant bubble with the label only if streaming hasn't begun
        if (!streamingStartedRef.current) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: label } : m))
          );
        }
        // Keep old status top bar in sync (optional)
        if (data.stage === "retrieving") setStatus("retrieving");
        if (data.stage === "reasoning") setStatus("reasoning");
        if (data.stage === "fetching_product") setStatus("fetching_product");
      } catch {}
    };

    const onTokens: EventSourceListener<SSEEvents, "tokens"> = (ev) => {
      console.log("[SSE] tokens", ev.data);
      let token = "";
      try {
        const data = JSON.parse(ev.data || "{}");
        token = data.token || "";
      } catch {}
      if (!token) return;

      // First token: clear any status label in the bubble
      if (!streamingStartedRef.current) {
        streamingStartedRef.current = true;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: "" } : m))
        );
      }

      // enqueue characters for smooth streaming
      for (const ch of token) streamQueueRef.current.push(ch);

      // start drain loop if not running
      if (!streamTimerRef.current) startDrain(assistantId, 14); // tweak speed here
    };

    const onFinal: EventSourceListener<SSEEvents, "final"> = (ev) => {
      console.log("[SSE] final", ev.data);
      try {
        const data = JSON.parse(ev.data || "{}");
        const product: Product | null = data.product || null;
        const rationale: string = data.rationale || "";

        // attach product; keep whatever has streamed so far
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, product } : m
          )
        );

        // Optional: ensure we end exactly on final rationale once queue empties
        // If you want a perfect match, you can do this small sync after a short delay:
        setTimeout(() => {
          if (!streamQueueRef.current.length && streamingMsgIdRef.current === assistantId) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: rationale } : m
              )
            );
          }
        }, 200);

        setStatus("done");
      } catch {
        setStatus("error");
      } finally {
        setIsBusy(false);
        es.removeAllEventListeners();
        es.close();
        esRef.current = null;
      }
    };

    const onErrEvt: EventSourceListener<SSEEvents, "error"> = (ev) => {
      console.log("[SSE] error", ev);
      setStatus("error");
      setIsBusy(false);
      es.removeAllEventListeners();
      es.close();
      esRef.current = null;
    };

    es.addEventListener("open", onOpen);
    es.addEventListener("message", onOpen); // not used by server, but safe
    es.addEventListener("error", onOpen);
    es.addEventListener("progress", onProgress);
    es.addEventListener("tokens", onTokens);
    es.addEventListener("final", onFinal);
    es.addEventListener("error", onErrEvt);

    setQueryText("");
  }, [queryText, isBusy]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, status]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/messages`);
        const json = await res.json();
        const restored = (json.messages || []).map((m: any) => ({
          id: String(m.id),
          role: m.role,
          content: m.content,
          product: m.product || undefined,
          candidates: m.candidates || undefined,
        }));
        setMessages(restored);
      } catch {}
    })();
  }, []);

  const statusLabel =
    status === "idle"
      ? "Idle"
      : status === "connecting"
      ? "Connecting…"
      : status === "retrieving"
      ? "Searching products…"
      : status === "reasoning"
      ? "Thinking…"
      : status === "fetching_product"
      ? "Fetching product details…"
      : status === "done"
      ? "Done"
      : "Error";

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                status === "error" ? "#ef4444" : status === "done" ? "#10b981" : "#f59e0b",
            },
          ]}
        />
        <Text style={styles.statusText}>{statusLabel}</Text>
        <TouchableOpacity
          style={[styles.seedBtn, { opacity: isBusy ? 0.6 : 1 }]}
          onPress={seedCatalog}
          disabled={isBusy}
        >
          <Database color="#fff" size={16} />
          <Text style={{ color: "#fff", marginLeft: 6 }}>Seed catalog</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Describe your needs and get the best product recommendation.
            </Text>
          </View>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[
                { marginVertical: 6, padding: 12, borderRadius: 12, maxWidth: "85%" },
                m.role === "user"
                  ? { alignSelf: "flex-end", backgroundColor: "#3b82f6" }
                  : { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
              ]}
            >
              <Text style={{ color: m.role === "user" ? "#fff" : "#111827", fontSize: 15, lineHeight: 20 }}>
                {m.content}
                {m.role === "assistant" && streamingMsgIdRef.current === m.id && status !== "done" && status !== "error" ? " ▍" : ""}
              </Text>
              {m.product ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {m.product.brand} — {m.product.product_name}
                  </Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    {m.product.category} • ₹{m.product.price}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
      <TouchableOpacity
  style={[styles.seedBtn, { marginRight: 8, backgroundColor: '#ef4444', opacity: isBusy ? 0.6 : 1 }]}
  onPress={async () => {
    try {
      setIsBusy(true);
      await fetch(`${BASE_URL}/messages/clear`, { method: 'POST' });
      setMessages([]);
      setStatus('idle');
    } finally {
      setIsBusy(false);
    }
  }}
  disabled={isBusy}
>
  <Text style={{ color: '#fff' }}>Clear chat</Text>
</TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={queryText}
          onChangeText={setQueryText}
          placeholder="e.g., I need a device for neck and shoulder relief"
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!isBusy}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: queryText.trim() && !isBusy ? 1 : 0.5 }]}
          onPress={startAdvice}
          disabled={!queryText.trim() || isBusy}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const advisor = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <AdvisorSSE />
      <Footer />
    </View>
  );
};

export default advisor;

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#0b1220",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#e5e7eb",
    flex: 1,
  },
  seedBtn: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    color: "#1f2937",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 24,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
