// utils/validators.ts
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone: string): boolean => {
    // Giả sử số điện thoại phải gồm 10-11 chữ số
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone);
  };
  