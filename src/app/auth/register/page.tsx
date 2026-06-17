import Link from "next/link";
import React from "react";

const Register = () => {
  const isLoading = false;
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-2 p-12">
      <h2 className="text-white text-3xl text-center">ثبت نام</h2>
      <p className="text-white text-lg text-center">
        برای ثبت نام اطلاعات خود را به طور کامل وارد کنید
      </p>
      <input
        placeholder="نام و نام خانوادگی"
        type="text"
        className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
      />
      <input
        placeholder="شماره تلفن"
        type="tel"
        className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
      />
      <input
        placeholder="کد ملی"
        type="number"
        className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
      />
      <input
        placeholder="رمز عبور"
        type="text"
        className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
      />
      <input
        placeholder="تکرار رمز عبور"
        type="text"
        className="w-full px-4 py-4 text-right border border-white rounded-lg mt-5 text-lg text-white"
      />

      <button
        className={`w-full p-4 rounded-lg mt-5 ${
          isLoading ? "bg-white/30 text-white" : "bg-white text-[#469173]"
        } text-center text-lg`}
      >
        ثبت نام
      </button>

      <Link href="/auth/login" className="text-white text-lg text-center mt-5">
        حساب کاربری دارید؟ وارد شوید
      </Link>
    </div>
  );
};

export default Register;
