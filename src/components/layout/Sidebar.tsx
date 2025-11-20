import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Library, 
  Upload, 
  BookOpen, 
  Settings, 
  HelpCircle,
  Users,
  BarChart3,
  Video,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Library", href: "/dashboard/library", icon: Library },
  { name: "Upload", href: "/dashboard/upload", icon: Upload },
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
];

const adminNavigation = [
  { name: "Admin Dashboard", href: "/admin", icon: BarChart3 },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

type UserRole = "admin" | "trainer" | "operator" | "customer_admin";

export default function Sidebar() {
  // TODO: Get user role from auth context
  const userRole: UserRole = "operator" as UserRole; // Placeholder
  
  const isAdmin = userRole === "admin" || userRole === "customer_admin";
  const allNavItems = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <div className="w-70 flex flex-col bg-[#F9FAFB] border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Video className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Winbro Training</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {allNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#E5E7EB] text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
