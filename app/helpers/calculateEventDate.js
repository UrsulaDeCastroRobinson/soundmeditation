export const calculateEventDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = 6 - dayOfWeek;
  const upcomingSaturday = new Date(today);
  upcomingSaturday.setDate(today.getDate() + daysUntilSaturday);
  return upcomingSaturday;
};

export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};