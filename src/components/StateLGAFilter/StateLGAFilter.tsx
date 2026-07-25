import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";

import statesLgas from "../../lib/states-lgas.json";

import styles from "./StateLGAFilter.module.css";

interface StateLGAFilterProps {
  selectedState: string | null;
  selectedLga: string | null;
  onStateChange: (state: string | null) => void;
  onLgaChange: (lga: string | null) => void;
}

const StateLGAFilter = ({
  selectedState,
  selectedLga,
  onStateChange,
  onLgaChange,
}: StateLGAFilterProps) => {
  const [openPanel, setOpenPanel] = useState<"state" | "lga" | null>(null);
  const [stateSearch, setStateSearch] = useState("");
  const [lgaSearch, setLgaSearch] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  const states = Object.keys(statesLgas);
  const lgas = selectedState
    ? statesLgas[selectedState as keyof typeof statesLgas]
    : [];

  const filteredStates = states.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase()),
  );
  const filteredLgas = lgas.filter((l) =>
    l.toLowerCase().includes(lgaSearch.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectState = (state: string) => {
    onStateChange(state);
    onLgaChange(null);
    setStateSearch("");
    setOpenPanel(null);
  };

  const handleSelectLga = (lga: string) => {
    onLgaChange(lga);
    setLgaSearch("");
    setOpenPanel(null);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.field}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpenPanel(openPanel === "state" ? null : "state")}
        >
          <MapPin size={18} className={styles.triggerIcon} />
          <span>{selectedState ?? "States"}</span>
        </button>

        {openPanel === "state" && (
          <div className={styles.panel}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                autoFocus
                type="text"
                placeholder="Search states"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.list}>
              {filteredStates.length === 0 && (
                <div className={styles.emptyItem}>No states found</div>
              )}
              {filteredStates.map((state) => (
                <button
                  type="button"
                  key={state}
                  className={styles.item}
                  onClick={() => handleSelectState(state)}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.field}>
        <button
          type="button"
          className={styles.trigger}
          disabled={!selectedState}
          onClick={() => setOpenPanel(openPanel === "lga" ? null : "lga")}
        >
          <Navigation size={18} className={styles.triggerIcon} />
          <span>{selectedLga ?? "LGA"}</span>
        </button>

        {openPanel === "lga" && selectedState && (
          <div className={styles.panel}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                autoFocus
                type="text"
                placeholder="Search LGA"
                value={lgaSearch}
                onChange={(e) => setLgaSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.list}>
              {filteredLgas.length === 0 && (
                <div className={styles.emptyItem}>No LGAs found</div>
              )}
              {filteredLgas.map((lga) => (
                <button
                  type="button"
                  key={lga}
                  className={styles.item}
                  onClick={() => handleSelectLga(lga)}
                >
                  {lga}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateLGAFilter;
