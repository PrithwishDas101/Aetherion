import User from "../models/User.js";

// GET LOGGED-IN USER
export const getLoggedUser = async (req, res) => {
    try {
        // req.user.userId comes from protectRoute
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        console.error("Get logged user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};