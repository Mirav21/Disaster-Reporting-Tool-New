"use client";

import { useEffect, useState } from "react";
import ChatButton from "./ChatButton";

export default function ChatBotUI() {
  const [isDhruva, setIsDhruva] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for query parameter 'dhruva'
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("dhruva")) {
        setIsDhruva(true);
      }
    }
  }, []);

  return <>{!isDhruva && <ChatButton />}</>;
}
