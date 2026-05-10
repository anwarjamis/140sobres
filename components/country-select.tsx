"use client";

import { useState, useRef, useEffect } from "react";

const ALL_COUNTRIES = [
  { code: "CHL", name: "Chile" },
  { code: "ARG", name: "Argentina" },
  { code: "MEX", name: "México" },
  { code: "COL", name: "Colombia" },
  { code: "PER", name: "Perú" },
  { code: "ESP", name: "España" },
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onChange,
  disabled = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedCountry = ALL_COUNTRIES.find((c) => c.code === value);
  const displayText = selectedCountry?.name || "Selecciona";

  const filteredCountries = searchTerm
    ? ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : ALL_COUNTRIES;

  return (
    <div className="field" ref={containerRef}>
      <label>país</label>
      <div
        style={{
          position: "relative",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid var(--line)",
            borderRadius: 12,
            background: "#fff",
            fontSize: 14,
            color: "var(--ink)",
            textAlign: "left",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{displayText}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              color: "var(--ink-3)",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "0 4px 12px #00000015",
              zIndex: 50,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "8px 8px", position: "sticky", top: 0 }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  fontSize: 13,
                  background: "#f9f8f6",
                }}
              />
            </div>

            <div>
              {filteredCountries.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "var(--ink-3)",
                    fontSize: 13,
                  }}
                >
                  No encontrado
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = value === country.code;

                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        onChange(country.code);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "none",
                        background: isSelected
                          ? "var(--yellow)"
                          : "transparent",
                        color: isSelected ? "var(--ink)" : "var(--ink)",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: isSelected ? 600 : 400,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          (e.currentTarget).style.background =
                            "#f9f8f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          (e.currentTarget).style.background =
                            "transparent";
                        }
                      }}
                    >
                      {country.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
