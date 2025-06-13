"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface EventsLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export default function EventsLayout({ children, params }: EventsLayoutProps) {
  const [adminName, setAdminName] = useState("");


  useEffect(() => {
    const fetchAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAdminName(user?.user_metadata?.full_name || "Admin");
    };
    fetchAdminData();
  }, []);

  return (  
    <main >
      {children}
    </main>
  );
}
