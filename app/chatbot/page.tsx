"use client";
import React, { useEffect } from "react";

const BotpressChat: React.FC = () => {
  useEffect(() => {
    // Load the Botpress Web Chat script dynamically
    const script = document.createElement("script");
    script.src =
      "https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2024/12/18/19/20241218193212-8ASC3SLI.json";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-[92.5vh]">
      <iframe
        src="https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2024/12/18/19/20241218193212-8ASC3SLI.json"
        className="w-full h-full border-none"
        title="Botpress Chat"
      />
    </div>
  );
};

export default BotpressChat;
