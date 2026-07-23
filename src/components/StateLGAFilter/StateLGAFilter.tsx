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
  const states = Object.keys(statesLgas);

  const lgas = selectedState
    ? statesLgas[selectedState as keyof typeof statesLgas]
    : [];

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (!value) {
      onStateChange(null);
      onLgaChange(null);
      return;
    }

    onStateChange(value);
    onLgaChange(null);
  };

  const handleLgaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    onLgaChange(value || null);
  };

  return (
    <div className={styles.container}>
      <select
        value={selectedState ?? ""}
        onChange={handleStateChange}
        className={styles.select}
      >
        <option value="">State</option>

        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        value={selectedLga ?? ""}
        onChange={handleLgaChange}
        disabled={!selectedState}
        className={styles.select}
      >
        <option value="">LGA</option>

        {lgas.map((lga) => (
          <option key={lga} value={lga}>
            {lga}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StateLGAFilter;
