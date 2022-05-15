import React, {useEffect, useState} from "react";
import "../../scss/main.scss"
import "../../scss/core.scss"
import {motion} from "framer-motion";
import {Anim} from "../../Animation";
import {useNavigate} from "react-router-dom";
import {APClass} from "../../core/APClass";
import {getFirestore, query, getDocs, collection} from "firebase/firestore";
import {firebaseApp} from "../../fb";

const db = getFirestore(firebaseApp);
const COLLECTION_NAME = "classes";

export default function Class(props: {}) {
    const [classes, setClasses] = useState<APClass[]>([]);

    useEffect(() => {
        const classesRef = collection(db, COLLECTION_NAME);
        getDocs(classesRef)
            .then(result => {
                const classes: APClass[] = result.docs.map(d => {
                    const doc = d.data() as APClass;
                    doc.id = d.id;
                    return doc;
                });
                setClasses(classes);
            })
    }, []);

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
            {
                classes.map(c =>
                <APCard {...c} key={c.id} url={c.id}/>
                )
            }
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
