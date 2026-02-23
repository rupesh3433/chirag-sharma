import { useLiveWebSocket } from "../hooks/useLiveWebSocket";

export default function PublicLiveTracker() {
  useLiveWebSocket();
  return null;
}