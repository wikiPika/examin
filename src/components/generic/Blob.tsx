import React, {LegacyRef, useEffect, useRef, useState} from "react";
import "../../scss/core.scss";
import "../../scss/generic.scss"
import {motion} from "framer-motion";
import {Anim} from "../../Animation";

export default function Blob(props: {
    onClick?: () => void
    color?: string,
    children?: any,
}) {

    return <motion.div layout className="generic-blob font-miniheader" style={{
        backgroundColor: props.color ?? "black"
    }} whileHover={{boxShadow: "0 0 0.25rem #2155cd"}} onClick={props.onClick}>
        {props.children}
    </motion.div>
}
