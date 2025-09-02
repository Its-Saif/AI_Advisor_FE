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
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowBigLeft,
  ArrowLeft,
  Send,
  ShoppingCart,
} from "lucide-react-native";
import { router } from "expo-router";

const Header = () => {
  const insets = useSafeAreaInsets();
  const { top } = insets;
  return (
    <View
      style={{
        // height: 80,
        // flex: 1,
        width: "100%",
        backgroundColor: "#1e293b",
        paddingTop: top + 10,
        paddingBottom: 20,
        flexDirection: "row",
        // justifyContent: "space-around",
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          width: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
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
        style={{
          width: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ShoppingCart
          color={"#FFD700"}
          size={24}
          style={{
            padding: 10,
            marginRight: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        />
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

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // WebSocket connection
  useEffect(() => {
    // Use your computer's IP address instead of localhost for React Native
    const WS_URL = "ws://192.168.1.7:8080";

    const connectWebSocket = () => {
      try {
        websocket.current = new WebSocket(WS_URL);

        websocket.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        websocket.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const aiMessage: Message = {
              id: Date.now().toString() + "_ai",
              text: data.message || event.data,
              sender: "ai",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
          } catch (error) {
            // If not JSON, treat as plain text
            const aiMessage: Message = {
              id: Date.now().toString() + "_ai",
              text: event.data,
              sender: "ai",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
          }
        };

        websocket.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };

        websocket.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = () => {
    if (inputText.trim() && websocket.current && isConnected) {
      // Add user message to chat
      const userMessage: Message = {
        id: Date.now().toString() + "_user",
        text: inputText.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send message to WebSocket server
      const messageData = {
        message: inputText.trim(),
        timestamp: new Date().toISOString(),
      };

      websocket.current.send(JSON.stringify(messageData));
      setInputText("");
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          message.sender === "user"
            ? styles.userMessageText
            : styles.aiMessageText,
        ]}
      >
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Connection status */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? "#10b981" : "#ef4444" },
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Start a conversation with your AI advisor
            </Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          onFocus={scrollToBottom}
          placeholder="Type your message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          editable={isConnected}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: inputText.trim() && isConnected ? 1 : 0.5 },
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || !isConnected}
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
      <AiChat />
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#64748b",
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
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  aiMessageText: {
    color: "#1f2937",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    color: "#9ca3af",
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
