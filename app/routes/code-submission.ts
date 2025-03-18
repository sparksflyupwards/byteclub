import { json } from "@remix-run/node";
import { UserCodeSubmission } from "~/interface/CodeExecutionSchema";
import Judge0Service from "~/codeExecution/Jude0Service";

// This action will handle the POST request to the '/my-action' route
export let action = async ({ request }) => {
  console.log("inside code-submission")
  const judge0Service = Judge0Service.getInstance();

  try {
    console.log(request)
    console.log("following will be json from code-submission")
    const formData: UserCodeSubmission = await request.json(); // Parse the incoming JSON body
    console.log("Received data:", formData);

    // You can process the formData as needed

    // Respond with a JSON message
    return judge0Service.executeCode(formData.code, formData.selectedLanguage);
  } catch (error) {
    return json({ message: "Error submitting code" }, { status: 500 });
  }
};
