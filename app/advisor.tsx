import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { ArrowLeft, SendHorizonalIcon, X } from "lucide-react-native";
import { router } from "expo-router";
import EventSource, { EventSourceListener } from "react-native-sse";
import "react-native-url-polyfill/auto";
import { StatusBar } from "expo-status-bar";

// const BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}:3000`;
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.6:3000";

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
  candidates?: Product[] | null;
  mode?: "more_products" | "single" | string;
};

type SSEEvents = "progress" | "final" | "error" | "tokens";

const Header = ({
  onClearConversation,
}: {
  onClearConversation: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { top } = insets;
  return (
    <View style={[styles.headerContainer, { paddingTop: top + 10 }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.headerButton}
      >
        <ArrowLeft color="#007AFF" size={24} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onClearConversation}
        style={styles.headerButton}
      >
        <X color="#007AFF" size={24} />
      </TouchableOpacity>
    </View>
  );
};

interface AdvisorSSERef {
  clearConversation: () => Promise<void>;
}

const AdvisorSSE = forwardRef<AdvisorSSERef>((props, ref) => {
  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState<
    | "idle"
    | "connecting"
    | "retrieving"
    | "reasoning"
    | "fetching_product"
    | "done"
    | "error"
  >("idle");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Streaming logic
  const streamQueueRef = useRef<string[]>([]);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgIdRef.current
            ? { ...m, content: m.content + ch }
            : m
        )
      );
    }, intervalMs);
  }

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
          mode: m.mode || undefined,
        }));
        setMessages(restored);
      } catch {}
    })();
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.removeAllEventListeners();
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const startAdvice = useCallback(() => {
    if (!queryText.trim() || isBusy) return;

    const userMsg: ChatMsg = {
      id: String(Date.now()) + "_user",
      role: "user",
      content: queryText.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setStatus("connecting");
    setIsBusy(true);

    streamQueueRef.current = [];
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    streamingMsgIdRef.current = null;

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
      pollingInterval: 0,
    });
    esRef.current = es;

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
        if (data.stage === "fetching_product")
          label = "Fetching product details…";
        if (!streamingStartedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: label } : m
            )
          );
        }
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

      if (!streamingStartedRef.current) {
        streamingStartedRef.current = true;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: "" } : m))
        );
      }

      for (const ch of token) streamQueueRef.current.push(ch);

      if (!streamTimerRef.current) startDrain(assistantId, 14); // tweak speed here
    };

    const onFinal: EventSourceListener<SSEEvents, "final"> = (ev) => {
      console.log("[SSE] final", ev.data);
      try {
        const data = JSON.parse(ev.data || "{}");
        const product: Product | null = data.product || null;
        const rationale: string = data.rationale || "";
        const candidates: Product[] | null = data.candidates || null;
        const mode: string | undefined = data.mode || undefined;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, product, candidates, mode } : m
          )
        );

        setTimeout(() => {
          if (
            !streamQueueRef.current.length &&
            streamingMsgIdRef.current === assistantId
          ) {
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
    es.addEventListener("message", onOpen);
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

  const clearConversation = async () => {
    try {
      setIsBusy(true);
      await fetch(`${BASE_URL}/messages/clear`, { method: "POST" });
      setMessages([]);
      setStatus("idle");
    } finally {
      setIsBusy(false);
    }
  };

  useImperativeHandle(ref, () => ({
    clearConversation,
  }));

  console.log(messages);
  AdvisorSSE.displayName = "AdvisorSSE";
  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" translucent={true} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Hey There</Text>
            <Text style={styles.emptySubtitle}>
              I'm your AI advisor. -- ready to chat, answer and assist
            </Text>
            <Text style={styles.emptyCallToAction}>Just say the word.</Text>
          </View>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.messageBase,
                m.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  m.role === "user"
                    ? styles.userMessageText
                    : styles.assistantMessageText,
                ]}
              >
                {m.content}
                {m.role === "assistant" &&
                streamingMsgIdRef.current === m.id &&
                status !== "done" &&
                status !== "error"
                  ? " ▍"
                  : ""}
              </Text>
              {/* Show the primary selected product when present */}
              {m.product ? (
                <TouchableOpacity
                  onPress={() =>
                    m.product?.id &&
                    router.push(`/product/${m.product.id}` as any)
                  }
                  style={styles.productContainer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.productTitle}>
                    {m.product.brand} — {m.product.product_name}
                  </Text>
                  <Text style={styles.productDetails}>
                    {m.product.category} • ₹{m.product.price}
                  </Text>
                  <Text style={styles.productLink}>View details →</Text>
                </TouchableOpacity>
              ) : null}
              {/* Only show candidate products when backend marks mode as more_products */}
              {m.mode === "more_products" &&
              m.candidates &&
              m.candidates.length ? (
                <View style={styles.candidatesContainer}>
                  {m.candidates.map((p, idx) => (
                    <TouchableOpacity
                      onPress={() =>
                        p?.id && router.push(`/product/${p.id}` as any)
                      }
                      key={p.id || String(idx)}
                      style={[
                        styles.candidateCard,
                        idx > 0 && styles.candidateCardSpacing,
                      ]}
                    >
                      <Text style={styles.candidateTitle}>
                        {p.brand} — {p.product_name}
                      </Text>
                      <Text style={styles.candidateDetails}>
                        {p.category} • ₹{p.price}
                      </Text>
                      <Text style={styles.candidateLink}>View details →</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={queryText}
          onChangeText={setQueryText}
          placeholder="What Product are you looking for?"
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!isBusy}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: queryText.trim() && !isBusy ? 1 : 0.5 },
          ]}
          onPress={startAdvice}
          disabled={!queryText.trim() || isBusy}
        >
          <SendHorizonalIcon color="#fff" size={31} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
});

const Advisor = () => {
  const advisorSSERef = useRef<AdvisorSSERef>(null);

  const handleClearConversation = () => {
    advisorSSERef.current?.clearConversation();
  };
  return (
    <View style={{ flex: 1 }}>
      <Header onClearConversation={handleClearConversation} />
      <AdvisorSSE ref={advisorSSERef} />
    </View>
  );
};

export default Advisor;

const styles = StyleSheet.create({
  // Main container
  mainContainer: {
    flex: 1,
  },

  // Header styles
  headerContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerButton: {
    width: "15%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Chat container
  chatContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Messages
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    height: "100%",
  },
  emptyText: {
    fontSize: 26,
    fontWeight: "900",
    color: "black",
    textAlign: "center",
  },
  emptySubtitle: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  emptyCallToAction: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#374151",
    textAlign: "center",
  },

  // Message bubbles
  messageBase: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: "#111827",
  },

  // Product display
  productContainer: {
    marginTop: 10,
  },
  productTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  productDetails: {
    color: "#6b7280",
    fontSize: 12,
  },
  productLink: {
    color: "#3b82f6",
    fontSize: 12,
    marginTop: 4,
  },

  // Candidates
  candidatesContainer: {
    marginTop: 10,
    gap: 8,
  },
  candidateCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  candidateCardSpacing: {
    marginTop: 6,
  },
  candidateTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  candidateDetails: {
    color: "#6b7280",
    fontSize: 12,
  },
  candidateLink: {
    color: "#3b82f6",
    fontSize: 12,
    marginTop: 4,
  },

  // Input container
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
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    color: "#1f2937",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Unused styles (kept for reference)
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#007AFF",
    borderBottomWidth: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#ffffff",
    flex: 1,
  },
  seedBtn: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
});
