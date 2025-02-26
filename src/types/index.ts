export interface DecodedToken {
    fullName: string;
    email: string;
    phone: string;
    userId: string;
    role: "seeker" | "guide" | "admin"; // Add more roles if needed
    iat: number; // Issued at timestamp
    exp: number; // Expiration timestamp
  }
  