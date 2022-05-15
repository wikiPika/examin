import {motion} from "framer-motion";
import React from "react";
import {choicesAnim} from "./animations";

// Quiz system -- single answer feedback tab
export function AnswerFeedback(props: {
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
