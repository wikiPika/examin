import React, {useState} from "react";
import "../../scss/main.scss"
import "../../scss/core.scss"
import {motion} from "framer-motion";
import {Anim} from "../../Animation";
import {useNavigate, useParams} from "react-router-dom";

type SingleQuestion = {
    prompt: string,
    imgUrl: string,
    answers: Array<string>,
    feedbacks: Array<string>,
    correctIndex: number,
    subject: string,
    year: number,
    difficulty: number,
    skills: Array<string>,
    topics: Array<string>,
    unit: number,
}

export function Quiz(props: {}) {

    // use this for querying class
    const { classId } = useParams();

    return <div className="apex-quiz w-100 col-cc">
        <div className="body container col-ct">
            <div className="f-grow" />
            <Progress amount={0.24324} />
        </div>
    </div>
}

function Question(props: {}) {
    return <div>

    </div>
}

function Answer(props: {}) {
    return <div>

    </div>
}

function Progress(props: {
    amount: number
}) {
    return <div className="w-100 font-miniheader bold">
        Progress: {(props.amount * 100).toFixed(2)}%
        <div className="quiz-progress">
            <div className="bar" style={{left: `${-100 + 100 * props.amount}%`}}/>
        </div>
    </div>
}
