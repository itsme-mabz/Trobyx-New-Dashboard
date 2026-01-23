import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { Workflow, Zap, MessageSquare, Layers, HelpCircle, LogOut, Link2, DollarSign } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import useAuthStore from "../stores/useAuthStore";
import toast from "react-hot-toast";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  onClick?: () => void;
  isExternal?: boolean;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { logout } = useAuthStore();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleSignOut = () => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <LogOut className="h-10 w-10 text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-full" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Sign Out Confirmation
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to end your session?
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              logout();
              toast.dismiss(t.id);
              toast.success("Signed out successfully");
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-semibold text-red-600 hover:text-red-500 focus:outline-none"
          >
            Sign Out
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Workflow className="w-[24px] h-[24px]" />,
      name: "Flows",
      path: "/flows",
    },
    {
      icon: <Zap className="w-[24px] h-[24px]" />,
      name: "Trobs",
      path: "/trobs",
    },
    {
      icon: <Layers className="size-6" />,
      name: "Automation",
      subItems: [
        { name: "Active Jobs", path: "/automations/active", pro: false },
        { name: "Completed Jobs", path: "/automations/completed", pro: false },
      ],
    },
    {
      icon: <MessageSquare className="w-[24px] h-[24px]" />,
      name: "Messages",
      path: "/messages",
    },
    {
      icon: <Link2 className="w-[24px] h-[24px]" />,
      name: "Connections",
      path: "/connections",
    },
    {
      icon: <DollarSign className="w-[24px] h-[24px]" />,
      name: "Pricing",
      path: "/pricing",
    },
    {
      icon: <UserCircleIcon />,
      name: "User Profile",
      path: "/profile-settings",
    },
  ];

  const othersItems: NavItem[] = [
    {
      icon: <HelpCircle className="size-6" />,
      name: "Help and Support",
      path: "https://trobyx.com/help",
      isExternal: true,
    },
    {
      icon: <LogOut className="size-6" />,
      name: "Sign Out",
      onClick: handleSignOut,
    },
  ];

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : nav.path ? (
            nav.isExternal ? (
              <a
                href={nav.path}
                target="_blank"
                rel="noopener noreferrer"
                className="menu-item group menu-item-inactive"
              >
                <span className="menu-item-icon-size menu-item-icon-inactive">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </a>
            ) : (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          ) : (
            <button
              onClick={nav.onClick}
              className="menu-item group menu-item-inactive w-full text-left"
            >
              <span className="menu-item-icon-size menu-item-icon-inactive">
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/trobyx.svg"
                alt="Logo"
                width={120}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/trobyx.svg"
                alt="Logo"
                width={120}
                height={40}
              />
            </>
          ) : (
            <img
              src="/trobyx.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
