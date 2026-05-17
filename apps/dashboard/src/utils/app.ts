const metadata = {
  title: "Web3Insight",
  tagline: "Web3 Analytics Platform",
  description: "A comprehensive metric system for evaluating Web3 Ecosystems, Communities and Repos.",
};

function getMetadata() {
  return {...metadata};
}

function getTitle() {
  return metadata.title;
}

export { getMetadata, getTitle };
