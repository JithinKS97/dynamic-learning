/* eslint-disable import/prefer-default-export, camelcase */
export const generateSrc = (username, project_id) => (
  `https://editor.p5js.org/${username}/embed/${project_id}`
);

export const isValidp5EmbedTag = (embedTag) => {
  if (embedTag.match('<iframe src="https://editor.p5js.org/[ A-Za-z0-9_@./#&+-]*/embed/[ A-Za-z0-9_@./#&+-]*"></iframe>')) {
    return true;
  }
  return false;
};
