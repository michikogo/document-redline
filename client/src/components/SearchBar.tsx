import React, { useState } from "react";
import styles from "../styles/SearchBar.module.css";

type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
};

const SearchBar = ({ onSearch, placeholder = "Search documents…" }: Props) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <button className={styles.button} type="submit">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
