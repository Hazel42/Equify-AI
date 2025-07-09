import { useState, useRef, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Heart,
  Gift,
  TrendingUp,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRelationships } from "@/hooks/useRelationships";
import { useFavorsEnhanced } from "@/hooks/useFavorsEnhanced";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  type?: "text" | "insight" | "recommendation";
  metadata?: any;
}

interface ConversationContext {
  recentRelationships: any[];
  recentFavors: any[];
  userPersonality: string;
  conversationHistory: ChatMessage[];
}

const EnhancedAIChatComponent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { relationships } = useRelationships();
  const { favors, getFavorStats } = useFavorsEnhanced();

  const handleQuickAction = async (action: string) => {
    const quickMessages = {
      insights: "Can you give me insights about my relationships?",
      balance: "How is my give-and-take balance with my relationships?",
      suggestions: "What are some ways I can strengthen my relationships?",
      patterns: "What patterns do you notice in my relationship interactions?",
      goals: "Help me set relationship goals for this month",
    };

    const messageText = quickMessages[action as keyof typeof quickMessages];
    if (messageText) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: messageText,
        sender: "user",
        timestamp: new Date().toISOString(),
        type: "text",
      };

      setConversation((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        await chatMutation.mutateAsync(messageText);
      } catch (error) {
        console.error("Quick action error:", error);
        setIsTyping(false);
      }
    }
  };

  // Listen for quick actions
  useEffect(() => {
    const handleGlobalQuickAction = (event: CustomEvent) => {
      const { action, activeTab } = event.detail;

      if (activeTab === "ai-chat" && action === "quick-ai-message") {
        // Send a quick AI message
        handleQuickAction("insights");
      }
    };

    window.addEventListener(
      "quick-action",
      handleGlobalQuickAction as EventListener,
    );
    return () =>
      window.removeEventListener(
        "quick-action",
        handleGlobalQuickAction as EventListener,
      );
  }, []);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize welcome message only once
  useEffect(() => {
    if (!isInitialized && user?.id) {
      setConversation([
        {
          id: "welcome",
          content:
            "Hi! I'm your relationship AI assistant. I can help you understand your relationships, suggest ways to strengthen connections, and provide insights based on your interaction patterns. What would you like to explore today?",
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      ]);
      setIsInitialized(true);
    }
  }, [user?.id, isInitialized]);

  // Get user context for AI
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Prepare context using enhanced hooks
  const favorStats = getFavorStats();
  const recentFavors = favors?.slice(0, 10) || [];
  const recentRelationships = relationships?.slice(0, 5) || [];

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const contextData: ConversationContext = {
        recentRelationships: recentRelationships,
        recentFavors: recentFavors,
        userPersonality: profile?.personality_type || "unknown",
        conversationHistory: conversation.slice(-5), // Last 5 messages for context
      };

      const { data, error } = await supabase.functions.invoke(
        "ai-chat-assistant",
        {
          body: {
            message: userMessage,
            userId: user?.id,
            context: contextData,
            language: "en",
          },
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: data.type || "text",
        metadata: data.metadata,
      };

      setConversation((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Chat Error",
        description:
          "Sorry, I'm having trouble responding right now. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setConversation((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    await chatMutation.mutateAsync(message);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const MessageBubble = ({ msg }: { msg: ChatMessage }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      {msg.sender === "ai" && (
        <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500">
          <AvatarFallback>
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] ${msg.sender === "user" ? "order-first" : ""}`}
      >
        <div
          className={`p-3 rounded-2xl ${
            msg.sender === "user"
              ? "bg-green-600 text-white"
              : msg.type === "insight"
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm leading-relaxed">{msg.content}</p>

          {msg.type === "insight" && msg.metadata && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Lightbulb className="h-3 w-3" />
                <span>AI Insight</span>
                {msg.metadata.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(msg.metadata.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          {msg.sender === "ai" && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyMessage(msg.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {msg.sender === "user" && (
        <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-500">
          <AvatarFallback>
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Relationship Assistant
            <Badge variant="secondary" className="ml-auto">
              Online
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("insights")}
              className="h-auto p-2 text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Get Insights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("balance")}
              className="h-auto p-2 text-xs"
            >
              <Heart className="h-3 w-3 mr-1" />
              Check Balance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("suggestions")}
              className="h-auto p-2 text-xs"
            >
              <Gift className="h-3 w-3 mr-1" />
              Get Suggestions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("patterns")}
              className="h-auto p-2 text-xs"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Find Patterns
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {conversation.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me about your relationships..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are generated and may not always be accurate
          </p>
        </div>
      </Card>
    </div>
  );
};

export const EnhancedAIChat = memo(EnhancedAIChatComponent);
