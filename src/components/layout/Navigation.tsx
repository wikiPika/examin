import React from "react";
import "../../scss/layout.scss"
import "../../scss/core.scss"

type NavTab = {
    name: string,
    url: string,
}

const navbarData: Array<NavTab> = [
    {
        name: "Quiz",
        url: "/quiz"
    },
    {
        name: "Login",
        url: "/login"
    }
]

export default function Navigation(props: {}) {
    return <div className="apex-nav row-sc">
        <div className="bold font-400">
            ExamIn
        </div>
        <div className="f-grow" />
        <div className="bold font-200">

        </div>
    </div>
}
