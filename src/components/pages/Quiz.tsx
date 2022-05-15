import React, {useEffect, useState} from "react";
import "../../scss/main.scss";
import {getFirestore, collection, getDocs} from "firebase/firestore";
import {firebaseApp} from "../../fb";
import {Question} from "../../core/Question";
import {useNavigate, useParams} from "react-router-dom";
import {QuestionResult} from "../../core/QuestionResult";
import {APClass} from "../../core/APClass";
import {AnimatePresence, AnimateSharedLayout, motion} from "framer-motion";
import {readCache, writeCache} from "../../core/cacheHelpers";

import iconTrash from "../../img/trash-10-64.png"
import {Anim, hexToRgb} from "../../Animation";
import {useScreen} from "../layout/ScreenContext";
import {BackgroundCanvas} from "../layout/BackgroundCanvas";
import Dropdown from "../generic/Dropdown";
import Blob from "../generic/Blob";
import {AnswerDisplay} from "../layout/quiz/AnswerDisplay";
import {QuestionDisplay} from "../layout/quiz/QuestionDisplay";
import {Init} from "../layout/quiz/Init";
import {Progress} from "../layout/quiz/Progress";
import {Results} from "../layout/quiz/Results";

const db = getFirestore(firebaseApp);
const QUESTIONS = "questions";

type Result = {
    numberAnswered: number,
    numberCorrect: number,
    timeElapsed: number,
}

export function Quiz(props: {}) {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const params = useParams();
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [questionsAnswered, setQuestionsAnswered] = useState<QuestionResult[]>([]);

    const [selectedAnswer, setSelectedAnswer] = useState(-1);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0)
    const [gameState, setGameState] = useState<0 | 1>(0); // 1 = finished, 0 = going
    const [bg, setBg] = useState(0); //0 = plain, 1 = ocean, 2 = space

    //submit callback for mcq
    const onAnswer = (selectedIndex: number) => {
        setSelectedAnswer(selectedIndex)
        const question = questionQueue[0];
        const correctIndex = question.answer; //get index of correct answer

        //append result to an array
        const result: QuestionResult = {
            question: questionQueue[0],
            result: correctIndex === selectedIndex //is correct if the two indices match
        };

        const answeredCopy = questionsAnswered.concat(result);
        setQuestionsAnswered(answeredCopy); //append to questions answered
    }

    const onContinue = () => {
        const copy = questionQueue.concat();

        //delete the most recently-asked question from the queue
        copy.splice(0, 1);

        SpacedRepetition(questionsAnswered[questionsAnswered.length - 1], copy);
        setSelectedAnswer(-1);
        setQuestionQueue(copy);
        if (copy.length == 0) {
            setGameState(1)
        }
    }

    const onDirection = (selectedUnits: string[]) => {
        if(!allQuestions.length)
            return;
        setQuestionsAnswered([])
        const units: string[] = selectedUnits.map(s => s.at(s.length-1) as string);
        let queue = allQuestions.filter(q => units.includes(q.unit));
        if (numberOfQuestions !== queue.length) {
            queue = queue.slice(0, numberOfQuestions)
        }
        setQuestionQueue(queue);
    }

    const onDropdownChange = (num: number) => {
        if (num === -1) {
            setNumberOfQuestions(allQuestions.length);
        }
        else {
            setNumberOfQuestions(num);
        }
    }

    const onResults = () => {
        setGameState(0)
        // TODO: Repopulate questionQueue after results page
        const className = params.classId;
        if(!className)
            return;

        const completedPrompts = questionsAnswered.map(q => q.question.prompt);
        const remainingQuestions = allQuestions.filter(q => !completedPrompts.includes(q.prompt));
        writeCache(className, remainingQuestions);
        setNumberOfQuestions(remainingQuestions.length);
    }

    //then get all questions on a subject
    useEffect(() => {
        const className = params.classId;
        if(!className) {
            window.location.href = "/";
            return;
        }

        const questions = readCache<Question[]>(className);
        if(questions) {
            setAllQuestions(questions.map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value));
            // shuffle go brrrrr
            // injects random sort element and removes it later
            setNumberOfQuestions(questions.length);
            return;
        }

        const path = QUESTIONS + "-" + className;
        const questionsRef = collection(db, path);
        getDocs(questionsRef)
            .then(result => {
                if(result.empty) {
                    window.location.href = "/";
                    return;
                }
                //serialize docs into state
                let questions: Question[] = result.docs.map(d => d.data() as Question);
                writeCache(className, questions);
                setAllQuestions(questions.map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value));
                    // same sorty thing
                setNumberOfQuestions(questions.length)
            });
    }, [params.classId]);

    return <div id="bg-container">
        <BackgroundCanvas bg={bg}/>
        <div className="apex-quiz w-100 h-100 col-sc">
            <div className="body container">
                {
                    (!questionQueue.length && gameState === 0) && <Init bg={bg} setBg={setBg} onChange={onDropdownChange} curNumber={numberOfQuestions} questions={allQuestions} onSubmit={onDirection} />
                }
                {
                    (!!questionQueue.length && gameState === 0) &&
                    <div className="h-100 w-100 col-st">
                        {
                            selectedAnswer === -1 && <QuestionDisplay key={questionQueue[0].prompt} data={questionQueue[0]} onSubmit={onAnswer}/>
                        }
                        {
                            selectedAnswer !== -1 && <AnswerDisplay key="answer" data={questionQueue[0]} selected={selectedAnswer} onSubmit={onContinue} />
                        }
                        <div className="f-grow" />
                        <Progress total={numberOfQuestions == -1 ? allQuestions.length : numberOfQuestions} answered={questionsAnswered} remaining={questionQueue} onFinish={() => {}} />
                    </div>
                }
                {
                    (!questionQueue.length && gameState === 1) && <div>
                        <Results answeredQuestions={questionsAnswered} onContinue={onResults} />
                    </div>
                }
            </div>
        </div>
    </div>
}

//spaced repetition algo to swap question order for optimal learning
//harder and more missed questions are sent to the front
//this results in easier questions being simultaneously being pushed to the back
function SpacedRepetition(questionResult: QuestionResult, queue: Question[]) {
    if(questionResult.result)
        return;
    const answered = questionResult.question;
    const filtered = queue.filter(q => q.skill == answered.skill //if skills match
        || q.unit == answered.unit //if units match
        || q.topic == answered.topic //if topics match
    );
    if(!filtered.length) //if no more hard questions left, we simply move on
        return;

    //now we try to find the most relevant question to ask. Find a relevant question through correlation
    let moreFiltered: Question[] = filtered.filter(q => q.skill == answered.skill && q.unit == answered.unit);
    moreFiltered.push(...filtered.filter(q => q.skill == answered.skill
        && q.topic == answered.topic)
    );
    moreFiltered.push(...filtered.filter(q => q.unit == answered.unit
        && q.topic == answered.topic)
    );


    if(!moreFiltered.length) { //if we found no more relevant questions, use ones that are less relevant but still useful
        SwapWithBeginning(filtered[0])
        return;
    }
    else {
        let mostFiltered: Question[] = moreFiltered.filter(q => q.skill == answered.skill && q.unit == answered.unit
        && q.topic == answered.topic);
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
