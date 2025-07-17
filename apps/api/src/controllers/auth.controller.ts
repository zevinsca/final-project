import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma-client.js";
import { ZodError } from "zod";
import { Resend } from "resend";
import fs from "fs/promises";
import handlebars from "handlebars";
import {
  registerSchema,
  setPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth-validation.js";
import { Profile } from "passport";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { CustomJwtPayload } from "../types/express.js";

const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------------------------------------------------------------- */
/*                       Register With Web Market Snap                        */
/* -------------------------------------------------------------------------- */
export async function register(req: Request, res: Response) {
  try {
    const { email, username } = registerSchema.parse(req.body);

    // Cek apakah email atau username sudah digunakan
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email atau Username sudah digunakan." });
      return;
    }

    // Buat akun baru tanpa password
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        isVerified: false,
      },
    });

    // Generate token untuk buat password
    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Simpan token untuk nanti dipakai saat set-password
    await prisma.user.update({
      where: { id: newUser.id },
      data: { verificationToken: token },
    });

    // Kirim email untuk buat password
    const templateSource = await fs.readFile(
      "src/templates/registration-welcoming-template.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlTemplate = compiledTemplate({
      customerName: username,
      token,
      currentYear: new Date().getFullYear(),
    });

    const { error: resendError } = await resend.emails.send({
      from: "MarketSnap <cs@resend.dev>",
      to: [email],
      subject: "Complete Your MarketSnap Registration",
      html: htmlTemplate,
    });

    if (resendError) {
      res.status(400).json({
        message: "Akun berhasil dibuat, tapi gagal mengirim email.",
      });
      return;
    }

    res.status(201).json({
      message:
        "Akun berhasil dibuat. Silakan cek email untuk membuat password.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Input tidak valid.",
        error: error.flatten().fieldErrors,
      });
      return;
    }

    console.error("Register error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat registrasi.",
      error,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                           Login With Market Snap                           */
/* -------------------------------------------------------------------------- */
export async function login(req: Request, res: Response) {
  try {
    const { username, password, email } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username: username }, { email: email }] },
    });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!existingUser.password) {
      res.status(400).json({ message: "User has no password set" });
      return;
    }
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const JWTToken = jwt.sign(
      {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        fullName:
          (existingUser.firstName ?? "") + " " + (existingUser.lastName ?? ""),
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_SECRET as string
    );
    if (!JWTToken) {
      res.status(404).json({ message: "Invalid credentials" });
      return;
    }
    res
      .cookie("accessToken", JWTToken, { httpOnly: true })
      .status(200)
      .json({ message: "Login success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
}
/* -------------------------------------------------------------------------- */
/*                                   logout;                                  */
/* -------------------------------------------------------------------------- */
export async function logout(_req: Request, res: Response) {
  try {
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to logout" }).redirect("/");
  }
}

/* -------------------------------------------------------------------------- */
/*                                verifyAccount                               */
/* -------------------------------------------------------------------------- */
export async function sendVerificationEmail(req: Request, res: Response) {
  const userLogin = req.user as CustomJwtPayload;
  const userEmail = userLogin.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Akun sudah diverifikasi." });
      return;
    }

    // Buat token baru jika belum ada
    if (!user.verificationToken) {
      const newToken = randomUUID();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newToken,
        },
      });
      user.verificationToken = newToken;
    }

    // Compile template email
    const templateSource = await fs.readFile(
      "src/templates/verify-email.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const htmlContent = compiledTemplate({
      customerName: user.username || user.email,
      token: user.verificationToken,
      currentYear: new Date().getFullYear(),
    });

    // Kirim email dengan Resend
    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Verifikasi Email MarketSnap",
      html: htmlContent,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      res.status(500).json({ message: "Gagal mengirim email." });
      return;
    }

    res.status(200).json({ message: "Email verifikasi telah dikirim." });
  } catch (error) {
    console.error("Gagal mengirim email verifikasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
    return;
  }
}
/* ------------------------------------ - ----------------------------------- */
export async function confirmEmail(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Token tidak valid.");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(404).send("Token tidak ditemukan.");
      return;
    }

    if (user.isVerified) {
      res.redirect(
        "http://localhost:3000/dashboard/user/profile?status=already-verified"
      );
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.redirect(
      "http://localhost:3000/dashboard/user/profile?status=already-verified"
    );
  } catch (error) {
    console.error("Gagal verifikasi email:", error);
    res.status(500).send("Terjadi kesalahan saat verifikasi email.");
  }
}
/* ------------------------------------ - ----------------------------------- */

export async function VerifySuccess(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Token tidak valid.");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(404).send("Token tidak ditemukan.");
      return;
    }

    if (user.isVerified) {
      // Baca dan compile template verify-complated.hbs
      const templateSource = await fs.readFile(
        "src/templates/verify-complated.hbs",
        "utf-8"
      );
      const compiledTemplate = handlebars.compile(templateSource);
      const htmlTemplate = compiledTemplate({
        currentYear: new Date().getFullYear(),
      });

      // Kirim email menggunakan hasil template
      const { error: sendError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verifikasi Email Berhasil",
        html: htmlTemplate,
      });

      if (sendError) {
        console.error("Resend error:", sendError);
        res.status(400).json({ message: "Gagal mengirim email." });
        return;
      }

      // Tampilkan halaman yang sama ke browser
      res.status(200).send(htmlTemplate);
      return;
    }

    res
      .status(400)
      .send("Akun belum diverifikasi. Silakan verifikasi terlebih dahulu.");
  } catch (error) {
    console.error("Gagal menampilkan halaman verifikasi:", error);
    res.status(500).send("Terjadi kesalahan saat menampilkan halaman.");
  }
}
/* -------------------------------------------------------------------------- */
/*                                Login Google                                */
/* -------------------------------------------------------------------------- */
export async function loginSuccess(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  res.json({
    message: "Login with Google successful",
    user: req.user,
  });
}
export async function loginFailed(_req: Request, res: Response) {
  res.status(401).json({ message: "Login with Google failed" });
}
export async function loginGoogle(req: Request, res: Response) {
  try {
    const googleUser = req.user as Profile;
    if (!googleUser.emails?.[0]?.value) {
      res.status(400).json({ message: "Email not found in Google profile" });
      return;
    }
    const email = googleUser.emails?.[0].value;

    if (!email) {
      res.status(400).json({ message: "Email not found from Google profile." });
      return;
    }

    // Cari user di database
    let user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      const nameParts = googleUser.displayName?.split(" ") ?? [
        "Google",
        "User",
      ];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Account";
      user = await prisma.user.create({
        data: {
          id: googleUser.id,
          email,
          firstName,
          lastName,
          // photo: googleUser.photos?.[0].value,
          provider: "google",
          // role default bisa diisi disini kalau mau
          role: "USER",
          isVerified: false, // Default false, bisa diubah nanti
        },
      });
    }

    const accesstoken = jwt.sign(
      {
        id: googleUser.id,
        email: googleUser.emails?.[0].value,
        name: googleUser.displayName,
        photo: googleUser.photos?.[0].value,
        provider: "google",
        role: user.role,
        isVerified: user.isVerified,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("accessToken", accesstoken, { httpOnly: true });

    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to Login", error });
  }
}

/* -------------------------------------------------------------------------- */
/*                               reset Password                               */
/* -------------------------------------------------------------------------- */
export async function setPassword(req: Request, res: Response) {
  const { token } = req.query;

  try {
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Token tidak valid." });
      return;
    }

    const { password } = setPasswordSchema.parse(req.body);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan." });
      return;
    }

    if (user.password) {
      res.status(400).json({ message: "Password sudah diatur sebelumnya." });
      return;
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        password: hashedPassword,
      },
    });

    res
      .status(200)
      .json({ message: "Password berhasil disimpan dan akun diverifikasi." });
  } catch (error) {
    console.error("Set Password Error:", error);
    res
      .status(500)
      .json({ message: "Gagal menyimpan password atau token tidak valid." });
  }
}

function generateToken(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ message: "Email tidak valid." });
      return;
    }

    const { email } = parse.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "Email tidak ditemukan." });
      return;
    }

    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });

    const templateSource = await fs.readFile(
      "src/templates/reset-password.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const html = compiledTemplate({
      resetLink: `http://localhost:3000/auth/set-password?token=${token}`,
      resendLink: `http://localhost:3000/auth/reset-password`,
      companyName: "Market Snap",
      currentYear: new Date().getFullYear(),
      userName: user.firstName || user.username || "Pengguna",
    });

    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Permintaan Reset Password",
      html: html,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      res.status(400).json({ message: "Gagal mengirim email." });
      return;
    }

    res.status(200).json({ message: "Link reset password berhasil dikirim." });
  } catch (err) {
    console.error("Error reset password:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
}
export const setNewPassword = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).json({ message: "Token tidak ditemukan." });
    return;
  }

  const parse = setPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    const msg = parse.error.errors[0]?.message || "Validasi gagal.";
    res.status(400).json({ message: msg });
    return;
  }

  const { password } = parse.data;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      res
        .status(400)
        .json({ message: "Token tidak valid atau sudah kadaluarsa." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    // Kirim email konfirmasi
    const templateSource = await fs.readFile(
      "src/templates/password-updated.hbs",
      "utf-8"
    );
    const compiledTemplate = handlebars.compile(templateSource);
    const html = compiledTemplate({
      userName: user.firstName || user.username || "Pengguna",
      formattedDate: new Date().toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }),
      companyName: "Market Snap",
      currentYear: new Date().getFullYear(),
    });

    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev", // Ubah ke verified domain saat produksi
      to: user.email,
      subject: "Password Anda Telah Diubah",
      html,
    });

    if (sendError) {
      console.error("Gagal kirim email:", sendError);
    }

    res.status(200).json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("Error atur ulang password:", err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
