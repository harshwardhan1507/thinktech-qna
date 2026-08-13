import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/types";
import type {
  QnaRealtimeBroadcastEvent,
  RealtimeStatus,
  BroadcastQnaPayload,
} from "./types";

export function subscribeToQnaChannel(
  client: SupabaseClient<Database>,
  onEvent: (event: QnaRealtimeBroadcastEvent) => void,
  onStatusChange: (status: RealtimeStatus) => void
): RealtimeChannel {
  onStatusChange("connecting");

  const channel = client.channel("thinktech:qna", {
    config: {
      broadcast: { self: false },
    },
  });

  channel
    .on(
      "broadcast",
      { event: "QUESTION_CREATED" },
      (res: { payload: BroadcastQnaPayload }) => {
        onEvent({ event: "QUESTION_CREATED", payload: res.payload });
      }
    )
    .on(
      "broadcast",
      { event: "QUESTION_STATE_CHANGED" },
      (res: { payload: BroadcastQnaPayload }) => {
        onEvent({ event: "QUESTION_STATE_CHANGED", payload: res.payload });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        onStatusChange("connected");
      } else if (status === "CLOSED") {
        onStatusChange("disconnected");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || err) {
        onStatusChange("error");
      } else {
        onStatusChange("reconnecting");
      }
    });

  return channel;
}

export function unsubscribeQnaChannel(
  client: SupabaseClient<Database>,
  channel: RealtimeChannel | null
) {
  if (channel) {
    client.removeChannel(channel);
  }
}
