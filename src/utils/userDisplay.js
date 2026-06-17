export const getUserRole = () => localStorage.getItem("userRole") || "";

export const getDisplayName = (user) => {
  if (!user || typeof user !== "object") return "User";
  const role = getUserRole();
  if (role === "artist") {
    return user.stage_name || user.full_name || user.email || "Artist";
  }
  if (role === "organizer" || role === "event_organizer") {
    return (
      user.organization_name ||
      user.full_name ||
      user.contact_person ||
      user.email ||
      "Organizer"
    );
  }
  return user.full_name || user.name || user.email || "Admin";
};

export const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getPhone = (user) => user?.phone || user?.phone_number || "";

export const getOrganizerStatus = (user) =>
  user?.organizer_status || user?.status || "pending";

export const getRoleLabel = () => {
  const role = getUserRole();
  if (role === "artist") return "Artist";
  if (role === "organizer" || role === "event_organizer") return "Event Organizer";
  return "Admin";
};

export const getProfileImageUrl = (user) => {
  const path = user?.profile_image;
  if (!path) return null;
  if (/^(https?:|data:)/i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

export const notifyUserUpdated = (user) => {
  if (!user) return;
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("tickahub-user-updated", { detail: user }));
};
