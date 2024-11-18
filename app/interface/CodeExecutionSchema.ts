export interface LanguageOption {
  id: number;
  name: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  error: string;
  status: CodeExecutionResponseStatus;
  memory: number;
  time: string;
  token: string;
  compile_output: string;
  message: string;
}

export interface CodeExecutionResponseStatus {
  id: number;
  description: string;
}

export interface UserCodeSubmission {
  code: string;
  selectedLanguage: LanguageOption;
}
