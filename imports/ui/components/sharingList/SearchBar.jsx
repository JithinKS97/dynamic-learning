import React from 'react';

import { Icon } from 'react-icons-kit';
import { ic_search } from 'react-icons-kit/md/ic_search';

const SearchBar = props => (
  <div className="sharedResources__searchBoxContainer">
    <Icon icon={ic_search} style={{ marginTop: '0.2rem' }} size={25} />
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
