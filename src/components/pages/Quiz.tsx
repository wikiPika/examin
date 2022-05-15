import React, {useEffect, useLayoutEffect, useState} from "react";
import "../../scss/main.scss";
import {getFirestore, collection, query, where, getDocs, doc, getDoc} from "firebase/firestore";
import {firebaseApp} from "../../fb";
import {Question} from "../../core/Question";
import {useLocation, useParams} from "react-router-dom";
import {QuestionResult} from "../../core/QuestionResult";
import {APClass} from "../../core/APClass";
import {AnimatePresence, motion} from "framer-motion";

import iconTrash from "../../img/trash-10-64.png"
import {Anim, hexToRgb} from "../../Animation";
import {useScreen} from "../layout/ScreenContext";

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

    const [selectedAnswer, setSelectedAnswer] = useState(-1)
    const [gameState, setGameState] = useState(0) // 1 = finished, 0 = going
    const [resultsSnapshot, setResultsSnapshot] = useState()

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
    questions: Question[]
    curNumber: number
    onSubmit: (selectedUnits: string[]) => void
    onChange: (v: number) => void,
    bg: number,
    setBg: (bg: number) => void
}) {

    const screen = useScreen()

    const [units, setUnits] = useState<Array<string>>([]);
    const [removedUnits, setRemovedUnits] = useState<Array<string>>([]);

    useEffect(() => {
        setUnits(questions.map(q => "Unit " + q.unit).filter((v, i, s) => s.indexOf(v) === i).sort());
    }, [questions]);

    return <div className="quiz-init h-100 w-100 col-sc">
        <div className="header font-header bold w-100 col-cc">
            {screen.apClass.name.toUpperCase()}
            <br />
            MULTIPLE CHOICE
            <br />
            Time—Unlimited
            <br/>
            {props.curNumber} Total Questions
        </div>
        <div className="directions w-100 font-subheader">
            <strong>Directions: </strong> Each of the questions or incomplete statements below is followed by four (or five, depending on the test) suggested answers or completions. Select the one that is best in each case, then select it again to confirm your answer. The answer choice will turn <span className="bold" style={{color: screen.apClass.color}}>Colorful</span> upon successful selection. Click the colorful answer again to submit.
            <br/>
            <br/>
            If you want to practice a particular unit, remove the units from the Selected Units table by clicking on them.
        </div>
        <div className="settings w-100 row-ss">
            <div className="columnar w-50 row-cs f-wrap">
                <div className="font-subheader w-100 col-cc bold underline">
                    Selected Units
                </div>
                <AnimatePresence>
                {
                    units.map((v, i) => <Blob key={i} onClick={() => {
                        let s = [...units]
                        s.splice(s.indexOf(v), 1)
                        setUnits(s)
                        let r = removedUnits.concat(v)
                        setRemovedUnits(r)
                    }}>{v}</Blob>)
                }
                </AnimatePresence>
            </div>
            <div className="columnar w-50 row-cs f-wrap">
                <div className="font-subheader w-100 col-cc bold underline">
                    Inactive Units
                </div>
                <AnimatePresence>
                {
                    removedUnits.map((v, i) => <Blob key={i} onClick={() => {
                        let s = [...removedUnits]
                        s.splice(s.indexOf(v), 1)
                        setRemovedUnits(s)
                        let r = units.concat([v])
                        setUnits(r)
                    }}>{v}</Blob>)
                }
                </AnimatePresence>
            </div>
        </div>

        <div className="w-60 row-bc bold">
            <span className="font-subheader underline" style={{paddingRight: "1rem"}}>Number of Questions:</span>

            <Dropdown options={[
                {
                    value: 10,
                    label: "10",
                },
                {
                    value: 20,
                    label: "20",
                },
                {
                    value: 50,
                    label: "50",
                },
                {
                    value: -1,
                    label: "All"
                }
            ]} width={8} height={3} initialValue={-1} onChange={(v: number) => {props.onChange(v)}}/>
        </div>
        <div className="w-60 row-bc bold" style={{marginTop: "1rem"}}>
            <span className="font-subheader underline" style={{paddingRight: "1rem"}}>Background:</span>

            <Dropdown options={[
                {
                    value: 0,
                    label: "Test Standard",
                },
                {
                    value: 1,
                    label: "Open Ocean",
                },
                {
                    value: 2,
                    label: "Sleek Space",
                }
            ]} width={8} height={3} initialValue={props.bg} onChange={(bg: number) => {props.setBg(bg)}}/>
        </div>
        <div className="f-grow" />
        <div className="confirm w-100 bold col-sc" onClick={() => props.onSubmit(units)}>
            <div className="font-header bold">
                YOU MAY TURN THE PAGE.
            </div>
            <div className="font-miniheader bold underline">
                (click here to continue)
            </div>
        </div>
    </div>
}

function Results(props: {
    answeredQuestions: QuestionResult[]
    onContinue: () => void
}) {

    const screen = useScreen()
    const nav = useNavigate()

    // displays per-unit results

    const [units, setUnits] = useState<Array<string>>()

    useEffect(() => {
        setUnits(props.answeredQuestions.map(q => "Unit " + q.question.unit).filter((v, i, s) => s.indexOf(v) === i).sort());
    }, [props.answeredQuestions]);

    return <div className="quiz-results h-100 w-100 col-sc">
        <div className="banner row-bc w-100" style={{backgroundColor: screen.apClass.color ?? "#2155cd"}}>
            <div className="font-turboheader bold underline">
                Complete!
            </div>
            <div className="font-subheader bold">
                <span className="underline">Score:</span> {(100 * props.answeredQuestions.filter(q => q.result).length / props.answeredQuestions.length).toFixed(2)}% ({props.answeredQuestions.filter(q => q.result).length}/{props.answeredQuestions.length})
            </div>
        </div>
        <div className="h-50 col-ss w-100 stat-bars">
            <div className="font-header bold">
                Subject Breakdown
            </div>
            {
                units && units.map((v, i) => {
                    let total = props.answeredQuestions.filter(q => Number.parseInt(q.question.unit) == Number.parseInt(v.at(-1) ?? ""))
                    console.log(props.answeredQuestions)
                    let part = total.filter(q => q.result)

                    return <div key={i} className="stat-bar w-100 col-ss font-subheader">
                        <div className="row-bc w-100">
                            <div>
                                <span className="bold underline">{v}:</span> {(100 * (isNaN(part.length/total.length) ? 0 : part.length / total.length)).toFixed(0)}% ({part.length}/{total.length})
                            </div>
                            <div>
                                {
                                    isNaN(part.length/total.length) ? "Error, this unit shouldn't be here" :
                                        part.length/total.length == 0 ? "Yeowch, what happened?" :
                                        part.length/total.length < 0.4 ? "That could've been better..." :
                                        part.length/total.length < 0.6 ? "Just acceptable." :
                                        part.length/total.length < 0.8 ? "Not bad! Keep it up." :
                                        part.length/total.length < 1 ? "Fantastic! Great results." :
                                                                        "Incredible! How'd you do it?"
                                }
                            </div>
                        </div>
                        <ProgressBar prog={part.length / total.length} color={screen.apClass.color}/>
                    </div>
                })

            }
        </div>
        <div className="go-begin w-100 col-sc" onClick={props.onContinue}>
            <div className='font-header bold' style={{textAlign: "center"}}>
                STOP
                <br/>
                END OF PRACTICE
            </div>
            <div className="font-miniheader bold">
                (Click here to return to the beginning screen)
            </div>
        </div>
        <div className="go-class">

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

    const screen = useScreen()
    const [choice, setChoice] = useState(-1);
    const [viewing, setViewing] = useState(false);

    const mcq = Array.from(Object.keys(props.data.answers)).sort();
    return <motion.div variants={slideAnim} initial="inactive" animate="active" exit="inactive" className="quiz-question h-100 w-100 col-sc">
        <div className='prompt w-100 h-60 f-shrink col-cc' onClick={() => setViewing(!viewing)}
             style={{
                 cursor: props.data.imgUrl ? "pointer" : "",
             }}
        >
            {
                props.data.imgUrl &&
                    <motion.img src={props.data.imgUrl} animate={viewing ? {filter: "none"} : {}} />
            }
            <motion.div className="text bold font-subheader" style={{backgroundColor: screen.apClass.color ?? "",}} animate={
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
                        Click to toggle visibility of image.
                    </div>
                }
                <div className="bold font-70">
                    <br/>
                    {props.data.year} {screen.apClass.name}, Unit {props.data.unit}
                </div>
            </motion.div>
        </div>
        <motion.div className="choices w-100" variants={choicesParent}>
            {mcq.map((v, i) => <QuestionChoice key={i} currentChoice={choice} thisChoice={i} onClick={() => {
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
    const screen = useScreen()

    return <motion.div className="quiz-choice row-bc" variants={choicesAnim} whileHover={clickable ? {
        filter: "brightness(1.2)"
    }: {}} animate={props.currentChoice == props.thisChoice ? {
        backgroundColor: screen.apClass.color ? `rgba(${hexToRgb(screen.apClass.color)}, 0.8)` : "rgba(33, 85, 205, 0.8)"
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
    total: number,
    onFinish: () => void,
}) {
    const screen = useScreen()
    const {answered, remaining, total} = props;
    const answeredRatio = (answered.length) / (total);
    let correctRatio = (answered.filter(q => q.result).length)/answered.length;
    correctRatio = isNaN(correctRatio) ? 0 : correctRatio;

    useEffect(() => {
        if (1 - answeredRatio < 0.0001) {
            console.log("finish!")
        }
    }, [answeredRatio])

    return <div className="w-100 font-miniheader bold" style={{padding: "0 1rem", marginTop: "1rem"}}>
        <div className="row-bc">
            <span id="left-stat">
                Progress: {(answeredRatio * 100).toFixed(2)}% ({answered.length}/{total})
            </span>
            <span id="right-stat">
                Accuracy: {(correctRatio * 100).toFixed(2)}% ({answered.filter(q => q.result).length}/{answered.length})
            </span>
        </div>
        <ProgressBar prog={answeredRatio} color={screen.apClass.color} />
    </div>
}

function ProgressBar(props: {
    prog: number
    color: string
}) {
    return <div className="quiz-progress w-100">
        <motion.div layout className="bar" style={{left: `${-100 + 100 * props.prog}%`, backgroundColor: props.color ?? "black"}}/>
    </div>
}

//spaced repetition algo to swap question order for optimal learning
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
