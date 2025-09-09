import React, { useState, useEffect } from "react";
import { Button } from "../primitive/Button"; // Adjust the import path as needed
import { BaseDialog } from "./BaseDialog"; // Assuming BaseDialog is in the components folder
import styles from "@styles/comp/form.module.css"
import { TagGroup } from "../primitive";
import { deletePortfolio, updatePortfolio } from "../../services/firebase/db";


const tagItems = [
  // Investment Strategies
  "Growth", "Value", "Dividend", "Balanced", "Aggressive", "Conservative",

  // Market Focus
  "Emerging Markets", "Emerging Tech", "Small Cap", "Large Cap", "Diversified", "Global",

  // Time Horizon
  "Short-term", "Long-term",
];

function removeContradictions(prev, n) {
  
  const newList = n.filter((t) => !prev.includes(t));

  if (!newList) {
      return n;
  }

  const newTag = newList[0]

  if (newTag<2) {
      n= n.filter(index => (index===newTag||index>1));
  }
  

  if (newTag===4 || newTag===5) {
      n= n.filter(index => (index===newTag||index<4||index>5));
  }

  if (newTag===8||newTag===9) {
      n = n.filter(index => (index===newTag||index<8||index>9));
  }

  if (11 < newTag) {
      n = n.filter(index => (index===newTag||index<12));
  }

  if (n.length>5) {
      return prev;
  }
  return n
};

export function EditPortfolioDialog({ isOpen, portfolio, onClose, setPortfolio}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");

  const [selectedIndices, setSelectedIndices] = useState(portfolio?.tags || [])

  useEffect(() => {
    setSelectedIndices(portfolio?.tags || [])
  }, [portfolio])
  function close() {
    setTitle('');
    setDescription('');
    setSelectedIndices(portfolio?.tags);
    setError('');
    onClose();
  }

  const handleUpdatePortfolio = async () => {
      const titleChanged = title && title !== portfolio?.title;
      const descriptionChanged = description && description !== portfolio?.description;
      const tagsChanged = selectedIndices && selectedIndices !== portfolio?.tags;
  
      // Check if any of the fields have changed
      if (!(titleChanged || descriptionChanged || tagsChanged)) {
        close();
        return;
      }
      const newPortfolio = {...portfolio, title:title || portfolio?.title, description:description || portfolio?.description, tags:selectedIndices || portfolio?.tags}
      updatePortfolio(newPortfolio).then(() =>{
      setPortfolio(newPortfolio)
      close()}
    )
    };
  
    const handleDeletePortfolio = async () => {
      // Step 1: Confirm the user really wants to delete their profile
      const confirmation = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
    
      if (!confirmation) {
        return;  // Exit the function if the user doesn't confirm
      }  
      deletePortfolio({portfolioId:portfolio?.id, onSuccess:()=>{window.location.href="/dash"}});
        
    };

  return (
    <BaseDialog isOpen = {isOpen} onClose={close}>
      <h2 className="head" >Edit Portfolio</h2>
      {error && <p className={`small ${styles.error}`}>{error}</p>}

      <div className={`${styles.group} column`} >
        <label htmlFor="title" className={`${styles.label} body`}>Title</label>
        <input
          type="text"
          id="title"
          className={`${styles.input} small`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          placeholder={portfolio?.title}
        />
      </div>

      <div className={`${styles.group} column`}>
        <label htmlFor="description" className={`${styles.label} body`}>Description</label>
        <textarea
          type="text"
          id="description"
          className={`${styles.input} small`}
          value={description}
          rows ={4}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
          }}
          placeholder={portfolio?.description}
        />
      </div>
      <div className={`${styles.group} column`}>
      <label htmlFor="tags" className="body">Tags</label>
      <TagGroup 
                          items={tagItems} 
                          iconType="hash"
                          size={0} 
                          selectedIndices={selectedIndices} 
                          setSelectedIndices={(lst) => {
                              setSelectedIndices((prev)=>{return removeContradictions(prev, lst(prev))})
                          }} 
                      />
      
      </div>
      <div>
      <div className={styles.links} style={{gap:'8px', marginBottom:'8px'}}>
      <Button
        type="secondary"
        label="Cancel"
        onClick={close}
        className="login-button"
      />
      <Button
        type="brand"
        label="Update"
        onClick={handleUpdatePortfolio}
        className="login-button"
      />
      </div>    
      <Button type="brand" icon='trash' label="Delete Portfolio" onClick={handleDeletePortfolio
      }/> 
      </div>
    </BaseDialog>
  );
}
