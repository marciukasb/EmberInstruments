export const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
