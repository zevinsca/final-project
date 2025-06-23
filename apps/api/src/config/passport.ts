import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config(); // ⛳ WAJIB agar .env bisa digunakan

console.log("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
console.log("callbackURL", "http://localhost:8000/api/v1/auth/google/callback");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Access Token:", accessToken);
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  // Simpan hanya ID user ke session, atau bisa seluruh profile kalau memang tidak ada DB
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  // Ambil user kembali dari session
  done(null, user);
});
