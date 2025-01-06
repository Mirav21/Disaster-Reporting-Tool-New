"use client";

import { useEffect, useState } from "react";
import ChatButton from "./ChatButton";

export default function ChatBotUI() {
  const [isDhruva, setIsDhruva] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.href.includes("dhruva")
    ) {
      setIsDhruva(true);
    }
  }, []);

  return <>{!isDhruva && <ChatButton />}</>;
}
