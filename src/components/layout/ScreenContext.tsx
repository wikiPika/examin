import React, {useEffect, useState} from "react";

/*
This feels redundant but you have to define the context component up here before you set the provider
 */
const ScreenContext = React.createContext<ScreenContextType>({
    width: 0,
    height: 0,
    scrollX: 0,
    scrollY: 0,
})

type ScreenContextType = {
    height: number,
    width: number,
    scrollX: number,
    scrollY: number,
}

/*
What people use when they register to a context
 */
export function useScreen() {
    return React.useContext(ScreenContext);
}

/*
The provider component that wraps around everything that might use the context
 */
export default function ScreenProvider(props: {
    children: any,
}) {
    const [height, setHeight] = useState(window.innerHeight);
    const [width, setWidth] = useState(window.innerWidth);
    const [scrollX, setScrollX] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    const resizeListener = (e: any) => {
        setWidth(e.target.innerWidth)
    }

    const scrollListener = (e: any) => {
        setScrollX(window.scrollX / document.body.clientWidth)
        setScrollY(window.scrollY / document.body.clientHeight)
    }

    useEffect(() => {
        window.addEventListener("resize", resizeListener);
        window.addEventListener("scroll", scrollListener);
        return () => {
            window.removeEventListener("resize", resizeListener);
            window.removeEventListener("scroll", scrollListener);
        }
    }, [])

    /*
    Note the processing done above - pass in the processing in the value tag
     */
    return <ScreenContext.Provider value={{
        width: width,
        height: height,
        scrollX: scrollX,
        scrollY: scrollY,
    }}>
        {props.children}
    </ScreenContext.Provider>
}

