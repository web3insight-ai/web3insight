const metadata = {
  title: "Web3Insights",
  tagline: "Developer Report",
  description: "A comprehensive metric system for evaluating Web3 Ecosystems, Communities and Repos.",
};

function getMetadata() {
  return {...metadata};
}

function getTitle() {
  return metadata.title;
}

function getTagline() {
  return metadata.tagline;
}

function getDescription() {
  return metadata.description;
}

export { getMetadata, getTitle, getTagline, getDescription };
