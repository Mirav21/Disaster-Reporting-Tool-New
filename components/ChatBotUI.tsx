"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ChatButton from "./ChatButton";

import { Suspense } from "react";

// Wrapper component
export default function ChatBotUIWrapper() {
  return (
    <Suspense fallback={null}>
      <ChatBotUIContent />
    </Suspense>
  );
}

// Content component that uses hooks
function ChatBotUIContent() {
  const [shouldHideButton, setShouldHideButton] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Hide button if we're on the /dhruva page OR if dhruva parameter exists
    const isOnDhruvaPage = pathname === "/dhruva";
    const hasDhruvaParam = searchParams.has("dhruva");
    setShouldHideButton(isOnDhruvaPage || hasDhruvaParam);
  }, [pathname, searchParams]);

  return <>{!shouldHideButton && <ChatButton />}</>;
}
