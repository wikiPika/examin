import React, {FormEvent, useEffect, useLayoutEffect, useState} from "react";
import "../../scss/main.scss";
import {getFirestore, collection, query, where, getDocs} from "firebase/firestore";
import {firebaseApp} from "../../fb";
import {Question} from "../../core/Question";
import {useLocation} from "react-router-dom";
import "../../scss/quiz.scss";
import {QuizForm} from "./QuizForm";
import {QuestionResult} from "../../core/QuestionResult";

const db = getFirestore(firebaseApp);
const QUESTIONS = "questions";
const QUERY_PARAM = "type";

const answerCharArray = ["A","B","C","D","E"];

export default function Quiz(props: {}) {
    const loc = useLocation();
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [subject, setSubject] = useState("");
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [questionsAnswered, setQuestionsAnswered] = useState<QuestionResult[]>([]);

    //submit callback for mcq
    const onSubmit = (input: string) => {
        const question = questionQueue[0];
        const correctIndex = answerCharArray.indexOf(question.answer); //get index of correct answer
        const answerArray = Array.from(Object.keys(question.answers)).sort();
        const selectedIndex = answerArray.indexOf(input); //get index of selected answer

        //append result to an array
        questionsAnswered.push({
            question: questionQueue[0],
            result: correctIndex == selectedIndex //is correct if the two indices match
        });
        setQuestionsAnswered(questionsAnswered); //append to questions answered
    }

    //run before useEffect
    useLayoutEffect(() => {
        //get subject from query parameters
        const params = new URLSearchParams(loc.search);
        const subject = params.get(QUERY_PARAM);
        if(!subject) {
            window.location.href = "/";
            return;
        }
        setSubject(subject);
    }, []);

    //initialize by getting all questions on a subject
    useEffect(() => {
        if(!subject)
            return;
        const questionsRef = collection(db, QUESTIONS);
        const q = query(questionsRef, where("subject", "==", subject));
        getDocs(q)
            .then(result => {
                //serialize docs into state
                const questions: Question[] = result.docs.map(d => d.data() as Question);
                setAllQuestions(questions);
            });
    }, [subject]);

    //initially, set the question queue to the new questions
    useEffect(() => {
        setQuestionQueue(allQuestions);
    }, [allQuestions]);

    if(!questionQueue.length) {
        return <div></div>
    }

    const currentQuestion = questionQueue[0];
    const mcq = Array.from(Object.keys(currentQuestion.answers));
    return <div id="study">
        <h3>Study {subject}</h3>
        <img src={currentQuestion.imageurl} />
        <QuizForm inputs={mcq} onSubmit={onSubmit}/>
    </div>
}