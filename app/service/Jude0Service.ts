import {
  CodeExecutionResponse,
  LanguageOption,
} from "~/interface/CodeExecutionSchema";
import axios, { AxiosResponse } from "axios";

const JUDGE0_HOST = process?.env?.JUDGE0_HOST;
const JUDGE0_API_KEY = process?.env?.JUDGE0_API_KEY;

class Judge0Service {
  // Static property to hold the single instance
  private static instance: Judge0Service;

  // Instance properties
  private baseUrl: string;
  private baseHeaders: {
    "Content-Type": string;
    "X-Judge0-Token": string;
    "x-rapidapi-host": string;
  };

  // Private constructor ensures that the class can only be instantiated through the getInstance method
  private constructor() {
    if (!JUDGE0_HOST || !JUDGE0_API_KEY) {
      throw new Error(
        `JUDGE0 environment variables that are set: HOST-> ${
          JUDGE0_HOST != null
        } API-KEY-> ${JUDGE0_API_KEY != null}`
      );
    }

    this.baseUrl = `${JUDGE0_HOST}`;
    this.baseHeaders = {
      "Content-Type": "application/json",
      "X-Judge0-Token": JUDGE0_API_KEY,
      "x-rapidapi-host": JUDGE0_HOST,
    };

  }

  // Static method to get the singleton instance
  public static getInstance(): Judge0Service {
    // If the instance is not created, create it
    if (!Judge0Service.instance) {
      Judge0Service.instance = new Judge0Service();
    }

    // Return the singleton instance
    return Judge0Service.instance;
  }

  /**
   * Submits code to Judge0 API and waits for execution result
   * @param {string} userCodeValue - The code that the user wants to execute.
   * @param {Object} selectedLanguage - The selected language (should contain an `id` property).
   * @returns {Promise<string>} The result of the code execution.
   */
  public executeCode(
    userCodeValue: string,
    selectedLanguage: LanguageOption
  ): Promise<string> {
    if (!userCodeValue || !selectedLanguage || !selectedLanguage.id) {
      throw new Error(
        "Missing required parameters: userCodeValue or selectedLanguage"
      );
    }
    const headers = this.baseHeaders;
    console.log(headers);
    return axios
      .post(
        this.baseUrl + "/submissions/?base64_encoded=false&wait=true",
        {
          source_code: userCodeValue,
          language_id: selectedLanguage.id,
        },
        { headers }
      )
      .then((response: { data: CodeExecutionResponse }) => {
        // Handle the successful response
        return (
          response.data.stdout ||
          response.data.stderr ||
          "Execution result not available"
        );
      })
      .catch((error: { message: string }) => {
        // Handle the error
        throw new Error(error.message || "Error executing code");
      });
  }

  /**
   * Fetches the list of available language options from the Judge0 API
   * @returns {Promise<LanguageOption[]>} The list of available language options
   */
  public getLanguageOptions(): Promise<LanguageOption[]> {
    // Ensure necessary environment variables are present

    const headers = this.baseHeaders;
    return axios
      .get<LanguageOption[]>(`${this.baseUrl}/languages`, { headers })
      .then((response: AxiosResponse<LanguageOption[]>) => {
        // Return the data from the response
        console.log("WE GOT: ", response.data.length);
        return response.data;
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
        throw new Error("Error fetching languages");
      });
  }
}

// Exporting the singleton instance
export default Judge0Service;
