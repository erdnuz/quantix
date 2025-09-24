import React, { useState, useEffect } from "react";
import { Button } from "../primitive/Button";
import { BaseDialog } from "./BaseDialog";
import { TagGroup } from "../primitive";
import { deletePortfolio, updatePortfolio } from "../../../services/firebase/db";
import { Portfolio, PortfolioTag } from "../../../types";

const tagItems = [
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",
  "Short-term", "Long-term",
] as PortfolioTag[];


interface EditPortfolioDialogProps {
  isOpen: boolean;
  portfolio: Portfolio | null;
  onClose: () => void;
  setPortfolio: (p: Portfolio) => void;
}

function removeContradictions(prev: number[], n: number[]): number[] {
  const newList = n.filter((t) => !prev.includes(t));
  if (!newList.length) return n;

  const newTag = newList[0];

  if (newTag < 2) n = n.filter(index => index === newTag || index > 1);
  if (newTag === 4 || newTag === 5) n = n.filter(index => index === newTag || index < 4 || index > 5);
  if (newTag === 8 || newTag === 9) n = n.filter(index => index === newTag || index < 8 || index > 9);
  if (11 < newTag) n = n.filter(index => index === newTag || index < 12);

  if (n.length > 5) return prev;
  return n;
}

export function EditPortfolioDialog({
  isOpen,
  portfolio,
  onClose,
  setPortfolio,
}: EditPortfolioDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>(portfolio?.tags.map(t => tagItems.indexOf(t)) || []);

  useEffect(() => {
    setSelectedIndices(portfolio?.tags.map(t => tagItems.indexOf(t)) || []);
  }, [portfolio]);

  function close() {
    setTitle("");
    setDescription("");
    setSelectedIndices(portfolio?.tags.map(t => tagItems.indexOf(t)) || []);
    setError("");
    onClose();
  }

  const handleUpdatePortfolio = async () => {
    if (!portfolio) return;

    const titleChanged = title && title !== portfolio.title;
    const descriptionChanged = description && description !== portfolio.description;
    const tagsChanged = selectedIndices && selectedIndices !== portfolio?.tags.map(t => tagItems.indexOf(t));

    if (!(titleChanged || descriptionChanged || tagsChanged)) {
      close();
      return;
    }

    const newPortfolio = {
      ...portfolio,
      title: title || portfolio.title,
      description: description || portfolio.description,
      tags: selectedIndices.map(i => tagItems[i]) || portfolio.tags,
    };

    await updatePortfolio({ portfolio: newPortfolio});
    setPortfolio(newPortfolio);
    close();
  };

  const handleDeletePortfolio = async () => {
    if (!portfolio) return;
    const confirmation = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
    if (!confirmation) return;

    deletePortfolio({
      portfolioId: portfolio.id,
      onSuccess: () => {
        window.location.href = "/dash";
      },
    });
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <div className="flex flex-col gap-2 min-w-xs sm:min-w-sm md:min-w-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-2">Edit Portfolio</h2>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-xs sm:text-sm font-medium">Title</label>
        <input
          type="text"
          id="title"
          className="text-xs sm:text-sm rounded-lg border border-border-light dark:border-border-dark bg-light dark:bg-dark px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          placeholder={portfolio?.title}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-xs sm:text-sm font-medium">Description</label>
        <textarea
          id="description"
          rows={4}
          className="text-xs sm:text-sm rounded-lg border border-border-light dark:border-border-dark bg-light dark:bg-dark px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
          }}
          placeholder={portfolio?.description}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1 ">
        <label htmlFor="tags" className="text-xs sm:text-sm font-medium">Tags</label>
        <TagGroup
          items={tagItems}
          iconType="hash"
          selectedIndices={selectedIndices}
          setSelectedIndices={(lst) => {
            setSelectedIndices((prev) => removeContradictions(prev, lst));
          }}
        />

      </div>

     {/* Action Buttons */}
    <div className="flex gap-2 w-full">
      <Button
        type="secondary"
        label="Cancel"
        onClick={close}
        className="flex-1"
      />
      <Button
        type="brand"
        label="Update"
        onClick={handleUpdatePortfolio}
        className="flex-1 text-center justify-center"
      />
    </div>

    <Button
      type="primary"
      icon="trash"
      label="Delete Portfolio"
      onClick={handleDeletePortfolio}
      className="w-full justify-center text-base"
    />
    </div>
    </BaseDialog>
  );
}
