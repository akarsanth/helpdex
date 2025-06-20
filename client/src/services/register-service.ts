import axios from "axios";

export const registerUser = async ({
  name,
  companyName,
  email,
  password,
}: {
  name: string;
  companyName: string;
  email: string;
  password: string;
}) => {
  try {
    const { data } = await axios.post(
      "/api/v1/users",
      { name, companyName, email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return { data, error: null, isEmailVerified: true };
  } catch (err: unknown) {
    let message = "Registration failed";
    let isEmailVerified = true;
    let unverifiedEmail: string | undefined;

    if (axios.isAxiosError(err)) {
      const resData = err.response?.data;

      message = resData?.message || err.message;

      // if backend says email is NOT verified
      if (resData?.isEmailVerified === false) {
        isEmailVerified = false;
        unverifiedEmail = resData?.email;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    return { data: null, error: message, isEmailVerified, unverifiedEmail };
  }
};
