import React, {LegacyRef, useEffect, useRef, useState} from "react";
import "../../scss/core.scss";
import "../../scss/generic.scss"
import upArrow from "../../img/up-arrow.svg";
import {AnimatePresence, motion} from "framer-motion";
import {Anim} from "../../Animation";

type DropdownData = {
    value: any,          // what gets smelled under the hood
    label: string,       // what gets displayed
    className?: string
}

// Slightly less-than-basic dropdown.
export default function Dropdown(props: {
    options: Array<DropdownData>,
    width: number, // in rem
    height: number, // in rem
    initialValue: any,
    onChange?: Function,
    invert?: boolean,
}) {

    const [currentValue, setCurrentValue] = useState(props.initialValue);
    const [dropping, setDropping] = useState(false);
    const outerRef = useRef<HTMLDivElement>();

    function handleClick(e: any) {
        if (outerRef.current && !outerRef.current.contains(e.target)) setDropping(false);
        console.log(outerRef)
        console.log(dropping)
    }

    useEffect(() => {
        if (dropping) document.addEventListener("mousedown", handleClick);
        else document.removeEventListener("mousedown", handleClick);
        return document.removeEventListener("mousedown", handleClick);
    }, [dropping])

    return <div className="generic-dropdown col-ss" ref={outerRef as LegacyRef<HTMLDivElement>}>
        <AnimatePresence>
            {
                dropping &&
                <motion.div variants={Anim.bounceY(-2).spring(120, 0, 20).build()} initial="inactive" animate="active" exit="inactive"
                            className="dropdown-container w-100 col-ss" style={{
                    top: `${props.height}rem`
                }}>
                    {
                        props.options.map((v, i) => {
                            return <motion.div whileHover={{
                                backgroundColor: "rgba(0, 0, 0, 0.16)",
                                color: "rgb(255, 255, 255)",
                                transition: Anim.getSpring(120, 0, 20)
                            }} className="w-100 text" onClick={() => {
                                setCurrentValue(v.value)
                                setDropping(false)
                                if (props.onChange) props.onChange(v.value)
                            }} key={i}>
                                {v.label}
                            </motion.div>
                        })
                    }
                </motion.div>
            }
        </AnimatePresence>
        <div className="main-container row-sc" onClick={() => setDropping(!dropping)} onBlur={() => setDropping(false)} style={{
            padding: `0.25rem 0.5rem`
        }}>
            <div className="current f-grow row-sc" style={{
                width: `${props.width}rem`
            }}>
                {props.options.find(v => v && v.value === currentValue)?.label ?? ""}
            </div>
            <motion.img src={upArrow} style={{height: `${props.height - 1.5}rem`, filter: props.invert ? "invert(1)" : ""}} animate={dropping ? {
                transform: "rotate(0deg)"
            } : {
                transform: "rotate(180deg)"
            }}/>
        </div>
    </div>
}
