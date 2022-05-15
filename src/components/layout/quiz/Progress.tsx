import {QuestionResult} from "../../../core/QuestionResult";
import {Question} from "../../../core/Question";
import {useScreen} from "../ScreenContext";
import React, {useEffect} from "react";
import {ProgressBar} from "./ProgressBar";

// Quiz system - Bottom progress bar
export function Progress(props: {
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
