import { Request } from "express";
import { UserResponse } from "../models/auth.model";

export interface UserRequest extends Request {
    user?: UserResponse;
}