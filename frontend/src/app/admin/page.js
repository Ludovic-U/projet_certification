"use client";

import { Button } from "@/components/ui";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminPage = () => {
  const { user } = useUser();
  const router = useRouter();

  // Check authorization on mount - redirect if not super_admin
  useEffect(() => {
    if (user && !user.roles?.includes("super_admin")) {
      router.push("/");
    }
  }, [user]);

  return (
    <div className="w-full h-screen bg-gray-100">      
      {/* Main Content */}
     Page en cours de développement...
    </div>
  );
};

export default AdminPage;
