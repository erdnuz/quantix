import styles from "./tabs.module.css";

const Tab = ({ label, selected, onClick }) => {
  return (
    <button
      className={`${styles.tab} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export function TabGroup({ currentTab, onSelect, options }) {
  const handleTabClick = (index) => {
    if (currentTab !== index) onSelect(index);  // Update the parent state
  };

  return (
    <div className={styles.tabGroup}>
      {options.map((option, index) => (
        <Tab
          key={option}
          label={option}
          selected={currentTab === index}  // Compare with currentTab
          onClick={() => handleTabClick(index)}  // Call onSelect when clicked
        />
      ))}
    </div>
  );
}
