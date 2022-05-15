import {QuestionResult} from "../../../core/QuestionResult";
import {useScreen} from "../ScreenContext";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {ProgressBar} from "./ProgressBar";

export function Results(props: {
    answeredQuestions: QuestionResult[]
    onContinue: () => void
}) {

    const screen = useScreen()
    const nav = useNavigate()

    // displays per-unit results

    const [units, setUnits] = useState<Array<string>>();
    const [topics, setTopics] = useState<Map<string,string>>(new Map());

    useEffect(() => {
        setUnits(props.answeredQuestions.map(q => "Unit " + q.question.unit).filter((v, i, s) => s.indexOf(v) === i).sort());
        const map = new Map<string,string>();
        for (let i = 0; i < props.answeredQuestions.length; i++) {
            const result = props.answeredQuestions[i];
            if(map.has(result.question.topic)) {
                continue;
            }
            map.set(result.question.topic, result.question.topicLong);
        }
        setTopics(map);
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
        <div className="h-50 col-ss w-100 stat-bars">
            <div className="font-header bold">
                Topic Breakdown
            </div>
            {
                topics && Array.from(topics.entries()).map((topicData, i) => {
                    const [topic, longTopic] = topicData;
                    const total = props.answeredQuestions.filter(q => q.question.topic == topic);
                    const part = total.filter(q => q.result);

                    return <div key={i} className="stat-bar w-100 col-ss font-subheader">
                        <div className="row-bc w-100">
                            <div>
                                <span className="bold underline">{longTopic.slice(0,-1)}:</span> {(100 * (isNaN(part.length/total.length) ? 0 : part.length / total.length)).toFixed(0)}% ({part.length}/{total.length})
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