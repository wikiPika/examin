import React from "react";
import "../../scss/core.scss"
import "../../scss/layout.scss"
import Navigation from "./Navigation"

export default function Layout(props: {
    children: any
}) {
    return <div className="apex-layout col-st">
        <Navigation />
        <div className="apex-nav-spacer" />
        {props.children}
    </div>
}
