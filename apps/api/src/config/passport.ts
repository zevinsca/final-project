import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { CustomJwtPayload, GoogleJwtPayload } from "../types/express.js";
import { GoogleProfileWithToken } from "../types/GoogleProfileWithToken .js";
import axios from "axios";
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
    async (accessToken, _refreshToken, _profile, done) => {
      try {
        // 🔍 Ambil data user langsung dari Google API
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // 📦 Bentuk profile lengkap sesuai tipe yang kamu buat
        const profileWithToken: GoogleProfileWithToken = {
          id: data.sub,
          displayName: data.name,
          emails: [{ value: data.email }],
          photos: [{ value: data.picture }],
          provider: "google",
          accessToken,
          name: {
            givenName: data.given_name,
            familyName: data.family_name,
          },
          _json: data,
          _raw: JSON.stringify(data),
        };

        return done(null, profileWithToken);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  const safeUser = user as GoogleProfileWithToken;

  done(null, {
    id: safeUser.id,
    name: safeUser.displayName,
    email: safeUser.emails?.[0].value,
    photo: safeUser.photos?.[0].value,
    accessToken: safeUser.accessToken,
  });
});

passport.deserializeUser((user: unknown, done) => {
  done(null, user as GoogleJwtPayload); // 👈 assert langsung
});
