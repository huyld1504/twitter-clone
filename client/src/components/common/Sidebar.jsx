import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const menus = [
  {
    icon: <MdHomeFilled className="w-8 h-8" />,
    path: "/",
    text: "Home",
  },
  {
    icon: <IoNotifications className="w-8 h-8" />,
    path: "/notifications",
    text: "Notifications",
  },
  {
    icon: <FaUser className="w-8 h-8" />,
    pathWithParams: (params) => `/profile/${params}`,
    text: "Profile",
    haveParams: true,
  },
];

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        const result = await response.json();
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error("Opps! Something went wrong!");
        }
      } catch (error) {
        toast.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-2 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          {menus.map((item, key) => (
            <li
              className="flex justify-center md:justify-start"
              key={key}
            >
              <Link
                to={
                  item.haveParams
                    ? item.pathWithParams(authUser?.username)
                    : item.path
                }
                className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                {item.icon}
                <span className="text-lg hidden md:block">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        {authUser && (
            <Link
              to={`/profile/${authUser.username}`}
              className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 hover:rounded-full"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-10 rounded-full">
                  <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                </div>
              </div>
              <div className="flex justify-start flex-1">
                <div className="hidden md:block">
                  <p className="text-white font-bold text-sm w-18 truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-slate-500 text-sm">@{authUser?.username}</p>
                </div>
                <BiLogOut
                  onClick={handleLogout}
                  className="w-7 h-7 cursor-pointer hidden md:block my-auto ml-5 hover:text-gray-500"
                />
                <div className="md:hidden bg:block rounded-full text-center" onClick={handleLogout}>
                    <BiLogOut className="w-8 h-8 hover:text-gray-500"/>
                </div>
              </div>
            </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
