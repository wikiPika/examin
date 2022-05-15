import React from "react";
import {Anim} from "../../Animation";
import {motion} from "framer-motion";

const base = Anim.bounceY(50).spring(120, 0, 20).delay_children(0).stagger(0.02).build()
const bounce = Anim.bounceY(10).build()

export default function TextFade(props: {
    text: string,
    className?: string,
    parentAnim?: any,
    textAnim?: any,
    intoView?: boolean
    inherit?: boolean
}) {
    return <motion.div variants={props.parentAnim ?? base} initial={props.inherit ? "" : "inactive"} animate={props.inherit ? "" : props.intoView ? "" : "active"} whileInView={props.intoView ? "active" : ""} viewport={props.intoView ? {once: true} : {}}>
        {
            props.text.split("").map((v, i) =>
                <motion.span key={i} variants={props.textAnim ?? bounce} className={props.className ?? ""} style={v != " " ? {display: "inline-block"} : {}}>
                    {v}
                </motion.span>
            )
        }
    </motion.div>
}
