"use client";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="border border-white h-[20px] w-fit text-amber-50 text-[12px]"
    >
      <FcGoogle size={24} />
      Sign With Google
    </button>
  );
}
