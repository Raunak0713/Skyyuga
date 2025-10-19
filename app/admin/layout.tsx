"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkIsAdmin } from "@/lib/checkAdmin";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkIsAdmin().then((isAdmin: boolean) => {
      if (!isAdmin) {
        router.replace("/");
        return;
      }
      setAuthorized(true);
    });
  }, [router]);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <div>{children}</div>;
};

export default AdminLayout;