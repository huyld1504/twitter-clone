import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const EditProfileModal = ({ authUser }) => {
	const navigate = useNavigate();
  const [isShowCurrentPassword, setIsShowCurrentPassword] = useState(true);
  const [isShowNewPassword, setIsShowNewPassword] = useState(true);
  const toggleCurrentPasswordVisibility = () => setIsShowCurrentPassword(!isShowCurrentPassword);

  const toggleNewPasswordVisibility = () => setIsShowNewPassword(!isShowNewPassword);

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { mutate: updateUserProfile, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/users/profile/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const result = await res.json();

        if (!res.ok)
          throw new Error(result.message || "Opps! Something went wrong!");

        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("User updated successfully!");
	  navigate(`/profile/${formData.username}`);
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile();
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName,
        username: authUser.username,
        email: authUser.email,
        bio: authUser.bio,
        link: authUser.link
      });
    }
  }, [authUser]);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex-1 input border border-gray-700 rounded p-2 input-md">
                <input
                  type={isShowCurrentPassword ? "password" : "text"}
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  name="currentPassword"
                  onChange={handleInputChange}
                />

                <button
                  onClick={toggleCurrentPasswordVisibility}
                  className="ml-7"
                  type="button"
                >
                  {isShowCurrentPassword ? (
                    <MdOutlineVisibilityOff />
                  ) : (
                    <MdOutlineVisibility />
                  )}
                </button>
              </label>

              <label className="flex-1 input border border-gray-700 rounded p-2 input-md">
                <input
                  type={isShowNewPassword ? "password" : "text"}
                  placeholder="New Password"
                  value={formData.newPassword}
                  name="newPassword"
                  onChange={handleInputChange}
                />
                <button
                  onClick={toggleNewPasswordVisibility}
                  className="ml-7"
                  type="button"
                >
                  {isShowNewPassword ? (
                    <MdOutlineVisibilityOff />
                  ) : (
                    <MdOutlineVisibility />
                  )}
                </button>
              </label>
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-full btn-sm text-white"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
