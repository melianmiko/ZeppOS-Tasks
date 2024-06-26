import {gettext as t} from 'i18n';
import {TextRoot} from "../../lib/mmk/setting/Layout";
import {VERSION} from "../../version";
import {Link, Paragraph, Title} from "../../lib/mmk/setting/Typography";

export function AboutTab(ctx) {
  return TextRoot([
    Title(
      `ZeppTasks ${VERSION}`
    ),
    Paragraph([
      t("Like this application? Consider to support their development with a small donation: "),
      Link("https://mmk.pw/donate")
    ]),
    Paragraph([
      t("Want to see ZeppTasks into another language? You can help us with translation: "),
      Link("https://mmk.pw/en/zepp/tasks/translate")
    ]),
    Paragraph([
      t("Source code available: "),
      Link("https://github.com/melianmiko/ZeppOS-Tasks")
    ])
  ]);
}