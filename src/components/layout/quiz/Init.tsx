import {Question} from "../../../core/Question";
import {useScreen} from "../ScreenContext";
import React, {useEffect, useState} from "react";
import {AnimatePresence} from "framer-motion";
import Blob from "../../generic/Blob";
import Dropdown from "../../generic/Dropdown";

export function Init(props: {
    questions: Question[]
    curNumber: number
    onSubmit: (selectedUnits: string[]) => void
    onChange: (v: number) => void,
    bg: number,
    setBg: (bg: number) => void
}) {
    const {questions} = props;
    const screen = useScreen();

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
