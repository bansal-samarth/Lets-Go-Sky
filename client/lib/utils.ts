// client/lib/utils.ts

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  export const calculateDuration = (departureTime: string, arrivalTime: string): string => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
  
    if (durationMs < 0) {
      console.warn("calculateDuration: arrivalTime is before departureTime or dates are invalid for flight.", {departureTime, arrivalTime});
      return "Invalid"; // Or handle error appropriately
    }
  
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0 && minutes === 0 && durationMs > 0 && durationMs < 60000) {
      return '< 1m';
    }
    if (hours === 0 && minutes === 0 && durationMs === 0){
      return '0m';
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  export const displayTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
      });
    } catch (e) {
      console.error("displayTime error for date:", dateString, e);
      return "Invalid Time";
    }
  };
  
  export const displayShortDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
      });
    } catch (e) {
      console.error("displayShortDate error for date:", dateString, e);
      return "Invalid Date";
    }
  };