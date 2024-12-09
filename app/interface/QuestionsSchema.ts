export class Question {
    public id: string;
    private title: string;
    private description: string;
    private tags: string[];

    public constructor(id : string, title : string, tags: string[], description:string) {
        this.id = id;
        this.title = title;
        this.tags = tags;
        this.description = description;
    }
}

