import {Question} from "../../../core/Question";
import {motion} from "framer-motion";
import React from "react";
import {AnswerFeedback} from "./AnswerFeedback";
import {choicesParent, slideAnim} from "./animations";

export function AnswerDisplay(props: {
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