
export const useValidation = (
  destinationType: string,
  name: string,
  credentials: Record<string, any>,
  oauthComplete: boolean
) => {
  const canProceedFromStep2 = () => {
    if (name === "") return false;
    
    if (destinationType === "Google Drive" || destinationType === "Microsoft OneDrive") {
      return oauthComplete;
    }
    
    if (destinationType === "AWS S3") {
      return credentials.accessKey && credentials.secretKey && credentials.bucket && credentials.region;
    }
    
    if (destinationType === "FTP/SFTP") {
      const hasCoreFields = credentials.host && credentials.username;
      const hasPasswordAuth = !credentials.useKeyAuth && credentials.password;
      const hasKeyAuth = credentials.useKeyAuth && credentials.privateKey;
      
      return hasCoreFields && (hasPasswordAuth || hasKeyAuth);
    }
    
    if (destinationType === "Custom API") {
      return credentials.baseUrl;
    }
    
    return false;
  };

  return {
    canProceedFromStep2
  };
};
