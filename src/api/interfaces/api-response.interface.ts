export interface ApiResponse {
  message: string;
  status: boolean;
  code: number;
  httpStatusCode?: number;
  data?: any;
}
