export function LastErrorView(props) {
    const err = props.settingsStorage.getItem("last_error");
    if(!err) return null;

    return View({
        style: {
            color: "#A22",
            fontSize: ".9rem",
        }
    }, [
        Text({bold: true}, "Potential error: "),
        Text({}, err)
    ])
}