import { useEffect, useState } from "react";
import { onToast, type ToastKind } from "../lib/toast.ts";

export function ToastHost() {
  const [msg, setMsg] = useState("");
  const [kind, setKind] = useState<ToastKind>("success");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t = 0;
    const off = onToast((m, k) => {
      setMsg(m);
      setKind(k);
      setShow(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => setShow(false), 3000);
    });
    return () => {
      window.clearTimeout(t);
      off();
    };
  }, []);

  if (!msg) return null;
  return (
    <div className={`toast ${kind} ${show ? "show" : ""}`}>
      <i
        className={`fas fa-${kind === "success" ? "check-circle" : "exclamation-circle"}`}
      />
      {msg}
    </div>
  );
}
