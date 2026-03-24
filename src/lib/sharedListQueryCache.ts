import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

export async function invalidateSharedListQueries(
  queryClient: QueryClient,
  userId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.sharedLists(userId) }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.sharedListItemStatsRoot(userId),
    }),
    queryClient.invalidateQueries({ queryKey: ["shared", "list-items"] }),
  ]);
}
