// Environment-aware base path configuration
export const getBasePath = () => {
  // In development, don't use a base path
  if (import.meta.env.DEV) {
    return "";
  }
  
  // For GitHub Pages, use the repository name
  if (window.location.hostname.includes('github.io')) {
    return "/customer-panel-builder-poc";
  }
  
  // For other production environments, you can configure as needed
  return "";
};

export const getFullUrl = (path: string = "") => {
  const basePath = getBasePath();
  const baseUrl = window.location.origin;
  return `${baseUrl}${basePath}${path}`;
};
