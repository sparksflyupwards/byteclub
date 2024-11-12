export interface LanguageOption {
  id: number;
  name: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  error: string;
  status: number;
}

export interface UserCodeSubmission {
  code: string;
  selectedLanguage: LanguageOption;
}
