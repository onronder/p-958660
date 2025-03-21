
export interface OAuthError {
  error: string;
  description: string;
  detailedMessage?: string;
}

export interface DestinationModalState {
  currentStep: number;
  destinationType: string;
  name: string;
  exportFormat: string;
  schedule: string;
  saveToStorage: boolean;
  credentials: Record<string, any>;
  oauthComplete: boolean;
  oauthError: OAuthError | null;
}
