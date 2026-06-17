import { useUser } from "@/contexts/UserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useLogin() {
  const router = useRouter();
  const { setUser } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("نام کاربری یا رمز عبور اشتباه است.!");
        }
        throw new Error("خطا در ارسال اطلاعات!");
      }
      return await res.json();
    },
    onError(error) {
      toast.error(error.message);
      console.log(error);
    },
    onSuccess: (result) => {
      setUser(result);
      toast.success("با موفقیت وارد شدید. لطفا کمی صبر کنید.");
      router.replace("/home/measurements");
    },
  });
}
