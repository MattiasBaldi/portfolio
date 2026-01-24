import { useMediaQuery } from 'react-responsive'

export function useMedia() {

    const isMobile = useMediaQuery({maxWidth: 764})
    const isTablet = useMediaQuery({minWidth: 764, maxWidth: 1024})
    const isDesktop = useMediaQuery({minWidth: 1024})
    const isTouch = useMediaQuery({query: "(pointer: coarse)"})
    
    return { isMobile, isTablet, isDesktop, isTouch }
}




