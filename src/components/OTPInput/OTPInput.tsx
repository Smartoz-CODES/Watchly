import { useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import styles from "./OTPInput.module.css";

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (code: string) => void;
  error: string | null;
}

const OTPInput = ({ length, value, onChange, error }: OTPInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const digit = e.target.value.replace(/\D/g, "");

    if (!digit) return;

    const otpArray = value.split("");
    otpArray[index] = digit[0];

    onChange(otpArray.join("").padEnd(length, "").slice(0, length));

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const otpArray = value.split("");

      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      otpArray[index] = "";

      onChange(otpArray.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    onChange(pastedData);

    inputRefs.current[pastedData.length - 1]?.focus();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputs}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] ?? ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={error ? styles.error : ""}
          />
        ))}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default OTPInput;
