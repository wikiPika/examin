import React, {useEffect, useLayoutEffect, useState} from "react";
import "../../scss/main.scss";
import {getFirestore, collection, query, where, getDocs, doc, getDoc} from "firebase/firestore";
import {firebaseApp} from "../../fb";
import {Question} from "../../core/Question";
import {useLocation, useParams} from "react-router-dom";
import "../../scss/quiz.scss";
import {QuizForm} from "./QuizForm";
import {QuestionResult} from "../../core/QuestionResult";
import {APClass} from "../../core/APClass";

const db = getFirestore(firebaseApp);
const QUESTIONS = "questions";
const CLASSES = "classes";

const answerCharArray = ["A","B","C","D","E"];

export function Quiz(props: {}) {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [apClass, setAPClass] = useState<APClass | null>(null);
    const params = useParams();
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [questionsAnswered, setQuestionsAnswered] = useState<QuestionResult[]>([]);

    //submit callback for mcq
    const onSubmit = (input: string) => {
        const question = questionQueue[0];
        const correctIndex = answerCharArray.indexOf(question.answer); //get index of correct answer
        const answerArray = Array.from(Object.keys(question.answers)).sort();
        const selectedIndex = answerArray.indexOf(input); //get index of selected answer

        //append result to an array
        const result: QuestionResult = {
            question: questionQueue[0],
            result: correctIndex == selectedIndex //is correct if the two indices match
        };

        const answeredCopy = questionsAnswered.concat(result);
        setQuestionsAnswered(answeredCopy); //append to questions answered


        const copy = questionQueue.concat();

        //delete the most recently-asked question from the queue
        copy.splice(0, 1);
        //employ spaced repetition
        SpacedRepetition(result, copy);
        setQuestionQueue(copy);
    }

    //start by getting the class related to the id
    //if the id does not exist or the class does not exist, the user should not be here
    useEffect(() => {
        const subjectId = params.classId;
        if(!subjectId) {
            window.location.href = "/";
            return;
        }
        const classesRef = collection(db, CLASSES);
        const selectedDoc = doc(classesRef, subjectId);
        getDoc(selectedDoc)
            .then(r => {
                if(!r.exists()) {
                    window.location.href = "/";
                    return;
                }
                setAPClass(r.data() as APClass);
            });
    }, []);

    //then get all questions on a subject
    useEffect(() => {
        if(!apClass)
            return;
        const questionsRef = collection(db, QUESTIONS);
        const q = query(questionsRef, where("subject", "==", apClass.name));
        getDocs(q)
            .then(result => {
                //serialize docs into state
                const questions: Question[] = result.docs.map(d => d.data() as Question);
                setAllQuestions(questions);
            });
    }, [apClass]);

    //initially, set the question queue to the new questions
    useEffect(() => {
        setQuestionQueue(allQuestions);
    }, [allQuestions]);

    console.log(questionQueue);
    console.log(questionQueue.length);
    if(!questionQueue.length || !apClass) {
        return <div></div>
    }

    const currentQuestion = questionQueue[0];
    const mcq = Array.from(Object.keys(currentQuestion.answers));
    return <div id="study">
        <h3>Study {apClass.name}</h3>
        <img src={currentQuestion.imageurl} />
        <QuizForm inputs={mcq} onSubmit={onSubmit}/>
    </div>
}

//spaced repetition algo to swap question order for optimal learning
function SpacedRepetition(questionResult: QuestionResult, queue: Question[]) {
    if(questionResult.result)
        return;
    const answered = questionResult.question;
    const filtered = queue.filter(q => q.skill == answered.skill //if skills match
        || q.unit == answered.unit //if units match
        || q.topics.some(topic => answered.topics.includes(topic)) //if topics match
    );
    if(!filtered.length) //if no more hard questions left, we simply move on
        return;

    //now we try to find the most relevant question to ask. Find a relevant question through correlation
    let moreFiltered: Question[] = filtered.filter(q => q.skill == answered.skill && q.unit == answered.unit);
    moreFiltered.push(...filtered.filter(q => q.skill == answered.skill
        && q.topics.some(topic => answered.topics.includes(topic)))
    );
    moreFiltered.push(...filtered.filter(q => q.unit == answered.unit
        && q.topics.some(topic => answered.topics.includes(topic)))
    );


    if(!moreFiltered.length) { //if we found no more relevant questions, use ones that are less relevant but still useful
        SwapWithBeginning(filtered[0])
        return;
    }
    else {
        let mostFiltered: Question[] = moreFiltered.filter(q => q.skill == answered.skill && q.unit == answered.unit
        && q.topics.some(topic => answered.topics.includes(topic)));
        if(!mostFiltered.length) {
            SwapWithBeginning(moreFiltered[0]); //if we found no super-relevant ones, still use more relevant questions
            return;
        }
        SwapWithBeginning(mostFiltered[0]); //use super-relevant question. Ideal.
    }

    function SwapWithBeginning(hardQ: Question) {
        const hardQIndex = queue.indexOf(hardQ);
        [queue[hardQIndex], queue[0]] = [queue[0], queue[hardQIndex]]; //swap values
    }
}