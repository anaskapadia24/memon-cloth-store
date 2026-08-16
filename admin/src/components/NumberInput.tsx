import { useEffect, useState, type InputHTMLAttributes } from "react";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: number;
  onChange: (value: number) => void;
};

// Plain `<input type="number" value={n} onChange={e => setN(Number(e.target.value) || 0)}>`
// forces the field back to "0" on every keystroke, including the one that
// clears it - so backspacing to empty instantly snaps back to "0" and it
// looks stuck. This keeps its own text buffer while typing (so an empty
// field can actually be empty) and only reconciles to a real number on blur.
export function NumberInput({ value, onChange, ...rest }: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      type="number"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && !Number.isNaN(n)) onChange(n);
      }}
      onBlur={() => {
        if (text === "" || Number.isNaN(Number(text))) {
          setText("0");
          onChange(0);
        }
      }}
      onFocus={(e) => e.target.select()}
      {...rest}
    />
  );
}
