import React from "react";
import "../../scss/layout.scss"
import "../../scss/core.scss"
import Button from "../generic/Button";
import {useAuth} from "../AuthProvider";
import {useNavigate} from "react-router-dom";

export default function Navigation(props: {}) {

    const nav = useNavigate()

    const auth = useAuth();
    const authed = auth.isAuth();

    return <div className="apex-nav row-sc">
        <Button className="bold font-header h-100" onClick={() => nav("./")}>
            ExamIn
        </Button>
        <div className="f-grow" />
        <div className="bold h-100 font-subheader row-cc">
            <Button className="h-100" onClick={() => nav("./class")}>
                Classes
            </Button>
            <Button className="h-100" onClick={authed ? auth.signOut : auth.googleLogin}>
                {authed ? "Logout" : "Login"}
            </Button>
        </div>
    </div>
}
