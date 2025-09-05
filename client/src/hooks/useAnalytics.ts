import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
