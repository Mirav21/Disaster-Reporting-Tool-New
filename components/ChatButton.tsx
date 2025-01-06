"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

const ChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const redirectToChat = () => {
    router.push("/dhruva");
  };

  return (
    <button
      className="fixed bottom-6 right-6 flex items-center justify-center space-x-2 rounded-full bg-green-500 p-4 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-green-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => redirectToChat()}
    >
      <MessageSquare className="h-6 w-6 transition-transform duration-300 ease-in-out" />
      {isHovered && (
        <span
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxWidth: isHovered ? "200px" : "0",
            opacity: isHovered ? 1 : 0,
            whiteSpace: "nowrap",
          }}
        >
          Chat with Dhruva
        </span>
      )}
    </button>
  );
};

export default ChatButton;
