import Notification from "../models/notification.model.js";

export const getAllNotifications = async (req, res) => {
    const userId = req.user._id;

    try {
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "_id username profileImage"
        });

        await Notification.updateMany({ to: userId }, { read: true });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ to: userId });
        res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if (!notification) return res.status(404).json({success: false, message: "Notification Not Found"});

        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({success: false, message: "Unauthorized, you cannot access this resource"});
        }

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({success: true, message: "Notification deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}