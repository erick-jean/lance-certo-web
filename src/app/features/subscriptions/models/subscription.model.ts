export interface SubscriptionCheckoutRequest {
  cardTokenId: string;
}

export interface SubscriptionCheckoutResponse {
  message: string;
  subscription?: {
    id: string;
    status: string;
  };
}
