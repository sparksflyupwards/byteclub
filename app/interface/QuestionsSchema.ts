export class Question {
    public id: string;
    public title: string;
    public description: string;
    public tags: string[][];
    public difficulty: string;
    public signature: Map<string,string>;

    public constructor(id: string, title: string, tags: string[][], 
        difficulty: string, description: string, signature: Map<string, string>) {
        this.id = id;
        this.title = title;
        this.tags = tags;
        this.difficulty = difficulty
        this.description = description;
        this.signature = signature;
    }
}

export interface TestCase<TInput = any, TOutput = any> {
    id: number;
    questionID: number;
    input: TInput;
    output: TOutput;
}
