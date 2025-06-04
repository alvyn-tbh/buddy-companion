import { motion } from "framer-motion";

export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <motion.h1
          whileHover={{ scale: 1.00 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Meet your Corporate Wellness Companion
        </motion.h1>

        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-40 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-40 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl leading-relaxed"
        >
          Designed by the Binary Holdings
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
        </motion.div>
      </motion.div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-40 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl animate-float dark:bg-purple-600/20" />
        <div className="absolute bottom-40 right-40 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl animate-float-delayed dark:bg-indigo-600/20" />
      </div>
    </div>
  );
};
