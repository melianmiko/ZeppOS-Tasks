import {gettext} from 'i18n';
import {HEADER_VIEW, CAPTION_VIEW} from "../styles";

export function LoginStatusView(props) {
    return View({}, [
        Text({
            style: {
                display: "block",
                textAlign: "center",
                margin: "8px",
                fontSize: "1.05em"
            }
        }, props.title),
        Text({
            style: {
                display: "block",
                textAlign: "center",
                margin: "8px",
                opacity: "0.6",
                fontSize: ".9em"
            }
        }, props.subtitle)
    ])
}
