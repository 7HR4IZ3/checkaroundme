declare module 'flutterwave-node-v3' {
  // Define the shape of the Flutterwave class and its methods here.
  // This is a basic example; you might need to expand it based on the methods you use.
  class Flutterwave {
    constructor(publicKey: string, secretKey: string, useSandbox?: boolean);

    PaymentPlan: {
      create: (payload: any) => Promise<any>;
      get_all: (payload?: any) => Promise<any>;
      get_plan: (id: number) => Promise<any>;
      update: (payload: { id: number; name?: string; amount?: number; status?: string }) => Promise<any>;
      cancel: (payload: { id: number }) => Promise<any>;
    };
    Transaction: {
      initialize: (payload: any) => Promise<any>;
      verify: (payload: { id: string }) => Promise<any>;
      // Add other transaction methods if needed
    };
    Subscription: {
      fetch_all: (payload?: any) => Promise<any>;
      get: (payload: { id: number }) => Promise<any>;
      activate: (payload: { id: number }) => Promise<any>;
      cancel: (payload: { id: number }) => Promise<any>; // Or deactivate
    };
    Refund: {
      create: (payload: any) => Promise<any>;
      // Add other refund methods if needed
    };
    // Add other services like Bill, Transfer, etc. as needed
    [key: string]: any; // For any other properties/methods not explicitly defined
  }
  export default Flutterwave;
}