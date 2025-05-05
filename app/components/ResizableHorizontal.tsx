import { ReactNode, useEffect, useRef, useState } from "react";
import './../stylesheets/resizablehorizontal.css'

interface ResizableHorizontalProps {
    children: ReactNode;
    minWidth? : number;
    maxWidth? : number;
    initialWidth? : number
}

const ResizableHorizontal: React.FC<ResizableHorizontalProps> = ({
    children,
    minWidth = 100,
    maxWidth = 800,
    initialWidth = 300
}) => {
    const [width, setWidth] = useState(initialWidth);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const isResizing = useRef<boolean>(false);

    const startResize = () => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing.current && boxRef.current) {
            const newWidth = e.clientX - boxRef.current.getBoundingClientRect().left;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        }
    };

    const stopResize = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResize);
        }
    }, []);

    return (
        <div
            ref={boxRef}
            className="resizable-horizontal"
            style={{ width: `${width}px`}}
        >
            <div className="content">{children}</div>
            <div className="resizer" onMouseDown={startResize} />
        </div>
    );
};

export default ResizableHorizontal;