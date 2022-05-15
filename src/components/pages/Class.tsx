import React, {useState} from "react";
import "../../scss/main.scss"
import "../../scss/core.scss"
import {motion} from "framer-motion";
import {Anim} from "../../Animation";
import {useNavigate} from "react-router-dom";

export default function Class(props: {}) {
    return <div className="apex-class w-100 col-cc">
        <div className="top w-100 row-cc">
            <div className="bold underline font-turboheader">
                Choose a Class
            </div>
            <div className="f-grow" />
            <div className="bold font-subheader" style={{textAlign: "end", width: "min(40rem, 35%)"}}>
                Master the AP© Curriculum with our proprietary spaced repetition algorithm.
            </div>
        </div>
        <div className="category f-wrap row-sc w-100">
            <APCard color={"#0d865d"} name={"AP World History"} imgUrl={"https://media.istockphoto.com/photos/compass-on-a-old-navigation-map-globe-picture-id535463967?b=1&k=20&m=535463967&s=170667a&w=0&h=IqdemNebOmLQIBKdTQxEG7oBMgzE-KXmhiCE7XdUudc="} desc={"A whole lot about Champa rice."} url={"world"} />
            <APCard color={"#49dcf9"} name="AP Physics 1" desc="Thanks to Newton, banging your head against a wall hurts." url="physics1" imgUrl="https://img1.goodfon.com/wallpaper/nbig/3/87/newton-s-cradle-physics-metal.jpg" />
            <APCard color={"#de126e"} name="AP Physics 2" desc="More variables than you'll ever know what to do with." url="physics2" imgUrl="https://i.pinimg.com/736x/43/fa/02/43fa024243020049cf05fe439c00514d.jpg" />
        </div>
    </div>
}

const mainSelectorAnim = Anim.bounceY(10).default().build();

function APCard(props: {
    name: string,
    imgUrl: string,
    desc: string,
    url: string,
    color: string,
}) {
    const nav = useNavigate();
    const [hovering, setHovering] = useState(false);

    return <div className="apex-apcard col-ss" onClick={() => nav(`./${props.url}`)} style={{borderTopColor: props.color}} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <motion.div className="title w-100 bold font-subheader" animate={hovering ? {height: "120px"} : {}}>
            {props.name}
        </motion.div>
        <img src={props.imgUrl}/>
        <motion.div className="desc w-100 col-es" animate={hovering ? {height: "120px"} : {}}>
            {props.desc}
        </motion.div>
        {
            hovering && <motion.div className="main-selector col-cc bold font-turboheader" variants={mainSelectorAnim}
                                    initial="inactive"
                                    animate="active"
                                    exit="inactive"
            >
                Start
            </motion.div>
        }
    </div>
}
