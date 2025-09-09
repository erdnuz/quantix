"use client"
import {useState} from 'react';
import { TagGroup, Select, Button } from '../../components/primitive';
import { useAuth } from '../../services/useAuth';
import { createPortfolio } from '../../services/firebase/db';
import styles from '@styles/comp/form.module.css'
import styles2 from './newportfolio.module.css'

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

function toTitleCase(str) {
    return str
        .toLowerCase()  // Convert to lowercase
        .split(' ')     // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' ');     // Join the words back together
}
  

export const NewPortfolio = () => 
    {
    const [pill, setPill] = useState(1);
    const [selectedIndices, setSelectedIndices] = useState([])
    const [initial, setInitial] = useState(1)

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")

    const { currentUser } = useAuth();

    function reset() {
        setSelectedIndices([]);
        setInitial(1);
        setTitle("");
        setDescription("")
        setError("")
    }

    function handleCreate() {
        if (!title) {
            setError("Please provide a title for your portfolio")
            return;
        }
        createPortfolio({
            userId: currentUser.id, 
            initialCash:[1000, 10000, 100000][initial], 
            title:toTitleCase(title), 
            description:description, 
            tags:selectedIndices}, (id)=>{
                reset();
                window.location.href=`/dash/`
            })
        
    }

    return (
    <div>
        
        
        <div className={styles2.container}>
        
        <div className={styles2.flexRow}>
            <div className={`${styles.group} ${styles2.inputs}`} >
                <input
                    type="text"
                    id="text"
                    className={`${styles.input} small`}
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        setError("");
                    }}
                    style={{width:'100%', maxWidth:'none', boxSizing:'border-box'}}
                    placeholder="Choose a title"
                />
                <textarea
                id="description"
                className={`${styles.input} small`}
                value={description}
                onChange={(e) => {
                setDescription(e.target.value);
                setError("");
                }}
                style={{width:'100%', maxWidth:'none', boxSizing:'border-box'}}
                placeholder="Describe your portfolio"
                rows="4"
            />
            </div>
            <div className={`${styles.group} ${styles2.gr}`} >
                <h2 className={`subhead ${styles2.head}`} >Select up to 5 tags ({5-selectedIndices.length} remaining)</h2>
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
        </div>
        <div className={styles2.flexRow}>
            <div style={{display:'flex', flex:1, flexDirection:'row', gap:'24px', maxWidth:'480px', justifyContent:'space-between'}}>
                <h2 className={`body ${styles2.initText}`} >Select your intial investment</h2>
                <Select options={[["$1k"], ["$10k"], ["$100k"]]} selected={initial} setSelected={setInitial}/>
            </div>
            <h2 className={`body ${styles2.bodyText}`}>Investments are simulated to track progress, never risking real funds</h2>
        </div>
        {error && <p className="error small">{error}</p>}
        <div className={styles2.flexRow}>
        <div style={{display:'flex', gap:'8px', flex:1, maxWidth:'480px'}}>
              <Button
                type="secondary"
                label="Cancel"
                onClick={reset}
              />
              <Button
                type="brand"
                label="Create Portfolio"
                disabled={currentUser===null}
                onClick={handleCreate}
              />
        </div>  
        <h2 className={`body ${styles2.bodyText}`}>
            After creating your portfolio, you can add or remove assets by searching in the navigation or through the <a style={{fontWeight:'bold', cursor:'pointer'}} href="/screener">Screener</a>.
        </h2>

        </div>
        
    </div>
        
    </div>
);
}



