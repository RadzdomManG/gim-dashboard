"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Verified personnel credentials database (Synchronized with Backend BUILT_IN_ACCOUNTS)
export const VERIFIED_ACCOUNTS: Record<
  string,
  {
    password: string;
    user: {
      id: string;
      username: string;
      name: string;
      nickname: string;
      email: string;
      role: string;
      isCoreAdmin: boolean;
      avatarColor: string;
      title: string;
      clientScope: string;
      assigned_clients: string[];
    };
  }
> = {
  // 1. Executive Leadership
  "divine.origines": {
    password: "GIM_Divine2026!Strategy",
    user: {
      id: "divine-001",
      username: "divine.origines",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: true,
      avatarColor: "bg-[#3D5249]",
      title: "Founder & Strategy Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "divine": {
    password: "GIM_Divine2026!Strategy",
    user: {
      id: "divine-001",
      username: "divine.origines",
      name: "Divine Origines",
      nickname: "Divine",
      email: "divine@graceinmotion.agency",
      role: "Owner",
      isCoreAdmin: true,
      avatarColor: "bg-[#3D5249]",
      title: "Founder & Strategy Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "rdzgllgo": {
    password: "GIM_Radz2026!Architect",
    user: {
      id: "radz-001",
      username: "rdzgllgo",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Chief Automation Architect & Platform Systems Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "radz": {
    password: "GIM_Radz2026!Architect",
    user: {
      id: "radz-001",
      username: "rdzgllgo",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Chief Automation Architect & Platform Systems Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "radzdom.gallego": {
    password: "GIM_Radz2026!Architect",
    user: {
      id: "radz-001",
      username: "rdzgllgo",
      name: "Radzdom Gallego",
      nickname: "Radz",
      email: "radz@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#466B53]",
      title: "Chief Automation Architect & Platform Systems Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "ra": {
    password: "GIM_RA2026!Finance",
    user: {
      id: "ra-001",
      username: "ra.malinao",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "ra@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Commercial Operations & Billing Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "ra.malinao": {
    password: "GIM_RA2026!Finance",
    user: {
      id: "ra-001",
      username: "ra.malinao",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "ra@graceinmotion.agency",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Commercial Operations & Billing Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },
  "aneweraa.ai@gmail.com": {
    password: "GIM_RA2026!Operations",
    user: {
      id: "ra-002",
      username: "aneweraa.ai@gmail.com",
      name: "Ma. Rose Anne (RA) Malinao",
      nickname: "RA",
      email: "aneweraa.ai@gmail.com",
      role: "Admin",
      isCoreAdmin: true,
      avatarColor: "bg-[#518E6A]",
      title: "Commercial Operations & Billing Lead",
      clientScope: "all",
      assigned_clients: ["All Accounts"],
    },
  },

  // 2. Delivery Squad & Client Specialists
  "erwin.manaog": {
    password: "GIM_Erwin2026!Sprint",
    user: {
      id: "erwin-001",
      username: "erwin.manaog",
      name: "Erwin Manaog",
      nickname: "Erwin",
      email: "erwin@graceinmotion.agency",
      role: "Operations Manager (OM)",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Manager (OM) & Delivery Lead",
      clientScope: "We Rock the Spectrum (WRTS), InVogue Cleans, Studio Nets",
      assigned_clients: ["We Rock the Spectrum (WRTS)", "InVogue Cleans", "Studio Nets"],
    },
  },
  "bj.ricafrente": {
    password: "GIM_BJ2026!Franchise",
    user: {
      id: "bj-001",
      username: "bj.ricafrente",
      name: "BJ Ricafrente",
      nickname: "BJ",
      email: "bj@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Operations Specialist",
      clientScope: "We Rock the Spectrum (WRTS), Grace In Motion (Internal)",
      assigned_clients: ["We Rock the Spectrum (WRTS)", "Grace In Motion (Internal)"],
    },
  },
  "jerold.recaplaza": {
    password: "GIM_Jerold2026!Growth",
    user: {
      id: "jerold-001",
      username: "jerold.recaplaza",
      name: "Jerold Recaplaza",
      nickname: "Jerold",
      email: "jerold@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "Risewise",
      assigned_clients: ["Risewise"],
    },
  },
  "jane.caillio": {
    password: "GIM_Jane2026!Lead",
    user: {
      id: "jane-001",
      username: "jane.caillio",
      name: "Jane Caillio",
      nickname: "Jane",
      email: "jane@graceinmotion.agency",
      role: "Project Lead",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Project Lead",
      clientScope: "NoirLab",
      assigned_clients: ["NoirLab"],
    },
  },
  "jedy.caillio": {
    password: "GIM_Jedy2026!Systems",
    user: {
      id: "jedy-001",
      username: "jedy.caillio",
      name: "Jedy Caillio",
      nickname: "Jedy",
      email: "jedy@graceinmotion.agency",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "InVogue Cleans",
      assigned_clients: ["InVogue Cleans"],
    },
  },
  "ellyka.pama": {
    password: "GIM_Ellyka2026!Assist",
    user: {
      id: "ellyka-001",
      username: "ellyka.pama",
      name: "Ellyka Claire Pama",
      nickname: "Ellyka",
      email: "ellyka@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant",
      clientScope: "InVogue Cleans, Studio Nets",
      assigned_clients: ["InVogue Cleans", "Studio Nets"],
    },
  },
  "joyce.roble": {
    password: "GIM_Joyce2026!Design",
    user: {
      id: "joyce-001",
      username: "joyce.roble",
      name: "Joyce Roble",
      nickname: "Joyce",
      email: "joyce@graceinmotion.agency",
      role: "Project Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Project Specialist",
      clientScope: "Studio Nets",
      assigned_clients: ["Studio Nets"],
    },
  },
  "joy.fabular": {
    password: "GIM_Joy2026!Clean",
    user: {
      id: "joy-001",
      username: "joy.fabular",
      name: "Joy Fabular",
      nickname: "Joy",
      email: "joy@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Operations Assistant",
      clientScope: "InVogue Cleans",
      assigned_clients: ["InVogue Cleans"],
    },
  },
  "aldwin.ops": {
    password: "GIM_Aldwin2026!Ops",
    user: {
      id: "aldwin-001",
      username: "aldwin.ops",
      name: "Aldwin",
      nickname: "Aldwin",
      email: "aldwin@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant",
      clientScope: "We Rock the Spectrum (WRTS)",
      assigned_clients: ["We Rock the Spectrum (WRTS)"],
    },
  },
  "hashim.saudi": {
    password: "GIM_Hashim2026!Tech",
    user: {
      id: "hashim-001",
      username: "hashim.saudi",
      name: "Hashim Saudi",
      nickname: "Hashim",
      email: "hashim@graceinmotion.agency",
      role: "Tech Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Tech Specialist",
      clientScope: "Studio Nets",
      assigned_clients: ["Studio Nets"],
    },
  },
  "kim": {
    password: "GIM_Kimberly2026!GIM",
    user: {
      id: "kimberly-001",
      username: "kimberly.besa",
      name: "Kimberly Besa",
      nickname: "Kimberly",
      email: "kimberly@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Operations Assistant (Juvibolt & GIM)",
      clientScope: "Juvibolt Cybertech, InVogue Cleans, Grace In Motion (Internal)",
      assigned_clients: ["Juvibolt Cybertech", "InVogue Cleans", "Grace In Motion (Internal)"],
    },
  },
  "kimberly.besa": {
    password: "GIM_Kimberly2026!GIM",
    user: {
      id: "kimberly-001",
      username: "kimberly.besa",
      name: "Kimberly Besa",
      nickname: "Kimberly",
      email: "kimberly@graceinmotion.agency",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Operations Assistant (Juvibolt, InVogue & GIM)",
      clientScope: "Juvibolt Cybertech, InVogue Cleans, Grace In Motion (Internal)",
      assigned_clients: ["Juvibolt Cybertech", "InVogue Cleans", "Grace In Motion (Internal)"],
    },
  },

  // 3. Verified Client Principals
  "aaron": {
    password: "Portal_Aaron2026!JB",
    user: {
      id: "aaron-001",
      username: "aaron.ofosu",
      name: "Aaron Ofosu",
      nickname: "Aaron",
      email: "aaron@juviboltcybertech.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Founder, Juvibolt Cybertech",
      clientScope: "Juvibolt Cybertech",
      assigned_clients: ["Juvibolt Cybertech"],
    },
  },
  "aaron.ofosu": {
    password: "Portal_Aaron2026!JB",
    user: {
      id: "aaron-001",
      username: "aaron.ofosu",
      name: "Aaron Ofosu",
      nickname: "Aaron",
      email: "aaron@juviboltcybertech.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Founder, Juvibolt Cybertech",
      clientScope: "Juvibolt Cybertech",
      assigned_clients: ["Juvibolt Cybertech"],
    },
  },
  "matthew.robbins": {
    password: "Portal_Matthew2026!IVC",
    user: {
      id: "matthew-001",
      username: "matthew.robbins",
      name: "Matthew Robbins",
      nickname: "Matthew",
      email: "matthew@invoguecleans.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Founder, InVogue Cleans",
      clientScope: "InVogue Cleans",
      assigned_clients: ["InVogue Cleans"],
    },
  },
  "nathan.blake": {
    password: "Portal_Nathan2026!SN",
    user: {
      id: "nathan-001",
      username: "nathan.blake",
      name: "Nathan Blake",
      nickname: "Nathan",
      email: "nathan@studionets.com.au",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Creative Director, Studio Nets",
      clientScope: "Studio Nets",
      assigned_clients: ["Studio Nets"],
    },
  },
  "nathan": {
    password: "Portal_Nathan2026!SN",
    user: {
      id: "nathan-001",
      username: "nathan.blake",
      name: "Nathan Blake",
      nickname: "Nathan",
      email: "nathan@studionets.com.au",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Creative Director, Studio Nets",
      clientScope: "Studio Nets",
      assigned_clients: ["Studio Nets"],
    },
  },
  "matthew": {
    password: "Portal_Matthew2026!IVC",
    user: {
      id: "matthew-001",
      username: "matthew.robbins",
      name: "Matthew Robbins",
      nickname: "Matthew",
      email: "matthew@invoguecleans.com",
      role: "Client User",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Founder, InVogue Cleans",
      clientScope: "InVogue Cleans",
      assigned_clients: ["InVogue Cleans"],
    },
  },
  "erwin": {
    password: "GIM_Erwin2026!Sprint",
    user: {
      id: "erwin-001",
      username: "erwin.manaog",
      name: "Erwin Manaog",
      nickname: "Erwin",
      email: "em.erwin011@gmail.com",
      role: "Operations Manager (OM)",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Manager (OM) & Delivery Lead",
      clientScope: "We Rock the Spectrum (WRTS), InVogue Cleans, Studio Nets, NoirLab, Risewise, Grace In Motion (Internal)",
      assigned_clients: ["We Rock the Spectrum (WRTS)", "InVogue Cleans", "Studio Nets", "NoirLab", "Risewise", "Grace In Motion (Internal)"],
    },
  },
  "bj": {
    password: "GIM_BJ2026!Franchise",
    user: {
      id: "bj-001",
      username: "bj.ricafrente",
      name: "BJ Ricafrente",
      nickname: "BJ",
      email: "ricafrente.bjl@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Operations Specialist",
      clientScope: "We Rock the Spectrum (WRTS), Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["We Rock the Spectrum (WRTS)", "Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "jerold": {
    password: "GIM_Jerold2026!Growth",
    user: {
      id: "jerold-001",
      username: "jerold.recaplaza",
      name: "Jerold Recaplaza",
      nickname: "Jerold",
      email: "recaplazajerold@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "Risewise, NoirLab, Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["Risewise", "NoirLab", "Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "jane": {
    password: "GIM_Jane2026!Lead",
    user: {
      id: "jane-001",
      username: "jane.caillio",
      name: "Jane Caillio",
      nickname: "Jane",
      email: "hello@theprocessease.com",
      role: "Project Lead",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Project Lead",
      clientScope: "NoirLab, Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["NoirLab", "Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "jedy": {
    password: "GIM_Jedy2026!Systems",
    user: {
      id: "jedy-001",
      username: "jedy.caillio",
      name: "Jedy Caillio",
      nickname: "Jedy",
      email: "jedy@theprocessease.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "InVogue Cleans, Grace In Motion (Internal)",
      assigned_clients: ["InVogue Cleans", "Grace In Motion (Internal)"],
    },
  },
  "aldwin": {
    password: "GIM_Aldwin2026!Ops",
    user: {
      id: "aldwin-001",
      username: "aldwin.ops",
      name: "Aldwin",
      nickname: "Aldwin",
      email: "charlesaldwinlim@gmail.com",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant",
      clientScope: "We Rock the Spectrum (WRTS), Grace In Motion (Internal)",
      assigned_clients: ["We Rock the Spectrum (WRTS)", "Grace In Motion (Internal)"],
    },
  },
  "joy": {
    password: "GIM_Joy2026!Clean",
    user: {
      id: "joy-001",
      username: "joy.fabular",
      name: "Joy Fabular",
      nickname: "Joy",
      email: "baluyotjoy89@gmail.com",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Operations Assistant",
      clientScope: "InVogue Cleans, Grace In Motion (Internal)",
      assigned_clients: ["InVogue Cleans", "Grace In Motion (Internal)"],
    },
  },
  "ellyka": {
    password: "GIM_Ellyka2026!Assist",
    user: {
      id: "ellyka-001",
      username: "ellyka.pama",
      name: "Ellyka Claire Pama",
      nickname: "Ellyka",
      email: "ellykaclairepama@gmail.com",
      role: "Operations Assistant",
      isCoreAdmin: false,
      avatarColor: "bg-[#65746C]",
      title: "Operations Assistant",
      clientScope: "InVogue Cleans, Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["InVogue Cleans", "Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "joyce": {
    password: "GIM_Joyce2026!Design",
    user: {
      id: "joyce-001",
      username: "joyce.roble",
      name: "Joyce Roble",
      nickname: "Joyce",
      email: "joyceroblevaservices@gmail.com",
      role: "Project Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#3D5249]",
      title: "Project Specialist",
      clientScope: "Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "hashim": {
    password: "GIM_Hashim2026!Tech",
    user: {
      id: "hashim-001",
      username: "hashim.saudi",
      name: "Hashim Saudi",
      nickname: "Hashim",
      email: "hashim3898@gmail.com",
      role: "Tech Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Tech Specialist",
      clientScope: "Studio Nets, Grace In Motion (Internal)",
      assigned_clients: ["Studio Nets", "Grace In Motion (Internal)"],
    },
  },
  "marj": {
    password: "GIM_Marj2026!Ops",
    user: {
      id: "marj-001",
      username: "marj.larona",
      name: "Marj Larona",
      nickname: "Marj",
      email: "marjoryann.d.larona@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Operations Specialist",
      clientScope: "Risewise, Grace In Motion (Internal)",
      assigned_clients: ["Risewise", "Grace In Motion (Internal)"],
    },
  },
  "marj.larona": {
    password: "GIM_Marj2026!Ops",
    user: {
      id: "marj-001",
      username: "marj.larona",
      name: "Marj Larona",
      nickname: "Marj",
      email: "marjoryann.d.larona@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#518E6A]",
      title: "Operations Specialist",
      clientScope: "Risewise, Grace In Motion (Internal)",
      assigned_clients: ["Risewise", "Grace In Motion (Internal)"],
    },
  },
  "cy": {
    password: "GIM_Cy2026!Funnels",
    user: {
      id: "cy-001",
      username: "cy.suarilla",
      name: "Cy Suarilla",
      nickname: "Cy",
      email: "cyilsua@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "Risewise, Grace In Motion (Internal)",
      assigned_clients: ["Risewise", "Grace In Motion (Internal)"],
    },
  },
  "cy.suarilla": {
    password: "GIM_Cy2026!Funnels",
    user: {
      id: "cy-001",
      username: "cy.suarilla",
      name: "Cy Suarilla",
      nickname: "Cy",
      email: "cyilsua@gmail.com",
      role: "Operations Specialist",
      isCoreAdmin: false,
      avatarColor: "bg-[#466B53]",
      title: "Operations Specialist",
      clientScope: "Risewise, Grace In Motion (Internal)",
      assigned_clients: ["Risewise", "Grace In Motion (Internal)"],
    },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authSaved = localStorage.getItem("gim_auth_user");
      if (authSaved) {
        router.replace("/");
      }
    }
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check built-in verified accounts (instant local verification)
    const account = VERIFIED_ACCOUNTS[cleanUsername];
    if (account && account.password === cleanPassword) {
      if (typeof window !== "undefined") {
        localStorage.setItem("gim_auth_user", JSON.stringify(account.user));
      }
      setTimeout(() => {
        setLoading(false);
        router.push("/");
      }, 300);
      return;
    }

    // 2. Query Cloud Database (/api/auth/login) for cross-browser, multi-device authentication
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("gim_auth_user", JSON.stringify(data.user));
        }
        setLoading(false);
        router.push("/");
        return;
      }
      if (data && data.error) {
        setLoading(false);
        setError(data.error);
        return;
      }
    } catch (err) {
      console.error("Cloud authentication lookup failed:", err);
    }

    // 3. Fallback Authentication failure
    setTimeout(() => {
      setLoading(false);
      setError("Invalid username or password. All legacy credentials have been revoked. Please use your newly issued GIM Mission Control credentials.");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FBF6F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Mark */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <Image
              src="/gim-mark-green.png"
              alt="GIM"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#242E29]">
          GIM Mission Control
        </h2>
        <p className="text-xs text-[#65746C]">
          Authorized access portal for Grace in Motion personnel
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E8E2DD] rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#242E29] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter assigned username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#242E29]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#65746C]" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FBF6F3]/50 border border-[#E8E2DD] rounded-xl text-xs text-[#242E29] focus:outline-none focus:ring-1 focus:ring-[#518E6A] transition-all"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 mt-2 cursor-pointer"
            >
              <span>{loading ? "Verifying Credentials..." : "Sign In to GIM"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Quick Access Badges for Core Admin Team & Scoped Specialists */}
          <div className="pt-2 border-t border-[#E8E2DD]/80">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#65746C] uppercase tracking-wider">
                Instant Verification Switcher (All Members)
              </p>
              <span className="text-[10px] font-mono text-[#518E6A] font-bold">19 Verified Users</span>
            </div>

            {/* Core Leadership */}
            <div className="mb-2">
              <span className="text-[10px] font-bold text-[#3D5249] block mb-1">Core 3 Admins (Universal Full Access):</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setUsername("radz");
                    setPassword("GIM_Radz2026!Architect");
                  }}
                  className="p-1.5 rounded-xl border border-[#518E6A]/30 bg-[#EBF3EF] hover:bg-[#dcebe3] text-left transition-all"
                >
                  <span className="font-bold text-xs text-[#242E29] block truncate">Radz (Admin)</span>
                  <span className="text-[9px] text-[#518E6A] font-medium block">All Accounts</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("divine");
                    setPassword("GIM_Divine2026!Strategy");
                  }}
                  className="p-1.5 rounded-xl border border-[#3D5249]/30 bg-[#FBF6F3] hover:bg-[#f3ece6] text-left transition-all"
                >
                  <span className="font-bold text-xs text-[#242E29] block truncate">Divine (Owner)</span>
                  <span className="text-[9px] text-[#3D5249] font-medium block">All Accounts</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername("ra");
                    setPassword("GIM_RA2026!Finance");
                  }}
                  className="p-1.5 rounded-xl border border-[#518E6A]/30 bg-[#EBF3EF] hover:bg-[#dcebe3] text-left transition-all"
                >
                  <span className="font-bold text-xs text-[#242E29] block truncate">RA (Admin)</span>
                  <span className="text-[9px] text-[#518E6A] font-medium block">All Accounts</span>
                </button>
              </div>
            </div>

            {/* Scoped Specialists & Client Users */}
            <div>
              <span className="text-[10px] font-bold text-[#65746C] block mb-1">Scoped Specialists &amp; Client Users:</span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1.5 bg-[#FBF6F3]/50 rounded-xl border border-[#E8E2DD]">
                {[
                  { u: "erwin", p: "GIM_Erwin2026!Sprint", label: "Erwin (WRTS, IVC, SN)" },
                  { u: "bj", p: "GIM_BJ2026!Franchise", label: "BJ (WRTS, GIM)" },
                  { u: "kim", p: "GIM_Kimberly2026!GIM", label: "Kim (Juvibolt, IVC)" },
                  { u: "jerold", p: "GIM_Jerold2026!Growth", label: "Jerold (Risewise)" },
                  { u: "jane", p: "GIM_Jane2026!Lead", label: "Jane (NoirLab)" },
                  { u: "jedy", p: "GIM_Jedy2026!Systems", label: "Jedy (InVogue)" },
                  { u: "aldwin", p: "GIM_Aldwin2026!Ops", label: "Aldwin (WRTS)" },
                  { u: "joy", p: "GIM_Joy2026!Clean", label: "Joy (InVogue)" },
                  { u: "ellyka", p: "GIM_Ellyka2026!Assist", label: "Ellyka (InVogue, SN)" },
                  { u: "joyce", p: "GIM_Joyce2026!Design", label: "Joyce (Studio Nets)" },
                  { u: "hashim", p: "GIM_Hashim2026!Tech", label: "Hashim (Studio Nets)" },
                  { u: "marj", p: "GIM_Marj2026!Ops", label: "Marj (Risewise)" },
                  { u: "cy", p: "GIM_Cy2026!Funnels", label: "Cy (Risewise)" },
                  { u: "aaron", p: "Portal_Aaron2026!JB", label: "Aaron (Client: Juvibolt)" },
                  { u: "matthew", p: "Portal_Matthew2026!IVC", label: "Matthew (Client: InVogue)" },
                  { u: "nathan", p: "Portal_Nathan2026!SN", label: "Nathan (Client: Studio Nets)" },
                ].map((item) => (
                  <button
                    key={item.u}
                    type="button"
                    onClick={() => {
                      setUsername(item.u);
                      setPassword(item.p);
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-[#E8E2DD] hover:border-[#518E6A] hover:bg-[#518E6A]/5 text-[10px] font-medium text-[#242E29] transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E2DD] text-center">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#65746C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#518E6A]" />
              <span>Strict Access Governance: Only authenticated accounts permitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
