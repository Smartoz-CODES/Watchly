import {
  Shield,
  Flame,
  UserX,
  Swords,
  DoorOpen,
  HelpCircle,
} from "lucide-react";

import type { IncidentCategory } from "../../types/incident";
import styles from "./CategorySelector.module.css";

interface CategorySelectorProps {
  selectedCategory: IncidentCategory | null;
  otherDescription: string;
  onSelect: (category: IncidentCategory) => void;
  onOtherDescriptionChange: (value: string) => void;
}

const categories: {
  label: IncidentCategory;
  icon: typeof Shield;
}[] = [
  { label: "Theft", icon: Shield },
  { label: "Fire", icon: Flame },
  { label: "Suspicious Person", icon: UserX },
  { label: "Assault", icon: Swords },
  { label: "Break-in", icon: DoorOpen },
  { label: "Other", icon: HelpCircle },
];

const CategorySelector = ({
  selectedCategory,
  otherDescription,
  onSelect,
  onOtherDescriptionChange,
}: CategorySelectorProps) => {
  return (
    <div className={styles.categorySelector}>
      <div className={styles.categoryGrid}>
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.label;

          return (
            <button
              key={category.label}
              type="button"
              className={`${styles.categoryCard} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => onSelect(category.label)}
            >
              <Icon size={28} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {selectedCategory === "Other" && (
        <div className={styles.otherInput}>
          <label htmlFor="other-description">
            What type of incident is this?
          </label>

          <input
            id="other-description"
            type="text"
            placeholder="Enter incident type"
            value={otherDescription}
            onChange={(e) => onOtherDescriptionChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelector;