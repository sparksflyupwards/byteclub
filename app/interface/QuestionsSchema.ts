export class Question {
    private id: string;
    private title: string;
    private description: string;
    private testCases: TestCases;
    private tags: string[];

    public constructor(id : string, title : string, tags: string[], description:string, testCases:TestCases) {
        this.id = id;
        this.title = title;
        this.tags = tags;
        this.description = description;
        this.testCases = testCases;
    }
}

export class TestCases {
    private inputs:string[];
    private input_values:string[];
    private expected_output_values:string[];

    public constructor(inputs: string[], input_values:string[], expected_output_values:string[]) {
        this.inputs = inputs;
        this.input_values = input_values;
        this.expected_output_values = expected_output_values;
    }
}
