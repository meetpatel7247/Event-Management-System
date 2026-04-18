import React from 'react';
import styles from './NavSearch.module.css';

const NavSearch = ({ onSearch }) => {
    return (
        <div className={styles.searchWrapper}>
            <input
                type="text"
                placeholder="Search for events, plays, sports and activities"
                className={styles.searchInput}
                onChange={(e) => onSearch && onSearch(e.target.value)}
            />
        </div>
    );
};

export default NavSearch;
