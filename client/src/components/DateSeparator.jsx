const DateSeparator = ({
    label,
}) => {

    return (

        <div className="my-4 flex items-center justify-center">

            <span className="rounded-full border border-[#d8f45a]/10 bg-[#151c16] px-4 py-1.5 text-xs font-medium text-[#aab3a8] shadow-sm">

                {label}

            </span>

        </div>

    );

};


export default DateSeparator;