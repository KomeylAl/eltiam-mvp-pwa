"use client";

import { useLogin } from "@/hooks/useAuth";
import { loginSchema } from "@/validations/authValidations";
import { yupResolver } from "@hookform/resolvers/yup";
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

  const onSubmit = (data: { phone: string; password: string }) => {
    login(data);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="glass-card w-full max-w-sm rounded-2xl p-8 flex flex-col gap-4">
        <div className="text-center mb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
          <h2 className="text-white text-2xl font-vazir-bold">التیام</h2>
          <p className="text-white/80 text-sm font-vazir mt-1">
            تجربه زندگی ارزشمند
          </p>
        </div>

        <h3 className="text-white text-xl font-vazir-bold text-center">
          ورود به برنامه
        </h3>
        <p className="text-white/70 text-sm text-center font-vazir leading-relaxed">
          شماره تلفن و رمز عبوری که درمانگر شما تعیین کرده را وارد کنید
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-3 mt-2"
        >
          <div>
            <input
              {...register("phone")}
              placeholder="شماره تلفن"
              type="tel"
              dir="ltr"
              className="w-full px-4 py-3.5 text-right bg-white/90 border-0 rounded-xl text-gray-800 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 outline-none"
            />
            {errors?.phone && (
              <p className="text-rose-300 text-sm mt-1 font-vazir">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              placeholder="رمز عبور"
              type="password"
              className="w-full px-4 py-3.5 text-right bg-white/90 border-0 rounded-xl text-gray-800 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 outline-none"
            />
            {errors?.password && (
              <p className="text-rose-300 text-sm mt-1 font-vazir">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl mt-2 text-center text-base font-vazir-bold transition-all ${
              isLoading
                ? "bg-white/30 text-white cursor-not-allowed"
                : "bg-white text-primary hover:shadow-lg hover:scale-[1.02]"
            }`}
          >
            {isLoading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="text-white/50 text-xs text-center font-vazir mt-2 leading-relaxed">
          حساب کاربری توسط درمانگر شما ایجاد می‌شود
        </p>
      </div>
    </div>
  );
};

export default Login;
