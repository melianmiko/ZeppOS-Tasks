export function Headline(text) {
    return View({
        style: {
            margin: "8px 0",
            color: "#0099FF",
            fontSize: ".9em"
        }
    }, [
        Text({bold: true}, text)]
    );
}