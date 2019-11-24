import React from 'react';
import { GoSearch } from 'react-icons/go';

const SearchBar = props => (
  <div className="sharedResources__searchBoxContainer">
    <GoSearch style={{ marginTop: '0.2rem' }} size={25} />
    <input
      className="sharedResources__input"
      onChange={(e) => {
        // eslint-disable-next-line react/prop-types
        props.onChange(e.target.value);
      }}
    />
  </div>
);

export default SearchBar;
