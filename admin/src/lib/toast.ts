export type ToastKind = "success" | "error";
type Listener = (msg: string, kind: ToastKind) => void;

let listener: Listener | null = null;

export function onToast(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function toast(msg: string, kind: ToastKind = "success") {
  listener?.(msg, kind);
}
