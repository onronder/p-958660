
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddSource = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the sources page and open the source selector
    const redirectToSources = () => {
      navigate("/sources", { state: { openSourceSelector: true } });
    };
    
    redirectToSources();
  }, [navigate]);

  return null; // This component will redirect immediately
};

export default AddSource;
