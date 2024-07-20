class customError extends Error {
    status: number;
    details?: any;
  
    constructor(message: string, status: number, details?: any) {
      super(message);
      this.status = status;
      this.details = details;
      Object.setPrototypeOf(this, customError.prototype);
    }
  }
  
  export default customError;
  