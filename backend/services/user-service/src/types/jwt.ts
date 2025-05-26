import { UserType } from "./interface/IUser";

interface jwtPayload {
  payload: {
    user: UserType;
  };
}
export default jwtPayload;
