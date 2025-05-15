import { Paystack } from "paystack-sdk";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error(
    "Paystack secret key not found in environment variables. Paystack functionality will be disabled."
  );
  // Depending on the app's needs, you might throw an error here.
}

// Initialize Paystack SDK
// The SDK might throw an error if the key is missing, handle this gracefully.
let paystack: Paystack | null = null;
try {
  if (PAYSTACK_SECRET_KEY) {
    paystack = new Paystack(PAYSTACK_SECRET_KEY);
  }
} catch (error) {
  console.error("Failed to initialize Paystack SDK:", error);
}

// Helper function to ensure Paystack is initialized
function getPaystackInstance(): Paystack {
  if (!paystack) {
    throw new Error("Paystack SDK not initialized. Check API key.");
  }
  return paystack;
}

// --- Transaction Functions ---

/**
 * Initializes a Paystack transaction.
 * @param details - Transaction details (email, amount in kobo, callback_url, etc.)
 * @returns Paystack API response, typically includes authorization_url, access_code, reference.
 */
export const initializeTransaction = async (details: {
  email: string;
  amount: number; // Amount in kobo (lowest currency unit)
  currency?: string; // e.g., NGN, GHS, USD. Defaults based on your Paystack account.
  reference?: string; // Optional: Unique transaction reference. If not provided, Paystack generates one.
  callback_url?: string; // URL to redirect to after payment attempt
  plan?: string; // Plan code for subscription payments
  metadata?: Record<string, any>; // Custom data
  channels?: (
    | "card"
    | "bank"
    | "ussd"
    | "qr"
    | "mobile_money"
    | "bank_transfer"
  )[];
  // Add other valid parameters from Paystack API docs
}) => {
  const ps = getPaystackInstance();
  try {
    // Ensure amount is an integer
    const amountInKobo = Math.round(details.amount).toString();
    const response = await ps.transaction.initialize({
      ...details,
      amount: amountInKobo,
    });
    console.log("Paystack Initialize Transaction Response:", response);
    // Expected success structure: { status: true, message: string, data: { authorization_url, access_code, reference } }
    return response;
  } catch (error: any) {
    console.error(
      "Error initializing Paystack transaction:",
      error?.response?.data || error.message
    );
    // Rethrow or return a structured error
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to initialize Paystack transaction."
    );
  }
};

/**
 * Verifies a Paystack transaction status.
 * @param reference - The transaction reference.
 * @returns Paystack API response with transaction details.
 */
export const verifyTransaction = async (reference: string) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.transaction.verify(reference);
    console.log("Paystack Verify Transaction Response:", response);
    // Expected success structure: { status: true, message: string, data: { id, status, reference, amount, currency, channel, customer, metadata, ... } }
    return response;
  } catch (error: any) {
    console.error(
      `Error verifying Paystack transaction ${reference}:`,
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to verify Paystack transaction."
    );
  }
};

// --- Plan Functions (for Subscriptions) ---

/**
 * Creates a payment plan on Paystack.
 * @param details - Plan details (name, interval, amount in kobo).
 * @returns Paystack API response.
 */
export const createPlan = async (details: {
  name: string;
  interval:
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "annually";
  amount: number; // Amount in kobo
  currency?: string; // e.g., NGN
  description?: string;
}) => {
  const ps = getPaystackInstance();
  try {
    const amountInKobo = Math.round(details.amount);
    const response = await ps.plan.create({ ...details, amount: amountInKobo });
    console.log("Paystack Create Plan Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error creating Paystack plan:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to create Paystack plan."
    );
  }
};

/**
 * Fetches all payment plans from Paystack.
 * @param params - Optional query parameters (e.g., perPage, page, status, interval).
 * @returns Paystack API response.
 */
export const listPlans = async (params?: {
  perPage: number;
  page: number;
  amount: number;
  status?: string;
  interval?: number;
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.plan.list(params);
    console.log("Paystack List Plans Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error listing Paystack plans:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to list Paystack plans."
    );
  }
};

/**
 * Get a plan by the ID or Plan Code
 * @param planCode
 * @returns Paystack API response
 */
export async function getPlan(planCode: string) {
  const ps = getPaystackInstance();
  try {
    const response = await ps.plan.fetch(planCode);
    console.log("Paystack Get Plan Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error geting Paystack plan:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to get Paystack plan."
    );
  }
}

// --- Subscription Functions ---

/**
 * Creates a subscription on Paystack.
 * Requires customer code/email and plan code.
 * @param details - Subscription details.
 * @returns Paystack API response.
 */
export const createSubscription = async (details: {
  customer: string; // Customer email or code
  plan: string; // Plan code
  authorization?: string; // Optional: Authorization code for charging card
  start_date?: Date;
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.subscription.create(details);
    console.log("Paystack Create Subscription Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error creating Paystack subscription:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to create Paystack subscription."
    );
  }
};

/**
 * Fetches all subscriptions from Paystack.
 * @param params - Optional query parameters (e.g., perPage, page, customer, plan).
 * @returns Paystack API response.
 */
export const listSubscriptions = async (params?: {
  perPage?: number;
  page?: number;
  customer?: number; // Customer ID
  plan?: number; // Plan ID
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.subscription.list(params);
    console.log("Paystack List Subscriptions Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error listing Paystack subscriptions:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to list Paystack subscriptions."
    );
  }
};


/**
 * Disables a subscription on Paystack.
 * @param details - Subscription code and token.
 * @returns Paystack API response.
 */
export const disableSubscription = async (details: {
  code: string;
  token: string;
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.subscription.disable(details);
    console.log("Paystack Disable Subscription Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error disabling Paystack subscription:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to disable Paystack subscription."
    );
  }
};

/**
 * Enables a subscription on Paystack.
 * @param details - Subscription code and token.
 * @returns Paystack API response.
 */
export const enableSubscription = async (details: {
  code: string;
  token: string;
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.subscription.enable(details);
    console.log("Paystack Enable Subscription Response:", response);
    return response;
  } catch (error: any) {
    console.error(
      "Error enabling Paystack subscription:",
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to enable Paystack subscription."
    );
  }
};

export const createCustomer = async (details: {
  email: string;
  first_name: string;
  last_name: string;
}) => {
  const ps = getPaystackInstance();
  try {
    const response = await ps.customer.create(details);
    console.log("Paystack Create Customer Response:", response); // Corrected log message
    return response;
  } catch (error: any) {
    console.error(
      "Error creating Paystack customer:", // Corrected error message
      error?.response?.data || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        error.message ||
        "Failed to create Paystack customer." // Corrected error message
    );
  }
};

// Add other necessary functions (e.g., fetching customers, refunds) as needed.
