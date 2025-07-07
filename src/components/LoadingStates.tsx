import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Bot, Users, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Enhanced Skeleton Components for specific content types

export const RelationshipCardSkeleton = () => (
  <Card className="bg-white border shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between text-xs mb-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

export const FavorCardSkeleton = () => (
  <Card className="hover:shadow-sm transition-shadow">
    <CardContent className="pt-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardContent className="p-4 text-center">
          <Skeleton className="h-8 w-8 mx-auto mb-2" />
          <Skeleton className="h-6 w-8 mx-auto mb-1" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChatMessageSkeleton = ({
  isUser = false,
}: {
  isUser?: boolean;
}) => (
  <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
    {!isUser && <Skeleton className="h-8 w-8 rounded-full" />}
    <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
      <div
        className={`p-3 rounded-2xl ${isUser ? "bg-green-100" : "bg-gray-100"}`}
      >
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
    {isUser && <Skeleton className="h-8 w-8 rounded-full" />}
  </div>
);

export const AITypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex gap-3"
  >
    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <div className="bg-gray-100 p-3 rounded-2xl">
      <div className="flex gap-1">
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  </motion.div>
);

export const AnalyticsChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-60" />
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-end justify-between gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

export const RecommendationCardSkeleton = () => (
  <Card className="hover:shadow-sm transition-shadow">
    <CardHeader>
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-3" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Animated Loading Overlay
export const LoadingOverlay = ({
  message = "Loading...",
  icon: Icon = Loader2,
}: {
  message?: string;
  icon?: any;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <Card className="p-6">
      <CardContent className="flex flex-col items-center space-y-4">
        <Icon className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm font-medium">{message}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Full Page Loading State
export const FullPageLoading = ({
  title = "Loading Application",
  subtitle = "Please wait while we prepare everything for you...",
}: {
  title?: string;
  subtitle?: string;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center"
      >
        <Heart className="h-8 w-8 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="flex justify-center space-x-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 bg-blue-500 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 bg-purple-500 rounded-full"
        />
      </div>
    </div>
  </div>
);

// Content Specific Loading States
export const RelationshipListLoading = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <RelationshipCardSkeleton key={i} />
    ))}
  </div>
);

export const FavorHistoryLoading = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <FavorCardSkeleton key={i} />
    ))}
  </div>
);

export const DashboardLoading = () => (
  <div className="space-y-6">
    <DashboardStatsSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnalyticsChartSkeleton />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);
