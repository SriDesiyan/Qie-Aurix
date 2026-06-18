import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentType } from "react";
import Typography from "./Typography";
import classNames from "classnames";
import { CurrencyDollarIcon, Squares2X2Icon } from "@heroicons/react/20/solid";

type SidebarProps = {};

export type NavigationItemProps = {
  label: string;
  href?: string;
  Icon?: ComponentType;
};

const Sidebar = ({}: SidebarProps) => {
  return (
    <div className="fixed z-30 flex h-full w-sidebar flex-col pt-4 shadow-2xl bg-neutral-400 border-base-200 border-r">
      <>
        <div className="px-2">
          <Link href="/" className="relative">
            Logo
            {/* <Image
              src="/logos/tokos-accent-blue.svg"
              width={97}
              height={32}
              alt="logo"
            /> */}
          </Link>
        </div>
        <div className="flex-1 flex items-center">
          <div className="px-2 text-lg w-full flex flex-col gap-2">
            <NavigationItem label="Dashboard" href="/" Icon={Squares2X2Icon} />
            <NavigationItem
              label="Invest"
              href="/invest"
              Icon={CurrencyDollarIcon}
            />
          </div>
        </div>
      </>
    </div>
  );
};

const NavigationItem = ({ Icon, label, href }: NavigationItemProps) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  console.log(router.pathname, href);

  const content = (
    <div className="flex items-center gap-3">
      <div className="w-4">{Icon && <Icon />}</div>
      <Typography variant="labelXS">{label}</Typography>
    </div>
  );
  return (
    <div className={classNames("flex items-center cursor-pointer")}>
      {href ? (
        <Link
          href={href}
          className={classNames(
            "flex w-full gap-3 rounded-lg p-2 transition-colors",
            {
              ["bg-primary-800 text-white"]: isActive,
              ["hover:bg-primary-950"]: !isActive,
            }
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={classNames("flex w-full gap-3 rounded-lg p-2")}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
