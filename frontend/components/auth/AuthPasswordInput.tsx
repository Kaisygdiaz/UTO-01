"use client";

import { Eye, EyeOff, Lock } from "lucide-react";

type AuthPasswordInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggleVisible: () => void;
};

export default function AuthPasswordInput({
  id,
  label,
  value,
  placeholder,
  visible,
  disabled,
  onChange,
  onToggleVisible,
}: AuthPasswordInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={onToggleVisible}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}