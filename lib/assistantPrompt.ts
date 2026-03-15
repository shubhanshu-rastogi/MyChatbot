export const ASSISTANT_PROMPT_EVENT = "assistant:prompt";

export const emitAssistantPrompt = (prompt: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ASSISTANT_PROMPT_EVENT, {
      detail: {
        prompt
      }
    })
  );

  const assistantAnchor = document.getElementById("ai-assistant");
  assistantAnchor?.scrollIntoView({ behavior: "smooth", block: "start" });
};
