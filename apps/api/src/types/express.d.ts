import { JwtPayload } from "jsonwebtoken";
import { Profile } from "passport";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      /**
       * Akan terisi user dari JWT atau dari Passport (Google)
       * Kamu bisa pakai union untuk menampung keduanya
       */
      user?: CustomJwtPayload;

      /**
       * Tambahkan logout() agar tidak error saat pakai Passport
       */
      logout(callback: (err: Error | null) => void): void;
    }
  }
}
