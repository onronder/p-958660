
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import NotificationSidebar from "@/components/NotificationSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    console.log("Logout button clicked, calling signOut()");
    await signOut();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <FlowTechsSidebar onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <NotificationSidebar />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
