import { useUser } from "@/contexts/UserContext";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useLogin() {
  const router = useRouter();
  const { setUser } = useUser();
  return useMutation({
    mutationFn: async (data: { phone: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "نام کاربری یا رمز عبور اشتباه است.");
      }
      return result;
    },
    onError(error) {
      toast.error(error.message);
    },
    onSuccess: (result) => {
      setUser(result);
      toast.success("با موفقیت وارد شدید.");
      router.replace("/home/measurements");
    },
  });
}
