import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Database,
  Pencil,
  Settings,
  Menu,
  X as XIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useAppSettings } from "../contexts/AppSettingsContext";
import { SettingsDialog } from "./SettingsDialog";

export function Navigation() {
  const location = useLocation();
  const { userName, setUserName, t } = useAppSettings();

  /* ── first-visit prompt ──────────────────────────── */
  const [showPrompt, setShowPrompt] = useState(() => userName === null);
  const [promptInput, setPromptInput] = useState("");
  const promptRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPrompt && promptRef.current) promptRef.current.focus();
  }, [showPrompt]);

  const confirmPrompt = () => {
    const trimmed = promptInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setShowPrompt(false);
  };

  /* ── inline title editing ───────────────────────── */
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = inputValue.trim();
    if (trimmed) setUserName(trimmed);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setIsEditing(false);
  };

  /* ── settings dialog ─────────────────────────────── */
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── mobile menu – close via NavLink onClick instead of effect ── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── derived ─────────────────────────────────────── */
  const displayName = userName ?? "My";
  const titleText = `${displayName}'s Dashboard`;

  const navItems = [
    { path: "/", label: t("tasks"), icon: CheckSquare },
    { path: "/dashboard", label: t("workHours"), icon: Clock },
    { path: "/backups", label: t("backups"), icon: Database },
  ];

  const NavLink = ({ path, label, icon: Icon }: (typeof navItems)[0]) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* ── first-visit prompt ── */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("welcome")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("enterYourName")}
              </p>
            </div>
            <input
              ref={promptRef}
              type="text"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder={t("yourName")}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmPrompt()}
            />
            <button
              onClick={confirmPrompt}
              disabled={!promptInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {t("letsGo")}
            </button>
          </div>
        </div>
      )}

      {/* ── settings dialog ── */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* ── navbar ── */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: logo + title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <LayoutDashboard className="h-6 w-6 md:h-7 md:w-7 text-blue-600 shrink-0" />
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={handleEditKeyDown}
                  className="text-base md:text-xl font-bold bg-transparent border-b-2 border-blue-500 text-gray-900 dark:text-white focus:outline-none w-36 md:w-48"
                />
              ) : (
                <button
                  onDoubleClick={() => {
                    setInputValue(userName ?? "");
                    setIsEditing(true);
                  }}
                  title={t("doubleclickRename")}
                  className="flex items-center gap-1.5 group cursor-default min-w-0"
                >
                  <span className="text-base md:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {titleText}
                  </span>
                  <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                </button>
              )}
            </div>

            {/* Centre: desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.path} {...item} />
              ))}
            </div>

            {/* Right: gear + mobile hamburger */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(true)}
                title={t("settings")}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t("menu")}
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
