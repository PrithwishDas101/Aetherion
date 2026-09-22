import AvatarDecoration from "./AvatarDecoration.jsx";

const Avatar = ({
    profilePic,
    initials,
    alt = "Profile",
    decoration = "none",
    size = "md",
    avatarClassName = "",
    className = "",
    children,
}) => {
    const sizeClasses = {
        xs: "h-10 w-10 text-xs",
        sm: "h-11 w-11 text-sm",
        md: "h-12 w-12 text-sm",
        lg: "h-28 w-28 text-3xl sm:h-32 sm:w-32 sm:text-4xl lg:h-36 lg:w-36",
    };

    const avatarSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative shrink-0 ${className}`}>
            <AvatarDecoration decoration={decoration} />

            <div className={`relative z-10 flex items-center justify-center overflow-hidden rounded-full ${avatarSize} ${avatarClassName}`}>        {profilePic ? (
                <img src={profilePic} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
            </div>

            {children}
        </div>
    );
};

export default Avatar;