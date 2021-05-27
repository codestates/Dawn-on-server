import { config } from "dotenv";

config();

export const jwtConstants = {
  secret: process.env.JWTCONSTANTS,
};
export const bcryptConstant = {
  saltOrRounds: 10,
};
