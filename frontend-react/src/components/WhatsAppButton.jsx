import { MADARSA_CONFIG } from '../config/config';

const WhatsAppButton = () => {
  if (!MADARSA_CONFIG.whatsapp.enabled) return null;
  
  const whatsappUrl = `https://wa.me/${MADARSA_CONFIG.whatsapp.number}?text=${encodeURIComponent(MADARSA_CONFIG.whatsapp.message)}`;
  
  return (
    <a 
      href={whatsappUrl} 
      className="whatsapp-float" 
      target="_blank" 
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp"></i>
    </a>
  );
};

export default WhatsAppButton;

