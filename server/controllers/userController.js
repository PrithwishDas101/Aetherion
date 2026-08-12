import User from "../models/User.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";

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

// GET ALL USERS EXCEPT LOGGED-IN USER
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: {
                $ne: req.user.userId,
            },
        }).select("-password");

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// UPDATE PROFILE PICTURE
export const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile picture is required.",
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const uploadResult = await uploadImage(req.file.buffer, "aetherion/profile-pictures");

        const oldPublicId = user.profilePicPublicId;

        user.profilePic = uploadResult.secure_url;

        user.profilePicPublicId = uploadResult.public_id;

        await user.save();

        if (oldPublicId) {
            try {
                await deleteImage(oldPublicId);
            } catch (deleteError) {
                console.error(
                    "Old profile picture deletion error:",
                    deleteError
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully.",
            data: user,
        });

    } catch (error) {
        console.error(
            "Update profile picture error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update profile picture.",
        });
    }
};