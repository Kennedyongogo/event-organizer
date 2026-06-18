export const emptyLineupEntry = () => ({ name: "", role: "" });

export function parseLineupFromApi(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, role: "" };
    return {
      name: item?.name ?? "",
      role: item?.role ?? "",
    };
  });
}

export function serializeLineupForSubmit(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((item) => item?.name?.trim())
    .map((item) => ({
      name: item.name.trim(),
      ...(item.role?.trim() ? { role: item.role.trim() } : {}),
    }));
}
