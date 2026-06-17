import * as yup from "yup";

export const loginSchema = yup.object({
  phone: yup.string().required("شماره تلفن الزامی است"),
  password: yup.string().required("رمز عبور الزامی است"),
});
