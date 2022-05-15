export type Question = {
    answer: string,
    answers: Map<string, string>,
    difficulty: number,
    skill: string,
    subject: string,
    topics: string[],
    unit: number,
    year: number,
    imageurl: string
};