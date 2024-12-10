export class Question {
    public id: string;
    public title: string;
    public description: string;
    public tags: string[];

    public constructor(id : string, title : string, tags: string[], description:string) {
        this.id = id;
        this.title = title;
        this.tags = tags;
        this.description = description;
    }
}

