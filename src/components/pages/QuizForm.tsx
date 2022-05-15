import {FormEvent, useState} from "react";
import {QuestionResult} from "../../core/QuestionResult";

export function QuizForm(props: {inputs: string[], onSubmit: (input: string) => void}) {
    const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
    let {inputs} = props;
    inputs = inputs.sort();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        props.onSubmit(inputs[selectedAnswer]);
    }

    return (
        <form id="answer-form" onSubmit={onSubmit}>
            {inputs.map((input) => <QuizFormElement key={input} input={input}/>)}
            <button type="submit" disabled={selectedAnswer == -1}>Submit</button>
        </form>
    )

    function QuizFormElement(props: {input: string}) {
        const {input} = props;
        const index = inputs.indexOf(input);
        const [eliminated, setEliminated] = useState(false);

        return (
            <div>
                <input defaultChecked={selectedAnswer == index} type="radio" id={input} name="answer" value={input} disabled={eliminated} onInput={() => setSelectedAnswer(inputs.indexOf(input))}/>
                <label style={{opacity: eliminated ? 0.5 : 1}} htmlFor={input}>{input}</label>
                <button className="elim" type="button" onClick={() => setEliminated(!eliminated)}>X</button>
                <br/>
            </div>
        )
    }
}