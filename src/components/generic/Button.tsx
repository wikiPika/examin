import React from "react";
import "../../scss/generic.scss";
import "../../scss/core.scss";
import {motion} from "framer-motion";

// Basic clickable button.
export default function Button(props: {
    onClick: any,
    children: any,
    className?: string,
}) {
    return <motion.div onClick={props.onClick} className={"generic-button col-cc " + (props.className ?? "")} whileHover={{filter: "brightness(0.9)"}}>
        {props.children}
    </motion.div>
}
