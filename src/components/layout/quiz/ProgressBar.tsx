import {motion} from "framer-motion";
import React from "react";

// Generic progress bar
export function ProgressBar(props: {
    prog: number
    color: string
}) {
    return <div className="quiz-progress w-100">
        <motion.div layout className="bar" style={{left: `${-100 + 100 * props.prog}%`, backgroundColor: props.color ?? "black"}}/>
    </div>
}
