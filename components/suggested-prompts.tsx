"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { memo } from "react";

interface SuggestedPromptsProps {
  sendMessage: (input: string) => void;
}

function PureSuggestedPrompts({ sendMessage }: SuggestedPromptsProps) {
  const suggestedActions = [
    {
      label: "I'm feeling completely drained after today.",
      action: "I'm feeling completely drained after today.",
    },
    {
      label: "Can I just vent for a minute? I am extremely nervous after today's meeting.",
      action: "Can I just vent for a minute? I am extremely nervous after today's meeting.",
    },
    {
      label: "I can't stop thinking about that meeting.",
      action: "I can't stop thinking about that meeting.",
    },
    {
      label: "I am not sure I'm cut out for this job. So many more deserving people...",
      action: "I am not sure I'm cut out for this job. So many more deserving people...",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-4 w-full p-6"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${index}`}
          className={`${index > 1 ? "hidden sm:block" : "block"} h-full`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              sendMessage(suggestedAction.action);
            }}
            className="group text-left border-2 border-indigo-200/50 hover:border-indigo-400 rounded-xl px-5 py-4 text-sm flex-1 gap-1 w-full h-full justify-start items-start whitespace-normal break-words bg-white/90 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="text-gray-700 group-hover:text-indigo-900 font-medium transition-colors duration-300">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedPrompts = memo(PureSuggestedPrompts, () => true);
