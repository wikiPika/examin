import React, {useState} from "react";
import {useScreen} from "../ScreenContext";
import {motion} from "framer-motion";
import {Anim, hexToRgb} from "../../../Animation";
import iconTrash from "../../../img/trash-10-64.png";
import {choicesAnim} from "./animations";

// Quiz system -- single question choice tab
export function QuestionChoice(props: {
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
