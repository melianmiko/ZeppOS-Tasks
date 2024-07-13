import { loadLocale } from "../lib/mmk/i18n";

import {default as russianStrings} from "./translations/ru-RU/device";
import {default as germanStrings} from "./translations/de-DE/device";
import {default as chineseStrings} from "./translations/zh-CN/device";
import {default as hungarianStrings} from "./translations/hu-HU/device";
import {default as italianStrings} from "./translations/it-IT/device";
import {default as frenchStrings} from "./translations/fr-FR/device";
import {default as spanishStrings} from "./translations/es-ES/device";
import {default as polishStrings} from "./translations/pl-PL/device";
import {default as brazilianStrings} from "./translations/pt-BR/device";
import {default as japanStrings} from "./translations/ja-JP/device";
import {default as turkeyStrings} from "./translations/tr-TR/device";

/**
 * Locale contents was split into separate files and saved into
 * `translations` folder. If you want to contribute translation
 * for some locale, please refer to them.
 *
 * You also could submit your translations here:
 * https://mmk.pw/en/zepp/tasks/translate
 */

loadLocale("ru-RU", russianStrings);
loadLocale("de-DE", germanStrings);
loadLocale("zh-CN", chineseStrings);
loadLocale("hu-HU", hungarianStrings);
loadLocale("it-IT", italianStrings);
loadLocale("fr-FR", frenchStrings);
loadLocale("es-ES", spanishStrings);
loadLocale("pl-PL", polishStrings);
loadLocale("pt-BR", brazilianStrings);
loadLocale("ja-JA", japanStrings);
loadLocale("tr-TR", turkeyStrings);
