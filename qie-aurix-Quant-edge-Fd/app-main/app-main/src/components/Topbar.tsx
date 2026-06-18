import classNames from "classnames";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

const Topbar = () => {
  return (
    <div className={classNames("z-30 fixed w-full top-0")}>
      <div className="flex w-full justify-between gap-4 px-6 py-4 backdrop-blur-lg bg[hsla(240,7%,97%,.6)] bg-transparent">
        <div>
          <Image
            className="dark:hidden"
            src={"/qhf_b_font_logo.png"}
            alt="logo"
            width={200}
            height={60}
          />

          <Image
            className={"hidden dark:block py-[5.4px]"}
            src={"/qhf_b_font_logo_dark.png"}
            alt="logo"
            width={200}
            height={60}
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
