import { Types } from "mongoose";

export interface Rating { 
    user: Types.ObjectId | string; 
    value: number; 
}