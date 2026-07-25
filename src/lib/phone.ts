export const normalizePhoneE164 = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, "");
  const local = digits.startsWith("234")
    ? digits.slice(3)
    : digits.replace(/^0/, "");
  return `+234${local}`;
};
