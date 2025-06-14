import jwt from "jsonwebtoken";

// Helper function to generate activation token (valid for 30 minutes)
export const createActivationToken = (user: { _id: string; email: string }) => {
  return jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET as string, {
    expiresIn: "30m",
  });
};

export const createRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};

export const createAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};
