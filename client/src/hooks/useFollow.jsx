import { toast } from "react-hot-toast";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: followUnfollow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Opps! Something went wrong!");
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),
        queryClient.invalidateQueries({queryKey: ["authUser"]})
        ])
    },
    onError: (error) => {
        toast.error(error.message);
    }
  });

  return {followUnfollow, isPending};

};

export default useFollow;
