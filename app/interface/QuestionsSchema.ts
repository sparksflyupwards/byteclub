export class Question {
    public id: string;
    public title: string;
    public description: string;
    public tags: string[][];
    public difficulty: string;

    public constructor(id : string, title : string, tags: string[][], difficulty:  string, description:string) {
        this.id = id;
        this.title = title;
        this.tags = tags;
        this.difficulty = difficulty
        this.description = description;
    }
}

