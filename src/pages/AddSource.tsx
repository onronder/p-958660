
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddSource = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the sources page and open the Shopify modal
    const redirectToSources = () => {
      navigate("/sources", { state: { openShopifyModal: true } });
    };
    
    redirectToSources();
  }, [navigate]);

  return null; // This component will redirect immediately
};

export default AddSource;
