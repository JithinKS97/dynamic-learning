/* eslint-disable react/prop-types */
import React from 'react';
import { FaFileMedical, FaFolderPlus } from 'react-icons/fa';

const FolderFileOption = ({ handleFolderAddPress, handleFileAddPress }) => (
  <div className="dashboard__folderfile-options__main">
    <div>
      <FaFileMedical
        onClick={() => { handleFileAddPress(); }}
        size="1.7rem"
        className="dashboard__folderfile-options__icon"
      />
      <FaFolderPlus
        onClick={() => { handleFolderAddPress(); }}
        size="1.7rem"
        className="dashboard__folderfile-options__icon"
        style={{ marginLeft: '1rem' }}
      />
    </div>
  </div>
);

export default FolderFileOption;
