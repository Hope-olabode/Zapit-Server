// utils/date.js
export function getFormattedDateTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const day = now.getDate();
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear().toString().slice(-2);

  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${hours}:${minutes} • ${day}${getOrdinal(day)} ${month}, ${year}`;
}
