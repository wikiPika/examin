import {Question} from "../../../core/Question";
import {useScreen} from "../ScreenContext";
import React, {useState} from "react";
import {motion} from "framer-motion";
import {Anim} from "../../../Animation";
import {QuestionChoice} from "./QuestionChoice";
import {choicesParent, slideAnim} from "./animations";

// Quiz system -- displays one question
export function QuestionDisplay(props: {
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
