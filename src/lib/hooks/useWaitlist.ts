import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WaitlistJoinRequest } from "@/types";
import { toast } from "react-hot-toast";
import { waitlistApi } from "../api/waitlistApiService";

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaitlistJoinRequest) => waitlistApi.joinWaitlist(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to join waitlist");
    },
  });
};

export const useWaitlistEntries = () => {
  return useQuery({
    queryKey: ["waitlist"],
    queryFn: () => waitlistApi.listWaitlistEntries(),
  });
};

export const useWaitlistEntry = (entryId: string) => {
  return useQuery({
    queryKey: ["waitlist", entryId],
    queryFn: () => waitlistApi.getWaitlistEntry(entryId),
  });
};
