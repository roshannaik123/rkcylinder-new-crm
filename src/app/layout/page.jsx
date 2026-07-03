import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Breadcrumbs } from "@/components/new/breadcrumbs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAppLogout from "@/utils/logout";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Page({ children }) {
  const navigate = useNavigate();
  const handleLogout = useAppLogout();
  const user = useSelector((state) => state.auth.user);
  const isStandardUser = user?.user_type_id === 1 || user?.user_type_id === "1";
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const LogoutDialog = () => (
    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the login page and your session will end.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Confirm Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isStandardUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 p-4 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <footer className="h-8 flex items-center justify-between gap-2 px-4 py-2 text-xs border-t bg-muted/50">
          <span>© 2025-26 All Rights Reserved</span>
          <span>Crafted with ❤️ by AG Solutions</span>
        </footer>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-primary/30" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 inline-block"
            />
            <Breadcrumbs onBack={handleBackClick} />
          </div>
          <div className="px-4">
            <Button variant="ghost" size="sm" onClick={() => setIsLogoutDialogOpen(true)} className="text-muted-foreground hover:text-destructive flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 pt-0 min-w-0">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 rounded-xl p-2 min-w-0 w-full">
            {children}
          </div>
        </main>
        <LogoutDialog />
        <footer className="hidden sm:block sticky bottom-0 z-10 h-8 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between gap-2 p-2 text-xs rounded-md border-t-2 border-primary">
            <span>© 2025-26 All Rights Reserved</span>
            <span>Crafted with ❤️ by AG Solutions</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
