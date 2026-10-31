const DateSeparator = ({ label }) => {
  return (
    <div className="my-4 flex items-center justify-center">
      <span className="rounded-full border border-[#E5E5E5] bg-[#F5F5F5] px-4 py-1.5 text-xs font-medium text-[#737373] shadow-sm">
        {label}
      </span>
    </div>
  );
};

export default DateSeparator;
