const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_API_BASE_URL = "https://api.flutterwave.com/v3";

if (!FLUTTERWAVE_SECRET_KEY) {
  console.error(
    "Flutterwave secret key not found in environment variables. Payment functionality will be severely limited or disabled."
  );
  // Depending on the app's needs, you might throw an error here or allow it to run with limited functionality.
}

interface FlutterwaveErrorResponse<T> {
  status: "error";
  message: string;
  data?: T | null;
}

interface FlutterwaveSuccessResponse<T> {
  status: "success";
  message: string;
  data: T | null;
}

type FlutterwaveResponse<T> =
  | FlutterwaveSuccessResponse<T>
  | FlutterwaveErrorResponse<T>;

async function fetchFlutterwaveAPI<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" = "GET",
  payload?: Record<string, any>
): Promise<FlutterwaveResponse<T>> {
  if (!FLUTTERWAVE_SECRET_KEY) {
    return {
      status: "error",
      message: "Flutterwave API request failed: Secret key is not configured.",
    };
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (payload && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(payload);
  }

  let url = `${FLUTTERWAVE_API_BASE_URL}/${endpoint}`;
  if (payload && method === "GET") {
    const queryParams = new URLSearchParams(
      payload as Record<string, string>
    ).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const responseData: FlutterwaveResponse<T> = await response.json();

    if (!response.ok) {
      // Log more details for server-side debugging
      console.error(
        `Flutterwave API Error (${response.status}) for ${method} ${url}:`,
        responseData
      );
      return {
        status: "error",
        message:
          responseData.message ||
          `API request failed with status ${response.status}`,
        data: responseData.data,
      };
    }
    return responseData;
  } catch (error: any) {
    console.error(
      `Flutterwave API Request Exception for ${method} ${url}:`,
      error
    );
    return {
      status: "error",
      message:
        error.message ||
        "An unexpected error occurred while contacting Flutterwave API.",
    };
  }
}

// Specific Data Interfaces for API responses
export interface InitiatePaymentData {
  link: string;
  // Add other fields if present in the actual response from Flutterwave
}

export interface VerifyTransactionData {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  charged_amount: number;
  currency: string;
  status: "successful" | "pending" | "failed" | "cancelled" | "error";
  payment_type: string;
  created_at: string;
  customer: {
    id: number;
    email: string;
    name?: string;
    phone_number?: string;
  };
  meta?: Record<string, any> | null;
  processor_response?: string;
  card?: any; // Contains card details, often masked
  // Add other fields as per Flutterwave's verify transaction response
}


/**
 * Creates a new payment plan on Flutterwave.
 */
export const createPaymentPlan = async (planDetails: {
  amount: number;
  name: string;
  interval:
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "annually";
  duration?: number;
  currency?: string; // e.g. NGN, USD. Defaults to NGN if not provided by Flutterwave
}) => {
  return fetchFlutterwaveAPI<{
    link: string;
  }>("payment-plans", "POST", planDetails);
};

/**
 * Fetches all payment plans from Flutterwave.
 */
export const getAllPaymentPlans = async (
  params?: Record<string, string | number>
) => {
  return fetchFlutterwaveAPI("payment-plans", "GET", params);
};

/**
 * Fetches a single payment plan from Flutterwave.
 */
export const getPaymentPlan = async (planId: number) => {
  return fetchFlutterwaveAPI(`payment-plans/${planId}`, "GET");
};

/**
 * Initiates a payment (standard flow).
 */
export const initiatePayment = async (paymentDetails: {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options?: string;
  customer: {
    email: string;
    phonenumber?: string;
    name?: string;
  };
  meta?: Record<string, any>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  payment_plan?: number; // For recurring payments
}) => {
  return fetchFlutterwaveAPI<InitiatePaymentData>("payments", "POST", paymentDetails);
};

/**
 * Verifies a transaction status with Flutterwave.
 */
export const verifyTransaction = async (transactionId: string | number) => {
  // The transactionId here is the numeric ID from Flutterwave.
  return fetchFlutterwaveAPI<VerifyTransactionData>(`transactions/${transactionId}/verify`, "GET");
};

/**
 * Fetches all subscriptions from Flutterwave.
 */
export const getAllSubscriptions = async (
  params?: Record<string, string | number>
) => {
  return fetchFlutterwaveAPI("subscriptions", "GET", params);
};

/**
 * Fetches a single subscription by its ID.
 */
export const getSubscription = async (subscriptionId: number) => {
  return fetchFlutterwaveAPI(`subscriptions/${subscriptionId}`, "GET");
};

/**
 * Cancels a subscription on Flutterwave.
 */
export const cancelSubscription = async (subscriptionId: number) => {
  // Flutterwave API uses PUT for cancelling/deactivating subscriptions
  return fetchFlutterwaveAPI(`subscriptions/${subscriptionId}/cancel`, "PUT");
};

/**
 * Activates a previously cancelled subscription on Flutterwave.
 */
export const activateSubscription = async (subscriptionId: number) => {
  // Flutterwave API uses PUT for activating subscriptions
  return fetchFlutterwaveAPI(`subscriptions/${subscriptionId}/activate`, "PUT");
};

/**
 * Initiates a refund for a transaction.
 */
export const createRefund = async (refundDetails: {
  id: number; // Transaction ID to refund
  amount?: number;
}) => {
  // The endpoint is usually /transactions/{id}/refund
  // The payload might just be { amount } if partial, or empty for full.
  // Let's assume the body should contain the amount if provided.
  const payload: { amount?: number } = {};
  if (refundDetails.amount) {
    payload.amount = refundDetails.amount;
  }
  return fetchFlutterwaveAPI(
    `transactions/${refundDetails.id}/refund`,
    "POST",
    payload
  );
};

// Note: The FLUTTERWAVE_PUBLIC_KEY is not used in these backend functions
// as authentication is done via the secret key.
// It might be needed if you were to use Flutterwave's inline JS SDK on the client-side.

// No default export of 'flw' instance needed anymore.
