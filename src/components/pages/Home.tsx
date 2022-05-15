import React, {useState} from "react";
import {motion} from "framer-motion";
import "../../scss/main.scss"
import "../../scss/core.scss"
import {Ocean} from "../layout/Ocean";
import infograph from "../../img/diagram.png";

export default function Home(props: {}) {
    const reviews = ['"It was absolutely great for my AP Language Exam. ExamIn let me focus on what I was getting wrong rather than what I was getting right."', '"I love being able to study just the concepts that I need to know. I don\'t have to go through the hastle of relearning things I am confident in."', '"An absolte 5 star website that helped me excel in all my tests."', '"If you want a place to learn, this is the go to place."', '"Learning has never been easier and quicker. I am able to bang out all my learning in a matter of a couple hours."', '"This is a genius idea that has helped me tremendously with my studying."'];
    var review = 0;
    const changeRowPos = () => {
        var one = document.getElementById("mainOne") as HTMLInputElement;
        var two = document.getElementById("mainTwo") as HTMLInputElement;
        var hero = document.getElementById("hero") as HTMLInputElement;
        var scroll = window.scrollY;
        var height =  hero.clientHeight;
        var width =  hero.clientWidth;

        one.style.marginLeft = -1000 + (scroll/height) * (width) + "px";
        two.style.marginLeft = 1500 - (scroll/height) * (width) + "px";

    };

    const changeText = () => {
        var div = document.getElementById("click-div") as HTMLInputElement;
        div.textContent = reviews[review];
        console.log(review);
        review++;
        if (review == reviews.length) {
            review = 0;
        }
    };

    window.addEventListener("scroll", changeRowPos);

    return (
        <div className="apex-home w-100 col-cc">
            <div className="body w-100 col-sc">
                <div id="hero" className="hero w-100 row-cc">
                    <div className="right w-50 col-ce">
                        <div className="right-span">
                            <h1>Improve Your</h1> 
                            <h1>Test Scores</h1>
                            <p>Use the power of machine learning to create a course specially designed for your needs.</p>
                            <motion.a
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                className="col-cc">
                                    Sign Up
                            </motion.a>
                        </div>
                    </div>
                    <div className="left w-50 col-cs">
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.8 }}
                            className="left-span col-cc"
                            id="click-div"
                            onClick={() => changeText()}>
                                Click To Read Our Reviews!
                        </motion.div>
                    </div>
                </div>
                <div className="courses w-100 col-ss">
                    <div className="text w-100 row-cc">
                        <h1>What Courses Do We Offer?</h1>
                    </div>
                    <div id="mainOne" className="main w-110 row-sc overflow-hidden">
                        <div className="part col-cc">AP US History</div>
                        <div className="part col-cc">AP Calculus AB/BC</div>
                        <div className="part col-cc">AP Statistics</div>
                        <div className="part col-cc">AP Macroeconomics</div>
                    </div>
                    <div id="mainTwo" className="main w-110 row-sc overflow-hidden">
                        <div className="part col-cc">AP Language and Composition</div>
                        <div className="part col-cc">AP Literature and Composition</div>
                        <div className="part col-cc">AP European History</div>
                        <div className="part col-cc">AP Spanish Language and Composition</div>
                    </div>
                </div>
                <div className="infograph w-100 col-cc">
                    <div className="infograph-div w-80 col-cc">
                        <motion.div className="info-text row-cc">
                            <div className="text-span">
                                <h1>Advanced Learning Systems</h1>
                                <p>The process is simple. The more questions you get wrong about a particular unit, the more ExamIn prioritizes it. Conversely, the more you master a topic, the less ExamIn will show it to you, allowing you to study without wasting time.</p>
                            </div>
                        </motion.div>
                        <motion.div className="info-img w-100 row-cs">
                            <img alt="infographic" src={infograph}/>
                        </motion.div>
                    </div>
                </div>
                <div className="done w-100 col-cc">

                </div>
            </div>
        </div>
    );
}
