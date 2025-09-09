import React from "react";
import { IconHash, IconCheck, IconX } from "../icons";
import styles from "./tags.module.css";

const Tag = ({ item, size=1, index, isSelected, onClick, iconType }) => {
  return (
    <div
      className={`${styles['tag-container']} ${isSelected ? styles.tagged : ""} ${size?'':styles.small}`}
      onClick={() => onClick(index)}
    >
      {isSelected &&
        (iconType === "hash" ? (
          <IconHash size={size?"16":"14"} className="icon-brand" />
        ) : iconType === "check" ? (
          <IconCheck size={size?"16":"14"} className="icon-brand" />
        ) : (
          <IconX size={size?"16":"14"} className="icon-brand" />
        ))}
      {item}
    </div>
  );
};

export function FilterGroup({ items }) {
  return (
    <div className={styles["tag-group"]}>
      {items.map((item, index) => (
        item.display ? (
          <Tag
            key={index}
            item={item.display + ' ' + item.label}
            index={index}
            isSelected={true}
            onClick={() => item.onRemove()}
            iconType='X'
          />
        ) : null
      ))}

    </div>
  );
};

export function TagGroup({ items, size=1, iconType, selectedIndices, setSelectedIndices }) {
  const handleTagClick = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedIndices((prev) => [...prev, index]);
    }
  };

  return (
    <div className={styles["tag-group"]}>
      {items.map((item, index) => (
        <Tag
          key={index}
          item={item}
          size={size}
          index={index}
          isSelected={selectedIndices.includes(index)}
          onClick={handleTagClick}
          iconType={iconType}
        />
      ))}
    </div>
  );
};