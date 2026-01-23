import { GSDevtools } from 'gsap/GSDevTools'
gsap.registerPlugin(GSDevTools) 
GSDevtools.create(); 

export function UseGsDev() {

    const create = useCallback((tl) => GSDevTools.create({animation: tl}), [])

    return { create }
}