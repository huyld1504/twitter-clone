import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../components/svgs/X.jsx";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

const SignUpPage = () => {

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });
  const [isShowPassword, setIsShowPassword] = useState(true);

  const togglePasswordVisibility = () => {
    setIsShowPassword(!isShowPassword);
  };

  const { mutate } = useMutation({
    mutationFn: async ({ username, password, fullName, email }) => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password, fullName }),
        });

        const result = await response.json();

          if (result.success === true) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        return result.data;
      } catch (error) {
        toast.error(error);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className=" lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>

          {/* Input Email */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>

          {/* Input Username */}
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow "
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>

            {/* Input Full Name */}
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>

          {/* Input password */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type={isShowPassword ? "password" : "text"}
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
            <button
              onClick={togglePasswordVisibility}
              className="top-2 right-2"
              type="button"
            >
              {isShowPassword ? (
                <MdOutlineVisibility />
              ) : (
                <MdOutlineVisibilityOff />
              )}
            </button>
          </label>
          <button
            className="btn rounded-full btn-primary text-white text-xl"
            type="submit"
          >
            Sign up
          </button>
        </form>
        <div className="flex flex-row lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <span className=" text-primary text-lg">
            <Link to={"/signin"}>
              <b>Sign in</b>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
