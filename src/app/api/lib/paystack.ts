interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      userId: string;
      plan: string;
      email: string;
      isRenewal?: boolean;
      remainingDays?: number
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
  };
}

export class PaystackService {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    if (!this.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is required");
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Paystack API error");
    }

    return response.json();
  }

  async initializePayment(params: {
    email: string;
    amount: number;
    reference: string;
    callback_url: string;
    metadata: {
      userId: string;
      plan: string;
      email: string;
      promoCode?: string | null;
      discount?: number;
      originalAmount?: number;
      finalAmount?: number;
      isRenewal?: boolean;
      remainingDays?: number
    };
  }): Promise<PaystackInitializeResponse> {
    return this.makeRequest("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    return this.makeRequest(`/transaction/verify/${reference}`);
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string
  ): Promise<boolean> {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(payload, "utf-8")
      .digest("hex");

    return hash === signature;
  }

  generateReference(userId: string): string {
    return `cheflymenuapp_${userId}_${Date.now()}`;
  }
}

export const paystack = new PaystackService();
