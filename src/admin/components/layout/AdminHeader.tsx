import { useAuth } from "@/admin/hooks/useAuth";
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { useSidebar } from "@shared/components/ui/sidebar";
import { LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar, setOpen, isMobile } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setOpen(true); // Mobile: open drawer
    } else {
      toggleSidebar(); // Desktop: toggle collapsed sidebar
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-[5]">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: User Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="
              flex items-center gap-2
              rounded-full
              px-2
              hover:bg-transparent
            "
          >
            <div
              className="
                w-8 h-8 rounded-full
                gradient-primary
                shadow-rose
                flex items-center justify-center
              "
            >
              <User className="h-4 w-4 text-white stroke-white" />
            </div>

            <span className="hidden sm:inline text-sm font-medium text-foreground">
              {user?.email?.split("@")[0]}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">My Account</span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AdminHeader;
