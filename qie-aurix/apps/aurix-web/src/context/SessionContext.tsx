"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { QiePassIdentity } from "@aurix/core";

export type AuthMode = "DEMO" | "QIE_PASS" | "WALLET" | "UNAUTHENTICATED";
export type NetworkMode = "TESTNET" | "MAINNET";
export type SessionSource = "demo" | "qiepass" | "wallet" | "none";

export interface SessionContextType {
  authMode: AuthMode;
  networkMode: NetworkMode;
  sessionSource: SessionSource;
  address: string | null;
  identity: QiePassIdentity | null;
  isMainnetActive: boolean;
  isDemoActive: boolean;
  setDemoMode: (address?: string, identity?: QiePassIdentity) => void;
  setMainnetMode: (address: string, identity: QiePassIdentity, source: "qiepass" | "wallet") => void;
  setQiePassMode: (address: string, identity: QiePassIdentity) => void;
  clearSession: () => void;
  getActiveNetworkLabel: () => string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>("UNAUTHENTICATED");
  const [networkMode, setNetworkMode] = useState<NetworkMode>("TESTNET");
  const [sessionSource, setSessionSource] = useState<SessionSource>("none");
  const [address, setAddress] = useState<string | null>(null);
  const [identity, setIdentity] = useState<QiePassIdentity | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuthMode = localStorage.getItem("aurix_auth_mode") as AuthMode;
      const storedNetworkMode = localStorage.getItem("aurix_network_mode") as NetworkMode;
      const storedSessionSource = localStorage.getItem("aurix_session_source") as SessionSource;
      const storedAddress = localStorage.getItem("aurix_address");
      const storedIdentity = localStorage.getItem("aurix_identity");

      if (storedAuthMode) setAuthMode(storedAuthMode);
      if (storedNetworkMode) setNetworkMode(storedNetworkMode);
      if (storedSessionSource) setSessionSource(storedSessionSource);
      if (storedAddress) setAddress(storedAddress);
      if (storedIdentity) {
        try {
          setIdentity(JSON.parse(storedIdentity));
        } catch (e) {
          console.error("Failed to parse stored identity", e);
        }
      }
    }
  }, []);

  const setDemoMode = (demoAddress?: string, demoIdentity?: QiePassIdentity) => {
    const defaultAddress = demoAddress || "0x7a4bc9120000000000000000000000000000c912";
    const defaultIdentity: QiePassIdentity = demoIdentity || {
      address: defaultAddress,
      passTokenId: "1024",
      tier: "GUARDIAN",
      verifiedDomains: ["family.aurix.qie", "vault.aurix.qie"],
      isValidator: true,
      communityScore: 98,
      passIssuedAt: Math.floor(Date.now() / 1000) - 540 * 86400,
    };

    setAuthMode("DEMO");
    setNetworkMode("TESTNET");
    setSessionSource("demo");
    setAddress(defaultAddress);
    setIdentity(defaultIdentity);

    localStorage.setItem("aurix_auth_mode", "DEMO");
    localStorage.setItem("aurix_network_mode", "TESTNET");
    localStorage.setItem("aurix_session_source", "demo");
    localStorage.setItem("aurix_address", defaultAddress);
    localStorage.setItem("aurix_identity", JSON.stringify(defaultIdentity));
  };

  const setMainnetMode = (realAddress: string, realIdentity: QiePassIdentity, source: "qiepass" | "wallet") => {
    const mode: AuthMode = source === "wallet" ? "WALLET" : "QIE_PASS";
    setAuthMode(mode);
    setNetworkMode("MAINNET");
    setSessionSource(source);
    setAddress(realAddress);
    setIdentity(realIdentity);

    localStorage.setItem("aurix_auth_mode", mode);
    localStorage.setItem("aurix_network_mode", "MAINNET");
    localStorage.setItem("aurix_session_source", source);
    localStorage.setItem("aurix_address", realAddress);
    localStorage.setItem("aurix_identity", JSON.stringify(realIdentity));
  };

  const setQiePassMode = (realAddress: string, realIdentity: QiePassIdentity) => {
    setMainnetMode(realAddress, realIdentity, "qiepass");
  };

  const clearSession = () => {
    setAuthMode("UNAUTHENTICATED");
    setNetworkMode("TESTNET");
    setSessionSource("none");
    setAddress(null);
    setIdentity(null);

    localStorage.removeItem("aurix_auth_mode");
    localStorage.removeItem("aurix_network_mode");
    localStorage.removeItem("aurix_session_source");
    localStorage.removeItem("aurix_address");
    localStorage.removeItem("aurix_identity");
    
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const getActiveNetworkLabel = () => {
    return networkMode === "MAINNET" ? "QIE MAINNET" : "QIE TESTNET";
  };

  const isMainnetActive = networkMode === "MAINNET";
  const isDemoActive = authMode === "DEMO";

  return (
    <SessionContext.Provider
      value={{
        authMode,
        networkMode,
        sessionSource,
        address,
        identity,
        isMainnetActive,
        isDemoActive,
        setDemoMode,
        setMainnetMode,
        setQiePassMode,
        clearSession,
        getActiveNetworkLabel,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
