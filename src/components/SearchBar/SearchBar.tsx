import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (term: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Community name or ID",
}: SearchBarProps) => {
  return (
    <div className={styles.wrapper}>
      <Search size={20} className={styles.searchIcon} />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />

      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
