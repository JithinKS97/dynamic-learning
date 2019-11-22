import React from "react";
import { GoSearch } from "react-icons/go";

const SearchBar = () => {
  return (
    <div className="sharedResources__searchBoxContainer">
      <GoSearch style={{ marginTop: "0.2rem" }} size={25} />
      <input className="sharedResources__input"></input>
    </div>
  );
};

export default SearchBar;
