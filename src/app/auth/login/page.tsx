"use client";

import { useLogin } from "@/hooks/useAuth";
import { loginSchema } from "@/validations/authValidations";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";

const Login = () => {
  const { mutate: login, isPending: isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    login(data);
  };
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-2 p-12">
      <h2 className="text-white text-3xl text-center">ورود به برنامه</h2>
      <p className="text-white text-lg text-center">
        برای ورود به برنامه شماره تلفن و رمز عبور خود را وارد کنید
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center gap-2"
      >
        <input
          {...register("phone")}
          placeholder="شماره تلفن"
          type="tel"
          className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
        />
        {errors?.phone && (
          <p className="text-rose-500">{errors?.phone.message}</p>
        )}

        <input
          {...register("password")}
          placeholder="رمز عبور"
          type="text"
          className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
        />
        {errors?.password && (
          <p className="text-rose-500">{errors?.password.message}</p>
        )}

        <button
          type="submit"
          className={`w-full p-4 rounded-lg mt-5 ${
            isLoading ? "bg-white/30 text-white" : "bg-white text-[#469173]"
          } text-center text-lg`}
        >
          ورود
        </button>
      </form>

      <Link
        href="/auth/register"
        className="text-white text-lg text-center mt-5"
      >
        حساب کاربری ندارید؟ ثبت نام کنید
      </Link>
    </div>
  );
};

export default Login;
