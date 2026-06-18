import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";

const ThemeToggle = () => {
  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    const newChecked = !checked;

    setChecked(newChecked);
    toggleDarkMode(newChecked);

    localStorage.setItem("darkMode", `${newChecked}`);
  };

  const toggleDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");

    if (darkMode === "true") {
      document.body.classList.add("dark");
      setChecked(true);
    }
  }, []);

  return (
    <div
      className={classNames(
        "relative inline-block w-16 select-none rounded-full border-4 border-transparent align-middle transition duration-200 ease-in hover:border-[#D9E4FF]"
      )}
      onClick={() => handleToggle()}
    >
      <label
        htmlFor="theme-toggle"
        className={classNames(
          "block h-7 cursor-pointer overflow-hidden rounded-full border-2 transition-colors duration-200 ease-in",
          {
            ["border-dark-toggle bg-dark-toggle"]: checked,
            ["border-light-toggle bg-accent-subdued hover:border-primary-accent-200 hover:bg-primary-accent-200 bg-light-toggle"]:
              !checked,
          }
        )}
      >
        <span
          className={classNames(
            "block h-6 w-6 p-1 translate-x-0 transform text-white rounded-full shadow transition-transform duration-200 ease-in",
            {
              ["translate-x-7 bg-dark-toggle-2"]: checked,
              ["bg-light-toggle-2"]: !checked,
            }
          )}
        >
          {checked ? <MoonIcon /> : <SunIcon />}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
