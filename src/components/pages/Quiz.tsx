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
import {AnimatePresence, motion} from "framer-motion";

import iconTrash from "../../img/trash-10-64.png"
import {Anim} from "../../Animation";
import {useScreen} from "../layout/ScreenContext";

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

    const [selectedAnswer, setSelectedAnswer] = useState(-1)
    const [gameState, setGameState] = useState(0) // 1 = finished, 0 = going
    const [resultsSnapshot, setResultsSnapshot] = useState()

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
    }

    const onContinue = () => {
        const copy = questionQueue.concat();

        //delete the most recently-asked question from the queue
        copy.splice(0, 1);
        //employ spaced repetition
        SpacedRepetition(questionsAnswered[questionsAnswered.length - 1], copy);
        setSelectedAnswer(-1);
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
        //setQuestionQueue(allQuestions);
    }, [allQuestions]);

    return <div className="apex-quiz w-100 h-100 col-cc">
        <div className="body container col-ct">
            {
                (!questionQueue.length && gameState === 0) && <Init />
            }
            {
                (!!questionQueue.length && gameState === 0) &&
                <div>
                    <div className="f-grow" />
                    {
                        selectedAnswer === -1 && <QuestionDisplay key={questionQueue[0].prompt} data={questionQueue[0]} onSubmit={onAnswer}/>
                    }
                    {
                        selectedAnswer !== -1 && <AnswerDisplay key="answer" data={questionQueue[0]} selected={selectedAnswer} onSubmit={onContinue} />
                    }
                    <div className="f-grow" />
                    <Progress answered={questionsAnswered} remaining={questionQueue} onFinish={() => setGameState(1)} />
                </div>
            }
            {
                (!questionQueue.length && gameState === 1) && <div>
                    results screen
                </div>
            }
        </div>
    </div>
}

function Init(props: {

}) {

    const screen = useScreen()

    return <div className="quiz-init f-grow h-100 w-100 col-sc">
        <div className="header font-subheader bold w-100 col-cc">
            {screen.apClass.name.toUpperCase()}
            <br />
            MULTIPLE CHOICE
            <br />
            Time—Unlimited
            <br/>
            150 Questions
        </div>
        <div className="directions w-100 font-miniheader col">
            <strong>Directions: </strong> Each of the questions or incomplete statements below is followed by four (or five, depending on the test) suggested answers or completions. Select the one that is best in each case, then select it again to confirm your answer. The answer choice will turn <span className="blue bold">Blue</span> upon successful selection.
        </div>
    </div>
}

const slideAnim = Anim.bounceY(64).spring(120, 0, 20).build(true, true)
const choicesParent = new Anim().spring(120, 0, 20).delay_children(0.2).stagger(0.15).build()
const choicesAnim = Anim.bounceX(-50).build()

function QuestionDisplay(props: {
    data: Question
    onSubmit: (choice: number) => void
}) {

    const [choice, setChoice] = useState(-1);
    const [viewing, setViewing] = useState(false);

    const mcq = Array.from(Object.keys(props.data.answers)).sort();
    return <motion.div variants={slideAnim} initial="inactive" animate="active" exit="inactive" className="quiz-question h-100 w-100 col-sc">
        <div className='prompt w-100 h-60 col-cc' onClick={() => setViewing(!viewing)}
             style={{
                 cursor: props.data.imgUrl ? "pointer" : "",
             }}
        >
            {
                props.data.imgUrl &&
                    <motion.img src={props.data.imgUrl} animate={viewing ? {filter: "none"} : {}} />
            }
            <motion.div className="text bold font-subheader" animate={
                props.data.imgUrl && viewing ? {
                    backgroundColor: "rgba(255, 255, 255, 0)",
                    textShadow: "none",
                    color: "rgba(255, 255, 255, 0)"
                } : {}
            }>
                {props.data.prompt}
                {
                    props.data.imgUrl && <div className="bold font-70">
                        <br/>
                        Click to toggle visibility.
                    </div>
                }
            </motion.div>
        </div>
        <motion.div className="choices w-100" variants={choicesParent}>
            {mcq.map((v, i) => <QuestionChoice currentChoice={choice} thisChoice={i} onClick={() => {
                if (i !== choice) {
                    setChoice(i)
                } else {
                    props.onSubmit(choice)
                }
            }} text={v} />)}
        </motion.div>
    </motion.div>
}

function QuestionChoice(props: {
    currentChoice: number,
    thisChoice: number,
    onClick: () => void,
    text: string,
}) {

    const [clickable, setClickable] = useState(true)

    return <motion.div className="quiz-choice row-bc" variants={choicesAnim} whileHover={clickable ? {
        filter: "brightness(1.2)"
    }: {}} animate={props.currentChoice == props.thisChoice ? {
        backgroundColor: "rgba(33, 85, 205, 0.8)"
    } : {}}>
        <motion.div animate={!clickable ? {
            filter: "blur(8px)"
        } : {}} onClick={() => {
            if (clickable) props.onClick()
        }}><span style={{pointerEvents: "none", userSelect: "none"}}>{props.text}</span></motion.div>
        <motion.img className="eliminate" src={iconTrash} onClick={() => {setClickable(!clickable)}}/>
    </motion.div>
}

function AnswerDisplay(props: {
    data: Question
    selected: number
    onSubmit: () => void
}) {

    const correct = props.selected == props.data.answer;

    return <motion.div className="quiz-answer h-100 w-100 col-cc" variants={slideAnim} initial="inactive" animate="active" exit="inactive">
        <div className="heading w-100 row-bc" style={{
            backgroundColor: correct ? "#22aB22" : "#b22a22"
        }} onClick={props.onSubmit}>

            <div className="font-turboheader bold underline" >
                {
                    correct ? "Correct!" : "Incorrect..."
                }
            </div>
            <div className="font-subheader bold">
                Click here to continue.
            </div>
        </div>
        <motion.div className="choices w-100" variants={choicesParent}>
            {
                Array.from(Object.values(props.data.answers)).sort().map((v, i) => <AnswerFeedback key={i} text={v} selected={i == props.selected} correct={i == props.data.answer} />)
            }
        </motion.div>
    </motion.div>
}

function AnswerFeedback(props: {
    text: string,
    correct: boolean,
    selected: boolean,
}) {
    return <motion.div variants={choicesAnim} className="quiz-feedback" style={{
        borderTopColor: props.correct ? "#22aB22" : "#b22a22",
        fontWeight: props.selected ? "bold" : "normal",
    }}>
        {props.text}
    </motion.div>
}

function Progress(props: {
    answered: QuestionResult[],
    remaining: Question[]
    onFinish: () => void,
}) {
    const {answered, remaining} = props;
    const answeredRatio = (answered.length) / (answered.length + remaining.length);
    let correctRatio = (answered.filter(q => q.result).length)/answered.length;
    correctRatio = isNaN(correctRatio) ? 0 : correctRatio;

    useEffect(() => {
        if (1 - answeredRatio < 0.0001) {
            props.onFinish()
        }
    }, [answeredRatio])

    return <div className="w-100 font-miniheader bold" style={{padding: "0 1rem", marginTop: "1rem"}}>
        <div className="row-bc">
            <span id="left-stat">
                Progress: {(answeredRatio * 100).toFixed(2)}%
            </span>
            <span id="right-stat">
                Accuracy: {(correctRatio * 100).toFixed(2)}%
            </span>
        </div>
        <div className="quiz-progress">
            <motion.div layout className="bar" style={{left: `${-100 + 100 * answeredRatio}%`}}/>
        </div>
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
