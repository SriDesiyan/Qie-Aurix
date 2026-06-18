import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
};

const Card = ({ children }: CardProps) => {
  return (
    <div className="dark:text-white shadow-card p-10 rounded-card bg-white dark:bg-primary-950 w-full">
      {children}
    </div>
  );
};

export default Card;
