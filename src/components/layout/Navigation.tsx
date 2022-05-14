import React from "react";
import "../../scss/layout.scss"
import "../../scss/core.scss"
import Button from "../generic/Button";
import {useNavigate} from "react-router-dom";

export default function Navigation(props: {}) {

    const nav = useNavigate()

    return <div className="apex-nav row-sc">
        <Button className="bold font-header h-100" onClick={() => nav("./")}>
            ExamIn
        </Button>
        <div className="f-grow" />
        <div className="bold h-100 font-subheader row-cc">
            <Button className="h-100" onClick={() => nav("./quiz")}>
               Quiz
            </Button>
            <Button className="h-100" onClick={() => alert("oauth wip")}>
                Login
            </Button>
        </div>
    </div>
}
