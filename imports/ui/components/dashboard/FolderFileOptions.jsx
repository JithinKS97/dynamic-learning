/* eslint-disable react/prop-types */
import React from 'react';

import { Icon } from 'react-icons-kit';
import { folder_add } from 'react-icons-kit/ikons/folder_add';
import { document_add } from 'react-icons-kit/ikons/document_add';

const FolderFileOption = ({ handleFolderAddPress, handleFileAddPress }) => (
  <div className="dashboard__folderfile-options__main">
    <div>
      <Icon
        icon={document_add}
        onClick={() => { handleFileAddPress(); }}
        size="1.7rem"
        className="dashboard__folderfile-options__icon"
      />
      <Icon
        color="grey"
        icon={folder_add}
        onClick={() => { handleFolderAddPress(); }}
        size="1.7rem"
        className="dashboard__folderfile-options__icon"
        style={{ marginLeft: '1rem' }}
      />
    </div>
  </div>
);

export default FolderFileOption;
