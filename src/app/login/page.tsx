"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [user, authLoading, authError] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authError?.message) {
      setError(authError.message);
    }
  }, [authError]);

  useEffect(() => {
    if (user) {
      setEmail("");
      setPassword("");
      setError("");
      router.push("/admin");
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error("[Login] Error during sign-in", err);
      setError(err?.message || "Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("[Login] Error during sign-out", err);
      setError(err?.message || "No pudimos cerrar la sesión. Intenta nuevamente.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-green-700">
        <div className="h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold">Verificando acceso...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-green-800">Sesión activa</h1>
          <p className="text-sm text-slate-600">
            Estás conectado como <span className="font-semibold text-green-700">{user.email}</span>.
          </p>

          {error && (
            <div className="rounded-lg bg-red-100 text-red-700 text-sm font-medium px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-white font-semibold shadow transition hover:bg-green-800"
            >
              Ir al panel admin
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 shadow-sm transition hover:bg-red-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl px-6 py-8 space-y-4"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-green-800">Panel Admin</h1>
          <p className="text-sm text-slate-600">
            Ingresa tus credenciales autorizadas para continuar
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 text-red-700 text-sm font-medium px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-slate-700">
          Correo
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
            placeholder="admin@senalmaq.com"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
            placeholder="********"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-700 py-2.5 text-white font-semibold shadow-md transition hover:bg-green-800 disabled:opacity-70"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
