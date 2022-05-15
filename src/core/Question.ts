export type Question = {
    prompt: string,
    answer: number,
    answers: Map<string, string>,
    difficulty: number,
    skill: string,
    subject: string,
    topic: string,
    unit: string,
    year: string,
    imgUrl: string,
    skillLong: string,
    topicLong: string
};
