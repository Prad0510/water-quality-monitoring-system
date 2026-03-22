export interface TestResult {
  result_id: number;
  sample_id: number;
  parameter_id: number;
  value: number;
  status: string;
  test_date: string;
}

export interface Alert {
  alert_id: number;
  result_id: number;
  alert_type: string;
  alert_message: string;
  alert_date: string;
}