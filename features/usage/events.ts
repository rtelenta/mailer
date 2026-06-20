import { db } from "@/db";
import { usageEvents } from "@/db/schema/usageEvents";

export type UsageEventType =
  | "test_send_ok"
  | "test_send_error"
  | "api_send_ok"
  | "api_send_error";

interface TrackEventParams {
  userId: string;
  templateId?: string | null;
  eventType: UsageEventType;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await db.insert(usageEvents).values({
      userId: params.userId,
      templateId: params.templateId ?? null,
      eventType: params.eventType,
      metadata: params.metadata,
    });
  } catch {
    // metering failures must never propagate to callers
  }
}
