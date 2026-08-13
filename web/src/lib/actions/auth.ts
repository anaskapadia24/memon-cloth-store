"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "../api";
import { getToken, setToken, clearToken } from "../session";
import type { ActionResult, Address, User } from "../types";

async function withTokenResponse(
  call: () => Promise<{ token: string; user: unknown }>,
): Promise<ActionResult> {
  try {
    const data = await call();
    await setToken(data.token);
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Something went wrong",
    };
  }
}

export async function loginAction(
  emailOrPhone: string,
  password: string,
): Promise<ActionResult> {
  return withTokenResponse(() =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    }),
  );
}

export async function registerAction(
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<ActionResult> {
  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password }),
    });
    return loginAction(email, password);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Something went wrong",
    };
  }
}

export async function googleLoginAction(
  credential: string,
): Promise<ActionResult> {
  return withTokenResponse(() =>
    apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  );
}

export async function logoutAction() {
  await clearToken();
  revalidatePath("/", "layout");
}

export async function updateProfileAction(
  name: string,
  email: string,
  phone: string,
): Promise<ActionResult<User>> {
  try {
    const token = await getToken();
    const user = await apiFetch<User>("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify({ name, email, phone }),
    });
    revalidatePath("/account");
    return { ok: true, data: user };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Update failed",
    };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch("/auth/password", {
      method: "PUT",
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiError ? err.message : "Failed to change password",
    };
  }
}

export async function addAddressAction(
  label: string,
  address: string,
): Promise<ActionResult<Address[]>> {
  try {
    const token = await getToken();
    const addresses = await apiFetch<Address[]>("/auth/address", {
      method: "POST",
      token,
      body: JSON.stringify({ label, address }),
    });
    revalidatePath("/account");
    return { ok: true, data: addresses };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to save address",
    };
  }
}

export async function deleteAddressAction(
  addressId: string,
): Promise<ActionResult<Address[]>> {
  try {
    const token = await getToken();
    const addresses = await apiFetch<Address[]>(`/auth/address/${addressId}`, {
      method: "DELETE",
      token,
    });
    revalidatePath("/account");
    return { ok: true, data: addresses };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to delete address",
    };
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const token = await getToken();
    await apiFetch("/users/me", { method: "DELETE", token });
    await clearToken();
    revalidatePath("/", "layout");
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof ApiError ? err.message : "Failed to delete account",
    };
  }
}
