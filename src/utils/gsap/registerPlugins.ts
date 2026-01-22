import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Draggable from "gsap/Draggable"
import InertiaPlugin from "gsap/InertiaPlugin"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

gsap.registerPlugin(useGSAP, ScrollToPlugin, Draggable, InertiaPlugin)
