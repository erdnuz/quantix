import styles from "./pills.module.css";

const Pill = ({ size=1, label, selected, onClick }) => {
  return (
    <button
      className={`${styles["pill"]} ${selected ? styles["pill-selected"] : ""} ${size===0 ? styles["small"] : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export function PillGroup({ currentPill, size=1, onSelect, options }) {

  const handlePillClick = (index) => {
    if (currentPill !== index) onSelect(index);  // Update the parent state
  };

  return (
    <div className={styles["pill-group"]}>
      {options.map((option, index) => (
        <Pill
          size={size}
          key={option}
          label={option}
          selected={currentPill === index}  // Compare with currentPill
          onClick={() => handlePillClick(index)}  // Call onSelect when clicked
        />
      ))}
    </div>
  );
}
