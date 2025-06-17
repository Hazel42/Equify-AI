
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, Sparkles, Heart, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRelationships } from "@/hooks/useRelationships";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'suggestion' | 'advice' | 'question';
}

export const AIChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { relationships } = useRelationships();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your relationship advisor. I can help you with:\n\n• Relationship advice and strategies\n• Analyzing your favor patterns\n• Suggestions for strengthening connections\n• Timing recommendations for reaching out\n\nWhat would you like to discuss about your relationships?`,
        timestamp: new Date(),
        type: 'advice'
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: input.trim(),
          userId: user.id,
          relationshipContext: relationships.map(r => ({
            name: r.name,
            type: r.relationship_type,
            importance: r.importance_level
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm here to help with your relationships. Could you tell me more about what you'd like to discuss?",
        timestamp: new Date(),
        type: data.type || 'advice'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Let me give you some general relationship advice: Focus on consistent, meaningful interactions with the people who matter most to you.",
        timestamp: new Date(),
        type: 'advice'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Having trouble with AI assistant, but you can still use the chat.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') return User;
    switch (message.type) {
      case 'suggestion': return Sparkles;
      case 'advice': return Heart;
      case 'question': return MessageCircle;
      default: return Bot;
    }
  };

  const quickPrompts = [
    "How can I improve my relationship balance?",
    "What should I do when someone doesn't reciprocate?",
    "How often should I reach out to friends?",
    "Tips for maintaining long-distance relationships"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            AI Relationship Assistant
          </h2>
          <p className="text-gray-600">Get personalized advice for managing your relationships</p>
        </div>
        <Badge className="bg-green-100 text-green-700">
          <Users className="h-3 w-3 mr-1" />
          {relationships.length} Relationships
        </Badge>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Relationship Advisor Chat</CardTitle>
          <CardDescription>Ask questions, get advice, and improve your relationships</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => {
                const Icon = getMessageIcon(message);
                return (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}>
                        <Icon className={`h-4 w-4 ${message.role === 'user' ? 'text-blue-600' : 'text-green-600'}`} />
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100">
                      <Bot className="h-4 w-4 text-green-600 animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Quick prompts to get started:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto p-2 text-xs"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your relationships..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
