import { NotificationPayload } from "@/types/capture";

export const notifySiteOwner = async (
  payload: NotificationPayload
): Promise<{ delivered: boolean; channel: "mock-console" }> => {
  const stamp = new Date().toISOString();

  console.info("[notifySiteOwner]", {
    deliveredAt: stamp,
    ...payload
  });

  return {
    delivered: true,
    channel: "mock-console"
  };
};
