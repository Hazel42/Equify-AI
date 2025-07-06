import { motion } from "framer-motion";
import { Heart, Users, Gift, Sparkles } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen = ({
  message = "Loading your relationships...",
  showLogo = true,
}: LoadingScreenProps) => {
  const icons = [Heart, Users, Gift, Sparkles];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        {showLogo && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Equify</h1>
            <p className="text-green-600 text-sm">Empowering relationships</p>
          </motion.div>
        )}

        {/* Animated Icons */}
        <div className="flex justify-center gap-4 mb-6">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ y: 0 }}
              animate={{ y: [-10, 0, -10] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
              className="p-3 bg-white rounded-full shadow-sm"
            >
              <Icon className="h-5 w-5 text-green-600" />
            </motion.div>
          ))}
        </div>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 text-sm"
        >
          {message}
        </motion.p>

        {/* Loading Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2,
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
